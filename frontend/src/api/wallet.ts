import api from './client'
import type { UserSummary } from './models/UserSummary'

export interface WalletDebt {
    groupId: string
    groupName: string
    currency: string
    counterparty: UserSummary
    amount: number
    type: 'owe' | 'owed'
}

export interface WalletGroupBalance {
    groupId: string
    balance: number
}

export interface WalletSummary {
    totalOwed: number
    totalOwe: number
    debts: WalletDebt[]
    groupBalances: WalletGroupBalance[]
}

export async function fetchWalletSummary(): Promise<WalletSummary> {
    const { data } = await api.get<WalletSummary>('/users/me/wallet-summary')
    return data
}
