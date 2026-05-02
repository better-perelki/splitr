/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExpenseCreateRequest } from '../models/ExpenseCreateRequest';
import type { ExpenseResponse } from '../models/ExpenseResponse';
import type { ExpenseUpdateRequest } from '../models/ExpenseUpdateRequest';
import type { PagedExpenseResponse } from '../models/PagedExpenseResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExpenseControllerService {
    /**
     * @returns ExpenseResponse OK
     * @throws ApiError
     */
    public static get({
        id,
    }: {
        id: string,
    }): CancelablePromise<ExpenseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/expenses/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ExpenseResponse OK
     * @throws ApiError
     */
    public static update({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: ExpenseUpdateRequest,
    }): CancelablePromise<ExpenseResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/expenses/{id}',
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
    public static delete({
        id,
    }: {
        id: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/expenses/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns PagedExpenseResponse OK
     * @throws ApiError
     */
    public static list({
        groupId,
        page,
        size = 20,
    }: {
        groupId: string,
        page?: number,
        size?: number,
    }): CancelablePromise<PagedExpenseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/groups/{groupId}/expenses',
            path: {
                'groupId': groupId,
            },
            query: {
                'page': page,
                'size': size,
            },
        });
    }
    /**
     * @returns ExpenseResponse Created
     * @throws ApiError
     */
    public static create({
        groupId,
        requestBody,
    }: {
        groupId: string,
        requestBody: ExpenseCreateRequest,
    }): CancelablePromise<ExpenseResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/groups/{groupId}/expenses',
            path: {
                'groupId': groupId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ExpenseResponse OK
     * @throws ApiError
     */
    public static uploadReceipt({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: {
            file: Blob;
        },
    }): CancelablePromise<ExpenseResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/expenses/{id}/attachments',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
