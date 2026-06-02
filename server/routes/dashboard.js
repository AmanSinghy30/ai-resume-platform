const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const ActivityLog = require('../models/ActivityLog');

router.get('/stats', async (req, res) => {
  try {
    const [total, shortlisted, pending, rejected, totalJobs, recentCandidates, recentActivity] =
      await Promise.all([
        Candidate.countDocuments(),
        Candidate.countDocuments({ status: 'shortlisted' }),
        Candidate.countDocuments({ status: 'new' }),
        Candidate.countDocuments({ status: 'rejected' }),
        Job.countDocuments(),
        Candidate.find().sort({ createdAt: -1 }).limit(5).populate('jobId', 'title'),
        ActivityLog.find().sort({ createdAt: -1 }).limit(10)
          .populate('candidateId', 'name')
          .populate('performedBy', 'name'),
      ]);

    res.json({
      success: true,
      stats: { total, shortlisted, pending, rejected, totalJobs },
      recentCandidates,
      recentActivity,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;