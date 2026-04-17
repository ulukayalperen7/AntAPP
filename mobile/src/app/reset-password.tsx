import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { AuthResetPasswordScreen } from '@antapp/app'
import { resetPassword } from '@/features/auth/api'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { email, token } = useLocalSearchParams<{ email?: string; token?: string }>()

  return (
    <AuthResetPasswordScreen
      email={email}
      token={token}
      onSubmit={resetPassword}
      onNavigateToLogin={() => router.replace('/')}
      onNavigateToForgotPassword={() => router.replace('/')}
    />
  )
}
