'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Input, Card, Anchor, Avatar } from '@antapp/ui'
import { ArrowLeft, Plus, MapPin, Edit2, Trash2, X, Save } from 'lucide-react'
import { AdminSpotItem, createSpot, updateSpot, deleteSpot } from '@/features/admin/spots-actions'
import { SpotMapModal } from './spot-map-modal'

export default function AdminSpotsClient({
    userName,
    profilePhotoUrl,
    initialSpots,
}: {
    userName: string
    profilePhotoUrl?: string | null
    initialSpots: AdminSpotItem[]
}) {
    const router = useRouter()
    const [spots, setSpots] = useState(initialSpots)
    const [isPending, startTransition] = useTransition()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSpot, setEditingSpot] = useState<AdminSpotItem | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [inspectingSpot, setInspectingSpot] = useState<AdminSpotItem | null>(null)

    // Form state
    const [formData, setFormData] = useState<Partial<AdminSpotItem>>({
        name: '',
        description: '',
        photoUrl: '',
        latitude: 36.8848,
        longitude: 30.7040,
        isActive: true
    })

    useEffect(() => {
        setSpots(initialSpots)
    }, [initialSpots])

    const handleOpenModal = (spot: AdminSpotItem | null = null) => {
        if (spot) {
            setEditingSpot(spot)
            setFormData({
                name: spot.name,
                description: spot.description,
                photoUrl: spot.photoUrl,
                latitude: spot.latitude,
                longitude: spot.longitude,
                isActive: spot.isActive
            })
        } else {
            setEditingSpot(null)
            setFormData({
                name: '',
                description: '',
                photoUrl: '',
                latitude: 36.8848,
                longitude: 30.7040,
                isActive: true
            })
        }
        setIsModalOpen(true)
    }

    const handleSave = () => {
        if (!formData.name || !formData.latitude || !formData.longitude) {
            alert("Please fill in Name, Latitude and Longitude.")
            return
        }

        startTransition(async () => {
            let success = false
            if (editingSpot) {
                success = await updateSpot(editingSpot.id, formData)
            } else {
                success = await createSpot(formData)
            }

            if (success) {
                setIsModalOpen(false)
                router.refresh()
                // Update local state is not strictly necessary with revalidatePath but helps for immediate feedback
                // However, we wait for router.refresh() to finish or the transition to end.
            } else {
                alert("An error occurred while saving the spot.")
            }
        })
    }

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this spot?")) return

        startTransition(async () => {
            const success = await deleteSpot(id)
            if (success) {
                setSpots(prev => prev.filter(s => s.id !== id))
                router.refresh()
            } else {
                alert("An error occurred while deleting the spot.")
            }
        })
    }

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
                    <Avatar size="sm" initials={userName.charAt(0).toUpperCase()} src={profilePhotoUrl ?? undefined} />
                    <YStack>
                        <Text variant="heading2" color="$primary">Spots Management</Text>
                        <Text variant="caption" muted>Manage points of interest and locations</Text>
                    </YStack>
                </XStack>
                <Button
                    size="md"
                    icon={<Plus size={16} />}
                    onPress={() => handleOpenModal()}
                >
                    Add New Spot
                </Button>
            </XStack>

            <YStack gap="$3">
                <XStack justifyContent="space-between" alignItems="center">
                    <Text variant="heading3">Managed Spots ({spots.length})</Text>
                    <Input
                        placeholder="Search spots by name..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        width={250}
                        size="sm"
                        backgroundColor="$backgroundStrong"
                    />
                </XStack>
                {spots.length === 0 ? (
                    <YStack padding="$6" alignItems="center" justifyContent="center" backgroundColor="$muted" borderRadius="$3" minHeight={200}>
                        <Text variant="body" muted>No spots found.</Text>
                    </YStack>
                ) : (
                    <YStack gap="$2" overflowX="auto">
                        <XStack padding="$3" backgroundColor="$backgroundStrong" borderBottomWidth={2} borderBottomColor="$borderColor" gap="$3">
                            <XStack flex={3} flexBasis={0} minWidth={0}><Text variant="label" weight="semibold">Spot</Text></XStack>
                            <XStack flex={2} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Coordinates</Text></XStack>
                            <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Linked</Text></XStack>
                            <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Map</Text></XStack>
                            <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Status</Text></XStack>
                            <XStack flex={2} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Actions</Text></XStack>
                        </XStack>

                        {spots.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((spot) => (
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

                                <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        icon={<MapPin size={14} />}
                                        onPress={() => setInspectingSpot(spot)}
                                    >
                                        Map
                                    </Button>
                                </XStack>

                                <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center">
                                    {spot.isActive ? (
                                        <Text variant="caption" color="$success600" weight="semibold">Active</Text>
                                    ) : (
                                        <Text variant="caption" color="$error600" weight="semibold">Inactive</Text>
                                    )}
                                </XStack>

                                <XStack flex={2} flexBasis={0} minWidth={0} justifyContent="center" gap="$2">
                                    <Button size="sm" variant="outline" icon={<Edit2 size={14} />} onPress={() => handleOpenModal(spot)}>Edit</Button>
                                    <Button size="sm" variant="ghost" icon={<Trash2 size={14} color="red" />} onPress={() => handleDelete(spot.id)} />
                                </XStack>
                            </XStack>
                        ))}
                    </YStack>
                )}
            </YStack>

            {/* Simple Modal Overlay */}
            {isModalOpen && (
                <YStack
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    backgroundColor="rgba(0,0,0,0.6)"
                    zIndex={9999}
                    alignItems="center"
                    justifyContent="center"
                    padding="$4"
                >
                    <Card width="100%" maxWidth={500} padding="$6" gap="$4" elevation={10} backgroundColor="$background">
                        <XStack justifyContent="space-between" alignItems="center">
                            <Text variant="heading3">{editingSpot ? 'Edit Spot' : 'Add New Spot'}</Text>
                            <Button size="sm" variant="ghost" icon={<X size={20} />} onPress={() => setIsModalOpen(false)} borderRadius="$10" />
                        </XStack>

                        <YStack gap="$4">
                            <YStack gap="$1">
                                <Text variant="label">Name</Text>
                                <Input
                                    placeholder="Enter spot name"
                                    value={formData.name || ''}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                />
                            </YStack>

                            <YStack gap="$1">
                                <Text variant="label">Description</Text>
                                <Input
                                    placeholder="Enter description"
                                    value={formData.description || ''}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                    numberOfLines={3}
                                    multiline
                                />
                            </YStack>

                            <YStack gap="$1">
                                <Text variant="label">Photo URL</Text>
                                <Input
                                    placeholder="https://example.com/photo.jpg"
                                    value={formData.photoUrl || ''}
                                    onChangeText={(text) => setFormData({ ...formData, photoUrl: text })}
                                />
                            </YStack>

                            <XStack gap="$4">
                                <YStack gap="$1" flex={1}>
                                    <Text variant="label">Latitude</Text>
                                    <Input
                                        type="number"
                                        placeholder="36.8848"
                                        value={formData.latitude?.toString() || ''}
                                        onChangeText={(text) => setFormData({ ...formData, latitude: parseFloat(text) || 0 })}
                                    />
                                </YStack>
                                <YStack gap="$1" flex={1}>
                                    <Text variant="label">Longitude</Text>
                                    <Input
                                        type="number"
                                        placeholder="30.7040"
                                        value={formData.longitude?.toString() || ''}
                                        onChangeText={(text) => setFormData({ ...formData, longitude: parseFloat(text) || 0 })}
                                    />
                                </YStack>
                            </XStack>

                            <XStack gap="$2" alignItems="center">
                                <Button
                                    size="sm"
                                    variant={formData.isActive ? 'solid' : 'outline'}
                                    onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                >
                                    {formData.isActive ? 'Active' : 'Inactive'}
                                </Button>
                                <Text variant="caption" muted>Toggle active status</Text>
                            </XStack>
                        </YStack>

                        <XStack justifyContent="flex-end" gap="$3" marginTop="$4">
                            <Button variant="outline" onPress={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button
                                variant="solid"
                                icon={<Save size={16} />}
                                onPress={handleSave}
                                loading={isPending}
                                disabled={isPending}
                            >
                                {editingSpot ? 'Update Spot' : 'Create Spot'}
                            </Button>
                        </XStack>
                    </Card>
                </YStack>
            )}

            {inspectingSpot && (
                <SpotMapModal
                    spot={inspectingSpot}
                    onClose={() => setInspectingSpot(null)}
                />
            )}
        </YStack>
    )
}
