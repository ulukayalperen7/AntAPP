import { getCollections } from '@/features/collections/actions'
import SavedClient from './saved-client'
import type { Collection } from '@/types/api'

export default async function SavedPage() {
  let collections: Collection[] = []
  let total = 0
  try {
    const result = await getCollections()
    collections = result.data
    total = result.totalRecords
  } catch { /* API offline or unauthenticated */ }

  return <SavedClient collections={collections} total={total} />
}
