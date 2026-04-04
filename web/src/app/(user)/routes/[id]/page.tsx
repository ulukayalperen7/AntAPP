import { getRouteById } from '@/features/routes/actions'
import { getCurrentUser } from '@/features/account/actions'
import RouteDetailClient from './route-detail-client'
import { notFound } from 'next/navigation'

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [routeResult, userResult] = await Promise.allSettled([
    getRouteById(id),
    getCurrentUser(),
  ])

  if (routeResult.status === 'rejected') {
    const err = routeResult.reason as Error
    // Dev: throw so Next.js error overlay shows the real message
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`getRouteById failed: ${err?.message ?? String(err)}`)
    }
    notFound()
  }

  const route = (routeResult as PromiseFulfilledResult<typeof routeResult extends PromiseFulfilledResult<infer T> ? T : never>).value as Awaited<ReturnType<typeof getRouteById>>
  const currentUser = userResult.status === 'fulfilled' ? userResult.value : null
  const isOwner = !!(currentUser && route.authorUserId === currentUser.id)

  return <RouteDetailClient route={route} isOwner={isOwner} />
}
