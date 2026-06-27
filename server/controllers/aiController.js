const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const { callAI, callAIWithRetry, sleep } = require('../utils/aiClient');
const { parseAIJson } = require('../utils/parseJSON');
const { buildAnalysisPrompt, buildScoringPrompt, buildMatchingPrompt } = require('../utils/prompts');
const { logActivity } = require('../utils/activityLogger');

// @route POST /api/ai/analyze/:candidateId
const analyzeResume = async (req, res) => {
  try {
    const { modelName } = req.body;
    const candidate = await Candidate.findOne({
  _id: req.params.candidateId,
  userId: req.user.id,        // ✅ Only own candidates
}).populate('jobId', 'title description');

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    if (!candidate.rawText) {
      return res.status(400).json({
        success: false,
        message: 'No resume text found. Re-upload the PDF.',
      });
    }

    const jobDescription = candidate.jobId?.description || '';
    const prompt = buildAnalysisPrompt(candidate.rawText, jobDescription);

    console.log(`🤖 Analyzing resume for: ${candidate.name} using ${modelName || 'gemini-2.5-flash'}`);
    // ✅ NEW
const result = await callAIWithRetry(prompt, 3, modelName);
console.log('RAW AI RESPONSE:', result.text);

if (!result.success || !result.text) {
  console.error('❌ AI call failed:', result.error);
  return res.status(500).json({
    success: false,
    message: 'AI service failed. Please try again.',
    debug: result.error,
  });
}

    const parsed = parseAIJson(result.text);
    if (!parsed.success) {
      return res.status(500).json({
        success: false,
        message: 'AI returned invalid response. Try again.',
      });
    }

    const analysis = parsed.data;

    // Save to candidate
    candidate.aiScore = Math.min(100, Math.max(0, Number(analysis.overallScore) || 0));
    candidate.aiAnalysis = analysis.summary || '';
    candidate.aiRecommendation = analysis.recommendation || null;

    // ✅ NEW — save strengths, weaknesses, reasoning
candidate.aiStrengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
candidate.aiWeaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];
candidate.aiReasoning = analysis.reasoning || '';

    if (analysis.education && analysis.education.length > 5) {
      candidate.education = analysis.education;
    }

    // Update skills if AI found more
    if (analysis.skills && analysis.skills.length > candidate.skills.length) {
      candidate.skills = analysis.skills;
    }

    // Update experience if missing
    if (!candidate.experience && analysis.experienceYears !== undefined) {
      const numExp = Number(analysis.experienceYears);
      candidate.experience = isNaN(numExp) ? 0 : numExp;
    }

    await candidate.save();

    await logActivity(
      'ai_analysis_run',
      req.user.id,
      candidate._id,
      candidate.jobId?._id || null,
      `AI analysis completed for ${candidate.name} — Score: ${candidate.aiScore}`
    );

    console.log(`✅ Analysis done: ${candidate.name} — Score: ${candidate.aiScore}`);

    res.json({
      success: true,
      candidate,
      analysis: {
        ...analysis,
        overallScore: candidate.aiScore,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/ai/score/:candidateId
const scoreCandidate = async (req, res) => {
  try {
    const { jobId } = req.body;

    const candidate = await Candidate.findOne({
  _id: req.params.candidateId,
  userId: req.user.id,        // ✅
});
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const job = await Job.findOne({
  _id: jobId || candidate.jobId,
  createdBy: req.user.id,     // ✅
});
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (!candidate.rawText) {
      return res.status(400).json({
        success: false,
        message: 'No resume text. Re-upload PDF.',
      });
    }

    const prompt = buildScoringPrompt(
      candidate.rawText,
      job.title,
      job.description,
      job.requiredSkills
    );

    console.log(`🤖 Scoring ${candidate.name} for ${job.title}`);
    const result = await callAI(prompt);

    if (!result.success) {
      return res.status(500).json({ success: false, message: result.error });
    }

    const parsed = parseAIJson(result.text);
    if (!parsed.success) {
      return res.status(500).json({
        success: false,
        message: 'AI returned invalid response.',
      });
    }

    const scoring = parsed.data;

    candidate.aiScore = Math.min(100, Math.max(0, Number(scoring.score) || 0));
candidate.aiRecommendation = scoring.recommendation || null;
candidate.aiAnalysis = scoring.summary || scoring.reasoning || '';
candidate.aiReasoning = scoring.reasoning || '';
candidate.aiStrengths = Array.isArray(scoring.strengths) ? scoring.strengths : [];
candidate.aiWeaknesses = Array.isArray(scoring.weaknesses) ? scoring.weaknesses : [];

await candidate.save();

    res.json({
      success: true,
      candidate,
      scoring,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/ai/score-all
// @route POST /api/ai/score-all
const scoreAllCandidates = async (req, res) => {
  try {
    const { jobId, candidateIds } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId required' });
    }

    const job = await Job.findOne({
      _id: jobId,
      createdBy: req.user.id,
    });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Build query — if specific candidateIds passed, score only those
    const query = {
      userId: req.user.id,
      rawText: { $ne: '' },
    };

    if (Array.isArray(candidateIds) && candidateIds.length > 0) {
      query._id = { $in: candidateIds };
    } else {
      query.jobId = jobId; // fallback — all candidates of this job
    }

    const candidates = await Candidate.find(query);

    if (candidates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No candidates with resume text found',
      });
    }

    console.log(`🤖 Scoring ${candidates.length} candidates for ${job.title}`);

    const results = [];

    // ✅ Proper loop — was missing/broken before
    for (const candidate of candidates) {
      try {
        const prompt = buildScoringPrompt(
          candidate.rawText,
          job.title,
          job.description,
          job.requiredSkills
        );

        const result = await callAIWithRetry(prompt);

        if (result.success) {
          const parsed = parseAIJson(result.text);
 if (parsed.success) {
  const d = parsed.data;

  candidate.aiScore = Math.min(100, Math.max(0, Number(d.score) || 0));
  candidate.aiRecommendation = d.recommendation || null;
  candidate.aiAnalysis = d.summary || d.reasoning || '';
  candidate.aiReasoning = d.reasoning || '';
  candidate.aiStrengths = Array.isArray(d.strengths) ? d.strengths : [];
  candidate.aiWeaknesses = Array.isArray(d.weaknesses) ? d.weaknesses : [];

  await candidate.save();
  results.push({ name: candidate.name, score: candidate.aiScore, success: true });
  console.log(`✅ ${candidate.name}: ${candidate.aiScore}`);
} else {
            results.push({ name: candidate.name, success: false, error: 'Bad JSON' });
          }
        } else {
          results.push({ name: candidate.name, success: false, error: result.error });
        }
      } catch (err) {
        console.error(`Failed for ${candidate.name}:`, err.message);
        results.push({ name: candidate.name, success: false, error: err.message });
      }

      await sleep(1500);  // delay between API calls
    }

    res.json({
      success: true,
      message: `Scored ${results.filter(r => r.success).length}/${candidates.length} candidates`,
      results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// @route POST /api/ai/match
const matchCandidates = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId required' });
    }

    const job = await Job.findOne({
  _id: jobId,
  createdBy: req.user.id,     // ✅
});
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const candidates = await Candidate.find({
  jobId,
  userId: req.user.id,        // ✅
});
    if (candidates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No candidates found for this job',
      });
    }

    const prompt = buildMatchingPrompt(
      job.title,
      job.description,
      job.requiredSkills,
      candidates
    );

    const result = await callAI(prompt, 2000);
    if (!result.success) {
      return res.status(500).json({ success: false, message: result.error });
    }
        
    const parsed = parseAIJson(result.text);
    if (!parsed.success) {
      return res.status(500).json({
        success: false,
        message: 'AI returned invalid response.',
      });
    }

    res.json({
      success: true,
      ranked: parsed.data.ranked,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  analyzeResume,
  scoreCandidate,
  scoreAllCandidates,
  matchCandidates,
};