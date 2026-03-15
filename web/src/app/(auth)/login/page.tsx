'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLoginScreen } from '@antapp/app'
import { login } from '@/features/auth/actions'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
    />
  )
}
