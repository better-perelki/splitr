/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserSearchResponse } from './UserSearchResponse';
export type GroupMemberResponse = {
    user?: UserSearchResponse;
    role?: 'ADMIN' | 'MEMBER';
    joinedAt?: string;
};

