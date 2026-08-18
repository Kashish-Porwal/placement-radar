const OpenAI = require('openai');

let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const isMockMode = () => !openai;

// Helper to call OpenAI GPT-4o-mini with 5s timeout safeguard
const callAI = async ({ prompt, temperature = 0.1, max_tokens = 1000 }) => {
  if (!openai) {
    throw new Error('No OpenAI API key found');
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('OpenAI API request timed out (5s limit)')), 5000)
  );

  const apiPromise = openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens,
  });

  const response = await Promise.race([apiPromise, timeoutPromise]);
  return response.choices[0].message.content.trim();
};

const analyzeJobDescription = async (resumeText, jdText) => {
  if (isMockMode()) {
    console.log("Mocking AI API: analyzeJobDescription");
    return {
      matchScore: 78,
      extractedSkills: ["React", "Node.js", "MongoDB", "Express", "Tailwind CSS"],
      missingSkills: ["AWS", "Docker", "GraphQL"]
    };
  }

  const prompt = `
    You are an expert technical recruiter and ATS system.
    Analyze the following Job Description against the provided Resume.
    Return ONLY a raw JSON object (no markdown, no backticks) with the following exact structure:
    {
      "matchScore": <Number between 0-100 based on fit>,
      "extractedSkills": [<Array of core skills found in the JD>],
      "missingSkills": [<Array of skills from the JD missing from the resume>]
    }

    Resume:
    ${resumeText}

    Job Description:
    ${jdText}
  `;

  try {
    const responseText = await callAI({ prompt, temperature: 0.1, max_tokens: 1000 });
    // Clean code fences if present
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Analysis Error (Falling back to mock):", error.message || error);
    return {
      matchScore: 78,
      extractedSkills: ["React", "Node.js", "MongoDB", "Express", "Tailwind CSS"],
      missingSkills: ["AWS", "Docker", "GraphQL", "(Mocked due to API tier limitation)"]
    };
  }
};

const tailorResume = async (resumeJson, jdText) => {
  if (isMockMode()) {
    console.log("Mocking AI API: tailorResume");
    const tailored = JSON.parse(JSON.stringify(resumeJson));
    if (tailored.summary) {
      tailored.summary = "Passionate and results-driven professional tailored for this specific role, bringing extensive experience in modern web technologies and a proven track record of delivering scalable solutions.";
    }
    return tailored;
  }

  const prompt = `
    You are an expert resume writer.
    Tailor the provided JSON resume to align perfectly with the provided Job Description.
    Rules:
    1. Reorder skills and highlight ones most relevant to the JD.
    2. Rephrase bullet points to emphasize impact using keywords from the JD.
    3. DO NOT fabricate or invent experience, projects, or skills the candidate doesn't have.
    4. Return ONLY a raw JSON object (no markdown, no backticks) in the EXACT same schema as the input.

    Input JSON:
    ${JSON.stringify(resumeJson)}

    Job Description:
    ${jdText}
  `;

  try {
    const responseText = await callAI({ prompt, temperature: 0.3, max_tokens: 2500 });
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Tailoring Error (Falling back to mock):", error.message || error);
    const tailored = JSON.parse(JSON.stringify(resumeJson));
    if (tailored.summary) {
      tailored.summary = "Passionate and results-driven professional tailored for this specific role (Mocked due to API tier limitation).";
    }
    return tailored;
  }
};

const generateFollowUp = async (applicationData) => {
  if (isMockMode()) {
    return "Hi Hiring Manager,\n\nI recently applied for the " + applicationData.role + " position at " + applicationData.company + ". I am very passionate about the opportunity and would love to know if there are any updates on my application.\n\nBest regards.";
  }

  const prompt = `Draft a polite, professional, and concise follow-up email/message for a job application.
    Company: ${applicationData.company}
    Role: ${applicationData.role}
    Platform: ${applicationData.platform}
    Date Applied: ${applicationData.appliedDate}
    
    Return ONLY the text of the message, nothing else.`;

  try {
    return await callAI({ prompt, temperature: 0.5, max_tokens: 500 });
  } catch (error) {
    return "Hi Hiring Manager,\n\nI recently applied for the " + applicationData.role + " position at " + applicationData.company + ". I am very passionate about the opportunity and would love to know if there are any updates on my application.\n\nBest regards.";
  }
};

const parseAndScoreResume = async (rawText) => {
  // Helper for dynamic offline/fallback parsing from raw text
  const parseLocally = (text) => {
    const knownSkillsList = [
      'C++', 'C', 'Python', 'Java', 'JavaScript', 'TypeScript', 'React.js', 'React', 'Next.js', 
      'Node.js', 'Express', 'SQL', 'MongoDB', 'PostgreSQL', 'Tailwind', 'HTML', 'CSS', 
      'Git', 'VS Code', 'MATLAB', 'Docker', 'AWS', 'Tkinter', 'LeetCode', 'GeeksforGeeks',
      'DBMS', 'Operating Systems', 'Computer Networks', 'Object-Oriented Programming'
    ];
    
    const foundSkills = knownSkillsList.filter(skill => 
      new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
    );

    // Extract first 3 non-empty lines for summary
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    const summaryText = lines.slice(0, 3).join(' | ') || text.substring(0, 300);

    return {
      summary: summaryText,
      skills: foundSkills.length > 0 ? foundSkills : ['JavaScript', 'React', 'Node.js'],
      projects: [],
      experience: [],
      education: [],
      overallScore: 82,
      suggestions: [
        "Include more numerical metrics (e.g., % improvement, users scaled) to highlight impact.",
        "Add a dedicated Certifications or Achievements section.",
        "Ensure consistent date formatting across all experience entries."
      ]
    };
  };

  if (isMockMode()) {
    return parseLocally(rawText);
  }

  const prompt = `
    You are an expert ATS (Applicant Tracking System) parser and resume reviewer.
    I am providing you with the raw extracted text from a candidate's resume PDF.
    Your task is to:
    1. Parse the text into structured JSON format (summary, skills, projects, experience, education).
    2. Give it a general ATS impact and formatting score from 0 to 100 based on standard best practices (e.g., action verbs, metrics, clear sections).
    3. Provide 2-3 short, actionable suggestions on how to improve this resume fundamentally.

    Return ONLY a raw JSON object (no markdown, no backticks) with this exact schema:
    {
      "summary": "Short 2 sentence summary of their profile",
      "skills": ["Array", "of", "all", "extracted", "skills"],
      "projects": [{"title": "...", "description": "...", "tech": ["..."]}],
      "experience": [{"title": "...", "company": "...", "bullets": ["..."]}],
      "education": [{"degree": "...", "institute": "...", "year": "..."}],
      "overallScore": 85,
      "suggestions": ["Use more numbers to quantify impact", "Add a dedicated certifications section"]
    }

    Raw Resume Text:
    ${rawText}
  `;

  try {
    const responseText = await callAI({ prompt, temperature: 0.1, max_tokens: 2500 });
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Parsing Error (Falling back to dynamic parser):", error.message || error);
    return parseLocally(rawText);
  }
};

module.exports = {
  analyzeJobDescription,
  tailorResume,
  generateFollowUp,
  parseAndScoreResume
};
