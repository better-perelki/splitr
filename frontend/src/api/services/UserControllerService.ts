/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateProfileRequest } from '../models/UpdateProfileRequest';
import type { UserProfileResponse } from '../models/UserProfileResponse';
import type { UserSearchResponse } from '../models/UserSearchResponse';
import type { UserSummary } from '../models/UserSummary';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserControllerService {
    /**
     * @returns UserProfileResponse OK
     * @throws ApiError
     */
    public static getProfile(): CancelablePromise<UserProfileResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/me',
        });
    }
    /**
     * @returns UserProfileResponse OK
     * @throws ApiError
     */
    public static updateProfile({
        requestBody,
    }: {
        requestBody: UpdateProfileRequest,
    }): CancelablePromise<UserProfileResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/users/me',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns UserProfileResponse OK
     * @throws ApiError
     */
    public static uploadAvatar({
        requestBody,
    }: {
        requestBody?: {
            file: Blob;
        },
    }): CancelablePromise<UserProfileResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/me/avatar',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns UserSummary OK
     * @throws ApiError
     */
    public static getUserSummary({
        id,
    }: {
        id: string,
    }): CancelablePromise<UserSummary> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/summary/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns UserSearchResponse OK
     * @throws ApiError
     */
    public static search({
        q,
        page,
        size = 20,
    }: {
        q: string,
        page?: number,
        size?: number,
    }): CancelablePromise<Array<UserSearchResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/search',
            query: {
                'q': q,
                'page': page,
                'size': size,
            },
        });
    }
    /**
     * @returns UserSummary OK
     * @throws ApiError
     */
    public static getAllUsers({
        page,
        size = 20,
    }: {
        page?: number,
        size?: number,
    }): CancelablePromise<Array<UserSummary>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/all',
            query: {
                'page': page,
                'size': size,
            },
        });
    }
}
