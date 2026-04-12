/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HealthControllerService {
    /**
     * @returns string OK
     * @throws ApiError
     */
    public static health(): CancelablePromise<Record<string, string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/health',
        });
    }
}
