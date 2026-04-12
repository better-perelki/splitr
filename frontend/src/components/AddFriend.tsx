import { useEffect, useState } from 'react'
import { searchUsers, type User } from '../api/services/users'
import Icon from './Icon'
import api from '../api/client'
import { MyQrCode } from './MyQrCode'
import { ScanQr } from './ScanQr'
import { parseQr } from '../utils/qrUtils'
import type { RelationStatus } from '../hooks/useFriends'

type Props = {
    open: boolean
    onClose: () => void
    userId: string | null
    getRelationStatus: (username: string) => RelationStatus
    sendFriendRequestById: (id: string) => Promise<void>
    refreshFriends: () => Promise<void>
}

type Tab = 'search' | 'myqr' | 'scan'

export default function AddFriendModal({
    open,
    onClose,
    userId,
    getRelationStatus,
    sendFriendRequestById,
    refreshFriends,
}: Props) {
    const [tab, setTab] = useState<Tab>('search')
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState<string | null>(null)
    const [sentUsernames, setSentUsernames] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (!open) return
        setTab('search')
        setQuery('')
        setResults([])
        setSentUsernames(new Set())
    }, [open])

    useEffect(() => {
        if (query.length < 3) {
            setResults([])
            return
        }

        const timeout = setTimeout(async () => {
            setLoading(true)
            try {
                const users = await searchUsers(query)
                setResults(users.filter(u => u.id !== userId))
            } catch {
                setResults([])
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(timeout)
    }, [query])

    if (!open) return null

    const handleAdd = async (user: User) => {
        try {
            setSending(user.id)
            await api.post('/friends/request/by-username', null, {
                params: { username: user.username },
            })
            setSentUsernames(prev => new Set(prev).add(user.username))
            refreshFriends()
        } catch {
            alert('Failed to send friend request')
        } finally {
            setSending(null)
        }
    }

    const handleQrScan = async (text: string) => {
        const scannedUserId = parseQr(text)
        if (scannedUserId) {
            await sendFriendRequestById(scannedUserId)
            onClose()
        } else {
            alert('Invalid QR code')
        }
    }

    const getStatus = (user: User): RelationStatus => {
        if (sentUsernames.has(user.username)) return 'PENDING_SENT'
        return getRelationStatus(user.username)
    }

    const statusBadge = (status: RelationStatus) => {
        switch (status) {
            case 'FRIEND':
                return (
                    <span className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg flex items-center gap-1">
                        <Icon name="check" className="text-sm" />
                        Friends
                    </span>
                )
            case 'PENDING_SENT':
                return (
                    <span className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg flex items-center gap-1">
                        <Icon name="schedule" className="text-sm" />
                        Sent
                    </span>
                )
            case 'PENDING_RECEIVED':
                return (
                    <span className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg flex items-center gap-1">
                        <Icon name="mail" className="text-sm" />
                        Pending
                    </span>
                )
            default:
                return null
        }
    }

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'search', label: 'Search', icon: 'search' },
        { id: 'myqr', label: 'My QR', icon: 'qr_code' },
        { id: 'scan', label: 'Scan', icon: 'qr_code_2' },
    ]

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl border border-primary/10 p-6 relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-all p-2 rounded-full hover:bg-error/10 z-20"
                >
                    <Icon name="close" />
                </button>

                <h3 className="font-headline text-xl font-bold tracking-tight mb-5">
                    Add Friend
                </h3>

                <div className="flex p-1 bg-surface-container-low rounded-xl mb-6">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 py-2.5 text-xs font-headline font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === t.id
                                    ? 'bg-surface-container-highest text-primary'
                                    : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                        >
                            <Icon name={t.icon} className="text-sm" />
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'search' && (
                    <div>
                        <div className="relative mb-4 group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                                <Icon name="search" className="text-lg" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by username or email"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                autoFocus
                                className="w-full bg-surface-container-low border border-primary/10 rounded-xl py-3 pl-10 pr-9 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-high transition-all font-body"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="absolute inset-y-0 right-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                                >
                                    <Icon name="close" className="text-base" />
                                </button>
                            )}
                        </div>

                        <div className="max-h-72 overflow-y-auto space-y-1">
                            {loading && (
                                <p className="text-xs text-center py-8 text-on-surface-variant">Searching...</p>
                            )}

                            {!loading && results.map(user => {
                                const status = getStatus(user)
                                return (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-lowest transition-all"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-surface-variant flex-shrink-0 overflow-hidden border border-primary/10 flex items-center justify-center">
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} className="w-10 h-10 object-cover" alt="" />
                                                ) : (
                                                    <span className="text-xs font-bold text-on-surface-variant uppercase">
                                                        {user.username[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="truncate text-sm font-medium">{user.username}</span>
                                        </div>

                                        {status !== 'NONE' ? (
                                            statusBadge(status)
                                        ) : (
                                            <button
                                                onClick={() => handleAdd(user)}
                                                disabled={sending === user.id}
                                                className="px-4 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
                                            >
                                                {sending === user.id ? '...' : 'Add'}
                                            </button>
                                        )}
                                    </div>
                                )
                            })}

                            {!loading && query.length >= 3 && results.length === 0 && (
                                <div className="text-center py-10 space-y-2">
                                    <Icon name="person_search" className="text-4xl text-on-surface-variant/30" />
                                    <p className="text-sm text-on-surface-variant">No users found</p>
                                </div>
                            )}

                            {!loading && query.length < 3 && (
                                <div className="text-center py-10 space-y-2">
                                    <Icon name="search" className="text-4xl text-on-surface-variant/30" />
                                    <p className="text-sm text-on-surface-variant">
                                        Type at least 3 characters to search
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'myqr' && (
                    <div className="flex justify-center">
                        {userId ? (
                            <MyQrCode userId={userId} />
                        ) : (
                            <p className="text-sm text-on-surface-variant py-8">Loading...</p>
                        )}
                    </div>
                )}

                {tab === 'scan' && (
                    <ScanQr onResult={handleQrScan} />
                )}
            </div>
        </div>
    )
}
