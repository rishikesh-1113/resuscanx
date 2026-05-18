// components/ui/Navbar.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { FileText, LogOut, Home, ArrowLeft } from 'lucide-react'

interface NavbarProps {
  backHref?: string
  backLabel?: string
}

export default function Navbar({ backHref, backLabel }: NavbarProps) {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
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

        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {backHref && (
            <>
              <Link
                href={backHref}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 13, color: '#9B9A96', textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#0F0F0D')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9B9A96')}
              >
                <ArrowLeft size={14} />
                {backLabel || 'Back'}
              </Link>
              <span style={{ color: 'rgba(0,0,0,0.12)', fontSize: 16 }}>|</span>
            </>
          )}

          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 26, height: 26, background: '#4F46E5',
              borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={13} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-bricolage)', fontWeight: 600, color: '#0F0F0D', fontSize: 16 }}>
              HireMatch
            </span>
          </Link>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            href="/dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 13, color: '#9B9A96', textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#0F0F0D')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9B9A96')}
          >
            <Home size={14} />
            <span>Dashboard</span>
          </Link>

          {user && (
            <>
              <span style={{ fontSize: 13, color: '#5C5B57' }}>{user.name}</span>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9B9A96', padding: 0, transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#0F0F0D')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9B9A96')}
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}