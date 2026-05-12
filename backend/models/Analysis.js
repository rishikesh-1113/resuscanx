// models/Analysis.js

const mongoose = require('mongoose')

const AnalysisSchema = new mongoose.Schema(
  {
    // Which user does this analysis belong to?
    // ref: 'User' creates a relationship between collections
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Original resume text (extracted from PDF)
    resumeText: {
      type: String,
      required: true
    },

    // Job description the user wants to match against
    jobDescription: {
      type: String,
      required: true
    },

    // Job title extracted from job description
    jobTitle: {
      type: String,
      default: 'Position'
    },

    // Company name if found in job description
    companyName: {
      type: String,
      default: 'Company'
    },

    // Overall match score 0-100
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    // Detailed AI analysis
    analysis: {
      // What the resume does well for this role
      strengths: [String],

      // What's missing or weak
      gaps: [String],

      // Specific improvements suggested
      recommendations: [String],

      // entry / junior / mid / senior
      experienceLevel: {
        type: String,
        enum: ['entry', 'junior', 'mid', 'senior'],
        default: 'mid'
      },

      // Final hiring recommendation
      hiringDecision: {
        type: String,
        enum: ['HIRE', 'MAYBE', 'REJECT'],
        default: 'MAYBE'
      },

      // Summary paragraph
      summary: {
        type: String,
        default: ''
      }
    },

    // Skills breakdown
    skills: {
      // Skills in resume that match job description
      matched: [String],

      // Skills required but missing from resume
      missing: [String],

      // Extra skills that are a bonus
      bonus: [String]
    },

    // ATS compatibility score
    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // ATS issues found
    atsIssues: [String],

    // ATS improvements suggested
    atsSuggestions: [String],

    // Which AI provider gave the analysis
    aiProvider: {
      type: String,
      default: 'gemini'
    }
  },

  // Second argument to Schema — options
  {
    timestamps: true
    // Automatically adds:
    // createdAt — when analysis was created
    // updatedAt — when it was last modified
  }
)

const Analysis = mongoose.model('Analysis', AnalysisSchema)

module.exports = Analysis