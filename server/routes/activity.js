const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

router.use(protect);

// GET /api/activity — get all activity logs with pagination
router.get('/', async (req, res) => {
  try {
    const { limit = 20, page = 1, action } = req.query;
    const query = { performedBy: req.user.id }; // ✅ Filter by user
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

// DELETE /api/activity/clear — clear ONLY this user's logs
router.delete('/clear', async (req, res) => {
  try {
    await ActivityLog.deleteMany({ performedBy: req.user.id }); // ✅
    res.json({ success: true, message: 'Activity logs cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;