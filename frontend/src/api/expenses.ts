import api from './client'
import type { AxiosResponse } from 'axios'
import { ExpenseControllerService } from './services/ExpenseControllerService'
import type { ExpenseCreateRequest } from './models/ExpenseCreateRequest'
import type { ExpenseUpdateRequest } from './models/ExpenseUpdateRequest'

export type { ExpenseCreateRequest, ExpenseUpdateRequest }
export type { PayerInput } from './models/PayerInput'
export type { SplitInput } from './models/SplitInput'

export type ExpenseCategory =
    | 'FOOD' | 'TRANSPORT' | 'ACCOMMODATION' | 'ENTERTAINMENT' | 'SHOPPING' | 'UTILITIES' | 'OTHER'

export type SplitType = 'EQUAL' | 'PERCENTAGE' | 'EXACT' | 'SHARES' | 'ADJUSTMENT'

export interface UserSummary {
    id: string
    username: string
    email?: string
    avatarUrl?: string | null
}

export interface ExpensePayerResponse {
    user: UserSummary
    amount: number
}

export interface ExpenseSplitResponse {
    user: UserSummary
    amount: number
    share?: number | null
    percentage?: number | null
    adjustment?: number | null
}

export interface ExpenseResponse {
    id: string
    groupId: string
    description: string
    amount: number
    currency: string
    category: ExpenseCategory
    expenseDate: string
    splitType: SplitType
    receiptUrl?: string | null
    notes?: string | null
    createdBy: UserSummary
    createdAt: string
    updatedAt: string
    payers: ExpensePayerResponse[]
    splits: ExpenseSplitResponse[]
}

export interface PagedExpenseResponse {
    items: ExpenseResponse[]
    page: number
    size: number
    total: number
}

export const expensesApi = {
    list: (groupId: string, page = 0, size = 20) =>
        ExpenseControllerService.list({ groupId, page, size }) as unknown as Promise<PagedExpenseResponse>,

    create: (groupId: string, requestBody: ExpenseCreateRequest) =>
        ExpenseControllerService.create({ groupId, requestBody }) as unknown as Promise<ExpenseResponse>,

    get: (id: string) =>
        ExpenseControllerService.get({ id }) as unknown as Promise<ExpenseResponse>,

    update: (id: string, requestBody: ExpenseUpdateRequest) =>
        ExpenseControllerService.update({ id, requestBody }) as unknown as Promise<ExpenseResponse>,

    remove: (id: string) => ExpenseControllerService.delete({ id }),

    uploadReceipt: (id: string, file: File) => {
        const fd = new FormData()
        fd.append('file', file)
        return api
            .post<ExpenseResponse>(`/expenses/${id}/attachments`, fd)
            .then((r: AxiosResponse<ExpenseResponse>) => r.data)
    },
}
