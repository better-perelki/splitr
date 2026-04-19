/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FriendRequestDetails } from '../models/FriendRequestDetails';
import type { Friendship } from '../models/Friendship';
import type { SendFriendRequest } from '../models/SendFriendRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FriendsService {
    /**
     * Send a friend request
     * @returns any OK
     * @throws ApiError
     */
    public static sendRequest({
        requestBody,
    }: {
        requestBody: SendFriendRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/friends/request',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Decline a friend request
     * @returns any OK
     * @throws ApiError
     */
    public static declineRequest({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/friends/request/{id}/decline',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Accept a friend request
     * @returns any OK
     * @throws ApiError
     */
    public static acceptRequest({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/friends/request/{id}/accept',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Send a friend request using username
     * @returns any OK
     * @throws ApiError
     */
    public static sendByUsername({
        username,
    }: {
        username: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/friends/request/by-username',
            query: {
                'username': username,
            },
        });
    }
    /**
     * @returns string OK
     * @throws ApiError
     */
    public static autoConnect({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<'SUCCESS' | 'ALREADY_FRIENDS'> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/friends/auto-connect/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * Get friends list with balances
     * @returns Friendship OK
     * @throws ApiError
     */
    public static getFriends(): CancelablePromise<Array<Friendship>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/friends',
        });
    }
    /**
     * Get sent friend requests
     * @returns FriendRequestDetails OK
     * @throws ApiError
     */
    public static getSent(): CancelablePromise<Array<FriendRequestDetails>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/friends/sent',
        });
    }
    /**
     * Get incoming friend requests
     * @returns FriendRequestDetails OK
     * @throws ApiError
     */
    public static getPending(): CancelablePromise<Array<FriendRequestDetails>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/friends/pending',
        });
    }
    /**
     * Remove a friend
     * @returns any OK
     * @throws ApiError
     */
    public static removeFriend({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/friends/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Cancel sent friend request
     * @returns any OK
     * @throws ApiError
     */
    public static cancelRequest({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/friends/request/{id}',
            path: {
                'id': id,
            },
        });
    }
}
