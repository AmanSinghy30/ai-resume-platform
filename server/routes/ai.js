const express = require('express');
const router = express.Router();

router.post('/analyze/:candidateId', (req, res) => {
  res.json({ message: 'AI analyze - coming Day 23' });
});

router.post('/score/:candidateId', (req, res) => {
  res.json({ message: 'AI score - coming Day 24' });
});

router.post('/match', (req, res) => {
  res.json({ message: 'AI match - coming Day 25' });
});

module.exports = router;