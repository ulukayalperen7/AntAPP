import { requireAuth } from '@/features/auth/guard'
import { getAdminCollectionById, getAdminCollections, getAdminTags } from '@/features/admin/actions'
import AdminPanelClient from './admin-panel-client'

export default async function AdminPage() {
  const session = await requireAuth('/admin')
  const collectionsResult = await getAdminCollections(1, 50)
  const tags = await getAdminTags(100)

  const initialSelectedCollectionId = collectionsResult.data[0]?.id ?? null
  const initialCollectionDetail = initialSelectedCollectionId
    ? await getAdminCollectionById(initialSelectedCollectionId)
    : null

  return (
    <AdminPanelClient
      userName={session.userName}
      email={session.email}
      roles={session.roles}
      initialCollections={collectionsResult.data}
      initialTags={tags}
      initialCollectionDetail={initialCollectionDetail}
    />
  )
}
