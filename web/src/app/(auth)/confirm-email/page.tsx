import { Suspense } from 'react'
import { confirmEmail } from '@/features/auth/actions'
import ConfirmEmailClient from './confirm-email-client'
import { AuthScreenSkeleton } from '@/components/loading/page-skeletons'

async function ConfirmEmailServer({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; code?: string }>
}) {
  const { userId, code } = await searchParams

  if (!userId || !code) {
    return (
      <ConfirmEmailClient
        ok={false}
        message="Invalid confirmation link. Please check your email and try again."
      />
    )
  }

  const result = await confirmEmail(userId, code)
  return <ConfirmEmailClient ok={result.ok} message={result.message} />
}

export default function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; code?: string }>
}) {
  return (
    <Suspense fallback={<AuthScreenSkeleton />}>
      <ConfirmEmailServer searchParams={searchParams} />
    </Suspense>
  )
}
