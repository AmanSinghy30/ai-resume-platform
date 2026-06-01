const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  uploadResume,
  getCandidates,
  getCandidateById,
  updateCandidateStatus,
  deleteCandidate,
} = require('../controllers/candidateController');

router.get('/', getCandidates);
router.get('/:id', getCandidateById);
router.post('/upload', upload.single('resume'), uploadResume);
router.patch('/:id/status', updateCandidateStatus);
router.delete('/:id', deleteCandidate);

module.exports = router;