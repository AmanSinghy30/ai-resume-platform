const Job = require('../models/Job');
const { logActivity } = require('../utils/activityLogger');

const createJob = async (req, res) => {
  try {
    const { 
      title, description, requiredSkills, experienceRequired,
      niceToHaveSkills, skillWeight, experienceWeight, roleFitWeight
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }

    const skillsArray = typeof requiredSkills === 'string'
      ? requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
      : requiredSkills || [];

    const niceToHaveArray = typeof niceToHaveSkills === 'string'
      ? niceToHaveSkills.split(',').map(s => s.trim()).filter(Boolean)
      : niceToHaveSkills || [];

    const sw = Number(skillWeight) || 50;
    const ew = Number(experienceWeight) || 30;
    const rw = Number(roleFitWeight) || 20;

    if (sw + ew + rw !== 100) {
      return res.status(400).json({ success: false, message: 'Weights must sum to exactly 100' });
    }

    const job = await Job.create({
      title,
      description,
      requiredSkills: skillsArray,
      niceToHaveSkills: niceToHaveArray,
      skillWeight: sw,
      experienceWeight: ew,
      roleFitWeight: rw,
      experienceRequired: experienceRequired || 0,
      createdBy: req.user.id,
    });

    await logActivity('job_created', req.user.id, null, job._id, `Job created: ${title}`);

    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 9, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 9);
    const skip = (pageNum - 1) * limitNum;
    
    const query = { createdBy: req.user.id };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const totalCount = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
      
    res.json({ 
      success: true, 
      jobs,
      totalCount,
      totalPages,
      currentPage: pageNum
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      createdBy: req.user.id,  // ✅
    }).populate('candidates');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },  // ✅
      req.body,
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    await logActivity('job_updated', req.user.id, null, job._id, `Job updated: ${job.title}`);

    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,  // ✅
    });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    await logActivity('job_deleted', req.user.id, null, req.params.id, `Job deleted: ${job.title}`);

    res.json({ success: true, message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };