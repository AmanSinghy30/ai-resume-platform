const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
  res.json({ message: 'Register route - coming Day 8' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login route - coming Day 8' });
});

module.exports = router;