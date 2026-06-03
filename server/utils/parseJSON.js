function parseAIJson(text) {
  if (!text) {
    return { success: false, error: 'Empty response from AI' };
  }

  // Step 1: Remove markdown code blocks
  let cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Step 2: Try direct parse
  try {
    const data = JSON.parse(cleaned);
    return { success: true, data };
  } catch (e1) {
    // Step 3: Extract between first { and last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const extracted = cleaned.slice(firstBrace, lastBrace + 1);

      try {
        const data = JSON.parse(extracted);
        return { success: true, data };
      } catch (e2) {
        // Step 4: Fix common issues and retry
        const fixed = extracted
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/\n/g, ' ')
          .replace(/\t/g, ' ');

        try {
          const data = JSON.parse(fixed);
          return { success: true, data };
        } catch (e3) {
          return {
            success: false,
            error: `Parse failed: ${e3.message}. Raw: ${extracted.slice(0, 200)}`
          };
        }
      }
    }

    return {
      success: false,
      error: `No JSON found. Raw: ${cleaned.slice(0, 200)}`
    };
  }
}

module.exports = { parseAIJson };