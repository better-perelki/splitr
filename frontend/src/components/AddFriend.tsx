import {useEffect, useState} from 'react'
import {searchUsers, type User} from '../api/services/users'
import Icon from './Icon'
import api from "../api/client.ts"
import {useFriends} from "../hooks/useFriends.ts";

type Props = {
    open: boolean
    onClose: () => void
    existingFriends: string[]
    onSuccess: () => void
}

type FriendRequest = {
    id: string
    receiverId: string
    receiver: { username: string }
}

export default function AddFriendModal({open, onClose, existingFriends, onSuccess}: Props) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState<string | null>(null)
    const [pendingRequests, setPendingRequests] = useState<Record<string, string>>({})
    const {filterNewPeople, fetchFriends} = useFriends();

    useEffect(() => {
        if (!open) return

        const fetchSentRequests = async () => {
            try {
                const res = await api.get<FriendRequest[]>('/friends/sent')
                const map: Record<string, string> = {}
                res.data.forEach(req => {
                    if (req.receiver?.username) map[req.receiver.username] = req.id
                })
                setPendingRequests(map)
            } catch (err) {
                console.error('Failed to fetch sent requests', err)
            }
        }

        fetchSentRequests()
    }, [open])

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 3) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const users = await searchUsers(query);
                setResults(filterNewPeople(users));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300) // Prosty debounce
        return () => clearTimeout(timeoutId)
    }, [query, existingFriends])

    if (!open) return null

    const handleAdd = async (user: User) => {
        try {
            setSending(user.id)
            await api.post('/friends/request/by-username', null, {
                params: {username: user.username}
            })

            onSuccess()
            onClose()

            setPendingRequests(prev => ({...prev, [user.username]: 'temp-id'}))
        } catch (err) {
            console.error('Failed to send friend request', err)
            alert('Failed to send friend request')
        } finally {
            setSending(null)
        }
    }

    const handleCancel = async (username: string) => {
        const requestId = pendingRequests[username]
        if (!requestId) return
        try {
            await api.delete(`/friends/request/${requestId}`)

            onSuccess()

            setPendingRequests(prev => {
                const copy = {...prev}
                delete copy[username]
                return copy
            })
        } catch (err) {
            console.error('Failed to cancel request', err)
            alert('Failed to cancel request')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-20 z-50">
            <div className="bg-surface w-96 rounded-2xl shadow-lg p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors"
                >
                    <Icon name="close"/>
                </button>

                <h3 className="font-headline text-xl font-bold mb-4">Add Friend</h3>

                <input
                    type="text"
                    placeholder="Search by name"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-surface-container-low border border-primary/10 rounded-xl py-3 px-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-high transition-all font-body mb-4"
                />

                <div className="max-h-64 overflow-y-auto space-y-2">
                    {loading ? (
                        <p className="text-xs text-center py-4 text-on-surface-variant">Searching...</p>
                    ) : (
                        results.map(user => {
                            const isPending = !!pendingRequests[user.username]
                            return (
                                <div key={user.id}
                                     className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-lowest transition-all">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full bg-surface-variant flex-shrink-0 overflow-hidden">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} className="w-10 h-10 object-cover"/>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <span className="truncate text-sm font-medium">{user.username}</span>
                                    </div>

                                    {isPending ? (
                                        <button
                                            onClick={() => handleCancel(user.username)}
                                            className="px-3 py-1 bg-error/10 text-error text-xs font-bold rounded-lg hover:bg-error/20 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleAdd(user)}
                                            disabled={sending === user.id}
                                            className="px-3 py-1 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
                                        >
                                            {sending === user.id ? '...' : 'Add'}
                                        </button>
                                    )}
                                </div>
                            )
                        })
                    )}

                    {query.length >= 3 && !loading && results.length === 0 && (
                        <p className="text-xs text-on-surface-variant text-center py-4">No users found</p>
                    )}
                </div>
            </div>
        </div>
    )
}