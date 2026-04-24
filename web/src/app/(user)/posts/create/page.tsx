import { getCurrentUser } from '@/features/account/actions'
import { getRoutes } from '@/features/routes/actions'
import CreatePostClient from './post-create-client'

export default async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{ routeId?: string; intent?: string }>
}) {
  const params = await searchParams

  const [publicRoutesResult, currentUserResult] = await Promise.allSettled([
    getRoutes({ visibility: 'public', sort: 'newest', pageSize: 200 }),
    getCurrentUser(),
  ])

  const publicRoutes = publicRoutesResult.status === 'fulfilled'
    ? publicRoutesResult.value.data
    : []
  const currentUserId = currentUserResult.status === 'fulfilled'
    ? currentUserResult.value.id
    : null
  const sortedRoutes = [...publicRoutes].sort((left, right) => {
    if (currentUserId) {
      const leftOwn = left.authorUserId === currentUserId ? 1 : 0
      const rightOwn = right.authorUserId === currentUserId ? 1 : 0
      if (leftOwn !== rightOwn) {
        return rightOwn - leftOwn
      }
    }
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  })

  return (
    <CreatePostClient
      routes={sortedRoutes}
      initialRouteId={params.routeId ?? null}
      intent={params.intent ?? null}
    />
  )
}
