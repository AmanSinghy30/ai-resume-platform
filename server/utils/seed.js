const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const ActivityLog = require('../models/ActivityLog');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  // Clear old data
  await User.deleteMany({});
  await Job.deleteMany({});
  await Candidate.deleteMany({});
  await ActivityLog.deleteMany({});

  // Create dummy user
  const user = await User.create({
    name: 'Test Recruiter',
    email: 'recruiter@test.com',
    password: 'password123',
    role: 'recruiter',
  });

  // Create dummy job
  const job = await Job.create({
    title: 'Frontend Developer',
    description: 'Looking for React developer with 2+ years experience',
    requiredSkills: ['React', 'TypeScript', 'CSS'],
    experienceRequired: 2,
    createdBy: user._id,
  });

  // Create dummy candidate
  const candidate = await Candidate.create({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    skills: ['React', 'JavaScript', 'CSS'],
    experience: 3,
    status: 'new',
    jobId: job._id,
  });

  // Create dummy log
  await ActivityLog.create({
    action: 'resume_uploaded',
    performedBy: user._id,
    candidateId: candidate._id,
    jobId: job._id,
    description: 'Resume uploaded for John Doe',
  });

  console.log('✅ Seed complete');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});