const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const jobRoutes = require('./routes/jobs');
const aiRoutes = require('./routes/ai');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const fs = require('fs');
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Core middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL, // will add this after Vercel deploy
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Resume Platform API is running',
    version: '1.0.0'
  });
});

const { protect } = require('./middleware/auth');
const dashboardRoutes = require('./routes/dashboard');
const activityRoutes = require('./routes/activity');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', protect, candidateRoutes);
app.use('/api/jobs', protect, jobRoutes);
app.use('/api/ai', protect, aiRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);
app.use('/api/activity', protect, activityRoutes);

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

// MongoDB + Server start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    // Listen for n8n background status updates using Change Streams
    try {
      const Candidate = require('./models/Candidate');
      const ActivityLog = require('./models/ActivityLog');

      const candidateChangeStream = Candidate.watch([], { fullDocument: 'updateLookup' });

      candidateChangeStream.on('change', async (change) => {
        if (change.operationType === 'update' && change.updateDescription?.updatedFields?.status) {
          const newStatus = change.updateDescription.updatedFields.status;
          const candidate = change.fullDocument;

          if (candidate && candidate.userId) {
            const actionMap = {
              shortlisted: 'candidate_shortlisted',
              rejected: 'candidate_rejected',
              reviewed: 'candidate_reviewed',
            };

            const action = actionMap[newStatus];
            if (action) {
              // Prevent duplicate logs if the backend already logged this manually in the last 3 seconds
              const recentLog = await ActivityLog.findOne({
                action,
                candidateId: candidate._id,
                createdAt: { $gte: new Date(Date.now() - 3000) }
              });

              if (!recentLog) {
                await ActivityLog.create({
                  action,
                  performedBy: candidate.userId,
                  candidateId: candidate._id,
                  jobId: candidate.jobId,
                  description: `${candidate.name} marked as ${newStatus} (Auto)`
                });
                console.log(`✅ Auto-logged status change for ${candidate.name}`);
              }
            }
          }
        }
      });
      console.log('✅ Candidate Change Stream initialized');
    } catch (err) {
      console.warn('⚠️ Change stream not supported (requires Replica Set):', err.message);
    }

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });