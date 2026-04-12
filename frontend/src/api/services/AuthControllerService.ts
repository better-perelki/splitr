/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponse } from '../models/AuthResponse';
import type { LoginRequest } from '../models/LoginRequest';
import type { RefreshRequest } from '../models/RefreshRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthControllerService {
    /**
     * @returns AuthResponse Created
     * @throws ApiError
     */
    public static register({
        requestBody,
    }: {
        requestBody: RegisterRequest,
    }): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns AuthResponse OK
     * @throws ApiError
     */
    public static refreshToken({
        requestBody,
    }: {
        requestBody: RefreshRequest,
    }): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/refresh-token',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns AuthResponse OK
     * @throws ApiError
     */
    public static login({
        requestBody,
    }: {
        requestBody: LoginRequest,
    }): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
