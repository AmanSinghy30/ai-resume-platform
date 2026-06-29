const { triggerResumeWorkflow, triggerManualStatusUpdateWorkflow } = require('../utils/n8nClient');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const ActivityLog = require('../models/ActivityLog');
const fs = require('fs');
const { extractTextFromPDF } = require('../utils/pdfParser');
const { extractSkills, extractExperience, extractEducation } = require('../utils/skillExtractor');
const { logActivity } = require('../utils/activityLogger');
const { extractName, extractEmail, extractPhone } = require('../utils/contactExtractor');

// Helper to log activity
const log = async (action, userId, candidateId = null, jobId = null, description = '') => {
  try {
    await ActivityLog.create({ action, performedBy: userId, candidateId, jobId, description });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
};

// @route POST /api/candidates/upload
// @route POST /api/candidates/upload
const uploadResume = async (req, res) => {
  try {
    const { name, email, phone, jobId, tempFilePath } = req.body;

    if (!name || !email) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Use either freshly uploaded file OR pre-parsed temp file from /parse-resume
    let filePath = req.file?.path || tempFilePath;

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file found'
      });
    }

    // Validate job if provided
    if (jobId) {
      const job = await Job.findOne({ _id: jobId, createdBy: req.user.id });
      if (!job) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
    }

    // Parse PDF for raw text + extra info
    const parsed = await extractTextFromPDF(filePath);

    // Check for duplicate candidate
    if (email) {
      const duplicateQuery = { 
        email, 
        userId: req.user.id,
        jobId: jobId || null
      };
      
      const existingCandidate = await Candidate.findOne(duplicateQuery);
      if (existingCandidate) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: jobId ? 'Candidate has already applied for this job' : 'Candidate profile already exists'
        });
      }
    }

    // Create candidate
    const cleanedPhone = phone ? String(phone).replace(/\D/g, '') : '';
    const candidate = await Candidate.create({
      name,
      email,
      phone: cleanedPhone,
      resumeUrl: filePath,
      jobId: jobId || null,
      status: 'new',
      userId: req.user.id,
    });

    // Save extracted data if PDF parsed successfully
    if (parsed.success && parsed.text) {
      candidate.rawText = parsed.text;
      candidate.skills = extractSkills(parsed.text);
      candidate.experience = extractExperience(parsed.text);
      candidate.education = extractEducation(parsed.text);
      await candidate.save();
      console.log(`✅ Saved — ${name} | ${candidate.skills.length} skills extracted`);
    } else {
      console.warn(`⚠️ PDF parsing failed for ${name}`);
    }


    // Trigger n8n asynchronously to calculate basic Job Match Score
    triggerResumeWorkflow(candidate._id.toString(), filePath, jobId, req.user.email).catch(err => {
      console.error(`⚠️ Async n8n trigger failed for ${name}:`, err.message);
    });
    // Add candidate to job's candidates array
    if (jobId) {
      await Job.findByIdAndUpdate(jobId, { $push: { candidates: candidate._id } });
    }

    // Activity log
    await log(
      'resume_uploaded',
      req.user.id,
      candidate._id,
      jobId || null,
      `Resume uploaded for ${name}`
    );

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      candidate
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Upload error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/candidates
const getCandidates = async (req, res) => {
  try {
    const { status, jobId, search, sortBy, order, minScore, maxScore, skills, minExperience } = req.query;
const query = { userId: req.user.id };  // ✅ Always filter by logged-in user
    if (status) query.status = status;
    if (jobId) query.jobId = jobId;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (minScore || maxScore) {
      query.aiScore = {};
      if (minScore) query.aiScore.$gte = Number(minScore);
      if (maxScore) query.aiScore.$lte = Number(maxScore);
    }
    if (minExperience) {
      query.experience = { $gte: Number(minExperience) };
    }
    if (skills) {
      const skillArray = skills.split(/[,+]/).map(s => s.trim()).filter(Boolean);
      if (skillArray.length > 0) {
        query.skills = { 
          $all: skillArray.map(skill => new RegExp(skill, 'i')) 
        };
      }
    }

    const sort = {};
    sort[sortBy || 'createdAt'] = order === 'asc' ? 1 : -1;

    const candidates = await Candidate.find(query)
      .sort(sort)
      .populate('jobId', 'title');

    res.json({ success: true, count: candidates.length, candidates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/candidates/:id
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({
  _id: req.params.id,
  userId: req.user.id,   // ✅ Only own candidates
}).populate('jobId', 'title description requiredSkills');
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    res.json({ success: true, candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PATCH /api/candidates/:id/status
const updateCandidateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'reviewed', 'shortlisted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

const candidate = await Candidate.findOneAndUpdate(
  { _id: req.params.id, userId: req.user.id },
  { status },
  { new: true }
);

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const actionMap = {
      shortlisted: 'candidate_shortlisted',
      rejected: 'candidate_rejected',
      reviewed: 'candidate_reviewed',
    };

    if (actionMap[status]) {
      await log(actionMap[status], req.user.id, candidate._id, candidate.jobId,
        `${candidate.name} marked as ${status}`);
        
      // Trigger n8n manual status webhook so emails can be sent
      triggerManualStatusUpdateWorkflow(candidate._id.toString(), status, candidate.jobId, req.user.email).catch(err => {
        console.error(`⚠️ Async n8n manual update failed for ${candidate.name}:`, err.message);
      });
    }

    res.json({ success: true, candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/candidates/:id
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({
  _id: req.params.id,
  userId: req.user.id,
});
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    if (candidate.resumeUrl && fs.existsSync(candidate.resumeUrl)) {
      fs.unlinkSync(candidate.resumeUrl);
    }

    await log('candidate_deleted', req.user.id, candidate._id, candidate.jobId,
      `${candidate.name} deleted`);

    await candidate.deleteOne();
    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/candidates/bulk-status
const bulkUpdateStatus = async (req, res) => {
  try {
    const { candidateIds, status, minScore } = req.body;
    const validStatuses = ['new', 'reviewed', 'shortlisted', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let query = {};

    if (candidateIds === 'auto') {
  if (minScore === undefined || minScore === null) {
    return res.status(400).json({ success: false, message: 'minScore required for auto mode' });
  }
  query = { aiScore: { $gte: Number(minScore) }, userId: req.user.id };  // ✅
} else {
  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    return res.status(400).json({ success: false, message: 'candidateIds array required' });
  }
  query = { _id: { $in: candidateIds }, userId: req.user.id };  // ✅
}

    // Find candidates first so we can trigger webhooks for them
    const candidatesToUpdate = await Candidate.find(query);

    const result = await Candidate.updateMany(query, { status });

    await logActivity(
      'candidate_shortlisted',
      req.user.id,
      null,
      null,
      `Bulk update: ${result.modifiedCount} candidates set to ${status}`
    );

    // Trigger n8n manual status webhook for each updated candidate
    for (const c of candidatesToUpdate) {
      triggerManualStatusUpdateWorkflow(c._id.toString(), status, c.jobId).catch(err => {
        console.error(`⚠️ Async n8n bulk manual update failed for ${c.name}:`, err.message);
      });
    }

    res.json({
      success: true,
      message: `${result.modifiedCount} candidates updated to ${status}`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/candidates/stats/summary
const getCandidateStats = async (req, res) => {
  try {
    const uid = req.user.id;
const total = await Candidate.countDocuments({ userId: uid });
const shortlisted = await Candidate.countDocuments({ userId: uid, status: 'shortlisted' });
const pending = await Candidate.countDocuments({ userId: uid, status: 'new' });
const rejected = await Candidate.countDocuments({ userId: uid, status: 'rejected' });
const reviewed = await Candidate.countDocuments({ userId: uid, status: 'reviewed' });
const totalJobs = await Job.countDocuments({ createdBy: uid });

    res.json({
      success: true,
      stats: { total, shortlisted, pending, rejected, reviewed, totalJobs }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// @route POST /api/candidates/parse-resume
// Parses PDF and returns extracted info WITHOUT saving to DB
const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    const parsed = await extractTextFromPDF(req.file.path);

    if (!parsed.success || !parsed.text) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from PDF',
      });
    }
    /*console.log('🔍 First 500 chars of PDF:', parsed.text.slice(0, 500));
    console.log('🔍 Extracted email:', extractEmail(parsed.text));
    console.log('🔍 Extracted name:', extractName(parsed.text));    
    console.log('🔍 Extracted phone:', extractPhone(parsed.text));*/
    const extracted = {
      name: extractName(parsed.text) || 'Unknown Candidate',
      email: extractEmail(parsed.text) || 'no-email@example.com',
      phone: extractPhone(parsed.text) || 'N/A',
      skills: extractSkills(parsed.text),
      experience: extractExperience(parsed.text),
      education: extractEducation(parsed.text),
      rawText: parsed.text,
      tempFilePath: req.file.path, // keep file for actual upload later
      fileName: req.file.originalname,
    };

    console.log(`📄 Parsed: ${extracted.name || 'Unknown'} | ${extracted.email || 'No email'} | ${extracted.skills.length} skills`);

    res.json({ success: true, extracted });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/candidates/bulk-delete
const bulkDeleteCandidates = async (req, res) => {
  try {
    const { candidateIds } = req.body;

    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'candidateIds array required',
      });
    }

    // Find candidates first (to delete their files)
    const candidates = await Candidate.find({
      _id: { $in: candidateIds },
      userId: req.user.id,
    });

    // Delete PDF files from disk
    candidates.forEach(c => {
      if (c.resumeUrl && fs.existsSync(c.resumeUrl)) {
        try { fs.unlinkSync(c.resumeUrl); } catch (e) { /* ignore */ }
      }
    });

    // Delete from DB
    const result = await Candidate.deleteMany({
      _id: { $in: candidateIds },
      userId: req.user.id,
    });

    await log(
      'candidate_deleted',
      req.user.id,
      null,
      null,
      `Bulk deleted ${result.deletedCount} candidates`
    );

    res.json({
      success: true,
      message: `${result.deletedCount} candidates deleted`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  uploadResume,
  parseResume,
  getCandidates,
  getCandidateById,
  updateCandidateStatus,
  deleteCandidate,
  bulkDeleteCandidates,
  bulkUpdateStatus,
  getCandidateStats,
};
