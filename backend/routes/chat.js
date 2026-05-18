// routes/chat.js

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const Analysis = require('../models/Analysis')
const { callAIWithFailover } = require('../services/ai/providers')
const { buildChatPrompt } = require('../services/ai/prompts')

// ─────────────────────────────────────────
// @route   POST /api/chat/analysis/:id
// @desc    Chat with AI about a specific analysis
// @access  Private
// ─────────────────────────────────────────
router.post('/analysis/:id', protect, async (req, res) => {
  try {
    // 1. Get the analysis this chat is about
    const analysis = await Analysis.findById(req.params.id)

    // 2. Check if analysis exists
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      })
    }

    // 3. Make sure this analysis belongs to logged in user
    if (analysis.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to chat about this analysis'
      })
    }

    // 4. Get message and chat history from request
    const { message, chatHistory = [] } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      })
    }

    // 5. Build the prompt with full context
    const prompt = buildChatPrompt(analysis, message, chatHistory)

    // 6. Call AI
    console.log('Chat AI thinking...')
    const { text, provider } = await callAIWithFailover(prompt)

    // 7. Return response
    res.status(200).json({
      success: true,
      message: text.trim(),
      provider,
      // Return updated history for frontend to store
      updatedHistory: [
        ...chatHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: text.trim() }
      ]
    })

  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({
      success: false,
      message: 'Chat failed',
      error: error.message
    })
  }
})

// ─────────────────────────────────────────
// @route   POST /api/chat/general
// @desc    General career advice chat
// @access  Private
// ─────────────────────────────────────────
router.post('/general', protect, async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      })
    }

    // Build general career advice prompt
    const prompt = `
You are an expert career advisor helping job seekers.
Give practical, specific, encouraging advice.
Keep responses under 150 words.
Be direct and actionable.

Chat history:
${chatHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${message}
`

    const { text, provider } = await callAIWithFailover(prompt)

    res.status(200).json({
      success: true,
      message: text.trim(),
      provider,
      updatedHistory: [
        ...chatHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: text.trim() }
      ]
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Chat failed',
      error: error.message
    })
  }
})

module.exports = router