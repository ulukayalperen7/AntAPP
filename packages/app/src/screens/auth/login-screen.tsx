import React, { useState } from 'react'
import { YStack } from 'tamagui'
import { Button, Card, Field, Input, Text, VStack } from '@antapp/ui'

export type AuthLoginScreenProps = {
  onLogin: (email: string, password: string) => Promise<string | null>
  loading?: boolean
  title?: string
  subtitle?: string
}

export function AuthLoginScreen({
  onLogin,
  loading: externalLoading = false,
  title = 'AntAPP',
  subtitle = 'Hesabınıza giriş yapın',
}: AuthLoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLoading = pending || externalLoading

  const onSubmit = async () => {
    if (isLoading) return
    setPending(true)
    setError(null)
    const result = await onLogin(email.trim(), password)
    if (result) setError(result)
    setPending(false)
  }

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="$4"
    >
      <Card variant="elevated" width="100%" maxWidth={440}>
        <Card.Content>
          <VStack gap="$5">
            <VStack gap="$1">
              <Text variant="heading2">{title}</Text>
              <Text variant="body" muted>
                {subtitle}
              </Text>
            </VStack>

            <VStack gap="$3">
              <Field label="Email" error={error ?? undefined}>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="email@example.com"
                />
              </Field>

              <Field label="Şifre">
                <Input
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="••••••••"
                />
              </Field>
            </VStack>

            <Button onPress={onSubmit} loading={isLoading} disabled={isLoading}>
              Giriş yap
            </Button>
          </VStack>
        </Card.Content>
      </Card>
    </YStack>
  )
}
