/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateProfileRequest } from '../models/UpdateProfileRequest';
import type { UserProfileResponse } from '../models/UserProfileResponse';
import type { UserSearchResponse } from '../models/UserSearchResponse';
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
     * @returns UserSearchResponse OK
     * @throws ApiError
     */
    public static search({
        q,
    }: {
        q: string,
    }): CancelablePromise<Array<UserSearchResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/search',
            query: {
                'q': q,
            },
        });
    }
}
