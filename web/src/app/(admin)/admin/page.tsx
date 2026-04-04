import { requireAuth } from '@/features/auth/guard'
import { getAdminCollectionById, getAdminCollections, getAdminTags } from '@/features/admin/actions'
import type { AdminCollection, AdminCollectionDetail, Tag } from '@/types/api'
import AdminPanelClient from './admin-panel-client'

export default async function AdminPage() {
  const session = await requireAuth('/admin')

  let initialCollections: AdminCollection[] = []
  let initialTags: Tag[] = []
  let initialCollectionDetail: AdminCollectionDetail | null = null

  try {
    const collectionsResult = await getAdminCollections(1, 50)
    initialCollections = collectionsResult.data
  } catch {}

  try {
    initialTags = await getAdminTags(100)
  } catch {}

  const initialSelectedCollectionId = initialCollections[0]?.id ?? null

  if (initialSelectedCollectionId) {
    try {
      initialCollectionDetail = await getAdminCollectionById(initialSelectedCollectionId)
    } catch {}
  }

  return (
    <AdminPanelClient
      userName={session.userName}
      email={session.email}
      roles={session.roles}
      initialCollections={initialCollections}
      initialTags={initialTags}
      initialCollectionDetail={initialCollectionDetail}
    />
  )
}
