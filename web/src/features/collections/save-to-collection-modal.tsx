'use client'

import { useState, useTransition, useEffect } from 'react'
import { YStack, XStack, Text, Button } from '@antapp/ui'
import { FolderOpen, Bookmark, Check, X, Plus } from 'lucide-react'
import { getCollections, addRouteToCollection, createCollection } from '@/features/collections/actions'
import type { Collection } from '@/types/api'

export function SaveToCollectionModal({
    routeId,
    isOpen,
    onClose,
    onSaved,
}: {
    routeId: string
    isOpen: boolean
    onClose: () => void
    onSaved: (collectionId: string) => void
}) {
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(false)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
    const [, startTransition] = useTransition()

    // Create New state
    const [isCreating, setIsCreating] = useState(false)
    const [newName, setNewName] = useState('')
    const [isCreatingLoading, setIsCreatingLoading] = useState(false)

    const fetchCollections = () => {
        setLoading(true)
        getCollections(1, 50)
            .then((res) => setCollections(res.data))
            .catch(() => setCollections([]))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (!isOpen) return
        fetchCollections()
    }, [isOpen])

    const handleCreateAndSave = async () => {
        if (!newName.trim()) return
        setIsCreatingLoading(true)
        try {
            const newId = await createCollection({ name: newName.trim() })
            await addRouteToCollection(newId, routeId)
            setSavedIds((prev) => new Set([...prev, newId]))
            onSaved(newId)
            setIsCreating(false)
            setNewName('')
            fetchCollections()
        } catch {
            // Error handling
        } finally {
            setIsCreatingLoading(false)
        }
    }

    if (!isOpen) return null

    const handleSave = (collectionId: string) => {
        if (savedIds.has(collectionId) || savingId) return
        setSavingId(collectionId)
        startTransition(async () => {
            try {
                await addRouteToCollection(collectionId, routeId)
                setSavedIds((prev) => new Set([...prev, collectionId]))
                onSaved(collectionId)
            } catch {
                // Ignore – show error in future iteration
            } finally {
                setSavingId(null)
            }
        })
    }

    return (
        // Backdrop
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                backgroundColor: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            <div
                onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: 16, padding: 24,
                    width: '100%', maxWidth: 440, maxHeight: '80vh',
                    display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Bookmark size={20} color="var(--color-primary)" />
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#111827' }}>Save to Collection</p>
                        <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>Choose which collection to add this route to</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#6B7280', padding: 4, borderRadius: 8,
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ width: '100%', height: 1, background: '#E5E7EB' }} />

                {/* Collection list */}
                <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {loading && (
                        <p style={{ textAlign: 'center', color: '#6B7280', padding: '24px 0' }}>Loading collections...</p>
                    )}
                    {!loading && collections.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#6B7280', padding: '24px 0' }}>
                            No collections yet. Create one first!
                        </p>
                    )}
                    {!loading && collections.map((col) => {
                        const isSaved = savedIds.has(col.id)
                        const isSaving = savingId === col.id
                        return (
                            <button
                                key={col.id}
                                onClick={() => handleSave(col.id)}
                                disabled={isSaved || !!savingId}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 14px', borderRadius: 10, border: '1.5px solid',
                                    borderColor: isSaved ? '#EA580C' : '#E5E7EB',
                                    background: isSaved ? '#FFF7ED' : '#FAFAFA',
                                    cursor: isSaved || savingId ? 'default' : 'pointer',
                                    opacity: (!!savingId && !isSaving) ? 0.6 : 1,
                                    transition: 'all 0.15s ease',
                                    textAlign: 'left',
                                    width: '100%',
                                }}
                            >
                                <div style={{
                                    width: 36, height: 36, borderRadius: 8,
                                    background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <FolderOpen size={18} color={isSaved ? '#EA580C' : '#9CA3AF'} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#111827' }}>{col.name}</p>
                                    <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{col.routeCount} route{col.routeCount !== 1 ? 's' : ''}</p>
                                </div>
                                {isSaved && <Check size={18} color="#EA580C" />}
                                {isSaving && <div className="loader" style={{ width: 18, height: 18, borderRadius: '50%', borderWidth: 2, borderStyle: 'solid', borderColor: '#E5E7EB', borderTopColor: '#EA580C', animation: 'spin 0.8s linear infinite' }} />}
                                {!isSaved && !isSaving && (
                                    <Plus size={16} color="#9CA3AF" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Create New Inline */}
                <div style={{ padding: '4px 0' }}>
                    {isCreating ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                autoFocus
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Collection name..."
                                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 14 }}
                            />
                            <Button size="sm" variant="solid" onPress={handleCreateAndSave} disabled={isCreatingLoading}>
                                {isCreatingLoading ? '...' : 'Create & Save'}
                            </Button>
                            <Button size="sm" variant="ghost" onPress={() => setIsCreating(false)}>
                                <X size={16} />
                            </Button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreating(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'none', border: 'none', color: 'var(--color-primary)',
                                fontWeight: 500, fontSize: 14, cursor: 'pointer', padding: '4px 8px'
                            }}
                        >
                            <Plus size={16} />
                            Create New Collection
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div style={{ paddingTop: 8, borderTop: '1px solid #E5E7EB' }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%', padding: '10px 0', borderRadius: 8,
                            background: savedIds.size > 0 ? '#EA580C' : '#F3F4F6',
                            color: savedIds.size > 0 ? '#fff' : '#374151',
                            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                            transition: 'background 0.2s',
                        }}
                    >
                        {savedIds.size > 0 ? 'Done' : 'Cancel'}
                    </button>
                </div>
            </div>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    )
}
