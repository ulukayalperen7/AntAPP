'use client'

import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button } from '@antapp/ui'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function ConfirmEmailClient({
  ok,
  message,
}: {
  ok: boolean
  message: string
}) {
  const router = useRouter()

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$background" alignItems="center" justifyContent="center" padding="$6">
      <YStack
        width="100%"
        maxWidth={400}
        backgroundColor="$backgroundStrong"
        borderRadius="$4"
        padding="$6"
        gap="$5"
        borderWidth={1}
        borderColor="$borderColor"
        alignItems="center"
      >
        {/* Logo */}
        <XStack alignItems="center" gap="$2" justifyContent="center">
          <img src="/ant-logo.png" alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <Text variant="heading4" color="$color">AntAPP</Text>
        </XStack>

        <XStack
          width={72}
          height={72}
          borderRadius="$full"
          backgroundColor={ok ? '$success50' : '$error50'}
          alignItems="center"
          justifyContent="center"
        >
          {ok ? (
            <CheckCircle2 size={36} color="var(--color-success500, #22C55E)" />
          ) : (
            <XCircle size={36} color="var(--color-error500, #DC2626)" />
          )}
        </XStack>

        <YStack gap="$2" alignItems="center">
          <Text variant="heading3" align="center">
            {ok ? 'Email Confirmed!' : 'Confirmation Failed'}
          </Text>
          <Text variant="body" muted align="center">{message}</Text>
        </YStack>

        {ok ? (
          <Button variant="solid" size="md" width="100%" onPress={() => router.push('/login')}>
            Go to Login
          </Button>
        ) : (
          <YStack gap="$2" width="100%">
            <Button variant="outline" size="md" width="100%" onPress={() => router.push('/login')}>
              Try Logging In
            </Button>
            <Button variant="ghost" size="md" width="100%" onPress={() => router.push('/register')}>
              Create a New Account
            </Button>
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}
