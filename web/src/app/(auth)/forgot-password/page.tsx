'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Input } from '@antapp/ui'
import { forgotPassword } from '@/features/auth/actions'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [error, action, isPending] = useActionState<string | null | undefined, FormData>(forgotPassword, undefined)

  // null error state = başarı gönderim tamamlandı
  const sent = error === null

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
      >
        {/* Logo */}
        <XStack alignItems="center" gap="$2" justifyContent="center" marginBottom="$2">
          <img src="/ant-logo.png" alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <Text variant="heading4" color="$color">AntAPP</Text>
        </XStack>

        {sent ? (
          <YStack gap="$4" alignItems="center">
            <XStack
              width={64}
              height={64}
              borderRadius="$full"
              backgroundColor="$success50"
              alignItems="center"
              justifyContent="center"
            >
              <CheckCircle2 size={32} color="var(--color-success500, #22C55E)" />
            </XStack>
            <YStack gap="$2" alignItems="center">
              <Text variant="heading3" align="center">Check Your Email</Text>
              <Text variant="body" muted align="center">
                If an account with that email exists, a password reset link has been sent.
              </Text>
            </YStack>
            <Button
              variant="outline"
              size="md"
              width="100%"
              onPress={() => router.push('/login')}
            >
              Back to Login
            </Button>
          </YStack>
        ) : (
          <>
            <YStack gap="$1">
              <Text variant="heading3">Forgot Password</Text>
              <Text variant="body" muted>
                Enter your email and we&apos;ll send you a reset link.
              </Text>
            </YStack>

            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <YStack gap="$1.5">
                <Text variant="label" color="$mutedForeground">Email</Text>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  variant="outline"
                  size="md"
                  error={!!error}
                />
              </YStack>

              {error && (
                <Text variant="caption" color="$error500">{error}</Text>
              )}

              <Button
                variant="solid"
                size="md"
                loading={isPending}
                disabled={isPending}
                icon={<Mail size={16} color="#fff" />}
                htmlType="submit"
              >
                Send Reset Link
              </Button>
            </form>

            <XStack justifyContent="center" gap="$1.5" alignItems="center">
              <ArrowLeft size={14} color="var(--color-mutedForeground)" />
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Text variant="body" color="$primary">Back to Login</Text>
              </Link>
            </XStack>
          </>
        )}
      </YStack>
    </YStack>
  )
}
