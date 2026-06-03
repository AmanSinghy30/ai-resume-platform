const SKILLS_LIST = [
  // Frontend
  'html', 'css', 'javascript', 'typescript', 'react', 'next.js', 'vue', 'angular',
  'tailwind', 'bootstrap', 'sass', 'scss', 'redux', 'jquery', 'webpack', 'vite',
  'figma', 'adobe xd', 'material ui', 'chakra ui',

  // Backend
  'node.js', 'express', 'express.js', 'django', 'flask', 'fastapi', 'spring boot',
  'ruby on rails', 'php', 'laravel', 'asp.net', 'graphql', 'rest api', 'microservices',

  // Databases
  'mongodb', 'mysql', 'postgresql', 'sqlite', 'redis', 'firebase',
  'dynamodb', 'cassandra', 'elasticsearch', 'prisma', 'mongoose',

  // Languages
  'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift',
  'kotlin', 'scala', 'r', 'matlab', 'bash', 'shell scripting',

  // DevOps / Cloud
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'google cloud',
  'ci/cd', 'jenkins', 'github actions', 'terraform', 'ansible', 'linux',
  'nginx', 'apache', 'vercel', 'heroku', 'netlify',

  // AI / Data
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
  'scikit-learn', 'pandas', 'numpy', 'opencv', 'nlp', 'computer vision',
  'data analysis', 'power bi', 'tableau', 'excel', 'sql',

  // Mobile
  'react native', 'flutter', 'android', 'ios', 'swift', 'dart',
  'expo', 'ionic',

  // Tools
  'git', 'github', 'gitlab', 'jira', 'postman', 'vs code',
  'linux', 'agile', 'scrum', 'jest', 'cypress', 'selenium',
  'webpack', 'babel', 'eslint',
];

function extractSkills(rawText) {
  if (!rawText) return [];

  const lower = rawText.toLowerCase();
  const found = new Set();

  for (const skill of SKILLS_LIST) {
    // Match whole word — avoids partial matches like "r" matching everywhere
    const regex = new RegExp(`(?<![a-z])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z])`, 'i');
    if (regex.test(lower)) {
      // Capitalize properly for display
      found.add(skill
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      );
    }
  }

  return Array.from(found);
}

function extractExperience(rawText) {
  if (!rawText) return 0;

  const patterns = [
    /(\d+)\+?\s*years?\s*of\s*(?:professional\s*)?experience/i,
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:work|industry|relevant)\s*experience/i,
    /experience\s*(?:of\s*)?(\d+)\+?\s*years?/i,
    /(\d+)\+?\s*yrs?\s*(?:of\s*)?experience/i,
  ];

  for (const pattern of patterns) {
    const match = rawText.match(pattern);
    if (match) return parseInt(match[1]);
  }

  // Fallback: count distinct year ranges like "2020 - 2023"
  const yearRanges = rawText.match(/20\d{2}\s*[-–]\s*(?:20\d{2}|present|current)/gi);
  if (yearRanges && yearRanges.length > 0) {
    let total = 0;
    for (const range of yearRanges) {
      const years = range.match(/\d{4}/g);
      if (years && years.length >= 1) {
        const start = parseInt(years[0]);
        const end = years[1] ? parseInt(years[1]) : new Date().getFullYear();
        total += Math.max(0, end - start);
      }
    }
    return Math.min(total, 30); // cap at 30 to avoid bad data
  }

  return 0;
}

function extractEducation(rawText) {
  if (!rawText) return '';

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Strong degree patterns — must appear at start or clearly in a line
  const degreePatterns = [
    /\b(b\.?\s*tech|bachelor\s+of\s+technology)\b/i,
    /\b(b\.?\s*e\.?|bachelor\s+of\s+engineering)\b/i,
    /\b(b\.?\s*sc\.?|bachelor\s+of\s+science)\b/i,
    /\b(b\.?\s*a\.?|bachelor\s+of\s+arts)\b/i,
    /\b(b\.?\s*com\.?|bachelor\s+of\s+commerce)\b/i,
    /\b(m\.?\s*tech|master\s+of\s+technology)\b/i,
    /\b(m\.?\s*e\.?|master\s+of\s+engineering)\b/i,
    /\b(m\.?\s*sc\.?|master\s+of\s+science)\b/i,
    /\b(m\.?\s*b\.?\s*a\.?|master\s+of\s+business)\b/i,
    /\b(ph\.?\s*d\.?|doctorate)\b/i,
    /\b(diploma\s+in)\b/i,
    /\b(high\s+school|secondary\s+school|12th|10th)\b/i,
  ];

  // Check each line strictly
  for (const line of lines) {
    for (const pattern of degreePatterns) {
      if (pattern.test(line)) {
        // Make sure it's not too short or too long
        if (line.length > 5 && line.length < 150) {
          return line.slice(0, 120);
        }
      }
    }
  }

  return '';
}

module.exports = { extractSkills, extractExperience, extractEducation };