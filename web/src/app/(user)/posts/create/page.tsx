import { getCurrentUser } from '@/features/account/actions'
import { getOwnRoutes } from '@/features/routes/actions'
import CreatePostClient from './post-create-client'

export default async function CreatePostPage() {
  const userResult = await Promise.allSettled([getCurrentUser()])
  const user = userResult[0].status === 'fulfilled' ? userResult[0].value : null

  const ownRoutes = user
    ? await getOwnRoutes(user.id)
    : []

  const publicRoutes = ownRoutes.filter((route) => route.isPublic)

  return <CreatePostClient routes={publicRoutes} />
}
