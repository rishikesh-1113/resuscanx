// config/multer.js

const multer = require('multer')
const path = require('path')
const uploadDir = 'uploads/'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// STORAGE — where and how to save files
const storage = multer.diskStorage({

  // Destination folder
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
    // cb = callback
    // null = no error
    // 'uploads/' = save here
  },

  // How to name the file
  filename: function (req, file, cb) {
    // Create unique filename:
    // "resume-1234567890-123456789.pdf"
    const uniqueName = `resume-${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const extension = path.extname(file.originalname) // ".pdf"
    cb(null, uniqueName + extension)
  }
})

// FILE FILTER — only allow PDFs
const fileFilter = (req, file, cb) => {
  // Check the file mimetype
  if (file.mimetype === 'application/pdf') {
    cb(null, true)  // accept the file
  } else {
    cb(new Error('Only PDF files are allowed'), false)  // reject
  }
}

// CREATE MULTER INSTANCE
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB maximum
    // 5 * 1024 * 1024 = 5,242,880 bytes = 5MB
  }
})

module.exports = upload