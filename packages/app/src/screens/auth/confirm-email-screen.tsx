import React, { useEffect, useState } from 'react'
import { Button } from '@antapp/ui'
import { AuthNotice, AuthShell } from './auth-shell'

export type AuthConfirmEmailScreenProps = {
  userId?: string
  code?: string
  onConfirm: (userId: string, code: string) => Promise<void>
  onNavigateToApp: () => void
  mascot?: React.ReactNode
}

type Status = 'loading' | 'success' | 'error'

export function AuthConfirmEmailScreen({
  userId,
  code,
  onConfirm,
  onNavigateToApp,
  mascot,
}: AuthConfirmEmailScreenProps) {
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!userId || !code) {
      setStatus('error')
      setMessage('Invalid or expired confirmation link.')
      return
    }

    onConfirm(userId, code)
      .then(() => {
        setStatus('success')
        setMessage('Your email has been confirmed. You can now use the app.')
      })
      .catch((e: Error) => {
        setStatus('error')
        setMessage(e.message || 'Confirmation failed. The link may have expired.')
      })
  }, [userId, code])

  const isSuccess = status === 'success'
  const isError = status === 'error'

  return (
    <AuthShell
      title={
        status === 'loading' ? 'Confirming your email…' :
        isSuccess ? 'Email Confirmed!' :
        'Confirmation Failed'
      }
      subtitle={
        status === 'loading'
          ? 'Please wait while we verify your email address.'
          : message
      }
      panelTitle={isSuccess ? 'You are all set!' : 'Verify your account'}
      panelDescription={
        isSuccess
          ? 'Your email is confirmed. Explore routes and build your adventure.'
          : 'A confirmed email keeps your account secure and allows you to recover access.'
      }
      mascot={mascot}
    >
      {isSuccess ? (
        <Button onPress={onNavigateToApp} size="lg" borderRadius="$4">
          Start Exploring
        </Button>
      ) : isError ? (
        <>
          <AuthNotice tone="error">{message}</AuthNotice>
          <Button onPress={onNavigateToApp} variant="outline" size="lg" borderRadius="$4">
            Go to App
          </Button>
        </>
      ) : null}
    </AuthShell>
  )
}
