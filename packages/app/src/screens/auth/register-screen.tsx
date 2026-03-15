import React, { useState } from 'react'
import { Button, Input, XStack } from '@antapp/ui'
import { AuthField, AuthFooterLink, AuthNotice, AuthShell } from './auth-shell'

export type AuthRegisterScreenProps = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  onFullNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSubmit: () => void
  pending?: boolean
  error?: string | null
  onNavigateToLogin?: () => void
}

export function AuthRegisterScreen({
  fullName,
  email,
  password,
  confirmPassword,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  pending = false,
  error,
  onNavigateToLogin,
}: AuthRegisterScreenProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <AuthShell
      title="Create Account"
      subtitle="Join us and start exploring"
      panelTitle="Discover Antalya"
      panelDescription="Create your account, collect your favorite spots, and start building routes with a calmer rhythm."
      panelPosition="left"
      footer={
        onNavigateToLogin ? (
          <AuthFooterLink
            prefix="Already have an account?"
            actionLabel="Sign In"
            onPress={onNavigateToLogin}
          />
        ) : undefined
      }
    >
      {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}

      <AuthField label="Full Name">
        <Input
          value={fullName}
          onChangeText={onFullNameChange}
          autoComplete="name"
          placeholder="Enter your full name"
          variant="filled"
          size="lg"
          disabled={pending}
        />
      </AuthField>

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
            placeholder="Create a password"
            variant="filled"
            size="lg"
            paddingRight="$12"
            disabled={pending}
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

      <AuthField label="Confirm Password">
        <XStack position="relative" alignItems="center">
          <Input
            flex={1}
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            secureTextEntry={!showConfirmPassword}
            placeholder="Re-enter your password"
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
            onPress={() => setShowConfirmPassword((current) => !current)}
            disabled={pending}
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </Button>
        </XStack>
      </AuthField>

      <Button onPress={onSubmit} loading={pending} disabled={pending} size="lg" borderRadius="$4">
        Sign Up
      </Button>
    </AuthShell>
  )
}
