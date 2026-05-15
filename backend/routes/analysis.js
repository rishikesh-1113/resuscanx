// routes/analysis.js

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const Analysis = require('../models/Analysis')
const upload = require('../config/multer')
const { extractTextFromPDF } = require('../services/pdfService')

// ─────────────────────────────────────────
// @route   GET /api/analysis/history
// @desc    Get all analyses for logged in user
// @access  Private
// ─────────────────────────────────────────
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
        message: 'Resume appears to be empty or unreadable. Please try a different PDF.'
      })
    }

    console.log(`Resume extracted: ${pdfResult.wordCount} words, ${pdfResult.pages} pages`)

    // 5. For now — return the extracted text
    // (AI analysis comes in next step!)
    res.status(200).json({
      success: true,
      message: 'Resume uploaded and text extracted successfully!',
      data: {
        wordCount: pdfResult.wordCount,
        pages: pdfResult.pages,
        resumePreview: resumeText.substring(0, 500) + '...',
        jobTitle: jobTitle || 'Position',
        companyName: companyName || 'Company'
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
router.get('/history', protect, async (req, res) => {
  try {
    // Find all analyses belonging to this user
    // Sort by newest first (-1 = descending)
    const analyses = await Analysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-resumeText') // exclude full resume text (too big)

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

    // Check if analysis exists
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      })
    }

    // Check if this analysis belongs to the logged in user
    // toString() because ObjectId needs conversion to compare
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

    // Only owner can delete
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