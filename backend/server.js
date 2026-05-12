// server.js

// 1. Import packages
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

const authRoutes = require('./routes/auth') 
const analysisRoutes = require('./routes/analysis')
// 2. Load environment variables from .env file
dotenv.config()

connectDB() // Connect to MongoDB before starting the server

// 3. Create the express app
const app = express()

// 4. Middleware — runs on every request
app.use(cors())                    // Allow frontend to connect
app.use(express.json())    
        // Allow reading JSON from requests

// 5. Use the auth routes
app.use('/api/auth', authRoutes)
app.use('/api/analysis', analysisRoutes)
// 6. A simple test route
app.get('/', (req, res) => {
  res.json({ message: 'ResuScanX API is running!' })
})

// 6. Start the server
const PORT = process.env.PORT || 12001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})