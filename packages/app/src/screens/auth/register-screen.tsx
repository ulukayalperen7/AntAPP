import React, { useRef, useState } from 'react'
import { Button, Input, Text, XStack, YStack, isWeb } from '@antapp/ui'
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
        backgroundColor="$backgroundStrong"
      >
        {(['personal', 'business'] as const).map((type) => {
          const isActive = value === type
          return (
            <XStack
              key={type}
              flex={1}
              paddingVertical="$3"
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
  const passwordInputRef = useRef<any>(null)
  const confirmPasswordInputRef = useRef<any>(null)

  const togglePasswordVisibility = () => {
    setShowPassword((current) => !current)

    if (isWeb) {
      requestAnimationFrame(() => {
        passwordInputRef.current?.focus?.()
      })
    }
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((current) => !current)

    if (isWeb) {
      requestAnimationFrame(() => {
        confirmPasswordInputRef.current?.focus?.()
      })
    }
  }

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
        <XStack position="relative" alignItems="center" width="100%">
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
            autoComplete="new-password"
            placeholder="Create a password"
            variant="filled"
            size="lg"
            paddingRight="$16"
            disabled={pending}
          />
          <YStack position="absolute" top={0} bottom={0} right="$4" justifyContent="center" zIndex={2}>
            <Button
              variant="link"
              size="sm"
              onMouseDown={isWeb ? (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault() : undefined}
              onPress={togglePasswordVisibility}
              disabled={pending}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </YStack>
        </XStack>
      </AuthField>

      <AuthField label="Confirm Password">
        <XStack position="relative" alignItems="center" width="100%">
          <Input
            ref={confirmPasswordInputRef}
            flex={1}
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            secureTextEntry={!showConfirmPassword}
            {...(isWeb ? { type: showConfirmPassword ? 'text' : 'password' } : {})}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            variant="filled"
            size="lg"
            paddingRight="$16"
            disabled={pending}
            onSubmitEditing={onSubmit}
          />
          <YStack position="absolute" top={0} bottom={0} right="$4" justifyContent="center" zIndex={2}>
            <Button
              variant="link"
              size="sm"
              onMouseDown={isWeb ? (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault() : undefined}
              onPress={toggleConfirmPasswordVisibility}
              disabled={pending}
              accessibilityLabel={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </Button>
          </YStack>
        </XStack>
      </AuthField>

      <Button onPress={onSubmit} loading={pending} disabled={pending} size="lg" borderRadius="$4">
        {userType === 'business' ? 'Create Business Account' : 'Sign Up'}
      </Button>
    </AuthShell>
  )
}
