'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import Navbar from '@/components/ui/Navbar'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import {
  FileText, Upload, X, Loader2,
  CheckCircle, XCircle, AlertCircle,
  Shield, ChevronRight
} from 'lucide-react'

interface ATSResult {
  atsScore: number
  rating: string
  profile: 'fresher' | 'experienced'
  aiPowered: boolean
  passedChecks: {
    hasEmail: boolean
    hasPhone: boolean
    hasDates: boolean
    hasSections: boolean
    goodLength: boolean
    hasActionVerbs: boolean
    noSpecialChars: boolean
    hasMetrics: boolean
    hasProfileLink: boolean
  }
  issues: string[]
  suggestions: string[]
}

export default function ATSCheckerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ATSResult | null>(null)

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') { toast.error('Please upload a PDF file only'); return }
    if (selectedFile.size > 5 * 1024 * 1024) { toast.error('File size must be under 5MB'); return }
    setFile(selectedFile)
    setResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { toast.error('Please upload your resume'); return }
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const response = await api.post('/api/ats/check', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      })
      if (response.data.success) setResult(response.data.ats)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ATS check failed')
    } finally {
      setIsLoading(false)
    }
  }

  const scoreColor  = (s: number) => s >= 70 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444'
  const scoreBg     = (s: number) => s >= 70 ? '#D1FAE5' : s >= 50 ? '#FEF3C7' : '#FEE2E2'
  const scoreBorder = (s: number) => s >= 70 ? '#A7F3D0' : s >= 50 ? '#FDE68A' : '#FECACA'
  const scoreText   = (s: number) => s >= 70 ? '#065F46' : s >= 50 ? '#92400E' : '#7F1D1D'

  const checkLabels: Record<string, string> = {
    hasEmail:       'Email present',
    hasPhone:       'Phone present',
    hasDates:       'Dates included',
    hasSections:    'Clear sections',
    goodLength:     'Good length',
    hasActionVerbs: 'Action verbs',
    noSpecialChars: 'No special chars',
    hasMetrics:     'Quantified results',
    hasProfileLink: 'GitHub / LinkedIn',
  }

  const card = {
    background: 'white',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: 12,
    padding: 24,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2' }}>
      <Navbar backHref="/dashboard" backLabel="Dashboard" />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '52px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'white', border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 100, padding: '4px 12px', marginBottom: 16,
          }}>
            <Shield size={12} color="#4F46E5" />
            <span style={{ fontSize: 12, color: '#5C5B57' }}>ATS Compatibility Checker</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-bricolage)',
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 600, color: '#0F0F0D',
            letterSpacing: '-0.02em', marginBottom: 8, lineHeight: 1.15,
          }}>
            Check your ATS score
          </h1>
          <p style={{ fontSize: 14, color: '#5C5B57', lineHeight: 1.65, maxWidth: 480 }}>
            Upload your resume and instantly see how well it passes Applicant Tracking Systems — before you apply.
          </p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ ...card, marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F0F0D', marginBottom: 10 }}>
              Resume (PDF)
            </label>

            <div
              onClick={() => !file && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              style={{
                border: `2px dashed ${file ? '#4F46E5' : isDragging ? '#4F46E5' : 'rgba(0,0,0,0.12)'}`,
                borderRadius: 12, padding: '32px 24px', textAlign: 'center',
                cursor: file ? 'default' : 'pointer',
                background: file ? '#EEF2FF' : isDragging ? '#F5F3FF' : '#FAFAF8',
                transition: 'all 0.15s', marginBottom: 20,
              }}
            >
              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, background: '#EEF2FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={16} color="#4F46E5" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#0F0F0D', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </p>
                      <p style={{ fontSize: 12, color: '#9B9A96' }}>{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setFile(null); setResult(null) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9B9A96', padding: 4, borderRadius: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9B9A96')}
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ width: 44, height: 44, background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Upload size={18} color="#9B9A96" />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0F0F0D', marginBottom: 4 }}>Drop your resume here</p>
                  <p style={{ fontSize: 12, color: '#9B9A96' }}>PDF only · max 5MB</p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, color: '#9B9A96' }}>Takes about 15 seconds</p>
              <button
                type="submit"
                disabled={isLoading || !file}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: isLoading || !file ? '#E5E4E0' : '#4F46E5',
                  color: isLoading || !file ? '#9B9A96' : 'white',
                  padding: '10px 22px', borderRadius: 8,
                  fontSize: 14, fontWeight: 500, border: 'none',
                  cursor: isLoading || !file ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (file && !isLoading) e.currentTarget.style.background = '#4338CA' }}
                onMouseLeave={e => { if (file && !isLoading) e.currentTarget.style.background = '#4F46E5' }}
              >
                {isLoading
                  ? <><Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> Checking...</>
                  : <><Shield size={15} /> Check ATS Score</>
                }
              </button>
            </div>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>

            {/* Score Hero */}
            <div style={{
              ...card, marginBottom: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 20,
              borderColor: scoreBorder(result.atsScore),
            }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9A96', marginBottom: 10 }}>
                  ATS Score
                </p>
                <div style={{ fontSize: 64, fontWeight: 700, color: scoreColor(result.atsScore), letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'var(--font-bricolage)', marginBottom: 10 }}>
                  {result.atsScore}%
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-block', fontSize: 12, fontWeight: 500,
                    padding: '4px 12px', borderRadius: 100,
                    background: scoreBg(result.atsScore),
                    color: scoreText(result.atsScore),
                    border: `1px solid ${scoreBorder(result.atsScore)}`,
                  }}>
                    {result.rating}
                  </span>
                  <span style={{
                    display: 'inline-block', fontSize: 11, fontWeight: 500,
                    padding: '4px 10px', borderRadius: 100,
                    background: '#F3F4F6', color: '#6B7280',
                    border: '1px solid #E5E7EB',
                  }}>
                    {result.profile === 'fresher' ? 'Student profile' : 'Professional profile'}
                  </span>
                </div>
              </div>

              <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={scoreColor(result.atsScore)} strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - result.atsScore / 100)}`}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: scoreColor(result.atsScore), fontFamily: 'var(--font-bricolage)' }}>
                  {result.atsScore}%
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div style={{ ...card, marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D', marginBottom: 16 }}>Checklist</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                {Object.entries(result.passedChecks).map(([key, passed]) => (
                  <div key={key} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 8,
                    background: passed ? '#F0FDF4' : '#FEF2F2',
                    border: `1px solid ${passed ? '#BBF7D0' : '#FECACA'}`,
                  }}>
                    {passed
                      ? <CheckCircle size={14} color="#10B981" style={{ flexShrink: 0 }} />
                      : <XCircle size={14} color="#EF4444" style={{ flexShrink: 0 }} />
                    }
                    <span style={{ fontSize: 13, color: passed ? '#065F46' : '#7F1D1D', fontWeight: 500 }}>
                      {checkLabels[key] || key}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues */}
            {result.issues?.length > 0 && (
              <div style={{ ...card, marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={15} color="#F59E0B" /> Issues Found
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.issues.map((issue, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#5C5B57', lineHeight: 1.65 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B', marginTop: 7, flexShrink: 0 }} />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div style={{ ...card, marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={15} color="#4F46E5" /> How to Fix
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.suggestions.map((s, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#5C5B57', lineHeight: 1.65 }}>
                      <span style={{ color: '#4F46E5', fontWeight: 600, flexShrink: 0 }}>{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upsell */}
            <div style={{
              ...card,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 16,
              background: '#EEF2FF', border: '1px solid #C7D2FE',
            }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D', marginBottom: 4 }}>
                  Want a full resume analysis?
                </h3>
                <p style={{ fontSize: 13, color: '#5C5B57' }}>
                  Match against a job description, get skill gaps, hiring decision and more.
                </p>
              </div>
              <Link
                href="/analyze"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#4F46E5', color: 'white',
                  padding: '10px 18px', borderRadius: 8,
                  fontSize: 13, fontWeight: 500, textDecoration: 'none', flexShrink: 0,
                }}
              >
                Full Analysis <ChevronRight size={14} />
              </Link>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}