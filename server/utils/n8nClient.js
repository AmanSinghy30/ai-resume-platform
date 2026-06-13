const axios = require('axios');

const N8N_ENABLED = process.env.N8N_ENABLED === 'true';
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';

async function triggerResumeWorkflow(candidateId, filePath, jobId) {
  // If n8n is disabled — skip silently
  if (!N8N_ENABLED) {
    return { success: false, reason: 'n8n disabled' };
  }

  try {
    const response = await axios.post(
      `${N8N_BASE_URL}/webhook/resume-upload`,
      { candidateId, filePath, jobId },
      { timeout: 60000 }
    );
    return { success: true, data: response.data };
  } catch (err) {
    // n8n not running or failed — return false so fallback runs
    console.warn(`⚠️ n8n unavailable: ${err.message} — using fallback`);
    return { success: false, reason: err.message };
  }
}

module.exports = { triggerResumeWorkflow };