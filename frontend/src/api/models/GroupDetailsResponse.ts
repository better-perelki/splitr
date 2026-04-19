/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GroupMemberResponse } from './GroupMemberResponse';
export type GroupDetailsResponse = {
    id?: string;
    name?: string;
    icon?: string;
    currency?: string;
    type?: 'TRIP' | 'APARTMENT' | 'EVENT' | 'OTHER';
    balance?: number;
    members?: Array<GroupMemberResponse>;
};

