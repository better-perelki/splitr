import api from '../client'

export type User = {
    id: string
    username: string
    email: string
    avatarUrl?: string
}

export async function searchUsers(query: string): Promise<User[]> {
    if (query.length < 3) return []
    const res = await api.get<User[]>('/users/search', { params: { q: query } })
    return res.data
}