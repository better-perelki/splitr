/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserSummary } from './UserSummary';
export type FriendRequestDetails = {
    id?: string;
    sender?: UserSummary;
    receiver?: UserSummary;
    status?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    createdAt?: string;
};

