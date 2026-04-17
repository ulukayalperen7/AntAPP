import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { AuthConfirmEmailScreen } from '@antapp/app'
import { confirmEmail } from '@/features/auth/api'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const { userId, code } = useLocalSearchParams<{ userId?: string; code?: string }>()

  return (
    <AuthConfirmEmailScreen
      userId={userId}
      code={code}
      onConfirm={confirmEmail}
      onNavigateToApp={() => router.replace('/')}
    />
  )
}
