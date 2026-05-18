// server.js

const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

// Import routes
const authRoutes = require('./routes/auth')
const analysisRoutes = require('./routes/analysis')
const atsRoutes = require('./routes/ats')
const chatRoutes = require('./routes/chat') 

// Load environment variables FIRST
dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/ats', atsRoutes)
app.use('/api/chat', chatRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'HireMatch API is running!',
    status: 'success',
    version: '1.0.0'
  })
})

// Start server
const PORT = process.env.PORT || 12001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})