// middleware/auth.js

const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    let token

    // 1. Check if token exists in Authorization header
    // Header format: "Bearer eyJhbGciOiJIUzI1NiIs..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract just the token part (remove "Bearer ")
      token = req.headers.authorization.split(' ')[1]
    }

    // 2. If no token found — block the request
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided'
      })
    }

    // 3. Verify the token is genuine and not expired
    // jwt.verify() throws an error if token is invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // decoded looks like: { id: "507f1f77bcf86cd799439011", iat: ..., exp: ... }

    // 4. Find the user from database using ID in token
    const user = await User.findById(decoded.id)

    // 5. If user doesn't exist anymore
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user not found'
      })
    }

    // 6. Attach user to request object
    // Now any route using this middleware can access req.user
    req.user = user

    // 7. Continue to the actual route handler
    next()

  } catch (error) {
    // Token is invalid or expired
    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid token'
    })
  }
}

module.exports = { protect }