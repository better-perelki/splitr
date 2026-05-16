import api from './client'
import type { AxiosResponse } from 'axios'
import type { UserSummary } from './expenses'

export interface CategoryStat {
    category: string
    amount: number
    percentage: number
}

export interface MonthStat {
    yearMonth: string
    amount: number
}

export interface MemberSpending {
    user: UserSummary
    amount: number
    percentage: number
}

export interface GroupAnalyticsResponse {
    totalSpent: number
    categoryBreakdown: CategoryStat[]
    monthlyTrend: MonthStat[]
    memberRanking: MemberSpending[]
}

export interface GlobalAnalyticsResponse {
    totalSpent: number
    youOwe: number
    owedToYou: number
    settlementsCount: number
    categoryBreakdown: CategoryStat[]
    monthlyTrend: MonthStat[]
    memberRanking: MemberSpending[]
}

export const analyticsApi = {
    get: (groupId: string, from: string, to: string) =>
        api
            .get<GroupAnalyticsResponse>(`/groups/${groupId}/analytics`, {
                params: { from, to },
            })
            .then((r: AxiosResponse<GroupAnalyticsResponse>) => r.data),

    getGlobal: (from: string, to: string) =>
        api
            .get<GlobalAnalyticsResponse>('/analytics', {
                params: { from, to },
            })
            .then((r: AxiosResponse<GlobalAnalyticsResponse>) => r.data),
}

