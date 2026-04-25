'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/features/auth/actions'
import { AuthScreenSkeleton } from '@/components/loading/page-skeletons'

const LOGIN_DRAFT_KEY = 'antapp-auth-login-draft'

const AuthLoginScreen = dynamic(
  () => import('@antapp/app').then((mod) => mod.AuthLoginScreen),
  {
    ssr: false,
    loading: () => <AuthScreenSkeleton />,
  }
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(LOGIN_DRAFT_KEY)
      if (!raw) return

      const parsed = JSON.parse(raw) as { email?: string }
      if (typeof parsed.email === 'string') {
        setEmail(parsed.email)
      }
    } catch {
      window.sessionStorage.removeItem(LOGIN_DRAFT_KEY)
    } finally {
      setHasRestoredDraft(true)
    }
  }, [])

  useEffect(() => {
    if (!hasRestoredDraft) return

    const nextEmail = email.trim()
    if (nextEmail.length === 0) {
      window.sessionStorage.removeItem(LOGIN_DRAFT_KEY)
      return
    }

    window.sessionStorage.setItem(
      LOGIN_DRAFT_KEY,
      JSON.stringify({ email: nextEmail })
    )
  }, [email, hasRestoredDraft])

  const handleSubmit = () => {
    setError(null)
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    startTransition(async () => {
      const result = await login(null, formData)
      if (result) setError(result)
    })
  }

  const mascotEl = (
    <img
      src="/ant-mascot.png"
      alt="AntAPP Mascot"
      style={{ width: 130, height: 130, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
    />
  )

  return (
    <AuthLoginScreen
      email={email}
      password={password}
      onEmailChange={(value) => {
        setEmail(value)
        setError(null)
      }}
      onPasswordChange={(value) => {
        setPassword(value)
        setError(null)
      }}
      onSubmit={handleSubmit}
      pending={isPending}
      error={error}
      onNavigateToRegister={() => router.push('/register')}
      onNavigateToForgotPassword={() => router.push('/forgot-password')}
      mascot={mascotEl}
    />
  )
}
