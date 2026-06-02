const mongoose = require('mongoose');
require('dotenv').config();
const Candidate = require('../models/Candidate');
const { extractTextFromPDF } = require('./pdfParser');
const { extractSkills, extractExperience, extractEducation } = require('./skillExtractor');

async function backfill() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  const candidates = await Candidate.find({
    $or: [{ rawText: '' }, { skills: { $size: 0 } }]
  });

  console.log(`Processing ${candidates.length} candidates...`);

  for (const c of candidates) {
    if (!c.resumeUrl) { console.log(`Skipping ${c.name} — no file`); continue; }

    const parsed = await extractTextFromPDF(c.resumeUrl);
    if (parsed.success && parsed.text) {
      c.rawText = parsed.text;
      c.skills = extractSkills(parsed.text);
      c.experience = extractExperience(parsed.text);
      c.education = extractEducation(parsed.text);
      await c.save();
      console.log(`✅ ${c.name} — ${c.skills.length} skills, ${c.experience} yrs`);
    } else {
      console.log(`❌ ${c.name} — parse failed`);
    }
  }

  console.log('Done');
  process.exit(0);
}

backfill();