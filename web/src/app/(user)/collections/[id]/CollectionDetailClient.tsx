'use client'

import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, RouteCard, Divider } from '@antapp/ui'
import type { CollectionDetail, RouteListItem } from '@/types/api'
import { ArrowLeft, FolderOpen, Map } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

function routeToCardData(route: RouteListItem) {
    return {
        id: route.id,
        title: route.title,
        description: route.description ?? undefined,
        image: route.thumbnailUrl ?? undefined,
        rating: route.averageRating > 0 ? route.averageRating : undefined,
        contentType: route.contentType,
        isOfficial: route.contentType === 'Official',
    }
}

export default function CollectionDetailClient({
    collection,
}: {
    collection: CollectionDetail
}) {
    const router = useRouter()

    return (
        <YStack gap="$5" flex={1}>
            {/* Header */}
            <XStack alignItems="center" gap="$3">
                <XStack
                    cursor="pointer"
                    onPress={() => router.back()}
                    padding="$2"
                    borderRadius="$full"
                    hoverStyle={{ backgroundColor: '$backgroundHover' }}
                >
                    <ArrowLeft size={20} color="currentColor" />
                </XStack>
                <YStack flex={1}>
                    <Text variant="heading2">{collection.name}</Text>
                    <Text variant="body" muted>{collection.description || 'Collection detail'}</Text>
                </YStack>
            </XStack>

            <Divider />

            {collection.routes.length === 0 ? (
                <EmptyState
                    Icon={FolderOpen}
                    title="Empty Collection"
                    description="You haven't added any routes to this collection yet."
                    actionLabel="Explore Routes"
                    onAction={() => router.push('/search')}
                />
            ) : (
                <YStack gap="$4">
                    <Text variant="heading4" weight="bold">
                        Saved Routes ({collection.routes.length})
                    </Text>
                    <XStack flexWrap="wrap" gap="$4">
                        {collection.routes.map((route) => (
                            <YStack key={route.id} flex={1} minWidth={240} maxWidth="33.3%">
                                <RouteCard
                                    data={routeToCardData(route)}
                                    onPress={() => router.push(`/routes/${route.id}`)}
                                />
                            </YStack>
                        ))}
                    </XStack>
                </YStack>
            )}
        </YStack>
    )
}
