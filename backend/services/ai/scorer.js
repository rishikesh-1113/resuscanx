// services/ai/scorer.js

// ─────────────────────────────────────────
// Apply realistic scoring adjustments
// Raw AI scores tend to be too generous
// This makes them match real recruiter logic
// ─────────────────────────────────────────
const applyRealisticScoring = (rawAnalysis) => {
  let score = rawAnalysis.matchScore
  const penalties = []
  const bonuses = []

  // ── EXPERIENCE GAP PENALTIES ──
  const expAnalysis = rawAnalysis.experienceAnalysis
  if (expAnalysis) {
    const gap = expAnalysis.yearsRequired - expAnalysis.yearsFound

    if (gap >= 3) {
      score -= 20
      penalties.push(`Major experience gap: ${gap} years short`)
    } else if (gap >= 1) {
      score -= 10
      penalties.push(`Experience gap: ${gap} years short`)
    } else if (gap < 0) {
      score += 5
      bonuses.push(`Exceeds experience requirement`)
    }
  }

  // ── MISSING CRITICAL SKILLS PENALTY ──
  const missingSkills = rawAnalysis.skills?.missing || []
  if (missingSkills.length >= 5) {
    score -= 15
    penalties.push(`Missing ${missingSkills.length} required skills`)
  } else if (missingSkills.length >= 3) {
    score -= 8
    penalties.push(`Missing ${missingSkills.length} required skills`)
  }

  // ── RED FLAGS PENALTY ──
  const redFlags = rawAnalysis.redFlags || []
  if (redFlags.length > 0) {
    score -= (redFlags.length * 5)
    penalties.push(`${redFlags.length} red flag(s) detected`)
  }

  // ── BONUS SKILLS BONUS ──
  const bonusSkills = rawAnalysis.skills?.bonus || []
  if (bonusSkills.length >= 3) {
    score += 5
    bonuses.push(`Strong bonus skills`)
  }

  // ── ENFORCE REALISTIC RANGE ──
  // Never below 20 (they did submit something)
  // Never above 95 (no one is perfect)
  score = Math.max(20, Math.min(95, score))

  // ── HIRING DECISION based on final score ──
  let hiringDecision
  if (score >= 75) hiringDecision = 'HIRE'
  else if (score >= 50) hiringDecision = 'MAYBE'
  else hiringDecision = 'REJECT'

  return {
    ...rawAnalysis,
    matchScore: Math.round(score),
    hiringDecision,
    scoringDetails: {
      originalScore: rawAnalysis.matchScore,
      finalScore: Math.round(score),
      penalties,
      bonuses
    }
  }
}

module.exports = { applyRealisticScoring }