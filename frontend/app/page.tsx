'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import {
  FileText, ArrowRight, CheckCircle,
  Shield, MessageSquare, Zap, TrendingUp
} from 'lucide-react'

// Simple fade-in hook
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0')
            entry.target.classList.remove('opacity-0', 'translate-y-4')
          }
        })
      },
      { threshold: 0.1 }
    )
    const elements = ref.current?.querySelectorAll('.fade-in')
    elements?.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

export default function LandingPage() {
  const pageRef = useFadeIn()

  return (
    <div ref={pageRef} style={{ background: '#F7F6F2', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{
        background: 'rgba(247,246,242,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}
          className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div style={{
              width: 28, height: 28,
              background: '#4F46E5',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FileText size={14} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-bricolage)', fontWeight: 600, color: '#0F0F0D', fontSize: 15 }}>
            HireMatch
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" style={{ color: '#5C5B57', fontSize: 14, textDecoration: 'none' }}
              className="hover:text-[#0F0F0D] transition-colors">
              Sign in
            </Link>
            <Link href="/register" style={{
              background: '#4F46E5',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none'
            }} className="hover:bg-[#4338CA] transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px 80px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="fade-in opacity-0 translate-y-4 transition-all duration-700">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'white',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 100,
              padding: '6px 12px',
              marginBottom: 24
            }}>
              <Zap size={12} color="#4F46E5" />
              <span style={{ fontSize: 12, color: '#5C5B57' }}>
                Powered by Gemini, Mistral & Cohere
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-bricolage)',
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 600,
              color: '#0F0F0D',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 20
            }}>
              Know if your resume
              <br />
              <span style={{ color: '#4F46E5' }}>lands the interview</span>
            </h1>

            <p style={{
              fontSize: 17,
              color: '#5C5B57',
              lineHeight: 1.65,
              marginBottom: 36,
              maxWidth: 440
            }}>
              Upload your resume and paste a job description.
              Get an honest match score, ATS report, and
              actionable feedback in under 30 seconds.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#4F46E5',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                textDecoration: 'none'
              }} className="hover:bg-[#4338CA] transition-colors">
                Analyze your resume free
                <ArrowRight size={16} />
              </Link>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent',
                color: '#4F46E5',
                padding: '12px 20px',
                borderRadius: 8,
                fontSize: 15,
                border: '1px solid #4F46E5',
                textDecoration: 'none'
              }} className="hover:bg-indigo-50 transition-colors">
                Sign in
              </Link>
            </div>

            <p style={{ fontSize: 12, color: '#9B9A96', marginTop: 12 }}>
              No credit card required
            </p>
          </div>

          {/* Right — Product Mock */}
          <div className="fade-in opacity-0 translate-y-4 transition-all duration-700 delay-200 hidden lg:block">
            <div style={{
              background: 'white',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 16,
              padding: 24,
              position: 'relative'
            }}>
              {/* Score Badge */}
              <div style={{
                position: 'absolute',
                top: -16,
                right: 24,
                background: '#4F46E5',
                color: 'white',
                borderRadius: 100,
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 600
              }}>
                78% Match
              </div>

              {/* Mock Resume Card */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: '#0F0F0D', marginBottom: 4
                }}>
                  Frontend Developer — Stripe
                </div>
                <div style={{ fontSize: 12, color: '#9B9A96' }}>
                  Analyzed 2 min ago · via Gemini AI
                </div>
              </div>

              {/* Progress bars */}
              {[
                { label: 'Match Score', value: 78, color: '#4F46E5' },
                { label: 'ATS Score', value: 65, color: '#10B981' },
              ].map((item) => (
                <div key={item.label} style={{ marginBottom: 16 }}>
                  <div className="flex justify-between" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#5C5B57' }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0F0F0D' }}>
                      {item.value}%
                    </span>
                  </div>
                  <div style={{
                    background: 'rgba(0,0,0,0.06)',
                    borderRadius: 100, height: 6
                  }}>
                    <div style={{
                      width: `${item.value}%`,
                      background: item.color,
                      borderRadius: 100, height: 6,
                      transition: 'width 1s ease'
                    }} />
                  </div>
                </div>
              ))}

              {/* Skills */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#5C5B57', marginBottom: 8 }}>
                  Matched Skills
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['React', 'TypeScript', 'Node.js', 'REST APIs'].map(s => (
                    <span key={s} style={{
                      fontSize: 11,
                      background: '#EEF2FF',
                      color: '#4F46E5',
                      border: '1px solid #C7D2FE',
                      borderRadius: 6,
                      padding: '3px 8px'
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Decision */}
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 8,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <CheckCircle size={14} color="#10B981" />
                <span style={{ fontSize: 13, color: '#065F46', fontWeight: 500 }}>
                  Strong candidate — recommend interview
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Stats */}
      <section style={{
        borderTop: '1px solid rgba(0,0,0,0.07)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        background: 'white'
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px' }}>
          <div className="grid grid-cols-3 gap-6 text-center fade-in opacity-0 translate-y-4 transition-all duration-700">
            {[
              { value: '4', label: 'AI Providers' },
              { value: '<30s', label: 'Analysis Time' },
              { value: 'Free', label: 'To Use' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{
                  fontSize: 28, fontWeight: 600,
                  color: '#0F0F0D',
                  fontFamily: 'var(--font-bricolage)',
                  marginBottom: 4
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 13, color: '#9B9A96' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px' }}>
        <div className="text-center fade-in opacity-0 translate-y-4 transition-all duration-700" style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: 'var(--font-bricolage)',
            fontSize: 32, fontWeight: 600,
            color: '#0F0F0D', marginBottom: 12
          }}>
            Everything you need to land the job
          </h2>
          <p style={{ fontSize: 16, color: '#5C5B57', maxWidth: 480, margin: '0 auto' }}>
            Built for real hiring scenarios, not generic advice
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: <CheckCircle size={18} color="#4F46E5" />,
              title: 'AI Match Analysis',
              desc: 'Realistic match score between your resume and job description. Includes strengths, gaps, and specific recommendations from expert AI.'
            },
            {
              icon: <Shield size={18} color="#10B981" />,
              title: 'ATS Compatibility',
              desc: '75% of resumes are rejected before a human sees them. We simulate real ATS behavior and tell you exactly what to fix.'
            },
            {
              icon: <MessageSquare size={18} color="#8B5CF6" />,
              title: 'AI Career Advisor',
              desc: 'Chat with an AI that knows your specific analysis. Ask anything — interview prep, skill gaps, resume improvements.'
            },
            {
              icon: <TrendingUp size={18} color="#F59E0B" />,
              title: 'Track Your Progress',
              desc: 'Every analysis is saved. See how your match scores improve as you refine your resume over time.'
            },
          ].map((feature, i) => (
            <div key={i}
              className={`fade-in opacity-0 translate-y-4 transition-all duration-700`}
              style={{
                background: 'white',
                border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: 12,
                padding: 24,
                transitionDelay: `${i * 100}ms`
              }}>
              <div style={{
                width: 36, height: 36,
                background: '#F7F6F2',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: 15, fontWeight: 600,
                color: '#0F0F0D', marginBottom: 8
              }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: 14, color: '#5C5B57', lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{
        borderTop: '1px solid rgba(0,0,0,0.07)',
        background: 'white',
        padding: '80px 0'
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
          <h2 className="text-center fade-in opacity-0 translate-y-4 transition-all duration-700"
            style={{
              fontFamily: 'var(--font-bricolage)',
              fontSize: 32, fontWeight: 600,
              color: '#0F0F0D', marginBottom: 48
            }}>
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '1', title: 'Upload Resume', desc: 'Upload your PDF resume and paste the job description you want to apply for' },
              { n: '2', title: 'AI Analysis', desc: 'Our AI reads your resume, compares it to requirements and scores the match realistically' },
              { n: '3', title: 'Get Results', desc: 'Receive match score, ATS report, skill gaps and personalized recommendations' },
            ].map((step, i) => (
              <div key={i}
                className="fade-in opacity-0 translate-y-4 transition-all duration-700 text-center"
                style={{ transitionDelay: `${i * 150}ms` }}>
                <div style={{
                  width: 40, height: 40,
                  background: '#4F46E5',
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 15, fontWeight: 600, color: 'white'
                }}>
                  {step.n}
                </div>
                <h3 style={{
                  fontSize: 15, fontWeight: 600,
                  color: '#0F0F0D', marginBottom: 8
                }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: '#5C5B57', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px' }}>
        <div className="fade-in opacity-0 translate-y-4 transition-all duration-700 text-center"
          style={{
            background: 'white',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 16,
            padding: '64px 24px'
          }}>
          <h2 style={{
            fontFamily: 'var(--font-bricolage)',
            fontSize: 32, fontWeight: 600,
            color: '#0F0F0D', marginBottom: 12
          }}>
            Ready to improve your resume?
          </h2>
          <p style={{ fontSize: 15, color: '#5C5B57', marginBottom: 32 }}>
            Free to use. Start analyzing in 30 seconds.
          </p>
          <Link href="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#4F46E5',
            color: 'white',
            padding: '12px 28px',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 500,
            textDecoration: 'none'
          }} className="hover:bg-[#4338CA] transition-colors">
            Get started free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(0,0,0,0.07)',
        padding: '24px',
        background: 'white'
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}
          className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div style={{
              width: 20, height: 20,
              background: '#4F46E5',
              borderRadius: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FileText size={11} color="white" />
            </div>
            <span style={{ fontSize: 13, color: '#5C5B57' }}>HireMatch</span>
          </div>
          <p style={{ fontSize: 12, color: '#9B9A96' }}>
            Built with Next.js, Node.js and AI
          </p>
        </div>
      </footer>

    </div>
  )
}