'use client'
import Navbar from '@/components/ui/Navbar'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'
import { Send, Loader2, User, Bot } from 'lucide-react'
import { ChatMessage } from '@/types'
import toast from 'react-hot-toast'

interface Analysis {
  jobTitle: string
  companyName: string
  matchScore: number
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user, logout } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true)

  const handleLogout = () => { logout(); router.push('/login') }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await api.get(`/api/analysis/${params.id}`)
        if (response.data.success) {
          const data = response.data.analysis
          setAnalysis({ jobTitle: data.jobTitle || 'Position', companyName: data.companyName || 'Company', matchScore: data.matchScore || 0 })
          setMessages([{ role: 'assistant', content: `Hi ${user?.name?.split(' ')[0]}! I have reviewed your resume analysis for ${data.jobTitle || 'this role'} at ${data.companyName || 'this company'}. Your match score is ${data.matchScore}%. What would you like to know?` }])
        }
      } catch {
        toast.error('Could not load analysis')
        router.push('/history')
      } finally {
        setIsLoadingAnalysis(false)
      }
    }
    fetchAnalysis()
  }, [params.id])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    const userMessage = input.trim()
    setInput('')
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)
    try {
      const response = await api.post(`/api/chat/analysis/${params.id}`, { message: userMessage, chatHistory: messages })
      if (response.data.success) {
        setMessages([...newMessages, { role: 'assistant', content: response.data.message }])
      }
    } catch {
      toast.error('Failed to send message')
      setMessages(messages)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const suggestions = ['How can I improve my match score?', 'What skills should I learn first?', 'Am I ready for this role?', 'How do I fix my ATS score?']

  const formatMessage = (text: string) => {
    const lines = text.split('\n')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {lines.map((line, i) => {
          if (!line.trim()) return null
          const formatted = line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
            j % 2 === 1 ? <strong key={j} style={{ color: '#0F0F0D', fontWeight: 600 }}>{part}</strong> : part
          )
          if (/^\d+\./.test(line.trim())) return (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: '#4F46E5', flexShrink: 0 }}>{line.match(/^\d+/)?.[0]}.</span>
              <span>{formatted}</span>
            </div>
          )
          if (line.trim().startsWith('-') || line.trim().startsWith('•')) return (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: '#9B9A96', flexShrink: 0 }}>·</span>
              <span>{formatted}</span>
            </div>
          )
          return <p key={i}>{formatted}</p>
        })}
      </div>
    )
  }

  if (isLoadingAnalysis) return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #4F46E5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', display: 'flex', flexDirection: 'column' }}>
      <Navbar backHref={`/analysis/${params.id}`} backLabel="Results" />

      {/* Chat Header */}
      <div style={{ background: 'rgba(247,246,242,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '12px 24px', flexShrink: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D', marginBottom: 2, fontFamily: 'var(--font-bricolage)' }}>
            Career Advisor — {analysis?.jobTitle} at {analysis?.companyName}
          </p>
          <p style={{ fontSize: 12, color: '#9B9A96' }}>
            Match score: {analysis?.matchScore}% · Ask anything about your analysis
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((message, index) => (
            <div key={index} style={{ display: 'flex', gap: 10, justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {message.role === 'assistant' && (
                <div style={{ width: 28, height: 28, background: '#4F46E5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Bot size={14} color="white" />
                </div>
              )}
              <div style={{
                maxWidth: '80%', borderRadius: 12, padding: '10px 14px', fontSize: 14, lineHeight: 1.65,
                ...(message.role === 'user'
                  ? { background: '#4F46E5', color: 'white' }
                  : { background: 'white', border: '1px solid rgba(0,0,0,0.07)', color: '#5C5B57' })
              }}>
                {message.role === 'assistant' ? formatMessage(message.content) : message.content}
              </div>
              {message.role === 'user' && (
                <div style={{ width: 28, height: 28, background: '#EEF2FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <User size={14} color="#4F46E5" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 28, height: 28, background: '#4F46E5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={14} color="white" />
              </div>
              <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '10px 14px' }}>
                <Loader2 size={14} color="#9B9A96" style={{ animation: 'spin 0.7s linear infinite' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ padding: '0 24px 12px', flexShrink: 0 }}>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => setInput(s)} style={{
                fontSize: 12, background: 'white', border: '1px solid rgba(0,0,0,0.07)',
                color: '#5C5B57', padding: '6px 12px', borderRadius: 100, cursor: 'pointer', transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#4F46E5')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)')}
              >{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', padding: '16px 24px', flexShrink: 0, background: 'rgba(247,246,242,0.85)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 10 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your resume analysis..."
            rows={1}
            style={{
              flex: 1, background: 'white', border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#0F0F0D',
              resize: 'none', outline: 'none', fontFamily: 'inherit',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#4F46E5')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)')}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            style={{
              width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: !input.trim() || isLoading ? '#E5E4E0' : '#4F46E5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, alignSelf: 'flex-end', transition: 'background 0.15s',
            }}
          >
            <Send size={15} color="white" />
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#9B9A96', textAlign: 'center', marginTop: 8 }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}