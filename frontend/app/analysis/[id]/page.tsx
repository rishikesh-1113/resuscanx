'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'
import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import { AnalysisResult } from '@/types'

export default function AnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showInterviewQ, setShowInterviewQ] = useState(false)

  const handleLogout = () => { logout(); router.push('/login') }

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await api.get(`/api/analysis/${params.id}`)
        if (response.data.success) 
        {
          const data = response.data.analysis

setAnalysis({
  ...data,
  // Fix ATS mapping
  ats: {
    score: data.atsScore || 0,
    rating: data.atsRating || 'Unknown',
    keywordMatchPercent: data.atsKeywordMatch || 0,
    issues: data.atsIssues || [],
    suggestions: data.atsSuggestions || [],
    passedChecks: data.atsPassedChecks || {
      hasEmail: false,
      hasPhone: false,
      hasDates: false,
      hasSections: false,
      goodLength: false
    }
  },
  // Fix analysis fields mapping
  strengths: data.analysis?.strengths || [],
  gaps: data.analysis?.gaps || [],
  recommendations: data.analysis?.recommendations || [],
  summary: data.analysis?.summary || '',
  experienceLevel: data.analysis?.experienceLevel || 'mid',
  hiringDecision: data.analysis?.hiringDecision || 'MAYBE',
  redFlags: data.analysis?.redFlags || [],
  interviewQuestions: data.analysis?.interviewQuestions || [],
  scoringDetails: data.analysis?.scoringDetails || {}
})
        }
      } catch { router.push('/dashboard') }
      finally { setIsLoading(false) }
    }
    fetchAnalysis()
  }, [params.id])

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #4F46E5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!analysis) return null

  const scoreColor = (s: number) => s >= 75 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444'
  const scoreBg = (s: number) => s >= 75 ? '#D1FAE5' : s >= 50 ? '#FEF3C7' : '#FEE2E2'
  const decisionStyle = (d: string) => {
    if (d === 'HIRE') return { color: '#065F46', background: '#D1FAE5', border: '1px solid #A7F3D0' }
    if (d === 'MAYBE') return { color: '#92400E', background: '#FEF3C7', border: '1px solid #FDE68A' }
    return { color: '#7F1D1D', background: '#FEE2E2', border: '1px solid #FECACA' }
  }

  const card = { background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: 24 }
  // Add this mapping object before the return
const checkLabels: Record<string, string> = {
  hasEmail: 'Email present',
  hasPhone: 'Phone present',
  hasDates: 'Dates included',
  hasSections: 'Clear sections',
  goodLength: 'Good length',
  hasActionVerbs: 'Action verbs',
  noSpecialChars: 'No special chars'
}

