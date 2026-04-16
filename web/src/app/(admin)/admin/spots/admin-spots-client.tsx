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

            <YStack gap="$3">
                <Text variant="heading3">Managed Spots ({spots.length})</Text>
                {spots.length === 0 ? (
                    <YStack padding="$6" alignItems="center" justifyContent="center" backgroundColor="$muted" borderRadius="$3" minHeight={200}>
                        <Text variant="body" muted>No spots found.</Text>
                    </YStack>
                ) : (
                    <YStack gap="$2" overflowX="auto">
                        <XStack padding="$3" backgroundColor="$backgroundStrong" borderBottomWidth={2} borderBottomColor="$borderColor" gap="$3">
                            <XStack flex={3} flexBasis={0} minWidth={0}><Text variant="label" weight="semibold">Spot</Text></XStack>
                            <XStack flex={2} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Coordinates</Text></XStack>
                            <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Linked Routes</Text></XStack>
                            <XStack flex={2} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Status & Actions</Text></XStack>
                        </XStack>

                        {spots.map((spot) => (
                            <XStack key={spot.id} padding="$3" borderBottomWidth={1} borderBottomColor="$borderColor" gap="$3" alignItems="center">
                                <XStack flex={3} flexBasis={0} minWidth={0} alignItems="center" gap="$3">
                                    <YStack width={36} height={36} borderRadius="$2" overflow="hidden" backgroundColor="$muted" alignItems="center" justifyContent="center">
                                        {spot.photoUrl ? (
                                            <img src={spot.photoUrl} alt={spot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <MapPin size={18} color="gray" />
                                        )}
                                    </YStack>
                                    <YStack flex={1}>
                                        <Text variant="body" weight="semibold" numberOfLines={1}>{spot.name}</Text>
                                        <Text variant="caption" muted numberOfLines={1}>{spot.description || 'No description'}</Text>
                                    </YStack>
                                </XStack>

                                <XStack flex={2} flexBasis={0} minWidth={0} justifyContent="center">
                                    <Text variant="caption" muted>Lat: {spot.latitude.toFixed(4)}, Lng: {spot.longitude.toFixed(4)}</Text>
                                </XStack>

                                <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center">
                                    <Text variant="body">{spot.routeCount}</Text>
                                </XStack>

                                <XStack flex={2} flexBasis={0} minWidth={0} justifyContent="center" gap="$2">
                                    {spot.isActive ? (
                                        <Text variant="caption" color="$success600" weight="semibold">Active</Text>
                                    ) : (
                                        <Text variant="caption" color="$error600" weight="semibold">Inactive</Text>
                                    )}
                                    <Button size="sm" variant="outline" icon={<Edit2 size={14} />} onPress={() => alert(`Edit feature for ${spot.name} is coming next!`)}>Edit</Button>
                                </XStack>
                            </XStack>
                        ))}
                    </YStack>
                )}
            </YStack>
        </YStack>
    )
}
