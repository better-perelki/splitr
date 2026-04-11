import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'
import type { Friendship, FriendRequestDetails } from '../api'

export type RelationStatus = 'FRIEND' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'NONE'

export function useFriends() {
    const [friends, setFriends] = useState<Friendship[]>([])
    const [pending, setPending] = useState<FriendRequestDetails[]>([])
    const [sent, setSent] = useState<FriendRequestDetails[]>([])
    const [loading, setLoading] = useState(true)

    const fetchFriends = useCallback(async () => {
        try {
            const [friendsRes, pendingRes, sentRes] = await Promise.all([
                api.get<Friendship[]>('/friends'),
                api.get<FriendRequestDetails[]>('/friends/pending'),
                api.get<FriendRequestDetails[]>('/friends/sent'),
            ])
            setFriends(friendsRes.data)
            setPending(pendingRes.data)
            setSent(sentRes.data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchFriends() }, [fetchFriends])

    const getRelationStatus = useCallback((username: string): RelationStatus => {
        if (friends.some(f => f.user?.username === username)) return 'FRIEND'
        if (pending.some(p => p.sender?.username === username)) return 'PENDING_RECEIVED'
        if (sent.some(s => s.receiver?.username === username)) return 'PENDING_SENT'
        return 'NONE'
    }, [friends, pending, sent])

    const sendFriendRequestById = useCallback(async (userId: string) => {
        try {
            await api.post('/friends/request', { receiverId: userId })
            await fetchFriends()
        } catch {
            alert('Failed to send friend request')
        }
    }, [fetchFriends])

    const acceptRequest = useCallback(async (id: string) => {
        const request = pending.find(p => p.id === id)
        try {
            await api.post(`/friends/request/${id}/accept`)
            setPending(prev => prev.filter(p => p.id !== id))
            if (request?.sender) {
                setFriends(prev => [...prev, {
                    id: request.id,
                    user: request.sender,
                    balance: 0,
                }])
            }
        } catch {
            alert('Failed to accept request')
        }
    }, [pending])

    const declineRequest = useCallback(async (id: string) => {
        try {
            await api.post(`/friends/request/${id}/decline`)
            setPending(prev => prev.filter(p => p.id !== id))
        } catch {
            alert('Failed to decline request')
        }
    }, [])

    const removeFriend = useCallback(async (id: string) => {
        try {
            await api.delete(`/friends/${id}`)
            setFriends(prev => prev.filter(f => f.id !== id))
        } catch {
            alert('Failed to remove friend')
        }
    }, [])

    const cancelRequest = useCallback(async (id: string) => {
        try {
            await api.delete(`/friends/request/${id}`)
            setSent(prev => prev.filter(s => s.id !== id))
        } catch {
            alert('Failed to cancel request')
        }
    }, [])

    return {
        friends,
        pending,
        sent,
        loading,
        fetchFriends,
        getRelationStatus,
        sendFriendRequestById,
        acceptRequest,
        declineRequest,
        removeFriend,
        cancelRequest,
    }
}
