import { requireAuth } from '@/features/auth/guard'
import { getCurrentUser } from '@/features/account/actions'
import { getAdminTags } from '@/features/admin/tags-actions'
import type { Tag } from '@/types/api'
import AdminTagsClient from './admin-tags-client'

export default async function AdminTagsPage() {
  const session = await requireAuth('/admin/tags')

  let initialTags: Array<Tag & { id: string }> = []
  let profilePhotoUrl: string | null = null

  try {
    const [tagsResult, userResult] = await Promise.allSettled([
      getAdminTags(),
      getCurrentUser(),
    ])

    if (tagsResult.status === 'fulfilled') {
      initialTags = tagsResult.value
    }

    if (userResult.status === 'fulfilled') {
      profilePhotoUrl = userResult.value.profilePhotoUrl
    }
  } catch { /* API offline */ }

  return (
    <AdminTagsClient
      userName={session.userName}
      email={session.email}
      profilePhotoUrl={profilePhotoUrl}
      initialTags={initialTags}
    />
  )
}
