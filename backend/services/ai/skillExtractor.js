// services/ai/skillExtractor.js

// Common tech skills database
const TECH_SKILLS = [
  // Languages
  'javascript', 'python', 'java', 'typescript', 'c++', 'c#',
  'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'scala',

  // Frontend
  'react', 'angular', 'vue', 'next.js', 'html', 'css',
  'tailwind', 'bootstrap', 'redux', 'graphql',

  // Backend
  'node.js', 'express', 'django', 'flask', 'spring',
  'fastapi', 'laravel', 'rails',

  // Database
  'mongodb', 'postgresql', 'mysql', 'redis', 'firebase',
  'dynamodb', 'elasticsearch',

  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes',
  'ci/cd', 'jenkins', 'github actions',

  // Tools
  'git', 'linux', 'rest api', 'microservices',
  'agile', 'scrum', 'jira'
]

// ─────────────────────────────────────────
// Extract skills mentioned in text
// ─────────────────────────────────────────
const extractSkillsFromText = (text) => {
  const lowerText = text.toLowerCase()

  return TECH_SKILLS.filter(skill =>
    lowerText.includes(skill.toLowerCase())
  )
}

// ─────────────────────────────────────────
// Compare resume skills vs job skills
// ─────────────────────────────────────────
const compareSkills = (resumeText, jobDescription) => {
  const resumeSkills = extractSkillsFromText(resumeText)
  const jobSkills = extractSkillsFromText(jobDescription)

  const matched = resumeSkills.filter(s => jobSkills.includes(s))
  const missing = jobSkills.filter(s => !resumeSkills.includes(s))
  const bonus = resumeSkills.filter(s => !jobSkills.includes(s))

  return { matched, missing, bonus }
}

module.exports = { extractSkillsFromText, compareSkills }