'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button } from '@antapp/ui'
import { LogOut, ArrowLeft, Star, Map, Trash2 } from 'lucide-react'
import { logout } from '@/features/auth/actions'
import { deleteAdminRoute, promoteRoute } from '@/features/admin/routes-actions'
import type { RouteListItem } from '@/types/api'
import { RouteMapModal } from './route-map-modal'

export default function AdminRoutesClient({
    userName,
    email,
    initialRoutes,
}: {
    userName: string
    email: string
    initialRoutes: RouteListItem[]
}) {
    const router = useRouter()
    const [routes, setRoutes] = useState(initialRoutes)
    const [isPending, startTransition] = useTransition()
    const [isLoggingOut, startLogoutTransition] = useTransition()
    const [inspectingRouteId, setInspectingRouteId] = useState<string | null>(null)

    const handlePromote = (id: string, newType: 'Official' | 'Sponsored' | 'Community') => {
        startTransition(async () => {
            const success = await promoteRoute(id, newType)
            if (success) {
                setRoutes(prev => prev.map(r => r.id === id ? { ...r, contentType: newType } : r))
            }
        })
    }

    const handleDelete = (id: string) => {
        if (!window.confirm('Delete this route from the system?')) return

        startTransition(async () => {
            const success = await deleteAdminRoute(id)
            if (success) {
                setRoutes(prev => prev.filter(r => r.id !== id))
            } else {
                alert('Failed to delete route.')
            }
        })
    }

    const handleLogout = () => {
        startLogoutTransition(async () => {
            await logout()
        })
    }

    return (
        <YStack flex={1} gap="$6" padding="$6">
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderBottomColor="$borderColor" paddingBottom="$4">
                <XStack gap="$3" alignItems="center" flex={1}>
                    <Button
                        size="md"
                        variant="ghost"
                        icon={<ArrowLeft size={18} />}
                        onPress={() => router.push('/admin')}
                    >
                        Back
                    </Button>
                    <img src="/ant-logo.png" alt="AntAPP Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                    <YStack gap="$1">
                        <XStack alignItems="center" gap="$2">
                            <Text variant="heading2">Routes</Text>
                        </XStack>
                        <Text variant="caption" muted>{userName} ({email})</Text>
                    </YStack>
                </XStack>
                <Button
                    variant="ghost"
                    size="md"
                    icon={<LogOut size={16} />}
                    loading={isLoggingOut}
                    disabled={isLoggingOut}
                    onPress={handleLogout}
                >
                    Logout
                </Button>
            </XStack >

            <YStack gap="$3">
                <Text variant="heading3">All Routes ({routes.length})</Text>
                {routes.length === 0 ? (
                    <YStack padding="$6" alignItems="center" justifyContent="center" backgroundColor="$muted" borderRadius="$3" minHeight={200}>
                        <Text variant="body" muted>No routes found in the system.</Text>
                    </YStack>
                ) : (
                    <YStack gap="$2" overflowX="auto">
                        <XStack padding="$3" backgroundColor="$backgroundStrong" borderBottomWidth={2} borderBottomColor="$borderColor" gap="$3">
                            <XStack width={60}><Text variant="label" weight="semibold">Image</Text></XStack>
                            <XStack flex={2} flexBasis={0} minWidth={0}><Text variant="label" weight="semibold">Title</Text></XStack>
                            <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Visibility</Text></XStack>
                            <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Type</Text></XStack>
                            <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Rating</Text></XStack>
                            <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Map</Text></XStack>
                            <XStack flex={2} flexBasis={0} minWidth={0} justifyContent="center"><Text variant="label" weight="semibold">Actions</Text></XStack>
                        </XStack>

                        {routes.map((route) => {
                            // Map numeric enum to string if backend returned standard JSON integers
                            const rawType = route.contentType as any;
                            const contentTypeStr = Array.isArray(rawType)
                                ? rawType[0]
                                : (rawType === 1 || rawType === '1' ? 'Official' : (rawType === 2 || rawType === '2' ? 'Sponsored' : 'Community'));

                            return (
                                <XStack key={route.id} padding="$3" borderBottomWidth={1} borderBottomColor="$borderColor" gap="$3" alignItems="center">
                                    <XStack width={60}>
                                        <img
                                            src={(route.thumbnailUrl && route.thumbnailUrl.trim() !== '') ? route.thumbnailUrl : 'https://via.placeholder.com/60x40.png?text=Empty'}
                                            alt={route.title}
                                            style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: '4px' }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x40.png?text=No+Img';
                                            }}
                                        />
                                    </XStack>
                                    <XStack flex={2} flexBasis={0} minWidth={0}>
                                        <Text variant="body" numberOfLines={1}>{route.title}</Text>
                                    </XStack>
                                    <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center">
                                        <Text variant="caption" muted>{route.isPublic ? 'Public' : 'Private'}</Text>
                                    </XStack>
                                    <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center">
                                        <Text variant="caption" weight={contentTypeStr !== 'Community' ? 'bold' : undefined} color={contentTypeStr === 'Official' ? '$primary' : (contentTypeStr === 'Sponsored' ? '$success600' : '$color')}>
                                            {contentTypeStr}
                                        </Text>
                                    </XStack>
                                    <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center" alignItems="center" gap="$1">
                                        {route.averageRating > 0 ? (
                                            <>
                                                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                                <Text variant="caption">{route.averageRating.toFixed(1)}</Text>
                                            </>
                                        ) : (
                                            <Text variant="caption" muted>N/A</Text>
                                        )}
                                    </XStack>
                                    <XStack flex={1} flexBasis={0} minWidth={0} justifyContent="center" alignItems="center">
                                        <Button size="sm" variant="ghost" icon={<Map size={14} />} onPress={() => setInspectingRouteId(route.id)}>Map</Button>
                                    </XStack>

                                    <XStack flex={2} flexBasis={0} minWidth={0} justifyContent="center" alignItems="center" gap="$2">
                                        {contentTypeStr === 'Community' && (
                                            <>
                                                <Button size="sm" variant="outline" onPress={() => handlePromote(route.id, 'Official')} disabled={isPending}>Official</Button>
                                                <Button size="sm" variant="outline" onPress={() => handlePromote(route.id, 'Sponsored')} disabled={isPending}>Sponsor</Button>
                                            </>
                                        )}
                                        {contentTypeStr !== 'Community' && (
                                            <Button size="sm" variant="outline" onPress={() => handlePromote(route.id, 'Community')} disabled={isPending}>Revert</Button>
                                        )}
                                        <Button size="sm" variant="ghost" onPress={() => handleDelete(route.id)} disabled={isPending} icon={<Trash2 size={14} color="var(--color-error500, #DC2626)" />}>
                                            <Text variant="label" color="$error500">Delete</Text>
                                        </Button>
                                    </XStack>
                                </XStack>
                            );
                        })}
                    </YStack>
                )}
            </YStack>

            {/* Map Inspector Modal */}
            {inspectingRouteId && (
                <RouteMapModal
                    routeId={inspectingRouteId}
                    onClose={() => setInspectingRouteId(null)}
                />
            )}
        </YStack >
    )
}
