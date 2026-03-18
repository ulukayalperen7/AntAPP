import React, { useState } from 'react'
import { Button, Input, Text, XStack, YStack } from '@antapp/ui'
import { AuthField, AuthFooterLink, AuthNotice, AuthShell } from './auth-shell'

export type UserType = 'personal' | 'business'

export type AuthRegisterScreenProps = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  userType: UserType
  onFullNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onUserTypeChange: (value: UserType) => void
  onSubmit: () => void
  pending?: boolean
  error?: string | null
  onNavigateToLogin?: () => void
  mascot?: React.ReactNode
}

function UserTypeSelector({
  value,
  onChange,
  disabled,
}: {
  value: UserType
  onChange: (v: UserType) => void
  disabled?: boolean
}) {
  return (
    <YStack gap="$2">
      <Text variant="label" color="$mutedForeground" fontSize="$3">Account Type</Text>
      <XStack
        borderRadius="$4"
        borderWidth={1}
        borderColor="$borderColor"
        overflow="hidden"
      >
        {(['personal', 'business'] as const).map((type) => {
          const isActive = value === type
          return (
            <XStack
              key={type}
              flex={1}
              paddingVertical="$2.5"
              alignItems="center"
              justifyContent="center"
              gap="$1.5"
              backgroundColor={isActive ? '$primary' : 'transparent'}
              cursor={disabled ? 'not-allowed' : 'pointer'}
              opacity={disabled ? 0.5 : 1}
              onPress={() => !disabled && onChange(type)}
              pressStyle={disabled ? {} : { opacity: 0.8 }}
            >
              <YStack
                width={8}
                height={8}
                borderRadius="$full"
                backgroundColor={isActive ? '#FFFFFF' : '$mutedForeground'}
                opacity={isActive ? 1 : 0.4}
              />
              <Text
                variant="label"
                fontSize="$4"
                color={isActive ? '#FFFFFF' : '$color'}
                weight={isActive ? 'semibold' : 'regular'}
              >
                {type === 'personal' ? 'Personal' : 'Business'}
              </Text>
            </XStack>
          )
        })}
      </XStack>
      {value === 'business' && (
        <Text variant="caption" color="$primary" fontSize="$2">
          Business accounts can list locations, create sponsored routes, and access analytics.
        </Text>
      )}
    </YStack>
  )
}

export function AuthRegisterScreen({
  fullName,
  email,
  password,
  confirmPassword,
  userType,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onUserTypeChange,
  onSubmit,
  pending = false,
  error,
  onNavigateToLogin,
  mascot,
}: AuthRegisterScreenProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <AuthShell
      title={userType === 'business' ? 'Business Account' : 'Create Account'}
      subtitle={userType === 'business' ? 'Register your business on AntAPP' : 'Join us and start exploring'}
      panelTitle="Discover Antalya"
      panelDescription="Create your account, collect your favorite spots, and start building routes with a calmer rhythm."
      panelPosition="left"
      mascot={mascot}
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

      <UserTypeSelector value={userType} onChange={onUserTypeChange} disabled={pending} />

      <AuthField label="Full Name">
        <Input
          value={fullName}
          onChangeText={onFullNameChange}
          autoComplete="name"
          placeholder={userType === 'business' ? 'Business name' : 'Enter your full name'}
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
          placeholder={userType === 'business' ? 'Business email' : 'Enter your email'}
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
        {userType === 'business' ? 'Create Business Account' : 'Sign Up'}
      </Button>
    </AuthShell>
  )
}
