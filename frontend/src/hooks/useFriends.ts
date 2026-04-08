import {useState, useEffect} from 'react'
import api from '../api/client'
import type {Friendship, FriendRequestDetails} from '../api'
import type {User} from "../api/services/users.ts";

export function useFriends() {
    const [friends, setFriends] = useState<Friendship[]>([])
    const [pending, setPending] = useState<FriendRequestDetails[]>([])
    const [sent, setSent] = useState<FriendRequestDetails[]>([])
    const [loading, setLoading] = useState(true)

    const fetchFriends = async () => {
        setLoading(true)
        try {
            const [friendsRes, pendingRes, sentRes] = await Promise.all([
                api.get<Friendship[]>('/friends'),
                api.get<FriendRequestDetails[]>('/friends/pending'),
                api.get<FriendRequestDetails[]>('/friends/sent')
            ])
            setFriends(friendsRes.data)
            setPending(pendingRes.data)
            setSent(sentRes.data)
        } finally {
            setLoading(false)
        }
    }

    const sendFriendRequestById = async (userId: string) => {
        try {
            await api.post('/friends/request', {receiverId: userId})
            await fetchFriends()
        } catch (e) {
            alert("Nie udało się wysłać zaproszenia")
        }
    }

    const acceptRequest = async (id: string) => {
        try {
            await api.post(`/friends/request/${id}/accept`)
            await fetchFriends()
        } catch (e) {
            alert("Nie udało się wysłać zaproszenia")
        }
    }

    const declineRequest = async (id: string) => {
        try {
            await api.post(`/friends/request/${id}/decline`)
            await fetchFriends()
        } catch (e) {
            alert("Nie udało się wysłać zaproszenia")
        }
    }

    const removeFriend = async (id: string) => {
        try {
            await api.delete(`/friends/${id}`)
            await fetchFriends()
        } catch (e) {
            alert("Nie udało się wysłać zaproszenia")
        }
    }

    const cancelRequest = async (id: string) => {
        try {
            await api.delete(`/friends/request/${id}`)
            await fetchFriends()
        } catch (e) {
            alert("Nie udało się wysłać zaproszenia")
        }
    }

    const getRelationStatus = (username: string) => {
        if (friends.some(f => f.user?.username === username)) return 'FRIEND';
        if (pending.some(p => p.sender?.username === username)) return 'PENDING_RECEIVED';
        if (sent.some(s => s.receiver?.username === username)) return 'PENDING_SENT';
        return 'NONE';
    };

    const filterNewPeople = (users: User[]) => {
        return users.filter(u => getRelationStatus(u.username) === 'NONE');
    };

    useEffect(() => {
        fetchFriends()
    }, [])

    return {
        friends,
        pending,
        sent,
        loading,
        filterNewPeople,
        fetchFriends,
        sendFriendRequestById,
        acceptRequest,
        declineRequest,
        removeFriend,
        cancelRequest,
    }
}