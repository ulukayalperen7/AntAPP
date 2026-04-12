import { requireAuth } from '@/features/auth/guard'
import { getAdminTags } from '@/features/admin/tags-actions'
import type { Tag } from '@/types/api'
import AdminTagsClient from './admin-tags-client'

export default async function AdminTagsPage() {
  const session = await requireAuth('/admin/tags')

  let initialTags: Array<Tag & { id: string }> = []

  try {
    const result = await getAdminTags()
    initialTags = result
  } catch { /* API offline */ }

  return (
    <AdminTagsClient
      userName={session.userName}
      email={session.email}
      initialTags={initialTags}
    />
  )
}
