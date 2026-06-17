const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
  index: true,
  },
  phone: {
    type: String,
    default: '',
  },
  resumeUrl: {
    type: String,
    default: '',
  },
  rawText: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  experience: {
    type: Number,
    default: 0,
  },
  education: {
    type: String,
    default: '',
  },
  matchedSkills: {
    type: [String],
    default: [],
  },
  missingSkills: {
    type: [String],
    default: [],
  },
  aiScore: {
    type: Number,
    default: null,
    min: 0,
    max: 100,
  },
  aiAnalysis: {
    type: String,
    default: '',
  },
  aiStrengths: {
  type: [String],
  default: [],
 },
  aiWeaknesses: {
  type: [String],
  default: [],
 },
  aiReasoning: {
  type: String,
  default: '',
 },
  aiRecommendation: {
    type: String,
    enum: ['shortlist', 'review', 'reject', null],
    default: null,
  },
  matchScore: {
    type: Number,
    default: null,
    min: 0,
    max: 100,
  },
  reason: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'shortlisted', 'rejected'],
    default: 'new',
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);