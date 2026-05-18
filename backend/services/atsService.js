// services/atsService.js

const { callAIWithFailover } = require('./ai/providers')
const fs = require('fs')

const SCORE = {
  START: 70,
  MIN: 15,
  MAX: 85,
  CAP_NO_EMAIL: 55,
  CAP_NO_PHONE: 62,
  CAP_NO_SECTIONS: 50,
  PENALTY_NO_EMAIL: 22,
  PENALTY_NO_PHONE: 15,
  PENALTY_NO_SECTION: 12,
  PENALTY_NO_DATES: 8,
  PENALTY_SPECIAL_CHARS: 10,
  PENALTY_NO_VERBS: 10,
  PENALTY_TOO_SHORT: 15,
  PENALTY_TOO_LONG: 8,
  AI_SCORE_MIN: 20,
  AI_SCORE_MAX: 85,
}

const detectProfile = (resumeText) => {
  const hasWorkExperience = /\b(work experience|professional experience|employment|work history)\b/i.test(resumeText)
  const hasProjects = /\b(projects|portfolio|academic projects|personal projects)\b/i.test(resumeText)
  const isStudent = /\b(student|pursuing|b\.?e|b\.?tech|bachelor|college|university)\b/i.test(resumeText)
  if (!hasWorkExperience && (hasProjects || isStudent)) return 'fresher'
  return 'experienced'
}

const runATSCheck = async (resumeText, filePath = null) => {
  if (filePath) fs.unlink(filePath, () => {})

  const profile = detectProfile(resumeText)
  console.log(`ATS: Profile detected — ${profile}`)

  try {
    const [aiResult, techResult] = await Promise.allSettled([
      getAIAnalysis(resumeText, profile),
      Promise.resolve(performTechnicalChecks(resumeText, profile))
    ])

    const ai = aiResult.status === 'fulfilled' ? aiResult.value : null
    const tech = techResult.value

    if (!ai) {
      console.log('AI failed — returning technical checks only')
      return { ...tech, aiPowered: false }
    }

    const mergedIssues = mergeAndDeduplicate(
      ai.issues || [],
      tech.issues || []
    ).slice(0, 8)

    const mergedSuggestions = mergeAndDeduplicate(
      ai.suggestions || [],
      tech.suggestions || []
    ).slice(0, 6)

    let score = validateAIScore(ai.atsScore, tech.atsScore)

    if (!tech.passedChecks.hasEmail)    score = Math.min(score, SCORE.CAP_NO_EMAIL)
    if (!tech.passedChecks.hasPhone)    score = Math.min(score, SCORE.CAP_NO_PHONE)
    if (!tech.passedChecks.hasSections) score = Math.min(score, SCORE.CAP_NO_SECTIONS)

    score = clamp(score, SCORE.MIN, SCORE.MAX)

    return {
      atsScore: Math.round(score),
      rating: getRating(score),
      issues: mergedIssues,
      suggestions: mergedSuggestions,
      passedChecks: tech.passedChecks,
      profile,
      aiPowered: true
    }

  } catch (err) {
    console.error('ATS check error:', err.message)
    const tech = performTechnicalChecks(resumeText, profile)
    return { ...tech, profile, aiPowered: false }
  }
}

const getAIAnalysis = async (resumeText, profile) => {
  const profileNote = profile === 'fresher'
    ? `NOTE: This is a student/fresher resume with no work experience.
       Treat "Projects" as equivalent to "Experience".
       Do NOT penalize for lack of work history.
       DO flag missing metrics, vague descriptions, missing GitHub/LinkedIn.`
    : `NOTE: This is an experienced professional resume.
       Flag experience gaps, missing quantified achievements, weak impact statements.`

  const prompt = `
You are a strict ATS evaluator with 15 years of recruiting experience.
Analyze this resume for ATS compatibility. Be specific — reference actual content from the resume.
Be realistic — most resumes score 35-70%.

${profileNote}

RESUME:
${resumeText.substring(0, 3200)}

Evaluate on:
1. PARSING (40%): Contact info present, standard section headers, clean text, readable dates
2. CONTENT QUALITY (35%): Action verbs, quantified achievements, specific skills
3. FORMAT (25%): No special characters, consistent structure, appropriate length

Find SPECIFIC issues — reference actual resume content.
Examples of good issues:
- "Skills section lists 'Gmail' — not a technical skill, replace with relevant tools"
- "Project descriptions lack metrics — 'Developed chat app' should be 'Developed chat app serving 200+ users'"
- "No GitHub or LinkedIn URL in contact section"
- "Education dates show only graduation year — add month for ATS parsing"

Respond with ONLY valid JSON, no text outside:
{
  "atsScore": <number 20-80>,
  "issues": [
    "<specific issue referencing actual resume content>",
    "<specific issue>",
    "<specific issue>"
  ],
  "suggestions": [
    "<specific actionable fix>",
    "<specific fix>",
    "<specific fix>"
  ]
}
`

  const { text } = await callAIWithFailover(prompt)
  const parsed = parseJSON(text)

  parsed.atsScore = clamp(parsed.atsScore || 50, SCORE.AI_SCORE_MIN, SCORE.AI_SCORE_MAX)

  if (parsed.atsScore > 75 && (!parsed.issues || parsed.issues.length === 0)) {
    parsed.atsScore = Math.min(parsed.atsScore, 72)
  }
  if (parsed.atsScore < 25 && (!parsed.issues || parsed.issues.length < 3)) {
    parsed.atsScore = Math.max(parsed.atsScore, 30)
  }

  return parsed
}

