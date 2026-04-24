'use client'

import { useState, useEffect } from 'react'
import { XStack, YStack, Text, Input, Button } from '@antapp/ui'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { getSpots } from '@/features/spots/actions'
import type { SpotListItem } from '@/types/api'

interface SpotSelectProps {
    onSelect: (spot: SpotListItem) => void
    excludeIds?: string[]
}

export default function SpotSelect({ onSelect, excludeIds = [] }: SpotSelectProps) {
    const [query, setQuery] = useState('')
    const [spots, setSpots] = useState<SpotListItem[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        let active = true

        if (query.length < 2) {
            setSpots([])
            setIsOpen(false)
            setLoading(false)
            return
        }

        setLoading(true)
        const timer = setTimeout(async () => {
            try {
                const response = await getSpots({ search: query, pageSize: 5 })
                if (active) {
                    setSpots(response.data)
                    setIsOpen(true)
                }
            } catch (error) {
                if (active) console.error('Failed to fetch spots:', error)
            } finally {
                if (active) setLoading(false)
            }
        }, 300)

        return () => {
            active = false
            clearTimeout(timer)
        }
    }, [query])

    const filteredSpots = spots.filter(s => !excludeIds.includes(s.id))

    return (
        <YStack gap="$2" width="100%" position="relative">
            <XStack gap="$2" alignItems="center" backgroundColor="$backgroundStrong" paddingHorizontal="$3" borderRadius="$3" borderWidth={1} borderColor="$borderColor">
                <Search size={18} color="var(--color-mutedForeground)" />
                <Input
                    placeholder="Search spots by name (e.g. Hadrian's Gate)"
                    value={query}
                    onChangeText={setQuery}
                    borderWidth={0}
                    flex={1}
                    paddingVertical="$2"
                />
                {loading && <Loader2 size={16} className="animate-spin" color="var(--color-primary)" />}
            </XStack>

            {isOpen && filteredSpots.length > 0 && (
                <YStack
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    zIndex={100}
                    marginTop="$1"
                    backgroundColor="$background"
                    borderRadius="$3"
                    borderWidth={1}
                    borderColor="$borderColor"
                    elevation={5}
                    maxHeight={300}
                    overflow="scroll"
                >
                    {filteredSpots.map((spot) => (
                        <XStack
                            key={spot.id}
                            padding="$3"
                            hoverStyle={{ backgroundColor: '$muted' }}
                            cursor="pointer"
                            onPress={() => {
                                onSelect(spot)
                                setQuery('')
                                setSpots([])
                                setIsOpen(false)
                            }}
                            gap="$3"
                            alignItems="center"
                            borderBottomWidth={1}
                            borderBottomColor="$borderColor"
                        >
                            <YStack
                                width={32}
                                height={32}
                                borderRadius="$2"
                                backgroundColor="$primary50"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <MapPin size={16} color="var(--color-primary)" />
                            </YStack>
                            <YStack flex={1}>
                                <Text variant="label" weight="semibold">{spot.name}</Text>
                                <Text variant="caption" muted numberOfLines={1}>{spot.description}</Text>
                            </YStack>
                            <Button variant="ghost" size="sm">Add</Button>
                        </XStack>
                    ))}
                </YStack>
            )}

            {isOpen && query.length >= 2 && !loading && filteredSpots.length === 0 && (
                <YStack
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    zIndex={100}
                    marginTop="$1"
                    backgroundColor="$background"
                    padding="$4"
                    borderRadius="$3"
                    borderWidth={1}
                    borderColor="$borderColor"
                >
                    <Text variant="body" muted textAlign="center">No spots found matching &quot;{query}&quot;</Text>
                </YStack>
            )}
        </YStack>
    )
}