// Then in the display:
{Object.entries(analysis.ats.passedChecks).map(([key, passed]) => (
  <div key={key} className={`text-center text-xs py-2 px-3 rounded-lg border ${
    passed
      ? 'bg-green-50 border-green-200 text-green-700'
      : 'bg-red-50 border-red-200 text-red-600'
  }`}>
    {passed ? '✓' : '✗'} {checkLabels[key] || key}
  </div>
))}

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2' }}>
      <Navbar backHref="/history" backLabel="History" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '52px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-bricolage)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 600, color: '#0F0F0D', letterSpacing: '-0.02em', marginBottom: 6 }}>
              {analysis.jobTitle} — {analysis.companyName}
            </h1>
            <p style={{ fontSize: 13, color: '#9B9A96' }}>
              {new Date(analysis.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              <span style={{ margin: '0 8px' }}>·</span>
              Analyzed by {analysis.aiProvider}
            </p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 100, flexShrink: 0, ...decisionStyle(analysis.hiringDecision) }}>
            {analysis.hiringDecision}
          </span>
        </div>

        {/* Score Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Match Score', value: analysis.matchScore, sub: null },
            { label: 'ATS Score', value: analysis.ats?.score || 0, sub: analysis.ats?.rating },
          ].map((item, i) => (
            <div key={i} style={card}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9A96', marginBottom: 12 }}>{item.label}</p>
              <div style={{ fontSize: 48, fontWeight: 700, color: scoreColor(item.value), letterSpacing: '-0.03em', marginBottom: 12, fontFamily: 'var(--font-bricolage)' }}>
                {item.value}%
              </div>
              <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: 100, height: 5 }}>
                <div style={{ width: `${item.value}%`, background: scoreColor(item.value), borderRadius: 100, height: 5 }} />
              </div>
              {item.sub && <p style={{ fontSize: 12, color: '#9B9A96', marginTop: 8 }}>{item.sub}</p>}
            </div>
          ))}
          <div style={card}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9A96', marginBottom: 12 }}>Experience Level</p>
            <p style={{ fontSize: 24, fontWeight: 600, color: '#0F0F0D', textTransform: 'capitalize', marginBottom: 8, fontFamily: 'var(--font-bricolage)' }}>{analysis.experienceLevel}</p>
            <p style={{ fontSize: 13, color: '#5C5B57', lineHeight: 1.6 }}>{analysis.summary?.substring(0, 80)}...</p>
          </div>
        </div>

        {/* Strengths + Gaps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 12, marginBottom: 16 }}>
          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={15} color="#10B981" /> Strengths
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analysis.strengths?.map((s, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#5C5B57', lineHeight: 1.6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', marginTop: 7, flexShrink: 0 }} />{s}
                </li>
              ))}
            </ul>
          </div>
          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <XCircle size={15} color="#EF4444" /> Gaps
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analysis.gaps?.map((g, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#5C5B57', lineHeight: 1.6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#EF4444', marginTop: 7, flexShrink: 0 }} />{g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Skills */}
        <div style={{ ...card, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D', marginBottom: 20 }}>Skills Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 20 }}>
            {[
              { label: 'Matched', items: analysis.skills?.matched, color: '#10B981', bg: '#D1FAE5', border: '#A7F3D0' },
              { label: 'Missing', items: analysis.skills?.missing, color: '#EF4444', bg: '#FEE2E2', border: '#FECACA' },
              { label: 'Bonus', items: analysis.skills?.bonus, color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
            ].map(({ label, items, color, bg, border }) => (
              <div key={label}>
                <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color, marginBottom: 10 }}>
                  {label} ({items?.length || 0})
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {items?.map((s, i) => (
                    <span key={i} style={{ fontSize: 12, background: bg, color, border: `1px solid ${border}`, borderRadius: 6, padding: '3px 8px' }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div style={{ ...card, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={15} color="#4F46E5" /> Recommendations
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {analysis.recommendations?.map((r, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#5C5B57', lineHeight: 1.6 }}>
                <span style={{ color: '#4F46E5', fontWeight: 600, flexShrink: 0 }}>{i + 1}.</span>{r}
              </li>
            ))}
          </ul>
        </div>

        {/* ATS */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D' }}>ATS Compatibility</h3>
            <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100, ...((analysis.ats?.score || 0) >= 70 ? { color: '#065F46', background: '#D1FAE5', border: '1px solid #A7F3D0' } : (analysis.ats?.score || 0) >= 50 ? { color: '#92400E', background: '#FEF3C7', border: '1px solid #FDE68A' } : { color: '#7F1D1D', background: '#FEE2E2', border: '1px solid #FECACA' }) }}>
              {analysis.ats?.rating || 'Unknown'}
            </span>
          </div>
          {analysis.ats?.passedChecks && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px,1fr))', gap: 8, marginBottom: 20 }}>
              {Object.entries(analysis.ats.passedChecks).map(([key, passed]) => (
                <div key={key} style={{ textAlign: 'center', fontSize: 12, padding: '8px 4px', borderRadius: 8, background: passed ? '#D1FAE5' : '#FEE2E2', color: passed ? '#065F46' : '#7F1D1D', border: `1px solid ${passed ? '#A7F3D0' : '#FECACA'}` }}>
                  {passed ? '✓' : '✗'} {key.replace(/([A-Z])/g, ' $1').replace('has ', '')}
                </div>
              ))}
            </div>
          )}
          {analysis.ats?.issues?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9A96', marginBottom: 10 }}>Issues Found</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analysis.ats.issues.map((issue, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#5C5B57' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B', marginTop: 7, flexShrink: 0 }} />{issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.ats?.suggestions?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9A96', marginBottom: 10 }}>How to Fix</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analysis.ats.suggestions.map((s, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#5C5B57' }}>
                    <span style={{ color: '#4F46E5', flexShrink: 0 }}>→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Interview Questions */}
        <div style={{ ...card, marginBottom: 16 }}>
          <button onClick={() => setShowInterviewQ(!showInterviewQ)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D' }}>
              Interview Questions <span style={{ fontSize: 13, fontWeight: 400, color: '#9B9A96' }}>({analysis.interviewQuestions?.length || 0})</span>
            </h3>
            {showInterviewQ ? <ChevronUp size={16} color="#9B9A96" /> : <ChevronDown size={16} color="#9B9A96" />}
          </button>
          {showInterviewQ && (
            <ul style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analysis.interviewQuestions?.map((q, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#5C5B57', lineHeight: 1.6 }}>
                  <span style={{ color: '#9B9A96', flexShrink: 0 }}>Q{i + 1}.</span>{q}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chat CTA */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D', marginBottom: 4 }}>Want personalised advice?</h3>
            <p style={{ fontSize: 13, color: '#5C5B57' }}>Chat with our AI career advisor about this analysis</p>
          </div>
          <Link href={`/chat/${params.id}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#4F46E5', color: 'white',
            padding: '10px 18px', borderRadius: 8,
            fontSize: 13, fontWeight: 500, textDecoration: 'none', flexShrink: 0,
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#4338CA')}
            onMouseLeave={e => (e.currentTarget.style.background = '#4F46E5')}
          >
            <MessageSquare size={14} /> Start Chat
          </Link>
        </div>

      </main>
    </div>
  )
}