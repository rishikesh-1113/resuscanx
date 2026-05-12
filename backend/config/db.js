// config/db.js

const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    // mongoose.connect() returns a promise
    // so we use await to wait for it
    const conn = await mongoose.connect(process.env.MONGO_URI)

    // If successful, log the host name
    console.log(`MongoDB Connected: ${conn.connection.host}`)

  } catch (error) {
    // If it fails, log the error and stop the server
    console.error(`MongoDB Connection Error: ${error.message}`)
    process.exit(1) // 1 means "exit with failure"
  }
}

module.exports = connectDB