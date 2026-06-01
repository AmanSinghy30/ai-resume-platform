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

const app = express();

// Core middleware
app.use(cors());
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', protect, candidateRoutes);
app.use('/api/jobs', protect, jobRoutes);
app.use('/api/ai', protect, aiRoutes);

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

// MongoDB + Server start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });