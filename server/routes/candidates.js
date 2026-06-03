const express = require('express');
const fs = require('fs');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');  // ✅ ADDED
const { body, validationResult } = require('express-validator');
const { Parser } = require('json2csv');
const Candidate = require('../models/Candidate');

// ✅ ALL routes below require login
router.use(protect);

const uploadValidation = [
  body('name').trim().notEmpty().withMessage('Candidate name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone')
    .optional({ checkFalsy: true })
    .custom((value) => {
      const digits = String(value).replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        throw new Error('Phone must contain 10-15 digits');
      }
      return true;
    }),
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
  parseResume,
  getCandidates,
  getCandidateById,
  updateCandidateStatus,
  deleteCandidate,
  bulkDeleteCandidates,
  bulkUpdateStatus,
  getCandidateStats,
} = require('../controllers/candidateController');

router.get('/stats/summary', getCandidateStats);

// GET /api/candidates/export/shortlisted — FIXED to filter by user
router.get('/export/shortlisted', async (req, res) => {
  try {
    const candidates = await Candidate.find({
      status: 'shortlisted',
      userId: req.user.id,   // ✅ Only own shortlisted candidates
    })
      .populate('jobId', 'title')
      .lean();

    if (candidates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No shortlisted candidates to export'
      });
    }

    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Phone', value: 'phone' },
      { label: 'Job', value: (row) => row.jobId?.title || 'N/A' },
      { label: 'AI Score', value: 'aiScore' },
      { label: 'Experience (years)', value: 'experience' },
      { label: 'Skills', value: (row) => row.skills.join(', ') },
      { label: 'Recommendation', value: 'aiRecommendation' },
      { label: 'Uploaded At', value: (row) => new Date(row.createdAt).toLocaleDateString() },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(candidates);

    res.header('Content-Type', 'text/csv');
    res.attachment('shortlisted-candidates.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/bulk-status', bulkUpdateStatus);
router.post('/bulk-delete', bulkDeleteCandidates); 
router.post('/parse-resume',upload.single('resume'),parseResume);
router.post('/upload',upload.single('resume'),uploadValidation,validate,uploadResume);
router.get('/', getCandidates);
router.get('/:id', getCandidateById);
router.patch('/:id/status', updateCandidateStatus);
router.delete('/:id', deleteCandidate);

module.exports = router;