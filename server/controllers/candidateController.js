const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const ActivityLog = require('../models/ActivityLog');
const fs = require('fs');
const { extractTextFromPDF } = require('../utils/pdfParser');
const { extractSkills, extractExperience, extractEducation } = require('../utils/skillExtractor');

// Helper to log activity
const log = async (action, userId, candidateId = null, jobId = null, description = '') => {
  try {
    await ActivityLog.create({ action, performedBy: userId, candidateId, jobId, description });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
};

// @route POST /api/candidates/upload
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    const { name, email, phone, jobId } = req.body;

    if (!name || !email) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    if (jobId) {
      const job = await Job.findById(jobId);
      if (!job) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ success: false, message: 'Job not found' });
      }
    }

    const candidate = await Candidate.create({
  name,
  email,
  phone: phone || '',
  resumeUrl: req.file.path,
  jobId: jobId || null,
  status: 'new',
   });

   // Auto-parse PDF text
const parsed = await extractTextFromPDF(req.file.path);
if (parsed.success && parsed.text) {
  candidate.rawText = parsed.text;

  // Auto-extract data from text
  candidate.skills = extractSkills(parsed.text);
  candidate.experience = extractExperience(parsed.text);
  candidate.education = extractEducation(parsed.text);

  await candidate.save();
  console.log(`✅ Extracted — Skills: ${candidate.skills.length}, Experience: ${candidate.experience} yrs`);
} else {
  console.warn(`⚠️ PDF parsing failed for ${name}`);
}

    if (jobId) {
      await Job.findByIdAndUpdate(jobId, { $push: { candidates: candidate._id } });
    }

    await log('resume_uploaded', req.user.id, candidate._id, jobId || null,
      `Resume uploaded for ${name}`);

    res.status(201).json({ success: true, message: 'Resume uploaded successfully', candidate });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/candidates
const getCandidates = async (req, res) => {
  try {
    const { status, jobId, search, sortBy, order, minScore, maxScore } = req.query;
    const query = {};

    if (status) query.status = status;
    if (jobId) query.jobId = jobId;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (minScore || maxScore) {
      query.aiScore = {};
      if (minScore) query.aiScore.$gte = Number(minScore);
      if (maxScore) query.aiScore.$lte = Number(maxScore);
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
    const candidate = await Candidate.findById(req.params.id)
      .populate('jobId', 'title description requiredSkills');
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

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
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
    }

    res.json({ success: true, candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/candidates/:id
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
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
    const { candidateIds, status } = req.body;
    const validStatuses = ['new', 'reviewed', 'shortlisted', 'rejected'];

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ success: false, message: 'candidateIds array required' });
    }
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await Candidate.updateMany(
      { _id: { $in: candidateIds } },
      { status }
    );

    res.json({ success: true, message: `${candidateIds.length} candidates updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/candidates/stats/summary
const getCandidateStats = async (req, res) => {
  try {
    const total = await Candidate.countDocuments();
    const shortlisted = await Candidate.countDocuments({ status: 'shortlisted' });
    const pending = await Candidate.countDocuments({ status: 'new' });
    const rejected = await Candidate.countDocuments({ status: 'rejected' });
    const reviewed = await Candidate.countDocuments({ status: 'reviewed' });
    const totalJobs = await Job.countDocuments();

    res.json({
      success: true,
      stats: { total, shortlisted, pending, rejected, reviewed, totalJobs }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  uploadResume,
  getCandidates,
  getCandidateById,
  updateCandidateStatus,
  deleteCandidate,
  bulkUpdateStatus,
  getCandidateStats,
};