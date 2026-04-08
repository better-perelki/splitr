import api from '../client'

export type User = {
    id: string
    username: string
    email: string
    avatarUrl?: string
}

let cachedUsers: User[] = []

export async function fetchAllUsers(): Promise<User[]> {
    if (cachedUsers.length > 0) return cachedUsers

    try {
        const res = await api.get<User[]>('/users/all')
        cachedUsers = res.data
        return cachedUsers
    } catch (err) {
        console.error('Failed to fetch users', err)
        throw err
    }
}

export async function searchUsers(query: string): Promise<User[]> {
    if (query.length < 3) return []

    const users = await fetchAllUsers()
    const lowerQuery = query.toLowerCase()
    return users.filter((u) => u.username.toLowerCase().includes(lowerQuery))
}


export function clearUsersCache() {
    cachedUsers = []
}