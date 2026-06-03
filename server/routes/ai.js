const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');  // ✅ ADDED
const {
  analyzeResume,
  scoreCandidate,
  scoreAllCandidates,
  matchCandidates,
} = require('../controllers/aiController');
const { callAI } = require('../utils/aiClient');

// ✅ All AI routes require login
router.use(protect);

// Test route
router.post('/test', async (req, res) => {
  try {
    const result = await callAI('Say hello in exactly 10 words.');
    if (!result.success) {
      return res.status(500).json({ success: false, message: result.error });
    }
    res.json({ success: true, response: result.text });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/analyze/:candidateId', analyzeResume);
router.post('/score/:candidateId', scoreCandidate);
router.post('/score-all', scoreAllCandidates);
router.post('/match', matchCandidates);

module.exports = router;