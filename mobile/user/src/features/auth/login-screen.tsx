import React, { useState } from 'react'
import { YStack } from 'tamagui'
import { Button, Card, Field, Input, Text, VStack } from '@antapp/ui'
import { useAuth } from './context'

export function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async () => {
    if (pending) return
    setPending(true)
    setError(null)
    const result = await login(email, password)
    if (result) setError(result)
    setPending(false)
  }

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" paddingHorizontal="$4" backgroundColor="$background">
      <Card variant="elevated" width="100%" maxWidth={400}>
        <Card.Content>
          <VStack gap="$4">
            <VStack gap="$1">
              <Text variant="heading3">AntAPP</Text>
              <Text variant="body" muted>
                Hesabınıza giriş yapın.
              </Text>
            </VStack>

            <VStack gap="$3">
              <Field label="Email">
                <Input
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="email@example.com"
                />
              </Field>

              <Field label="Şifre" error={error ?? undefined}>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="••••••••"
                />
              </Field>
            </VStack>

            <Button onPress={onSubmit} loading={pending} disabled={pending}>
              Giriş yap
            </Button>
          </VStack>
        </Card.Content>
      </Card>
    </YStack>
  )
}
