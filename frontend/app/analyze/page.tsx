'use client'
import { useState, useRef } from 'react'
import Navbar from '@/components/ui/Navbar'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { FileText, Upload, X, Loader2 } from 'lucide-react'

export default function AnalyzePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleLogout = () => { logout(); router.push('/login') }

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') { toast.error('Please upload a PDF file only'); return }
    if (selectedFile.size > 5 * 1024 * 1024) { toast.error('File size must be under 5MB'); return }
    setFile(selectedFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { toast.error('Please upload your resume'); return }
    if (!jobDescription.trim()) { toast.error('Please paste the job description'); return }
    if (jobDescription.trim().length < 50) { toast.error('Job description is too short'); return }
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('jobDescription', jobDescription)
      formData.append('jobTitle', jobTitle || 'Position')
      formData.append('companyName', companyName || 'Company')
      const response = await api.post('/api/analysis/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000
      })
      if (response.data.success) { toast.success('Analysis complete!'); router.push(`/analysis/${response.data.analysis.id}`) }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Analysis failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2' }}>
      <Navbar backHref="/dashboard" backLabel="Dashboard" />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '52px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-bricolage)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, color: '#0F0F0D', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Analyze Resume
          </h1>
          <p style={{ fontSize: 14, color: '#5C5B57', lineHeight: 1.6 }}>
            Upload your resume and paste the job description to get an AI-powered match analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Upload */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F0F0D', marginBottom: 8 }}>
                  Resume (PDF)
                </label>
                <div
                  onClick={() => !file && fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  style={{
                    border: `2px dashed ${file ? '#4F46E5' : isDragging ? '#4F46E5' : 'rgba(0,0,0,0.12)'}`,
                    borderRadius: 12, padding: 28, textAlign: 'center',
                    cursor: file ? 'default' : 'pointer',
                    background: file ? '#EEF2FF' : isDragging ? '#F5F3FF' : 'white',
                    transition: 'all 0.15s',
                  }}
                >
                  {file ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, background: '#EEF2FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={16} color="#4F46E5" />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#0F0F0D', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                          <p style={{ fontSize: 12, color: '#9B9A96' }}>{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                      <button type="button" onClick={e => { e.stopPropagation(); setFile(null) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9B9A96', padding: 4, borderRadius: 4 }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#9B9A96')}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ width: 40, height: 40, background: '#F7F6F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <Upload size={18} color="#9B9A96" />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#0F0F0D', marginBottom: 4 }}>Drop your resume here</p>
                      <p style={{ fontSize: 12, color: '#9B9A96' }}>PDF only, max 5MB</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
              </div>

              {/* Job Title */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F0F0D', marginBottom: 8 }}>
                  Job Title <span style={{ color: '#9B9A96', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  style={{ width: '100%', background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#0F0F0D', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#4F46E5')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)')}
                />
              </div>

              {/* Company */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F0F0D', marginBottom: 8 }}>
                  Company Name <span style={{ color: '#9B9A96', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Google"
                  style={{ width: '100%', background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#0F0F0D', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#4F46E5')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)')}
                />
              </div>
            </div>

            {/* Right — Job Description */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F0F0D', marginBottom: 8 }}>
                Job Description <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                required rows={14}
                style={{ flex: 1, background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#0F0F0D', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.65 }}
                onFocus={e => (e.currentTarget.style.borderColor = '#4F46E5')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)')}
              />
              <p style={{ fontSize: 12, color: '#9B9A96', marginTop: 6 }}>
                {jobDescription.length} characters
                {jobDescription.length < 50 && jobDescription.length > 0 && (
                  <span style={{ color: '#F59E0B', marginLeft: 8 }}>Too short — paste the full description</span>
                )}
              </p>
            </div>
          </div>

          {/* Submit */}
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 12, color: '#9B9A96' }}>Analysis takes 10–20 seconds</p>
            <button
              type="submit"
              disabled={isLoading || !file || !jobDescription.trim()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: isLoading || !file || !jobDescription.trim() ? '#E5E4E0' : '#4F46E5',
                color: isLoading || !file || !jobDescription.trim() ? '#9B9A96' : 'white',
                padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                border: 'none', cursor: isLoading || !file || !jobDescription.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {isLoading ? <><Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> Analyzing...</> : <><FileText size={15} /> Analyze Resume</>}
            </button>
          </div>
        </form>
      </main>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}