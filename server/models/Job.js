const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
  },
  requiredSkills: {
    type: [String],
    default: [],
  },
  niceToHaveSkills: {
    type: [String],
    default: [],
  },
  skillWeight: {
    type: Number,
    default: 50,
  },
  experienceWeight: {
    type: Number,
    default: 30,
  },
  roleFitWeight: {
    type: Number,
    default: 20,
  },
  experienceRequired: {
    type: Number,
    default: 0,
  },
  minShortlistedScore: {
    type: Number,
    default: 90,
  },
  minReviewedScore: {
    type: Number,
    default: 70,
  },
  createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
  index: true,
},
  candidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);