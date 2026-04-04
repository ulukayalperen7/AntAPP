import React, { useRef, useState } from 'react'
import { Button, Input, XStack, isWeb } from '@antapp/ui'
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
  onNavigateToForgotPassword?: () => void
  mascot?: React.ReactNode
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
  onNavigateToForgotPassword,
  mascot,
}: AuthLoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false)
  const passwordInputRef = useRef<any>(null)

  const togglePasswordVisibility = () => {
    setShowPassword((current) => !current)

    if (isWeb) {
      requestAnimationFrame(() => {
        passwordInputRef.current?.focus?.()
      })
    }
  }

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Discover amazing routes in Antalya"
      panelTitle="Start your journey"
      panelDescription="Plan better routes, return to saved stops faster, and keep your Antalya trips organized."
      panelPosition="right"
      mascot={mascot}
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
            ref={passwordInputRef}
            flex={1}
            value={password}
            onChangeText={onPasswordChange}
            secureTextEntry={!showPassword}
            {...(isWeb ? { type: showPassword ? 'text' : 'password' } : {})}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete="current-password"
            placeholder="Enter your password"
            variant="filled"
            size="lg"
            paddingRight="$14"
            disabled={pending}
            onSubmitEditing={onSubmit}
          />
          <Button
            variant="link"
            size="sm"
            position="absolute"
            right="$3"
            top="$2.5"
            zIndex={2}
            onMouseDown={isWeb ? (event) => event.preventDefault() : undefined}
            onPress={togglePasswordVisibility}
            disabled={pending}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </Button>
        </XStack>
      </AuthField>

      {onNavigateToForgotPassword ? (
        <XStack justifyContent="flex-end">
          <Button variant="link" size="sm" onPress={onNavigateToForgotPassword} disabled={pending}>
            Forgot password?
          </Button>
        </XStack>
      ) : null}

      <Button onPress={onSubmit} loading={pending} disabled={pending} size="lg" borderRadius="$4">
        Sign In
      </Button>
    </AuthShell>
  )
}
