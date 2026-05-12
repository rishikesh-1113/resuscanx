// routes/analysis.js

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const Analysis = require('../models/Analysis')

// ─────────────────────────────────────────
// @route   GET /api/analysis/history
// @desc    Get all analyses for logged in user
// @access  Private
// ─────────────────────────────────────────
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