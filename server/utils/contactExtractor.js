function extractName(text) {
  if (!text) return '';

  const stopWords = [
    'Email', 'E-mail', 'Phone', 'Mobile', 'Tel', 'Telephone', 'Address',
    'LinkedIn', 'GitHub', 'Twitter', 'Portfolio', 'Website',
    'Resume', 'CV', 'Curriculum', 'Contact', 'Profile', 'Summary',
    'Objective', 'About', 'Education', 'Experience', 'Skills',
    'http', 'https', 'www', '@'
  ];

  const stopRegex = new RegExp(`(${stopWords.join('|')})`, 'i');

  const cleanName = (str) => {
    return str.split(stopRegex)[0].trim().replace(/\s+/g, ' ');
  };

  const isValidName = (str) => {
    if (!str || str.length < 4 || str.length > 50) return false;
    const words = str.split(' ');
    if (words.length < 2 || words.length > 4) return false;
    // Each word must be at least 2 chars and start with uppercase
    return words.every(w => w.length >= 1 && /^[A-Z]/.test(w));
  };

  // Pattern 1 — "Name: John Doe"
  const labelMatch = text.match(/(?:name|candidate)\s*[:\-]\s*([A-Z][a-zA-Z\s.'-]{2,40})/i);
  if (labelMatch) {
    const cleaned = cleanName(labelMatch[1]);
    if (isValidName(cleaned)) return cleaned;
  }

  const lines = text
    .split(/\n|\r/)
    .map(l => l.trim())
    .filter(l => l.length > 1);

  // Pattern 2 — Standard "First Last" capitalized
  for (const line of lines.slice(0, 8)) {
    const cleaned = cleanName(line);
    if (
      /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/.test(cleaned) &&
      cleaned.length >= 4 && cleaned.length <= 50
    ) {
      return cleaned;
    }
  }

  // Pattern 3 — First 200 chars: try to find a name
  const firstChunk = text.slice(0, 200);
  const nameMatch = firstChunk.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/);
  if (nameMatch) {
    const cleaned = cleanName(nameMatch[1]);
    if (isValidName(cleaned)) return cleaned;
  }

  // Pattern 4 — All caps "MAYA PATEL" or "JOHN DOE"
  for (const line of lines.slice(0, 10)) {
    const cleaned = cleanName(line);
    // Allow single space between, 2-4 words, all caps, 2+ chars each
    if (/^[A-Z]{2,}(?:\s+[A-Z]{2,}){1,3}$/.test(cleaned)) {
      return cleaned
        .split(' ')
        .map(w => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  // Pattern 5 — Mixed: "MAYA Patel" or "Maya PATEL" (partial caps)
  for (const line of lines.slice(0, 10)) {
    const cleaned = cleanName(line);
    if (
      /^[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,3}$/.test(cleaned) &&
      cleaned.length >= 4 && cleaned.length <= 50
    ) {
      // Normalize to title case
      return cleaned
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  // Pattern 6 — Search for "MAYA PA" type pattern at very start (incomplete caps)
  const firstWords = text.slice(0, 100).match(/^([A-Z]{2,}(?:\s+[A-Z]{1,})*)/);
  if (firstWords) {
    const cleaned = cleanName(firstWords[1]);
    if (cleaned.length >= 4) {
      return cleaned
        .split(' ')
        .map(w => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  // Pattern 7 — Look near the email (name is often nearby)
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (emailMatch) {
    const idx = text.indexOf(emailMatch[0]);
    const before = text.slice(Math.max(0, idx - 100), idx);
    const nameNear = before.match(/([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3})\s*$/);
    if (nameNear) {
      const cleaned = cleanName(nameNear[1]);
      if (isValidName(cleaned)) return cleaned;
    }
  }

  return '';
}

function extractEmail(text) {
  if (!text) return '';
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : '';
}

function extractPhone(text) {
  if (!text) return '';

  const patterns = [
    /(?:\+91[\s\-]?)?[6-9]\d{9}/,                    // Indian mobile
    /\+?[\d\s\-().]{10,15}/,                          // General international
    /\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}/,         // US format
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const cleaned = match[0].replace(/[^\d+]/g, '');
      if (cleaned.length >= 10) return match[0].trim();
    }
  }

  return '';
}

module.exports = { extractName, extractEmail, extractPhone };