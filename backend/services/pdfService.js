// services/pdfService.js

const fs = require('fs')
const path = require('path')

// ─────────────────────────────────────────
// Extract text from uploaded PDF file
// ─────────────────────────────────────────
const extractTextFromPDF = async (filePath) => {
  try {
    // 1. Read the PDF file from disk as binary data
    const dataBuffer = fs.readFileSync(filePath)

    // 2. Dynamically import pdf-parse
    const pdfParse = require('pdf-parse')
    
    // 3. Parse the PDF — extract all text
    const data = await pdfParse(dataBuffer)

    // 4. Clean the extracted text
    const cleanText = cleanResumeText(data.text)

    // 5. Delete the file after extraction
    deleteFile(filePath)

    return {
      success: true,
      text: cleanText,
      pages: data.numpages,
      wordCount: cleanText.split(' ').length
    }

  } catch (error) {
    // If something goes wrong, still try to delete the file
    deleteFile(filePath)

    return {
      success: false,
      error: error.message
    }
  }
}

// ─────────────────────────────────────────
// Clean extracted text
// ─────────────────────────────────────────
const cleanResumeText = (text) => {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\S\n]{2,}/g, ' ')
    .trim()
}

// ─────────────────────────────────────────
// Delete file from disk
// ─────────────────────────────────────────
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`Deleted file: ${filePath}`)
    }
  } catch (error) {
    console.error(`Could not delete file: ${filePath}`)
  }
}

module.exports = { extractTextFromPDF }