const performTechnicalChecks = (resumeText, profile = 'experienced') => {
  const issues = []
  const suggestions = []
  let score = SCORE.START

  // ── Email ──
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText)
  if (!hasEmail) {
    score -= SCORE.PENALTY_NO_EMAIL
    issues.push('No email address found — ATS will auto-reject this resume')
    suggestions.push('Add email in plain text at the top: email@example.com')
  }

  // ── Phone (international-safe) ──
  const hasPhone = /(\+?\d[\d\s\-().]{6,}\d)/.test(resumeText)
  if (!hasPhone) {
    score -= SCORE.PENALTY_NO_PHONE
    issues.push('No phone number detected in ATS-readable format')
    suggestions.push('Add phone number: +91 98765 43210 or (555) 123-4567')
  }

  // ── Sections ──
  const sectionPatterns = profile === 'fresher'
    ? {
        experience: /\b(experience|employment|work history|projects|portfolio|internship)\b/i,
        education:  /\b(education|degree|university|college|bachelor|master|b\.?e|b\.?tech)\b/i,
        skills:     /\b(skills|technical skills|competencies|technologies)\b/i
      }
    : {
        experience: /\b(experience|employment|work history|professional experience)\b/i,
        education:  /\b(education|degree|university|college|bachelor|master)\b/i,
        skills:     /\b(skills|technical skills|competencies|technologies)\b/i
      }

  const foundSections = Object.entries(sectionPatterns)
    .filter(([_, pattern]) => pattern.test(resumeText))
    .map(([name]) => name)

  const hasSections = foundSections.length >= 3

  if (!hasSections) {
    score -= SCORE.PENALTY_NO_SECTION * (3 - foundSections.length)
    const missing = ['experience', 'education', 'skills'].filter(s => !foundSections.includes(s))
    issues.push(`Missing standard sections: ${missing.join(', ').toUpperCase()} — ATS cannot categorize content`)
    suggestions.push(`Add clear section headers: ${missing.map(s => s.toUpperCase()).join(', ')}`)
  }

  // ── Dates ──
  const hasDates = /\b(20\d{2}|19\d{2})\b/.test(resumeText) ||
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(resumeText)

  if (!hasDates) {
    score -= SCORE.PENALTY_NO_DATES
    issues.push('No dates detected — ATS cannot calculate years of experience')
    suggestions.push('Add dates to all entries: Jan 2022 – Present or 08/2023 – Present')
  }

  // ── Special Characters ──
  const hasSpecialChars = /[★✓✗◆▶❖➤☑☒✔✘]/u.test(resumeText)
  const noSpecialChars = !hasSpecialChars
  if (hasSpecialChars) {
    score -= SCORE.PENALTY_SPECIAL_CHARS
    issues.push('Special symbols detected (★ ✓ ◆) — many ATS systems cannot parse these')
    suggestions.push('Replace symbols with plain hyphens (-) or remove them entirely')
  }

  // ── Action Verbs ──
  const actionVerbs = [
    'managed', 'developed', 'created', 'implemented', 'analyzed',
    'designed', 'led', 'built', 'improved', 'delivered', 'achieved',
    'launched', 'coordinated', 'established', 'reduced', 'increased',
    'utilized', 'integrated', 'automated', 'deployed', 'optimized'
  ]
  const verbCount = actionVerbs.filter(v =>
    new RegExp(`\\b${v}`, 'i').test(resumeText)
  ).length
  const hasActionVerbs = verbCount >= 3

  if (!hasActionVerbs) {
    score -= SCORE.PENALTY_NO_VERBS
    issues.push(`Only ${verbCount} action verbs found — ATS keyword matching needs more`)
    suggestions.push('Start bullet points with: Built, Led, Developed, Implemented, Designed')
  }

  // ── Length ──
  const wordCount = resumeText.split(/\s+/).filter(w => w.length > 0).length
  const minWords = profile === 'fresher' ? 150 : 250
  const goodLength = wordCount >= minWords && wordCount <= 1000

  if (wordCount < minWords) {
    score -= SCORE.PENALTY_TOO_SHORT
    issues.push(`Resume too short (${wordCount} words) — ATS needs more content to rank effectively`)
    suggestions.push('Expand project/experience descriptions with specific details and outcomes')
  } else if (wordCount > 1000) {
    score -= SCORE.PENALTY_TOO_LONG
    issues.push(`Resume too long (${wordCount} words) — aim for 300-700 words`)
    suggestions.push('Remove outdated or irrelevant content; consolidate older roles')
  }

  // ── Metrics ──
  const hasMetrics = /\d+\s*(%|users|customers|projects|teams|members|million|thousand|\bk\b|hours|days|ms|seconds)/i
    .test(resumeText)
  if (!hasMetrics) {
    issues.push('No quantified achievements — ATS ranks resumes with metrics higher')
    suggestions.push('Add numbers: "Served 200+ users", "Reduced load time by 30%"')
  }

  // ── GitHub / LinkedIn ──
  const hasProfileLink = /github\.com|linkedin\.com/i.test(resumeText)
  if (!hasProfileLink) {
    issues.push('No GitHub or LinkedIn URL — recruiters and ATS expect this for tech roles')
    suggestions.push('Add your GitHub and LinkedIn links to the contact section')
  }

  // ── Hard Caps ──
  if (!hasEmail) score = Math.min(score, SCORE.CAP_NO_EMAIL)
  if (!hasPhone) score = Math.min(score, SCORE.CAP_NO_PHONE)

  score = clamp(score, SCORE.MIN, SCORE.MAX)

  return {
    atsScore: Math.round(score),
    rating: getRating(score),
    issues,
    suggestions,
    passedChecks: {
      hasEmail,
      hasPhone,
      hasDates,
      hasSections,
      goodLength,
      hasActionVerbs,
      noSpecialChars,
      hasMetrics,
      hasProfileLink
    },
    aiPowered: false
  }
}

