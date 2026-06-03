require('dotenv').config();
const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // 👉 Change this email to your main account
  const PRIMARY_EMAIL = 'aman@gmail.com';

  const primaryUser = await User.findOne({ email: PRIMARY_EMAIL });
  if (!primaryUser) {
    console.error(`❌ User ${PRIMARY_EMAIL} not found. Edit script with correct email.`);
    process.exit(1);
  }

  console.log(`✅ Found primary user: ${primaryUser.name} (${primaryUser._id})`);

  // Candidates
  const candResult = await Candidate.updateMany(
    { $or: [{ userId: { $exists: false } }, { userId: null }] },
    { $set: { userId: primaryUser._id } }
  );
  console.log(`✅ Updated ${candResult.modifiedCount} candidates`);

  // Jobs
  const jobResult = await Job.updateMany(
    { $or: [{ createdBy: { $exists: false } }, { createdBy: null }] },
    { $set: { createdBy: primaryUser._id } }
  );
  console.log(`✅ Updated ${jobResult.modifiedCount} jobs`);

  // Activity Logs
  const logResult = await ActivityLog.updateMany(
    { $or: [{ performedBy: { $exists: false } }, { performedBy: null }] },
    { $set: { performedBy: primaryUser._id } }
  );
  console.log(`✅ Updated ${logResult.modifiedCount} activity logs`);

  console.log('🎉 Migration complete!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});