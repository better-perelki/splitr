import axios, {
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
    type AxiosError,
    AxiosHeaders,
} from 'axios'
import { OpenAPI } from './core/OpenAPI'

const TOKEN_KEY = 'splitr_access_token'
const REFRESH_KEY = 'splitr_refresh_token'

let accessToken: string | null = localStorage.getItem(TOKEN_KEY)
let refreshToken: string | null = localStorage.getItem(REFRESH_KEY)

// Sync OpenAPI token on initial load so generated services are authenticated
OpenAPI.TOKEN = accessToken ?? undefined
let onLogout: (() => void) | null = null

export function setTokens(access: string, refresh: string) {
    accessToken = access
    refreshToken = refresh
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
    OpenAPI.TOKEN = access
}

export function getAccessToken() {
    return accessToken
}

export function getRefreshToken() {
    return refreshToken
}

export function clearTokens() {
    accessToken = null
    refreshToken = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    OpenAPI.TOKEN = undefined
}

export function setLogoutHandler(handler: () => void) {
    onLogout = handler
}

const api = axios.create({
    baseURL: '/api',
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (!config.headers) {
        config.headers = new AxiosHeaders()
    }

    if (accessToken) {
        config.headers.set('Authorization', `Bearer ${accessToken}`)
    }

    return config
})

let isRefreshing = false

let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (token) resolve(token)
        else reject(error)
    })
    failedQueue = []
}

api.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (error: AxiosError) => {
        const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined

        if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error)
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token: string) => {
                        if (!originalRequest.headers) {
                            originalRequest.headers = new AxiosHeaders()
                        }

                        if (originalRequest.headers instanceof AxiosHeaders) {
                            originalRequest.headers.set('Authorization', `Bearer ${token}`)
                        } else {
                            originalRequest.headers['Authorization'] = `Bearer ${token}`
                        }

                        resolve(api(originalRequest))
                    },
                    reject,
                })
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            if (!refreshToken) throw new Error('No refresh token')

            const { data } = await axios.post('/api/auth/refresh-token', {
                refreshToken,
            })

            setTokens(data.accessToken, data.refreshToken)

            processQueue(null, data.accessToken)

            if (!originalRequest.headers) {
                originalRequest.headers = new AxiosHeaders()
            }

            if (originalRequest.headers instanceof AxiosHeaders) {
                originalRequest.headers.set('Authorization', `Bearer ${data.accessToken}`)
            } else {
                originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`
            }

            return api(originalRequest)
        } catch (err) {
            processQueue(err, null)
            clearTokens()
            onLogout?.()
            return Promise.reject(err)
        } finally {
            isRefreshing = false
        }
    }
)

export default api