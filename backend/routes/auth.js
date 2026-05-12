// routes/auth.js

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// ─────────────────────────────────────────
// HELPER: Create JWT Token
// ─────────────────────────────────────────
const createToken = (userId) => {
  return jwt.sign(
    { id: userId },           // payload — data inside the token
    process.env.JWT_SECRET,   // secret key — used to sign it
    { expiresIn: '30d' }      // token expires in 30 days
  )
}

// ─────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    // 1. Get data from request body
    const { name, email, password } = req.body

    // 2. Check if all fields provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      })
    }

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      })
    }

    // 4. Create user — password gets encrypted automatically
    // via our pre('save') middleware in the model
    const user = await User.create({ name, email, password })

    // 5. Create JWT token
    const token = createToken(user._id)

    // 6. Send response
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
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
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    // 1. Get email and password from request
    const { email, password } = req.body

    // 2. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    // 3. Find user — explicitly include password
    // (remember we set select: false — so we must ask for it here)
    const user = await User.findOne({ email }).select('+password')

    // 4. Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'  // vague on purpose — security
      })
    }

    // 5. Check if password matches
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'  // same message — security
      })
    }

    // 6. Create token and respond
    const token = createToken(user._id)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
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
// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
// ─────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is set by our middleware
    const user = await User.findById(req.user._id)

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router