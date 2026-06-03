const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const ActivityLog = require('../models/ActivityLog');

const getDashboardStats = async (req, res) => {
  try {
    const uid = req.user.id;  // ✅

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
        .populate('jobId', 'title')
        .select('name email status aiScore createdAt jobId'),

      ActivityLog.find({ performedBy: uid })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('performedBy', 'name')
        .populate('candidateId', 'name')
        .populate('jobId', 'title'),
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
};

const getActivityLogs = async (req, res) => {
  try {
    const { limit = 20, action } = req.query;

    const query = { performedBy: req.user.id };  // ✅
    if (action) query.action = action;

    const logs = await ActivityLog.find(query)
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

module.exports = { getDashboardStats, getActivityLogs };