const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callAI(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return { success: true, text };  // ✅ added success: true
  } catch (err) {
    console.error('callAI error:', err.message);
    return { success: false, text: undefined, error: err.message };
  }
}

async function callAIWithRetry(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await callAI(prompt);

      if (result.success) {
        return result; // ✅ return immediately on success
      }

      console.error(`AI attempt ${attempt} failed: ${result.error}`);
    } catch (err) {
      console.error(`AI attempt ${attempt} exception: ${err.message}`);
    }

    if (attempt < retries) {
      await sleep(attempt * 1000);
    }
  }

  return { success: false, text: undefined, error: 'All retries failed' };
}

// ✅ sleep exported so controller can import it
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { callAI, callAIWithRetry, sleep };