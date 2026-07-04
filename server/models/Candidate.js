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

  // ── Enhanced AI Analysis Fields ──
  aiVerdict: {
    type: String,
    enum: ['STRONG_YES', 'YES', 'MAYBE', 'NO', 'STRONG_NO', null],
    default: null,
  },
  aiVerdictConfidence: {
    type: Number,
    default: null,
    min: 0,
    max: 100,
  },
  aiVerdictSummary: {
    type: String,
    default: '',
  },
  aiDimensionScores: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  aiRedFlags: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  aiGreenFlags: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  aiSkillGapAnalysis: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  aiInterviewQuestions: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  aiComparativeNotes: {
    type: String,
    default: '',
  },
  aiCultureFitNotes: {
    type: String,
    default: '',
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

  // ── Enhanced Match Data (from n8n workflow) ──
  matchScoreBreakdown: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  matchExperienceSummary: {
    type: String,
    default: '',
  },
  matchTotalExperienceYears: {
    type: Number,
    default: null,
  },
  matchStrengths: {
    type: [String],
    default: [],
  },
  matchConcerns: {
    type: [String],
    default: [],
  },
  matchHiringSignal: {
    type: String,
    enum: ['STRONG_YES', 'YES', 'MAYBE', 'NO', 'STRONG_NO', '', null],
    default: null,
  },
  matchOneLineVerdict: {
    type: String,
    default: '',
  },
  matchInterviewQuestions: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  matchImprove: {
    type: String,
    default: '',
  },
  matchFlaggedManipulation: {
    type: Boolean,
    default: false,
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