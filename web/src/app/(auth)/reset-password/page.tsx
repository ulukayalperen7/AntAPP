'use client'

import { useActionState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { YStack, XStack, Text, Button, Input } from '@antapp/ui'
import { resetPassword } from '@/features/auth/actions'
import { Lock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { AuthScreenSkeleton } from '@/components/loading/page-skeletons'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''
  const router = useRouter()

  const formRef = useRef<HTMLFormElement>(null)
  const [error, action, isPending] = useActionState<string | null | undefined, FormData>(resetPassword, undefined)
  const success = error === null

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

        {success ? (
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
              <Text variant="heading3" align="center">Password Reset!</Text>
              <Text variant="body" muted align="center">
                Your password has been updated successfully.
              </Text>
            </YStack>
            <Button variant="solid" size="md" width="100%" onPress={() => router.push('/login')}>
              Go to Login
            </Button>
          </YStack>
        ) : (
          <>
            <YStack gap="$1">
              <Text variant="heading3">Reset Password</Text>
              <Text variant="body" muted>Enter your new password below.</Text>
            </YStack>

            {(!email || !token) && (
              <YStack
                backgroundColor="$warning50"
                borderRadius="$3"
                padding="$3"
                borderWidth={1}
                borderColor="$warning200"
              >
                <Text variant="caption" color="$warning500">
                  Invalid or expired reset link. Please request a new one.
                </Text>
              </YStack>
            )}

            <form ref={formRef} action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="token" value={token} />

              <YStack gap="$1.5">
                <Text variant="label" color="$mutedForeground">New Password</Text>
                <Input
                  name="password"
                  secureTextEntry
                  placeholder="••••••••"
                  variant="outline"
                  size="md"
                  error={!!error}
                />
              </YStack>

              <YStack gap="$1.5">
                <Text variant="label" color="$mutedForeground">Confirm Password</Text>
                <Input
                  name="confirmPassword"
                  secureTextEntry
                  placeholder="••••••••"
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
                disabled={isPending || !email || !token}
                icon={<Lock size={16} color="#fff" />}
                onPress={() => formRef.current?.requestSubmit()}
              >
                Set New Password
              </Button>
            </form>

            <XStack justifyContent="center">
              <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                <Text variant="body" color="$primary">Request a new reset link</Text>
              </Link>
            </XStack>
          </>
        )}
      </YStack>
    </YStack>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthScreenSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
