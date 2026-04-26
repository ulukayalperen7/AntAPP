'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Badge, RouteCard, Input, Card } from '@antapp/ui'
import type { RouteCardData } from '@antapp/ui'
import type { RouteListItem } from '@/types/api'
import { getRoutes } from '@/features/routes/actions'
import { Search, Map as MapIcon, Compass, Sparkles } from 'lucide-react'

type RoutesClientProps = {
    initialRoutes: RouteListItem[]
    initialTotal: number
}

function routeToCardData(route: RouteListItem): RouteCardData {
    const owner = route.authorUserName?.trim()
    const source = route.originalAuthorName?.trim()

    return {
        id: route.id,
        title: route.title,
        description: route.description ?? undefined,
        image: route.thumbnailUrl ?? undefined,
        rating: route.averageRating > 0 ? route.averageRating : undefined,
        contentType: route.contentType,
        tag: source ? `Copy from ${source}` : owner ? `By ${owner}` : undefined,
    }
}

function dedupeRoutesById(items: RouteListItem[]) {
    const seen = new Set<string>()
    return items.filter((item) => {
        if (seen.has(item.id)) return false
        seen.add(item.id)
        return true
    })
}

export default function RoutesClient({ initialRoutes, initialTotal }: RoutesClientProps) {
    const router = useRouter()
    const [routes, setRoutes] = useState(() => dedupeRoutesById(initialRoutes))
    const [total, setTotal] = useState(initialTotal)
    const [searchTerm, setSearchTerm] = useState('')
    const [sort, setSort] = useState('newest')
    const [isPending, startTransition] = useTransition()
    const [page, setPage] = useState(1)

    const handleSearch = (term: string) => {
        setSearchTerm(term)
        setPage(1)
        startTransition(async () => {
            const result = await getRoutes({
                page: 1,
                pageSize: 24,
                search: term,
                sort,
                visibility: 'public'
            })
            setRoutes(dedupeRoutesById(result.data))
            setTotal(result.totalRecords)
        })
    }

    const handleSort = (newSort: string) => {
        setSort(newSort)
        setPage(1)
        startTransition(async () => {
            const result = await getRoutes({
                page: 1,
                pageSize: 24,
                search: searchTerm,
                sort: newSort,
                visibility: 'public'
            })
            setRoutes(dedupeRoutesById(result.data))
            setTotal(result.totalRecords)
        })
    }

    const loadMore = () => {
        const nextPage = page + 1
        startTransition(async () => {
            const result = await getRoutes({
                page: nextPage,
                pageSize: 24,
                search: searchTerm,
                sort,
                visibility: 'public'
            })
            setRoutes((current) => dedupeRoutesById([...current, ...result.data]))
            setPage(nextPage)
        })
    }

    return (
        <YStack gap="$6" flex={1} paddingVertical="$2">
            <YStack gap="$2">
                <XStack alignItems="center" gap="$3">
                    <Compass size={28} color="var(--color-primary)" />
                    <Text variant="heading1">Route Discovery</Text>
                </XStack>
                <Text variant="body" muted>Explore public routes from across the AntAPP community.</Text>
            </YStack>

            <Card variant="outline" size="sm" backgroundColor="$backgroundStrong" padding="$4" borderRadius="$4">
                <XStack gap="$4" flexWrap="wrap" alignItems="center">
                    <XStack flex={1} minWidth={280} position="relative">
                        <YStack position="absolute" left="$3" top="50%" style={{ transform: 'translateY(-50%)', zIndex: 10 }}>
                            <Search size={18} color="var(--color-mutedForeground)" />
                        </YStack>
                        <Input
                            placeholder="Search by title or description..."
                            value={searchTerm}
                            onChangeText={handleSearch}
                            paddingLeft="$10"
                            flex={1}
                        />
                    </XStack>

                    <XStack gap="$2" alignItems="center">
                        <Text variant="caption" muted>Sort by:</Text>
                        <Button
                            variant={sort === 'newest' ? 'solid' : 'ghost'}
                            size="sm"
                            onPress={() => handleSort('newest')}
                        >
                            Newest
                        </Button>
                        <Button
                            variant={sort === 'rating' ? 'solid' : 'ghost'}
                            size="sm"
                            onPress={() => handleSort('rating')}
                        >
                            Top Rated
                        </Button>
                        <Button
                            variant={sort === 'oldest' ? 'solid' : 'ghost'}
                            size="sm"
                            onPress={() => handleSort('oldest')}
                        >
                            Oldest
                        </Button>
                    </XStack>
                </XStack>
            </Card>

            {routes.length === 0 && !isPending ? (
                <YStack alignItems="center" justifyContent="center" paddingVertical="$10" gap="$4">
                    <MapIcon size={48} color="var(--color-muted)" />
                    <YStack alignItems="center" gap="$1">
                        <Text variant="heading3">No routes found</Text>
                        <Text variant="body" muted>Try adjusting your search terms or filters.</Text>
                    </YStack>
                    <Button variant="outline" onPress={() => handleSearch('')}>Clear filters</Button>
                </YStack>
            ) : (
                <YStack gap="$6">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '24px'
                    }}>
                        {routes.map((route) => (
                            <RouteCard
                                key={route.id}
                                data={routeToCardData(route)}
                                onPress={() => router.push(`/routes/${route.id}`)}
                            />
                        ))}
                    </div>

                    {routes.length < total && (
                        <XStack justifyContent="center" paddingVertical="$4">
                            <Button
                                variant="outline"
                                size="md"
                                loading={isPending}
                                onPress={loadMore}
                                icon={<Sparkles size={16} color="currentColor" />}
                            >
                                Load More Routes
                            </Button>
                        </XStack>
                    )}
                </YStack>
            )}
        </YStack>
    )
}
