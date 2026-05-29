const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Get all candidates - coming Day 12' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get one candidate - coming Day 12' });
});

router.post('/upload', (req, res) => {
  res.json({ message: 'Upload resume - coming Day 10' });
});

router.patch('/:id/status', (req, res) => {
  res.json({ message: 'Update status - coming Day 12' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete candidate - coming Day 12' });
});

module.exports = router;