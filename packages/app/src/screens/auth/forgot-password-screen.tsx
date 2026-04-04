import React from 'react'
import { Button, Input } from '@antapp/ui'
import { AuthField, AuthFooterLink, AuthNotice, AuthShell } from './auth-shell'

export type AuthForgotPasswordScreenProps = {
  email: string
  onEmailChange: (value: string) => void
  onSubmit: () => void
  pending?: boolean
  error?: string | null
  successMessage?: string | null
  onNavigateToLogin?: () => void
  mascot?: React.ReactNode
}

export function AuthForgotPasswordScreen({
  email,
  onEmailChange,
  onSubmit,
  pending = false,
  error,
  successMessage,
  onNavigateToLogin,
  mascot,
}: AuthForgotPasswordScreenProps) {
  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your email and we'll send you a password reset link."
      panelTitle="Get back on the trail"
      panelDescription="Recover access without losing your saved routes, collections, and upcoming plans."
      panelPosition="right"
      mascot={mascot}
      footer={
        onNavigateToLogin ? (
          <AuthFooterLink
            prefix="Remembered your password?"
            actionLabel="Back to Sign In"
            onPress={onNavigateToLogin}
          />
        ) : undefined
      }
    >
      {successMessage ? <AuthNotice tone="success">{successMessage}</AuthNotice> : null}
      {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}

      <AuthField label="Email">
        <Input
          value={email}
          onChangeText={onEmailChange}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="Enter your email"
          variant="filled"
          size="lg"
          disabled={pending}
          onSubmitEditing={onSubmit}
        />
      </AuthField>

      <Button onPress={onSubmit} loading={pending} disabled={pending} size="lg" borderRadius="$4">
        Send Reset Link
      </Button>
    </AuthShell>
  )
}
