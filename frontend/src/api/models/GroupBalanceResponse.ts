/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BalanceEntry } from './BalanceEntry';
import type { MemberBalance } from './MemberBalance';
export type GroupBalanceResponse = {
    groupId?: string;
    memberBalances?: Array<MemberBalance>;
    simplifiedDebts?: Array<BalanceEntry>;
};

