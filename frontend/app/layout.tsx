import type { Metadata } from 'next'
import { Inter, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage'
})

export const metadata: Metadata = {
  title: 'HireMatch — AI Resume Analyzer',
  description: 'Analyze your resume against job descriptions using AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bricolage.variable} font-sans`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#0F0F0D',
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}