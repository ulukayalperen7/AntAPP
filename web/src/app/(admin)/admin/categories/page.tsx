import { requireAuth } from '@/features/auth/guard'
import { getAdminCategories } from '@/features/admin/categories-actions'
import type { Category } from '@/types/api'
import AdminCategoriesClient from './admin-categories-client'

export default async function AdminCategoriesPage() {
  const session = await requireAuth('/admin/categories')

  let initialCategories: Array<Category & { id: string }> = []

  try {
    const result = await getAdminCategories()
    initialCategories = result
  } catch { /* API offline */ }

  return (
    <AdminCategoriesClient
      userName={session.userName}
      email={session.email}
      initialCategories={initialCategories}
    />
  )
}
