import api from './client'

export interface NotificationData {
  id: string
  type: 'EXPENSE_ADDED' | 'SETTLEMENT_RECEIVED' | 'FRIEND_REQUEST' | 'GROUP_ADDED'
  title: string
  message: string
  link: string | null
  actorUsername: string | null
  actorAvatarUrl: string | null
  read: boolean
  createdAt: string
}

export interface NotificationPage {
  content: NotificationData[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export async function fetchNotifications(page = 0, size = 20): Promise<NotificationPage> {
  const { data } = await api.get('/notifications', { params: { page, size } })
  return data
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>('/notifications/unread-count')
  return data.count
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.put(`/notifications/${id}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.put('/notifications/read-all')
}
