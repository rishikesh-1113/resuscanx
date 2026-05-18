'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { FileText, Mail, Lock, User, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setIsLoading(true)
    try {
      const response = await api.post('/api/auth/register', formData)
      if (response.data.success) {
        login(response.data.token, response.data.user)
        toast.success(`Welcome, ${response.data.user.name}!`)
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px 10px 36px',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 8, fontSize: 14,
    color: '#0F0F0D', outline: 'none', background: 'white'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

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

        <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-bricolage)', fontSize: 22, fontWeight: 600, color: '#0F0F0D', marginBottom: 6 }}>
            Create account
          </h1>
          <p style={{ fontSize: 14, color: '#5C5B57', marginBottom: 24 }}>
            Start analyzing your resume today
          </p>

          <form onSubmit={handleSubmit}>

            {[
              { label: 'Full Name', name: 'name', type: 'text', icon: <User size={15} color="#9B9A96" />, placeholder: 'John Doe' },
              { label: 'Email', name: 'email', type: 'email', icon: <Mail size={15} color="#9B9A96" />, placeholder: 'you@example.com' },
              { label: 'Password', name: 'password', type: 'password', icon: <Lock size={15} color="#9B9A96" />, placeholder: 'Min 6 characters' },
            ].map(field => (
              <div key={field.name} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F0F0D', marginBottom: 6 }}>
                  {field.label}
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                    {field.icon}
                  </div>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
            ))}

            <button
              type="submit" disabled={isLoading}
              style={{
                width: '100%', padding: '11px',
                background: isLoading ? '#818CF8' : '#4F46E5',
                color: 'white', border: 'none',
                borderRadius: 8, fontSize: 14, fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
                marginTop: 8
              }}
            >
              {isLoading ? <><Loader2 size={15} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>

          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#5C5B57', marginTop: 20 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#4F46E5', fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}