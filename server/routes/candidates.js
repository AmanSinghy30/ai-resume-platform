const express = require('express');
const fs = require('fs');
const router = express.Router();
const upload = require('../middleware/upload');
const { body, validationResult } = require('express-validator');
const uploadValidation = [
  body('name').trim().notEmpty().withMessage('Candidate name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
];
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const {
  uploadResume,
  getCandidates,
  getCandidateById,
  updateCandidateStatus,
  deleteCandidate,
  bulkUpdateStatus,
  getCandidateStats,
} = require('../controllers/candidateController');

router.get('/stats/summary', getCandidateStats);
router.get('/', getCandidates);
router.get('/:id', getCandidateById);
router.post('/upload',
  upload.single('resume'),
  uploadValidation,
  validate,
  uploadResume
);
router.patch('/:id/status', updateCandidateStatus);
router.delete('/:id', deleteCandidate);
router.post('/bulk-status', bulkUpdateStatus);

module.exports = router;