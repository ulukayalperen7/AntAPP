'use client'

import { useState, useEffect } from 'react'
import { getSavedSpots } from '@/features/spots/actions'
import type { SpotListItem } from '@/types/api'
import { MapPin, Check, X, BookmarkCheck, Heart } from 'lucide-react'

export function SavedSpotsPickerModal({
    isOpen,
    onClose,
    onAddSelected,
    excludeIds = [],
}: {
    isOpen: boolean
    onClose: () => void
    onAddSelected: (spots: SpotListItem[]) => void
    excludeIds?: string[]
}) {
    const [savedSpots, setSavedSpots] = useState<SpotListItem[]>([])
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (!isOpen) return
        setSelected(new Set())
        setLoading(true)
        getSavedSpots()
            .then((spots) => setSavedSpots(spots.filter((s) => !excludeIds.includes(s.id))))
            .catch(() => setSavedSpots([]))
            .finally(() => setLoading(false))
    }, [isOpen])

    if (!isOpen) return null

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleAdd = () => {
        const picked = savedSpots.filter((s) => selected.has(s.id))
        onAddSelected(picked)
        onClose()
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                backgroundColor: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: 16, padding: 24,
                    width: '100%', maxWidth: 480, maxHeight: '80vh',
                    display: 'flex', flexDirection: 'column', gap: 16,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Heart size={20} color="#EA580C" fill="#EA580C" />
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#111827' }}>Pick from Saved Spots</p>
                        <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
                            {selected.size > 0 ? `${selected.size} selected` : 'Select spots to add as stops'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4, borderRadius: 8 }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ width: '100%', height: 1, background: '#E5E7EB' }} />

                {/* Spot list */}
                <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {loading && (
                        <p style={{ textAlign: 'center', color: '#6B7280', padding: '32px 0' }}>Loading saved spots...</p>
                    )}
                    {!loading && savedSpots.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <BookmarkCheck size={40} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
                            <p style={{ margin: 0, fontWeight: 600, color: '#374151' }}>No saved spots yet</p>
                            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
                                Like spots from the Spots page first!
                            </p>
                        </div>
                    )}
                    {!loading && savedSpots.map((spot) => {
                        const isSelected = selected.has(spot.id)
                        return (
                            <button
                                key={spot.id}
                                onClick={() => toggle(spot.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '10px 12px', borderRadius: 10, border: '1.5px solid',
                                    borderColor: isSelected ? '#EA580C' : '#E5E7EB',
                                    background: isSelected ? '#FFF7ED' : '#FAFAFA',
                                    cursor: 'pointer', textAlign: 'left',
                                    transition: 'all 0.12s ease',
                                }}
                            >
                                {/* Spot thumbnail or icon */}
                                <div style={{
                                    width: 42, height: 42, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                                    background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {spot.photoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={spot.photoUrl} alt={spot.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    ) : (
                                        <MapPin size={18} color={isSelected ? '#EA580C' : '#9CA3AF'} />
                                    )}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {spot.name}
                                    </p>
                                    {spot.description && (
                                        <p style={{ margin: 0, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {spot.description}
                                        </p>
                                    )}
                                </div>

                                {/* Check indicator */}
                                <div style={{
                                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                    background: isSelected ? '#EA580C' : '#F3F4F6',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.12s ease',
                                }}>
                                    {isSelected && <Check size={13} color="#fff" strokeWidth={3} />}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Footer */}
                <div style={{ paddingTop: 8, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8 }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '10px 0', borderRadius: 8,
                            background: '#F3F4F6', color: '#374151',
                            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={selected.size === 0}
                        style={{
                            flex: 2, padding: '10px 0', borderRadius: 8,
                            background: selected.size > 0 ? '#EA580C' : '#F3F4F6',
                            color: selected.size > 0 ? '#fff' : '#9CA3AF',
                            border: 'none', cursor: selected.size > 0 ? 'pointer' : 'default',
                            fontWeight: 600, fontSize: 14, transition: 'all 0.15s ease',
                        }}
                    >
                        {selected.size > 0 ? `Add ${selected.size} Stop${selected.size > 1 ? 's' : ''}` : 'Select spots first'}
                    </button>
                </div>
            </div>
        </div>
    )
}
