// types/index.ts

export interface User {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
}

export interface Skills {
  matched: string[]
  missing: string[]
  bonus: string[]
}

export interface ATSResult {
  score: number
  rating: string
  keywordMatchPercent: number
  issues: string[]
  suggestions: string[]
  passedChecks: {
    hasEmail: boolean
    hasPhone: boolean
    hasDates: boolean
    hasSections: boolean
    goodLength: boolean
  }
}

export interface AnalysisResult {
  id: string
  matchScore: number
  hiringDecision: 'HIRE' | 'MAYBE' | 'REJECT'
  experienceLevel: string
  summary: string
  strengths: string[]
  gaps: string[]
  recommendations: string[]
  skills: Skills
  redFlags: string[]
  interviewQuestions: string[]
  scoringDetails: {
    originalScore: number
    finalScore: number
    penalties: string[]
    bonuses: string[]
  }
  ats: ATSResult
  aiProvider: string
  jobTitle: string
  companyName: string
  createdAt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}