'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { FileText, Mail, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await api.post('/api/auth/login', formData)
      if (response.data.success) {
        login(response.data.token, response.data.user)
        toast.success(`Welcome back, ${response.data.user.name}!`)
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div className="text-center" style={{ marginBottom: 32 }}>
          <Link href="/" className="inline-flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: '#4F46E5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-bricolage)', fontWeight: 600, fontSize: 18, color: '#0F0F0D' }}>
              HireMatch
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-bricolage)', fontSize: 22, fontWeight: 600, color: '#0F0F0D', marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#5C5B57', marginBottom: 24 }}>
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F0F0D', marginBottom: 6 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#9B9A96" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email" name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%', padding: '10px 12px 10px 36px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 8, fontSize: 14,
                    color: '#0F0F0D', outline: 'none',
                    background: 'white'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F0F0D', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#9B9A96" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password" name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '10px 12px 10px 36px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 8, fontSize: 14,
                    color: '#0F0F0D', outline: 'none',
                    background: 'white'
                  }}
                />
              </div>
            </div>

            <button
              type="submit" disabled={isLoading}
              style={{
                width: '100%', padding: '11px',
                background: isLoading ? '#818CF8' : '#4F46E5',
                color: 'white', border: 'none',
                borderRadius: 8, fontSize: 14,
                fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8
              }}
            >
              {isLoading ? <><Loader2 size={15} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>

          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#5C5B57', marginTop: 20 }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: '#4F46E5', fontWeight: 500, textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}