function parseAIJson(text) {
  try {
    // Remove markdown code blocks if present
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    return { success: true, data: JSON.parse(cleaned) };
  } catch (err) {
    // Try to find JSON object inside the text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return { success: true, data: JSON.parse(match[0]) };
      } catch {
        return { success: false, error: 'Could not parse JSON from AI response' };
      }
    }
    return { success: false, error: 'No valid JSON found in response' };
  }
}

module.exports = { parseAIJson };