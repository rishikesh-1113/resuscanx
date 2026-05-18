'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'
import {
  FileText,
  ChevronRight,
  Clock,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface HistoryItem {
  _id: string
  jobTitle: string
  companyName: string
  matchScore: number
  analysis: { hiringDecision: string }
  atsScore: number
  aiProvider: string
  createdAt: string
}

export default function HistoryPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [analyses, setAnalyses] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const handleLogout = () => { logout(); router.push('/login') }

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/api/analysis/history')
        if (response.data.success) setAnalyses(response.data.analyses)
      } catch {
        toast.error('Failed to load history')
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/analysis/${id}`)
      setAnalyses(analyses.filter(a => a._id !== id))
      toast.success('Analysis deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return '#10B981'
    if (score >= 50) return '#F59E0B'
    return '#EF4444'
  }

  const getDecisionStyle = (decision: string) => {
    if (decision === 'HIRE') return { color: '#065F46', background: '#D1FAE5', border: '1px solid #A7F3D0' }
    if (decision === 'MAYBE') return { color: '#92400E', background: '#FEF3C7', border: '1px solid #FDE68A' }
    return { color: '#7F1D1D', background: '#FEE2E2', border: '1px solid #FECACA' }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2' }}>
      <Navbar backHref="/dashboard" backLabel="Dashboard" />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '52px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-bricolage)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, color: '#0F0F0D', letterSpacing: '-0.02em', marginBottom: 6 }}>
              Analysis History
            </h1>
            <p style={{ fontSize: 13, color: '#9B9A96' }}>
              {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'} total
            </p>
          </div>
          <Link href="/analyze" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#4F46E5', color: 'white',
            padding: '9px 18px', borderRadius: 8,
            fontSize: 13, fontWeight: 500, textDecoration: 'none',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#4338CA')}
            onMouseLeave={e => (e.currentTarget.style.background = '#4F46E5')}
          >
            <FileText size={14} /> New Analysis
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 24, height: 24, border: '2px solid #4F46E5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Empty */}
        {!isLoading && analyses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 48, height: 48, background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Clock size={22} color="#9B9A96" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0F0F0D', marginBottom: 6 }}>No analyses yet</h3>
            <p style={{ fontSize: 13, color: '#9B9A96', marginBottom: 24 }}>Upload your resume to get started</p>
            <Link href="/analyze" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: '#4F46E5', color: 'white',
              padding: '9px 18px', borderRadius: 8,
              fontSize: 13, fontWeight: 500, textDecoration: 'none',
            }}>
              Analyze Resume
            </Link>
          </div>
        )}

        {/* List */}
        {!isLoading && analyses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analyses.map((item) => (
              <div
                key={item._id}
                style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'box-shadow 0.18s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 38, height: 38, background: '#EEF2FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={16} color="#4F46E5" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D' }}>
                        {item.jobTitle || 'Position'} — {item.companyName || 'Company'}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 100, ...getDecisionStyle(item.analysis?.hiringDecision) }}>
                        {item.analysis?.hiringDecision || 'MAYBE'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#9B9A96' }}>
                      <span>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>·</span>
                      <span>{item.aiProvider}</span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#9B9A96', marginBottom: 2 }}>Match</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: getScoreColor(item.matchScore) }}>{item.matchScore}%</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#9B9A96', marginBottom: 2 }}>ATS</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: getScoreColor(item.atsScore) }}>{item.atsScore || 0}%</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => handleDelete(item._id)}
                      style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#D1D0CB', borderRadius: 6, transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#D1D0CB')}
                    >
                      <Trash2 size={15} />
                    </button>
                    <Link href={`/analysis/${item._id}`} style={{ padding: 6, color: '#9B9A96', display: 'flex', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#0F0F0D')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#9B9A96')}
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}