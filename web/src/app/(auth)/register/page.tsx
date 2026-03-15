'use client'

import { startTransition, useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Text, VStack } from '@antapp/ui'
import { AuthRegisterScreen, AuthShell } from '@antapp/app'
import { register } from '@/features/auth/actions'

export default function RegisterPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(register, null)
  const [hasEditedSinceSubmit, setHasEditedSinceSubmit] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = () => {
    setHasEditedSinceSubmit(false)
    const formData = new FormData()
    formData.append('email', email)
    formData.append('userName', fullName)
    formData.append('password', password)
    formData.append('confirmPassword', confirmPassword)

    startTransition(() => {
      formAction(formData)
    })
  }

  if (state?.ok) {
    return (
      <AuthShell
        title="Account Created"
        subtitle="Your account is ready. Sign in to start exploring your next route."
        panelTitle="Discover Antalya"
        panelDescription="Your account has been created successfully. Continue to sign in when you're ready to explore."
        panelPosition="left"
      >
        <VStack gap="$4" alignItems="center">
          <Text variant="bodyLarge" align="center" color="$success500">
            Account created successfully. Follow the confirmation instructions before signing in.
          </Text>
          <Text variant="body" align="center" muted>
            {state.message}
          </Text>
          <Button size="lg" onPress={() => router.push('/login')} borderRadius="$4">
            Back to Sign In
          </Button>
        </VStack>
      </AuthShell>
    )
  }

  return (
    <AuthRegisterScreen
      fullName={fullName}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      onFullNameChange={(value) => {
        setFullName(value)
        setHasEditedSinceSubmit(true)
      }}
      onEmailChange={(value) => {
        setEmail(value)
        setHasEditedSinceSubmit(true)
      }}
      onPasswordChange={(value) => {
        setPassword(value)
        setHasEditedSinceSubmit(true)
      }}
      onConfirmPasswordChange={(value) => {
        setConfirmPassword(value)
        setHasEditedSinceSubmit(true)
      }}
      onSubmit={handleSubmit}
      pending={pending}
      error={state?.ok === false && !hasEditedSinceSubmit ? state.message : null}
      onNavigateToLogin={() => router.push('/login')}
    />
  )
}
