const express = require('express');
const router = express.Router();
const { callAI } = require('../utils/aiClient');
const { parseAIJson } = require('../utils/parseJSON');

// Test route — verify AI is working
router.post('/test', async (req, res) => {
  try {
    const result = await callAI(
      'Say hello and tell me one interesting fact about AI recruitment. Keep it under 50 words.'
    );

    if (!result.success) {
      return res.status(500).json({ success: false, message: result.error });
    }

    res.json({ success: true, response: result.text });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Placeholder routes — will be filled Day 23-25
router.post('/analyze/:candidateId', async (req, res) => {
  res.json({ message: 'AI analyze — coming Day 23' });
});

router.post('/score/:candidateId', async (req, res) => {
  res.json({ message: 'AI score — coming Day 24' });
});

router.post('/match', async (req, res) => {
  res.json({ message: 'AI match — coming Day 25' });
});

module.exports = router;