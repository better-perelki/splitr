/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExpensePayerResponse } from './ExpensePayerResponse';
import type { ExpenseSplitResponse } from './ExpenseSplitResponse';
import type { UserSummary } from './UserSummary';
export type ExpenseResponse = {
    id?: string;
    groupId?: string;
    description?: string;
    amount?: number;
    currency?: string;
    category?: 'FOOD' | 'TRANSPORT' | 'ACCOMMODATION' | 'ENTERTAINMENT' | 'SHOPPING' | 'UTILITIES' | 'OTHER';
    expenseDate?: string;
    splitType?: 'EQUAL' | 'PERCENTAGE' | 'EXACT' | 'SHARES' | 'ADJUSTMENT';
    receiptUrl?: string;
    notes?: string;
    createdBy?: UserSummary;
    createdAt?: string;
    updatedAt?: string;
    payers?: Array<ExpensePayerResponse>;
    splits?: Array<ExpenseSplitResponse>;
};

