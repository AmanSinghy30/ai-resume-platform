const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callAI(prompt, maxTokens = 1000) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash', // free tier model
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.3,
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return { success: true, text };
  } catch (err) {
    console.error('Gemini error:', err.message);
    return { success: false, error: err.message };
  }
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { callAI, sleep };