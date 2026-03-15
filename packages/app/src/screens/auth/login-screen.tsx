import React, { useState } from 'react'
import { Button, Input, XStack } from '@antapp/ui'
import { AuthField, AuthFooterLink, AuthNotice, AuthShell } from './auth-shell'

export type AuthLoginScreenProps = {
  email: string
  password: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
  pending?: boolean
  error?: string | null
  successMessage?: string | null
  onNavigateToRegister?: () => void
}

export function AuthLoginScreen({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  pending = false,
  error,
  successMessage,
  onNavigateToRegister,
}: AuthLoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Discover amazing routes in Antalya"
      panelTitle="Start your journey"
      panelDescription="Plan better routes, return to saved stops faster, and keep your Antalya trips organized."
      panelPosition="right"
      footer={
        onNavigateToRegister ? (
          <AuthFooterLink
            prefix="Don't have an account?"
            actionLabel="Sign Up"
            onPress={onNavigateToRegister}
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
        />
      </AuthField>

      <AuthField label="Password">
        <XStack position="relative" alignItems="center">
          <Input
            flex={1}
            value={password}
            onChangeText={onPasswordChange}
            secureTextEntry={!showPassword}
            placeholder="Enter your password"
            variant="filled"
            size="lg"
            paddingRight="$12"
            disabled={pending}
            onSubmitEditing={onSubmit}
          />
          <Button
            variant="link"
            size="sm"
            position="absolute"
            right="$3"
            top="$2.5"
            onPress={() => setShowPassword((current) => !current)}
            disabled={pending}
          >
            {showPassword ? 'Hide' : 'Show'}
          </Button>
        </XStack>
      </AuthField>

      <Button onPress={onSubmit} loading={pending} disabled={pending} size="lg" borderRadius="$4">
        Sign In
      </Button>
    </AuthShell>
  )
}
