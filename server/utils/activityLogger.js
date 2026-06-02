const ActivityLog = require('../models/ActivityLog');

const ACTION_LABELS = {
  resume_uploaded:       'Resume uploaded',
  candidate_shortlisted: 'Candidate shortlisted',
  candidate_rejected:    'Candidate rejected',
  candidate_reviewed:    'Candidate marked as reviewed',
  job_created:           'New job created',
  job_updated:           'Job updated',
  job_deleted:           'Job deleted',
  ai_analysis_run:       'AI analysis completed',
  candidate_deleted:     'Candidate deleted',
};

async function logActivity(action, userId, candidateId = null, jobId = null, description = '') {
  try {
    const label = ACTION_LABELS[action] || action;
    await ActivityLog.create({
      action,
      performedBy: userId || null,
      candidateId: candidateId || null,
      jobId: jobId || null,
      description: description || label,
    });
  } catch (err) {
    // Never let logging crash the main flow
    console.error('Activity log error:', err.message);
  }
}

module.exports = { logActivity };