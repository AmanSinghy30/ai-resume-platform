const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const ActivityLog = require('../models/ActivityLog');

// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Run all counts in parallel for speed
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
      Candidate.countDocuments(),
      Candidate.countDocuments({ status: 'shortlisted' }),
      Candidate.countDocuments({ status: 'new' }),
      Candidate.countDocuments({ status: 'rejected' }),
      Candidate.countDocuments({ status: 'reviewed' }),
      Job.countDocuments(),

      // Last 5 candidates
      Candidate.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('jobId', 'title')
        .select('name email status aiScore createdAt jobId'),

      // Last 10 activity logs
      ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('performedBy', 'name')
        .populate('candidateId', 'name')
        .populate('jobId', 'title'),
    ]);

    res.json({
      success: true,
      stats: {
        total,
        shortlisted,
        pending,
        rejected,
        reviewed,
        totalJobs,
      },
      recentCandidates,
      recentActivity,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route   GET /api/dashboard/activity
// @access  Private
const getActivityLogs = async (req, res) => {
  try {
    const { limit = 20, action } = req.query;

    const query = {};
    if (action) query.action = action;

    const logs = await ActivityLog
      .find(query)
      .populate('performedBy', 'name email')
      .populate('candidateId', 'name')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, logs });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getActivityLogs,
};