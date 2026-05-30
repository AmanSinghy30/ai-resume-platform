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
  aiRecommendation: {
    type: String,
    enum: ['shortlist', 'review', 'reject', null],
    default: null,
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