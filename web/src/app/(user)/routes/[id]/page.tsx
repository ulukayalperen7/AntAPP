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
    notFound()
  }

  const route = routeResult.value
  const currentUser = userResult.status === 'fulfilled' ? userResult.value : null
  const isOwner = !!(currentUser && (route as any).authorUserId === currentUser.id)

  return <RouteDetailClient route={route} isOwner={isOwner} />
}
