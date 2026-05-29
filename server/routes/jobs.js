const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Get all jobs - coming Day 12' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get one job - coming Day 12' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create job - coming Day 12' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update job - coming Day 12' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete job - coming Day 12' });
});

module.exports = router;