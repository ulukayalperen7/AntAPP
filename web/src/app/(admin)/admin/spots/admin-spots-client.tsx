'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Card } from '@antapp/ui'
import { ArrowLeft, Plus, MapPin, Edit2 } from 'lucide-react'
import type { AdminSpotItem } from '@/features/admin/spots-actions'

export default function AdminSpotsClient({
    userName,
    initialSpots,
}: {
    userName: string
    initialSpots: AdminSpotItem[]
}) {
    const router = useRouter()
    const [spots] = useState(initialSpots)

    return (
        <YStack flex={1} gap="$6" padding="$6">
            <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" gap="$4">
                    <Button
                        size="sm"
                        variant="ghost"
                        icon={<ArrowLeft size={16} />}
                        onPress={() => router.push('/admin')}
                        borderRadius="$10"
                    />
                    <YStack>
                        <Text variant="heading2" color="$primary">Spots Management</Text>
                        <Text variant="caption" muted>Manage points of interest and locations</Text>
                    </YStack>
                </XStack>
                <Button
                    size="md"
                    icon={<Plus size={16} />}
                    onPress={() => {
                        alert("This feature will be implemented in the next step (Add New Spot Form).")
                    }}
                >
                    Add New Spot
                </Button>
            </XStack>

            <Card padding="$4" flex={1}>
                {spots.length === 0 ? (
                    <YStack padding="$8" alignItems="center" justifyContent="center">
                        <Text muted>No spots found.</Text>
                    </YStack>
                ) : (
                    <YStack gap="$4">
                        {spots.map((spot) => (
                            <XStack key={spot.id} padding="$3" borderBottomWidth={1} borderColor="$borderColor" alignItems="center" justifyContent="space-between">
                                <XStack gap="$4" alignItems="center">
                                    <YStack width={48} height={48} borderRadius="$2" overflow="hidden" backgroundColor="$muted" alignItems="center" justifyContent="center">
                                        {spot.photoUrl ? (
                                            <img src={spot.photoUrl} alt={spot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <MapPin size={24} color="gray" />
                                        )}
                                    </YStack>
                                    <YStack>
                                        <Text variant="body" weight="semibold">{spot.name}</Text>
                                        <Text variant="caption" muted>Lat: {spot.latitude.toFixed(5)}, Lng: {spot.longitude.toFixed(5)}</Text>
                                    </YStack>
                                </XStack>
                                <XStack gap="$4" alignItems="center">
                                    <YStack alignItems="flex-end" paddingRight="$4">
                                        <Text variant="body">{spot.routeCount}</Text>
                                        <Text variant="caption" muted>Linked Routes</Text>
                                    </YStack>
                                    <Button size="sm" variant="outline" icon={<Edit2 size={14} />}>Edit</Button>
                                </XStack>
                            </XStack>
                        ))}
                    </YStack>
                )}
            </Card>
        </YStack>
    )
}
