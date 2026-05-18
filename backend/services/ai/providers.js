// services/ai/providers.js

const axios = require('axios')

// Timeout for all AI requests (18 seconds)
const TIMEOUT = 18000

// ─────────────────────────────────────────
// PROVIDER 1: Google Gemini
// ─────────────────────────────────────────
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Gemini API key not configured')

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192
        // ← responseMimeType removed — was forcing JSON on chat responses too
      }
    },
    { timeout: TIMEOUT }
  )

  let text = response.data.candidates[0].content.parts[0].text
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim()
  return text
}

// ─────────────────────────────────────────
// PROVIDER 2: Mistral AI
// ─────────────────────────────────────────
const callMistral = async (prompt) => {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new Error('Mistral API key not configured')

  const response = await axios.post(
    'https://api.mistral.ai/v1/chat/completions',
    {
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2048
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: TIMEOUT
    }
  )

  return response.data.choices[0].message.content
}

// ─────────────────────────────────────────
// PROVIDER 3: Cohere
// ─────────────────────────────────────────
const callCohere = async (prompt) => {
  const apiKey = process.env.COHERE_API_KEY
  if (!apiKey) throw new Error('Cohere API key not configured')

  const response = await axios.post(
    'https://api.cohere.com/v2/chat',
    {
      model: 'command-r-plus-08-2024',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.3
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: TIMEOUT
    }
  )

  return response.data.message.content[0].text
}

// ─────────────────────────────────────────
// PROVIDER 4: OpenRouter
// ─────────────────────────────────────────
const callOpenRouter = async (prompt) => {
  const apiKey = process.env.OPEN_ROUTER_API_KEY
  if (!apiKey) throw new Error('OpenRouter API key not configured')

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'openai/gpt-oss-20b:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.3
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:12001',
        'X-Title': 'HireMatch'
      },
      timeout: TIMEOUT
    }
  )

  return response.data.choices[0].message.content
}

// ─────────────────────────────────────────
// MAIN: Try all providers with failover
// ─────────────────────────────────────────
const callAIWithFailover = async (prompt) => {
  // Define providers in priority order
const providers = [
  { name: 'mistral',    fn: callMistral },
  { name: 'gemini',     fn: callGemini },
  { name: 'cohere',     fn: callCohere },
  { name: 'openrouter', fn: callOpenRouter }
]

  let lastError = null

  // Try each provider one by one
  for (const provider of providers) {
    try {
      console.log(`Trying AI provider: ${provider.name}...`)

      const result = await provider.fn(prompt)

      console.log(`✅ Success with provider: ${provider.name}`)

      return {
        text: result,
        provider: provider.name
      }

    } catch (error) {
 console.log(`❌ ${provider.name} failed: ${error.response?.data?.error?.message || error.message}`)
      lastError = error
      // Continue to next provider
    }
  }

  // All providers failed
  throw new Error(`All AI providers failed. Last error: ${lastError.message}`)
}

module.exports = {
  callAIWithFailover,
  callGemini,
  callMistral,
  callCohere,
  callOpenRouter
}