import { getCollections } from '@/features/collections/actions'
import CollectionsClient from './collections-client'
import type { Collection } from '@/types/api'

export default async function CollectionsPage() {
  let collections: Collection[] = []
  let total = 0
  try {
    const result = await getCollections()
    collections = result.data
    total = result.totalRecords
  } catch (e) {
    console.error('[Collections Page] Failed to fetch:', e)
  }

  return <CollectionsClient collections={collections} total={total} />
}
