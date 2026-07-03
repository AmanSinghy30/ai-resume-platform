function buildAnalysisPrompt(resumeText, jobDescription = '') {
  return `
You are an elite Senior Technical Recruiter with 15+ years of experience evaluating candidates across all industries.
Analyze the following resume with extreme rigor and provide a comprehensive evaluation that will help a hiring manager decide whether to shortlist or reject this candidate.

${jobDescription ? `The candidate is applying for this role:\n"""\n${jobDescription}\n"""` : 'No specific job description provided — evaluate general employability and professional quality.'}

Resume:
"""
${resumeText.slice(0, 4000)}
"""

Respond ONLY with a valid JSON object. No explanation, no markdown, no extra text. Start with { end with }.

{
  "summary": "2-3 sentence professional summary of the candidate",
  "skills": ["skill1", "skill2", "skill3"],
  "experienceYears": 0,
  "education": "Extract ONLY the degree name and institution. Example: B.Tech Computer Science - IIT Delhi. If not found write empty string.",

  "overallScore": 72,

  "verdict": "YES",
  "verdictConfidence": 78,
  "verdictSummary": "One clear sentence explaining why this candidate should or should not move forward",

  "dimensionScores": {
    "skillMatch": 80,
    "experienceRelevance": 70,
    "educationFit": 65,
    "projectQuality": 75,
    "communicationClarity": 60
  },

  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],

  "redFlags": [
    { "flag": "Short title", "severity": "critical", "detail": "Explanation of the concern" }
  ],
  "greenFlags": [
    { "flag": "Short title", "detail": "Why this is a strong positive signal" }
  ],

  "skillGapAnalysis": [
    { "skill": "React", "candidateLevel": "advanced", "requiredLevel": "advanced" },
    { "skill": "Docker", "candidateLevel": "none", "requiredLevel": "intermediate" }
  ],

  "interviewQuestions": [
    { "question": "The actual question to ask", "rationale": "Why ask this", "area": "technical" }
  ],

  "comparativeNotes": "1-2 sentences on how this candidate compares to a typical applicant for this kind of role",
  "cultureFitNotes": "1-2 sentences about soft skills, communication style, and team-fit observations based on the resume",

  "recommendation": "shortlist",
  "reasoning": "2 sentences explaining the score and recommendation"
}

Rules:
- overallScore must be a number between 0 and 100
- experienceYears must be an integer (e.g., 0, 1, 2, etc.)
- verdict must be exactly one of: "STRONG_YES", "YES", "MAYBE", "NO", "STRONG_NO"
- verdictConfidence must be a number between 0 and 100
- recommendation must be exactly one of: "shortlist", "review", "reject"
- skills, strengths, weaknesses must be arrays of strings
- dimensionScores values must all be numbers between 0 and 100
- redFlags severity must be one of: "critical", "moderate", "minor"
- redFlags: include 0-5 items. Only include genuine concerns. If no red flags, return empty array.
- greenFlags: include 0-5 items. Only include genuinely impressive signals. If none, return empty array.
- skillGapAnalysis: compare candidate skills against job requirements. candidateLevel and requiredLevel must be one of: "none", "beginner", "intermediate", "advanced", "expert". Include 3-8 key skills.
- interviewQuestions: provide 3-5 targeted questions. area must be one of: "technical", "behavioral", "experience", "culture"
- If information is missing, use reasonable defaults
- Be honest and calibrated — do not inflate scores
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