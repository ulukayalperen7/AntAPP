import React, { useState, useTransition } from 'react'
import { Button, Input } from '@antapp/ui'
import { AuthField, AuthFooterLink, AuthNotice, AuthShell } from './auth-shell'

export type AuthResetPasswordScreenProps = {
  email?: string
  token?: string
  onSubmit: (data: { email: string; token: string; password: string; confirmPassword: string }) => Promise<void>
  onNavigateToLogin?: () => void
  onNavigateToForgotPassword?: () => void
  mascot?: React.ReactNode
}

export function AuthResetPasswordScreen({
  email = '',
  token = '',
  onSubmit,
  onNavigateToLogin,
  onNavigateToForgotPassword,
  mascot,
}: AuthResetPasswordScreenProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const invalidLink = !email || !token

  const handleSubmit = () => {
    setError(null)

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    startTransition(async () => {
      try {
        await onSubmit({ email, token, password, confirmPassword })
        setSuccess(true)
      } catch (e) {
        setError((e as Error).message ?? 'Failed to reset password.')
      }
    })
  }

  if (success) {
    return (
      <AuthShell
        title="Password Reset!"
        subtitle="Your password has been updated successfully. You can now sign in with your new password."
        panelTitle="Back on track"
        panelDescription="Your account is secured. Pick up where you left off."
        mascot={mascot}
        footer={
          onNavigateToLogin ? (
            <AuthFooterLink
              prefix="Ready to continue?"
              actionLabel="Sign In"
              onPress={onNavigateToLogin}
            />
          ) : undefined
        }
      >
        {onNavigateToLogin ? (
          <Button onPress={onNavigateToLogin} size="lg" borderRadius="$4">
            Go to Sign In
          </Button>
        ) : null}
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your new password below."
      panelTitle="Secure your trail"
      panelDescription="Choose a strong password to keep your routes, collections, and profile safe."
      mascot={mascot}
      footer={
        onNavigateToForgotPassword ? (
          <AuthFooterLink
            prefix="Link expired?"
            actionLabel="Request a new one"
            onPress={onNavigateToForgotPassword}
          />
        ) : undefined
      }
    >
      {invalidLink ? (
        <AuthNotice tone="error">
          Invalid or expired reset link. Please request a new password reset.
        </AuthNotice>
      ) : null}

      {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}

      <AuthField label="New Password">
        <Input
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          variant="filled"
          size="lg"
          disabled={isPending || invalidLink}
          onSubmitEditing={handleSubmit}
        />
      </AuthField>

      <AuthField label="Confirm Password">
        <Input
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="••••••••"
          variant="filled"
          size="lg"
          disabled={isPending || invalidLink}
          onSubmitEditing={handleSubmit}
        />
      </AuthField>

      <Button
        onPress={handleSubmit}
        loading={isPending}
        disabled={isPending || invalidLink || !password || !confirmPassword}
        size="lg"
        borderRadius="$4"
      >
        Set New Password
      </Button>
    </AuthShell>
  )
}
