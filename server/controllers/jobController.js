const Job = require('../models/Job');

const createJob = async (req, res) => {
  try {
    const { title, description, requiredSkills, experienceRequired } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }

    const skillsArray = typeof requiredSkills === 'string'
      ? requiredSkills.split(',').map(s => s.trim())
      : requiredSkills || [];

    const job = await Job.create({
      title,
      description,
      requiredSkills: skillsArray,
      experienceRequired: experienceRequired || 0,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('candidates');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };