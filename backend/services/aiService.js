// services/aiService.js

const { callAIWithFailover } = require('./ai/providers')
const { buildAnalysisPrompt } = require('./ai/prompts')
const { applyRealisticScoring } = require('./ai/scorer')
const { compareSkills } = require('./ai/skillExtractor')

// ─────────────────────────────────────────
// Parse AI response text into JSON
// ─────────────────────────────────────────
const parseAIResponse = (text) => {
  try {
    // Remove any markdown code blocks if present
    // Sometimes AI wraps JSON in ```json ... ```
    let cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    // Find JSON object in the text
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No JSON found in response')
    }

    const jsonString = cleaned.substring(jsonStart, jsonEnd + 1)
    return JSON.parse(jsonString)

  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error.message}`)
  }
}

// ─────────────────────────────────────────
// MAIN: Analyze resume against job description
// ─────────────────────────────────────────
const analyzeResume = async (resumeText, jobDescription) => {
  try {
    // 1. Build the prompt
    console.log('Building AI prompt...')
    const prompt = buildAnalysisPrompt(resumeText, jobDescription)

    // 2. Call AI with failover
    console.log('Calling AI providers...')
    const { text, provider } = await callAIWithFailover(prompt)

    // 3. Parse the JSON response
    console.log('Parsing AI response...')
    console.log('RAW TEXT FROM AI:', text.substring(0, 500))  // ← add this
    const rawAnalysis = parseAIResponse(text)

    // 4. Enhance skills with our own extractor
    // (combines AI skill detection + our keyword matching)
    const extractedSkills = compareSkills(resumeText, jobDescription)
    const dedupSkills = (arr) => {
  const seen = new Set()
  return arr.filter(skill => {
    const clean = skill.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (seen.has(clean)) return false
    seen.add(clean)
    return true
  })
}

    // Merge AI skills with extracted skills (remove duplicates)
   const mergedSkills = {
  matched: dedupSkills([
    ...(rawAnalysis.skills?.matched || []),
    ...extractedSkills.matched
  ]),
  missing: dedupSkills([
    ...(rawAnalysis.skills?.missing || []),
    ...extractedSkills.missing
  ]),
  bonus: dedupSkills([
    ...(rawAnalysis.skills?.bonus || []),
    ...extractedSkills.bonus
  ])
}

    // 5. Apply realistic scoring
    console.log('Applying realistic scoring...')
    const scoredAnalysis = applyRealisticScoring({
      ...rawAnalysis,
      skills: mergedSkills
    })

    // 6. Return final analysis
    return {
      success: true,
      provider,
      matchScore: scoredAnalysis.matchScore,
      analysis: {
        summary: scoredAnalysis.summary,
        strengths: scoredAnalysis.strengths || [],
        gaps: scoredAnalysis.gaps || [],
        recommendations: scoredAnalysis.recommendations || [],
        experienceLevel: scoredAnalysis.experienceLevel || 'mid',
        hiringDecision: scoredAnalysis.hiringDecision,
        redFlags: scoredAnalysis.redFlags || [],
        interviewQuestions: scoredAnalysis.interviewQuestions || [],
        scoringDetails: scoredAnalysis.scoringDetails
      },
      skills: mergedSkills,
      experienceAnalysis: scoredAnalysis.experienceAnalysis
    }

  } catch (error) {
    console.error('AI Analysis error:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

module.exports = { analyzeResume }