function buildAnalysisPrompt(resumeText, jobDescription = '') {
  return `
You are an expert HR recruiter and resume analyst.
Analyze the following resume carefully.
${jobDescription ? `The candidate is applying for: ${jobDescription}` : ''}

Resume:
"""
${resumeText.slice(0, 3000)}
"""

Respond ONLY with a valid JSON object. No explanation, no markdown, no extra text.
Use exactly this structure:

{
  "summary": "2-3 sentence professional summary of the candidate",
  "skills": ["skill1", "skill2", "skill3"],
  "experienceYears": 0,
  "education": "Extract ONLY the degree name and institution. Example: B.Tech Computer Science - IIT Delhi. If not found write empty string.",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "overallScore": 70,
  "recommendation": "shortlist",
  "reasoning": "2 sentences explaining the score and recommendation"
}

Rules:
- overallScore must be a number between 0 and 100
- recommendation must be exactly one of: "shortlist", "review", "reject"
- skills must be an array of strings
- strengths and weaknesses must be arrays of strings
- If information is missing, use reasonable defaults
`;
}

function buildScoringPrompt(resumeText, jobTitle, jobDescription, requiredSkills) {
  return `You are a technical recruiter. Score this candidate for the job AND provide full analysis.

Job: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${requiredSkills.join(', ')}

Resume:
${resumeText.slice(0, 2500)}

YOU MUST respond with ONLY a JSON object. No explanation. No markdown. Start with { end with }.

{"score":75,"skillMatch":80,"experienceMatch":70,"summary":"2-3 sentence summary of candidate","reasoning":"2 sentences explaining the score","matchedSkills":["skill1"],"missingSkills":["skill2"],"strengths":["strength1","strength2","strength3"],"weaknesses":["weakness1","weakness2"],"recommendation":"review"}

Rules:
- score, skillMatch, experienceMatch: integers 0-100
- recommendation: MUST be exactly one of: shortlist, review, reject
- summary: brief candidate overview (2-3 sentences)
- reasoning: WHY you gave this score (2 sentences)
- strengths: 3-5 specific strengths as array
- weaknesses: 2-4 specific weaknesses/gaps as array
- Do not add any text outside the JSON`;
}

function buildMatchingPrompt(jobTitle, jobDescription, requiredSkills, candidates) {
  const candidateSummaries = candidates.map((c, i) => ({
    index: i,
    id: c._id,
    name: c.name,
    skills: c.skills,
    experience: c.experience,
    currentScore: c.aiScore,
  }));

  return `
You are ranking candidates for a job position.

Job: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${requiredSkills.join(', ')}

Candidates:
${JSON.stringify(candidateSummaries, null, 2)}

Respond ONLY with valid JSON. No markdown, no explanation.

{
  "ranked": [
    {
      "candidateId": "id_string",
      "matchScore": 85,
      "reason": "one sentence explaining fit"
    }
  ]
}

Rules:
- Include ALL candidates in the ranked array
- matchScore must be 0-100
- Order from highest to lowest matchScore
- candidateId must exactly match the id field provided
`;
}

module.exports = { buildAnalysisPrompt, buildScoringPrompt, buildMatchingPrompt };