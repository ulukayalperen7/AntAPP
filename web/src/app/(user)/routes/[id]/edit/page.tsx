import { getRouteById } from '@/features/routes/actions'
import { getCurrentUser } from '@/features/account/actions'
import RouteEditClient from './route-edit-client'
import { notFound, redirect } from 'next/navigation'

export default async function RouteEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [routeResult, userResult] = await Promise.allSettled([
    getRouteById(id),
    getCurrentUser(),
  ])

  if (routeResult.status === 'rejected') notFound()

  const route = routeResult.value
  const currentUser = userResult.status === 'fulfilled' ? userResult.value : null

  // Only owner can edit
  if (!currentUser || route.authorUserId !== currentUser.id) {
    redirect(`/routes/${id}`)
  }

  return <RouteEditClient route={route} />
}
