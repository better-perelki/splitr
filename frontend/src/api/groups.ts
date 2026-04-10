import api from './client'

export type GroupType = 'TRIP' | 'APARTMENT' | 'EVENT' | 'OTHER'
export type GroupRole = 'ADMIN' | 'MEMBER'

export interface GroupResponse {
  id: string
  name: string
  icon: string | null
  currency: string
  type: GroupType
  balance: number
}

export interface GroupMemberResponse {
  user: {
    id: string
    email: string
    phone: string | null
    username: string
    avatarUrl: string | null
  }
  role: GroupRole
  joinedAt: string
}

export interface GroupDetailsResponse extends GroupResponse {
  members: GroupMemberResponse[]
}

export interface GroupCreateRequest {
  name: string
  icon?: string
  currency: string
  type: GroupType
}

export interface GroupUpdateRequest {
  name: string
  icon?: string
  currency: string
  type: GroupType
}

import type { AxiosResponse } from 'axios'

export const groupsApi = {
  list: () => api.get<GroupResponse[]>('/groups').then((r: AxiosResponse<GroupResponse[]>) => r.data),
  get: (id: string) => api.get<GroupDetailsResponse>(`/groups/${id}`).then((r: AxiosResponse<GroupDetailsResponse>) => r.data),
  create: (data: GroupCreateRequest) => api.post<GroupResponse>('/groups', data).then((r: AxiosResponse<GroupResponse>) => r.data),
  update: (id: string, data: GroupUpdateRequest) =>
    api.put<GroupResponse>(`/groups/${id}`, data).then((r: AxiosResponse<GroupResponse>) => r.data),
  addMember: (groupId: string, userId: string) =>
    api.post(`/groups/${groupId}/members`, { userId }),
  removeMember: (groupId: string, userId: string) =>
    api.delete(`/groups/${groupId}/members/${userId}`),
}
