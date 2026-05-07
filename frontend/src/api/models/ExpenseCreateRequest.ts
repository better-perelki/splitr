/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PayerInput } from './PayerInput';
import type { SplitInput } from './SplitInput';
export type ExpenseCreateRequest = {
    amount: number;
    currency?: string;
    description?: string;
    expenseDate: string;
    category: 'FOOD' | 'TRANSPORT' | 'ACCOMMODATION' | 'ENTERTAINMENT' | 'SHOPPING' | 'UTILITIES' | 'OTHER';
    splitType: 'EQUAL' | 'PERCENTAGE' | 'EXACT' | 'SHARES' | 'ADJUSTMENT';
    payers?: Array<PayerInput>;
    splits?: Array<SplitInput>;
    notes?: string;
};