const clamp = (val, min, max) => Math.max(min, Math.min(max, val))

const getRating = (score) => {
  if (score >= 70) return 'ATS Optimized'
  if (score >= 50) return 'Needs Improvement'
  return 'ATS Unfriendly'
}

const validateAIScore = (aiScore, techScore) => {
  if (!aiScore) return techScore
  const diff = Math.abs(aiScore - techScore)
  if (diff > 25) return Math.round((aiScore * 0.65) + (techScore * 0.35))
  return aiScore
}

const parseJSON = (text) => {
  try {
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('No JSON object found')
    return JSON.parse(cleaned.substring(start, end + 1))
  } catch (err) {
    throw new Error(`JSON parse failed: ${err.message}`)
  }
}

const mergeAndDeduplicate = (arr1, arr2) => {
  const combined = [...arr1, ...arr2]
  const seen = new Set()
  return combined.filter(item => {
    if (!item || typeof item !== 'string') return false
    if (item.includes('{') || item.includes('type:') || item.includes('"details"')) return false
    const key = item.toLowerCase().replace(/\s+/g, ' ').substring(0, 35)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const getATSTips = () => [
  { category: 'Format',        tip: 'Use single-column layout — avoid tables and columns',            impact: 'high'   },
  { category: 'Contact',       tip: 'Put name, email, phone, GitHub, LinkedIn at the very top',      impact: 'high'   },
  { category: 'File Type',     tip: 'Submit as .docx or simple PDF — not image-based PDFs',          impact: 'high'   },
  { category: 'Sections',      tip: 'Use standard headers: Experience, Education, Skills, Projects', impact: 'medium' },
  { category: 'Dates',         tip: 'Use consistent format: Jan 2023 – Present',                     impact: 'medium' },
  { category: 'Action Verbs',  tip: 'Start bullets with: Built, Led, Developed, Implemented',        impact: 'medium' },
  { category: 'Metrics',       tip: 'Quantify achievements: "Improved speed by 40%"',                impact: 'high'   },
  { category: 'Special Chars', tip: 'Avoid symbols and icons — use plain hyphens',                   impact: 'medium' },
  { category: 'Skills',        tip: 'List skills as plain text — not as bars or visual charts',      impact: 'medium' },
  { category: 'Length',        tip: 'Keep resume 300-700 words for most roles',                      impact: 'low'    },
  { category: 'Fonts',         tip: 'Use standard fonts: Arial, Calibri, Times New Roman',           impact: 'low'    }
]

module.exports = { runATSCheck, getATSTips }