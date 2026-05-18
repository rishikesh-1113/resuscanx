// models/Analysis.js

const mongoose = require('mongoose')

const AnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    resumeText: {
      type: String,
      required: true
    },

    jobDescription: {
      type: String,
      required: true
    },

    jobTitle: {
      type: String,
      default: 'Position'
    },

    companyName: {
      type: String,
      default: 'Company'
    },

    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    // Nested analysis object from AI
    analysis: {
      strengths: [String],
      gaps: [String],
      recommendations: [String],
      redFlags: [String],
      interviewQuestions: [String],
      experienceLevel: {
        type: String,
        enum: ['entry', 'junior', 'mid', 'senior'],
        default: 'mid'
      },
      hiringDecision: {
        type: String,
        enum: ['HIRE', 'MAYBE', 'REJECT'],
        default: 'MAYBE'
      },
      summary: {
        type: String,
        default: ''
      },
      scoringDetails: {
        originalScore: Number,
        finalScore: Number,
        penalties: [String],
        bonuses: [String]
      }
    },

    skills: {
      matched: [String],
      missing: [String],
      bonus: [String]
    },

    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    atsRating: {
      type: String,
      default: 'Unknown'
    },

    atsKeywordMatch: {
      type: Number,
      default: 0
    },

    atsIssues: [String],

    atsSuggestions: [String],

    atsPassedChecks: {
  hasEmail:       { type: Boolean, default: false },
  hasPhone:       { type: Boolean, default: false },
  hasDates:       { type: Boolean, default: false },
  hasSections:    { type: Boolean, default: false },
  goodLength:     { type: Boolean, default: false },
  hasActionVerbs: { type: Boolean, default: false },
  noSpecialChars: { type: Boolean, default: false },
  hasMetrics:     { type: Boolean, default: false },
  hasProfileLink: { type: Boolean, default: false }
},

    aiProvider: {
      type: String,
      default: 'gemini'
    }
  },
  {
    timestamps: true
  }
)

const Analysis = mongoose.model('Analysis', AnalysisSchema)

module.exports = Analysis