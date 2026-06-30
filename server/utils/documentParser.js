const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');

async function extractTextFromDocument(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    let text = '';
    let pages = 1;

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
      pages = data.numpages || 1;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (ext === '.doc') {
      const extractor = new WordExtractor();
      const extracted = await extractor.extract(filePath);
      text = extracted.getBody();
    } else {
      throw new Error('Unsupported file format. Please upload a PDF or Word document.');
    }

    // Clean extracted text
    const cleanText = text
      .replace(/\s+/g, ' ')        // collapse multiple spaces
      .replace(/\n{3,}/g, '\n\n')  // max 2 consecutive newlines
      .trim();

    return {
      success: true,
      text: cleanText,
      pages: pages,
    };
  } catch (err) {
    return {
      success: false,
      text: '',
      error: err.message,
    };
  }
}

module.exports = { extractTextFromDocument };
