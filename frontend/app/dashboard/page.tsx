'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import {
  FileText,
  Upload,
  History,
  LogOut,
  User,
  ChevronRight,
  MessageSquare,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle,
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [latestAnalysisId, setLatestAnalysisId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await api.get('/api/analysis/history')
        if (response.data.success && response.data.analyses.length > 0) {
          setLatestAnalysisId(response.data.analyses[0]._id)
        }
      } catch {
        // no analyses yet
      }
    }
    if (user) fetchLatest()
  }, [user])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 24, height: 24,
          border: '2px solid #4F46E5',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) return null

  const firstName = user.name.split(' ')[0]

  const cards = [
    {
      href: '/analyze',
      icon: <Upload size={18} color="#4F46E5" />,
      iconBg: '#EEF2FF',
      label: 'Analyze Resume',
      desc: 'Upload your resume and match it against a job description',
      cta: 'Get started',
      ctaColor: '#4F46E5',
      accent: true,
    },
     
    {
      href: '/ats-checker',
      icon: <Shield size={18} color="#10B981" />,
      iconBg: '#F0FDF4',
      label: 'ATS Checker',
      desc: 'Check how well your resume passes Applicant Tracking Systems instantly',
      cta: 'Check now',
      ctaColor: '#10B981',
      accent: false,
    },
    {
      href: '/history',
      icon: <History size={18} color="#5C5B57" />,
      iconBg: '#F7F6F2',
      label: 'Past Analyses',
      desc: 'View and compare all your previous resume analyses',
      cta: 'View history',
      ctaColor: '#5C5B57',
      accent: false,
    },
    {
      href: latestAnalysisId ? `/chat/${latestAnalysisId}` : '/analyze',
      icon: <MessageSquare size={18} color="#8B5CF6" />,
      iconBg: '#F5F3FF',
      label: 'Career Advisor',
      desc: latestAnalysisId
        ? 'Chat with AI about your latest resume analysis'
        : 'Analyze a resume first to unlock AI career advisor',
      cta: latestAnalysisId ? 'Start chat' : 'Analyze now',
      ctaColor: '#8B5CF6',
      accent: false,
    },
  ]

  const steps = [
    {
      n: '1',
      title: 'Upload Resume',
      desc: 'Upload your PDF resume and paste the job description you want to apply for',
    },
    {
      n: '2',
      title: 'AI Analysis',
      desc: 'Our AI reads your resume, compares it to requirements and scores the match realistically',
    },
    {
      n: '3',
      title: 'Get Results',
      desc: 'Receive match score, ATS report, skill gaps and personalised recommendations',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2' }}>

      {/* Navbar */}
      <nav style={{
        background: 'rgba(247,246,242,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto', padding: '0 24px',
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, background: '#4F46E5',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={14} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-bricolage)', fontWeight: 600, color: '#0F0F0D', fontSize: 15 }}>
              HireMatch
            </span>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#EEF2FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={13} color="#4F46E5" />
              </div>
              <span style={{ fontSize: 13, color: '#5C5B57' }}>{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 13, color: '#9B9A96',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0F0F0D')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9B9A96')}
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '52px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'white',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 100,
            padding: '4px 12px',
            marginBottom: 18,
          }}>
            
          </div>

          <h1 style={{
            fontFamily: 'var(--font-bricolage)',
            fontSize: 'clamp(26px, 4vw, 36px)',
            fontWeight: 600,
            color: '#0F0F0D',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: 10,
          }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ fontSize: 15, color: '#5C5B57', lineHeight: 1.65, maxWidth: 480 }}>
            Analyze your resume and improve your chances of landing your dream job.
          </p>
        </div>

        {/* Action Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
          marginBottom: 40,
        }}>
          {cards.map((card, i) => (
            <Link key={i} href={card.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: 'white',
                  border: card.accent ? '1px solid #C7D2FE' : '1px solid rgba(0,0,0,0.07)',
                  borderRadius: 12,
                  padding: 24,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, transform 0.18s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: 36, height: 36,
                  background: card.iconBg,
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  {card.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-bricolage)',
                  fontSize: 15, fontWeight: 600,
                  color: '#0F0F0D', marginBottom: 6,
                }}>
                  {card.label}
                </h3>
                <p style={{ fontSize: 13, color: '#5C5B57', lineHeight: 1.65, flex: 1, marginBottom: 20 }}>
                  {card.desc}
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 13, color: card.ctaColor, fontWeight: 500,
                }}>
                  {card.cta} <ChevronRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats strip */}
        <div style={{
          background: 'white',
          border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: 12,
          padding: '18px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          marginBottom: 16,
          flexWrap: 'wrap',
          rowGap: 12,
        }}>
          {[
            { icon: <Zap size={13} color="#4F46E5" />, label: 'Powered by Gemini, Mistral & Cohere' },
            { icon: <Shield size={13} color="#10B981" />, label: 'Real ATS simulation' },
            { icon: <TrendingUp size={13} color="#F59E0B" />, label: 'Track progress over time' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontSize: 13, color: '#5C5B57',
              paddingRight: i < 2 ? 24 : 0,
              marginRight: i < 2 ? 24 : 0,
              borderRight: i < 2 ? '1px solid rgba(0,0,0,0.07)' : 'none',
            }}>
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{
          background: 'white',
          border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: 12,
          padding: '32px 28px',
          marginTop: 24,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-bricolage)',
            fontSize: 17, fontWeight: 600,
            color: '#0F0F0D', marginBottom: 28,
          }}>
            How it works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32,
                  background: '#EEF2FF',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 13, fontWeight: 600, color: '#4F46E5',
                  fontFamily: 'var(--font-bricolage)',
                }}>
                  {step.n}
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0F0F0D', marginBottom: 5 }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: 13, color: '#5C5B57', lineHeight: 1.65 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(0,0,0,0.07)' }}>
            <Link
              href="/analyze"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#4F46E5',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#4338CA')}
              onMouseLeave={e => (e.currentTarget.style.background = '#4F46E5')}
            >
              Start your first analysis
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}
