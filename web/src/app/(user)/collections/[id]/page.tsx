import { notFound } from 'next/navigation'
import { getCollectionById } from '@/features/collections/actions'
import CollectionDetailClient from './CollectionDetailClient'

export const dynamic = 'force-dynamic'

export default async function CollectionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    console.log(`[PAGE DEBUG] Fetching collection: ${id}`)
    const collection = await getCollectionById(id)
    console.log(`[PAGE DEBUG] Result for ${id}:`, collection ? 'FOUND' : 'NULL')

    if (!collection) {
        console.log(`[PAGE DEBUG] Calling notFound() for ${id}`)
        return notFound()
    }

    return <CollectionDetailClient collection={collection} />
}
