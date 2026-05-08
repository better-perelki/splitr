/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserSummary } from './UserSummary';
export type SettlementResponse = {
    id?: string;
    groupId?: string;
    payer?: UserSummary;
    payee?: UserSummary;
    amount?: number;
    currency?: string;
    method?: string;
    notes?: string;
    settledAt?: string;
};

