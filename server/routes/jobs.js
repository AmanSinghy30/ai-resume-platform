const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');  // ✅ ADDED

const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

// ✅ All job routes require auth
router.use(protect);

const jobValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required'),
  body('description')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('experienceRequired')
    .optional()
    .isNumeric()
    .withMessage('Experience must be a number'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', jobValidation, validate, createJob);
router.put('/:id', jobValidation, validate, updateJob);
router.delete('/:id', deleteJob);

module.exports = router;