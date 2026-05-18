// routes/analysis.js

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const Analysis = require('../models/Analysis')
const upload = require('../config/multer')
const { extractTextFromPDF } = require('../services/pdfService')
const { analyzeResume } = require('../services/aiService')
const { runATSCheck } = require('../services/atsService')

// ─────────────────────────────────────────
// @route   POST /api/analysis/analyze
// @desc    Upload resume + analyze against job description
// @access  Private
// ─────────────────────────────────────────
router.post('/analyze', protect, upload.single('resume'), async (req, res) => {
  try {
    // 1. Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF resume'
      })
    }

    // 2. Check if job description was provided
    const { jobDescription, jobTitle, companyName } = req.body
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job description'
      })
    }

    // 3. Extract text from PDF
    console.log('Extracting text from PDF...')
    const pdfResult = await extractTextFromPDF(req.file.path)

    if (!pdfResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Could not read PDF file. Please ensure it is a valid PDF.',
        error: pdfResult.error
      })
    }

    const resumeText = pdfResult.text

    // 4. Validate extracted text
    if (resumeText.length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Resume appears to be empty or unreadable.'
      })
    }

    console.log(`Extracted: ${pdfResult.wordCount} words, ${pdfResult.pages} pages`)

    // 5. Run AI Analysis + ATS Check simultaneously
    // Promise.all runs both at the same time — faster!
    console.log('Running AI analysis and ATS check...')
    const [aiResult, atsResult] = await Promise.all([
      analyzeResume(resumeText, jobDescription),
      runATSCheck(resumeText, jobDescription)
    ])

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        message: 'AI analysis failed',
        error: aiResult.error
      })
    }

    // 6. Save complete results to MongoDB
    const analysis = await Analysis.create({
      user: req.user._id,
      resumeText,
      jobDescription,
      jobTitle: jobTitle || 'Position',
      companyName: companyName || 'Company',
      matchScore: aiResult.matchScore,
      analysis: aiResult.analysis,
      skills: aiResult.skills,
      aiProvider: aiResult.provider,
      atsScore: atsResult.atsScore,
      atsIssues: atsResult.issues,
      atsSuggestions: atsResult.suggestions,
      atsRating: atsResult.rating,
      atsKeywordMatch: atsResult.keywordMatchPercent,
      atsPassedChecks: atsResult.passedChecks
    })

    console.log(`✅ Analysis complete — Match: ${aiResult.matchScore}% | ATS: ${atsResult.atsScore}%`)

    // 7. Return full results
    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully!',
      analysis: {
        id: analysis._id,
        matchScore: analysis.matchScore,
        hiringDecision: analysis.analysis.hiringDecision,
        experienceLevel: analysis.analysis.experienceLevel,
        summary: analysis.analysis.summary,
        strengths: analysis.analysis.strengths,
        gaps: analysis.analysis.gaps,
        recommendations: analysis.analysis.recommendations,
        skills: analysis.skills,
        redFlags: analysis.analysis.redFlags,
        interviewQuestions: analysis.analysis.interviewQuestions,
        scoringDetails: analysis.analysis.scoringDetails,
        aiProvider: analysis.aiProvider,
        jobTitle: analysis.jobTitle,
        companyName: analysis.companyName,
        ats: {
          score: atsResult.atsScore,
          rating: atsResult.rating,
          keywordMatchPercent: atsResult.keywordMatchPercent,
          issues: atsResult.issues,
          suggestions: atsResult.suggestions,
          passedChecks: atsResult.passedChecks
        },
        createdAt: analysis.createdAt
      }
    })

  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during analysis',
      error: error.message
    })
  }
})

// ─────────────────────────────────────────
// @route   GET /api/analysis/history
// @desc    Get all analyses for logged in user
// @access  Private
// ─────────────────────────────────────────
router.get('/history', protect, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-resumeText')

    res.status(200).json({
      success: true,
      count: analyses.length,
      analyses
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
})

// ─────────────────────────────────────────
// @route   GET /api/analysis/:id
// @desc    Get single analysis by ID
// @access  Private
// ─────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id)

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      })
    }

    if (analysis.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this analysis'
      })
    }

    res.status(200).json({
      success: true,
      analysis
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
})

// ─────────────────────────────────────────
// @route   DELETE /api/analysis/:id
// @desc    Delete an analysis
// @access  Private
// ─────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id)

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      })
    }

    if (analysis.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this analysis'
      })
    }

    await analysis.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Analysis deleted successfully'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
})

module.exports = router