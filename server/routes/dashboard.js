const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const ActivityLog = require('../models/ActivityLog');

// All dashboard routes require auth
router.use(protect);

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const uid = req.user.id; // ✅ Filter by logged-in user

    const [
      total,
      shortlisted,
      pending,
      rejected,
      reviewed,
      totalJobs,
      recentCandidates,
      recentActivity,
    ] = await Promise.all([
      Candidate.countDocuments({ userId: uid }),
      Candidate.countDocuments({ userId: uid, status: 'shortlisted' }),
      Candidate.countDocuments({ userId: uid, status: 'new' }),
      Candidate.countDocuments({ userId: uid, status: 'rejected' }),
      Candidate.countDocuments({ userId: uid, status: 'reviewed' }),
      Job.countDocuments({ createdBy: uid }),

      Candidate.find({ userId: uid })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('jobId', 'title'),

      ActivityLog.find({ performedBy: uid })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('candidateId', 'name')
        .populate('performedBy', 'name'),
    ]);

    res.json({
      success: true,
      stats: { total, shortlisted, pending, rejected, reviewed, totalJobs },
      recentCandidates,
      recentActivity,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/activity
router.get('/activity', async (req, res) => {
  try {
    const { limit = 20, page = 1, action } = req.query;
    const query = { performedBy: req.user.id }; // ✅
    if (action) query.action = action;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('candidateId', 'name email')
        .populate('jobId', 'title')
        .populate('performedBy', 'name'),
      ActivityLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      logs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;