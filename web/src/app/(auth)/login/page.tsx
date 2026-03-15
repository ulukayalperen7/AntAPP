'use client'

import { useState, useTransition } from 'react'
import { YStack } from 'tamagui'
import { Button, Card, Field, Input, Text, VStack } from '@antapp/ui'
import { login } from '@/features/auth/actions'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    setError(null)
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    startTransition(async () => {
      const result = await login(null, formData)
      if (result) setError(result)
    })
  }

  return (
    <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center" minHeight="100vh">
      <Card variant="elevated" width="100%" maxWidth={480}>
        <Card.Content>
          <VStack gap="$5">
            <VStack gap="$1">
              <Text variant="heading2">AntAPP</Text>
              <Text variant="body" muted>
                Hesabınıza giriş yapın.
              </Text>
            </VStack>

            <VStack gap="$3">
              <Field label="Email">
                <Input
                  value={email}
                  onChangeText={setEmail}
                  autoComplete="email"
                  placeholder="email@example.com"
                  disabled={isPending}
                />
              </Field>

              <Field label="Şifre" error={error ?? undefined}>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  disabled={isPending}
                />
              </Field>
            </VStack>

            <Button onPress={handleSubmit} loading={isPending} disabled={isPending}>
              Giriş yap
            </Button>
          </VStack>
        </Card.Content>
      </Card>
    </YStack>
  )
}
