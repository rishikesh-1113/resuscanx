// routes/ats.js

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { runATSCheck, getATSTips } = require('../services/atsService')
const upload = require('../config/multer')
const { extractTextFromPDF } = require('../services/pdfService')

router.post('/check', protect, upload.single('resume'), async (req, res) => {
  const filePath = req.file?.path || null

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF resume'
      })
    }

    console.log('ATS Check: Extracting text from PDF...')
    const pdfResult = await extractTextFromPDF(filePath)

    if (!pdfResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Could not read PDF. Ensure it is a text-based PDF, not a scanned image.',
        error: process.env.NODE_ENV === 'development' ? pdfResult.error : undefined
      })
    }

    const resumeText = pdfResult.text

    if (resumeText.length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Resume appears empty or unreadable — try uploading a different PDF.'
      })
    }

    console.log('ATS Check: Running analysis...')
    const result = await runATSCheck(resumeText, filePath)

    console.log(`✅ ATS Check complete — Score: ${result.atsScore}% | AI: ${result.aiPowered}`)

    res.status(200).json({
      success: true,
      ats: result
    })

  } catch (error) {
    console.error('ATS check error:', error)
    res.status(500).json({
      success: false,
      message: 'ATS check failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

router.get('/tips', protect, async (req, res) => {
  try {
    const tips = getATSTips()
    res.status(200).json({
      success: true,
      count: tips.length,
      tips
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch tips',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router