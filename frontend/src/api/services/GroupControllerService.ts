/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddMemberRequest } from '../models/AddMemberRequest';
import type { GroupCreateRequest } from '../models/GroupCreateRequest';
import type { GroupDetailsResponse } from '../models/GroupDetailsResponse';
import type { GroupResponse } from '../models/GroupResponse';
import type { GroupUpdateRequest } from '../models/GroupUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GroupControllerService {
    /**
     * @returns GroupDetailsResponse OK
     * @throws ApiError
     */
    public static getGroupDetails({
        id,
    }: {
        id: string,
    }): CancelablePromise<GroupDetailsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/groups/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns GroupResponse OK
     * @throws ApiError
     */
    public static updateGroup({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: GroupUpdateRequest,
    }): CancelablePromise<GroupResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/groups/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static deleteGroup({
        id,
    }: {
        id: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/groups/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns GroupResponse OK
     * @throws ApiError
     */
    public static getUserGroups(): CancelablePromise<Array<GroupResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/groups',
        });
    }
    /**
     * @returns GroupResponse Created
     * @throws ApiError
     */
    public static createGroup({
        requestBody,
    }: {
        requestBody: GroupCreateRequest,
    }): CancelablePromise<GroupResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/groups',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static transferAdminRole({
        id,
        newAdminId,
    }: {
        id: string,
        newAdminId: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/groups/{id}/transfer-admin/{newAdminId}',
            path: {
                'id': id,
                'newAdminId': newAdminId,
            },
        });
    }
    /**
     * @returns any Created
     * @throws ApiError
     */
    public static addMember({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: AddMemberRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/groups/{id}/members',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static leaveGroup({
        id,
    }: {
        id: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/groups/{id}/leave',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static removeMember({
        id,
        userId,
    }: {
        id: string,
        userId: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/groups/{id}/members/{userId}',
            path: {
                'id': id,
                'userId': userId,
            },
        });
    }
}
