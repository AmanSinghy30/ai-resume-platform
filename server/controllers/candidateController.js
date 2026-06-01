const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const { validationResult } = require('express-validator');
const fs = require('fs');

// @route POST /api/candidates/upload
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    const { name, email, phone, jobId } = req.body;

    if (!name || !email) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    // Check if job exists (if jobId provided)
    if (jobId) {
      const job = await Job.findById(jobId);
      if (!job) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ success: false, message: 'Job not found' });
      }
    }

    const candidate = await Candidate.create({
      name,
      email,
      phone: phone || '',
      resumeUrl: req.file.path,
      jobId: jobId || null,
      status: 'new',
    });

    // Add candidate to job's candidates array
    if (jobId) {
      await Job.findByIdAndUpdate(jobId, {
        $push: { candidates: candidate._id }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      candidate,
    });
  } catch (err) {
    // Clean up file if DB save fails
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/candidates
const getCandidates = async (req, res) => {
  try {
    const { status, jobId, search, sortBy, order } = req.query;
    const query = {};

    if (status) query.status = status;
    if (jobId) query.jobId = jobId;
    if (search) query.name = { $regex: search, $options: 'i' };

    const sort = {};
    sort[sortBy || 'createdAt'] = order === 'asc' ? 1 : -1;

    const candidates = await Candidate.find(query)
      .sort(sort)
      .populate('jobId', 'title');

    res.json({ success: true, count: candidates.length, candidates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/candidates/:id
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('jobId', 'title description');
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    res.json({ success: true, candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PATCH /api/candidates/:id/status
const updateCandidateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'reviewed', 'shortlisted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    res.json({ success: true, candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/candidates/:id
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Delete resume file from disk
    if (candidate.resumeUrl && fs.existsSync(candidate.resumeUrl)) {
      fs.unlinkSync(candidate.resumeUrl);
    }

    await candidate.deleteOne();
    res.json({ success: true, message: 'Candidate deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  uploadResume,
  getCandidates,
  getCandidateById,
  updateCandidateStatus,
  deleteCandidate,
};