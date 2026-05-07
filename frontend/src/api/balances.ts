import api from './client'
import type { AxiosResponse } from 'axios'
import type { UserSummary } from './expenses'

export interface MemberBalance {
    user: UserSummary
    balance: number
}

export interface BalanceEntry {
    from: UserSummary
    to: UserSummary
    amount: number
}

export interface GroupBalanceResponse {
    groupId: string
    memberBalances: MemberBalance[]
    simplifiedDebts: BalanceEntry[]
}

export interface SettlementCreateRequest {
    payeeId: string
    amount: number
    currency?: string
    method?: string | null
    notes?: string | null
}

export interface SettlementResponse {
    id: string
    groupId: string
    payer: UserSummary
    payee: UserSummary
    amount: number
    currency: string
    method: string | null
    notes: string | null
    settledAt: string
}

export const balancesApi = {
    get: (groupId: string) =>
        api.get<GroupBalanceResponse>(`/groups/${groupId}/balances`)
            .then((r: AxiosResponse<GroupBalanceResponse>) => r.data),
}

export const settlementsApi = {
    list: (groupId: string) =>
        api.get<SettlementResponse[]>(`/groups/${groupId}/settlements`)
            .then((r: AxiosResponse<SettlementResponse[]>) => r.data),

    create: (groupId: string, data: SettlementCreateRequest) =>
        api.post<SettlementResponse>(`/groups/${groupId}/settlements`, data)
            .then((r: AxiosResponse<SettlementResponse>) => r.data),
}
