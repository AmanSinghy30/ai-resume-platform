const pdfParse = require('pdf-parse');
const fs = require('fs');

async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    // Clean extracted text
    const cleanText = data.text
      .replace(/\s+/g, ' ')        // collapse multiple spaces
      .replace(/\n{3,}/g, '\n\n')  // max 2 consecutive newlines
      .trim();

    return {
      success: true,
      text: cleanText,
      pages: data.numpages,
    };
  } catch (err) {
    return {
      success: false,
      text: '',
      error: err.message,
    };
  }
}

module.exports = { extractTextFromPDF };