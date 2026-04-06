import axios, { type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

let accessToken: string | null = null
let refreshToken: string | null = null
let onLogout: (() => void) | null = null

export function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
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
}

export function setLogoutHandler(handler: () => void) {
  onLogout = handler
}

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
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
  async (error: { config: AxiosRequestConfig & { _retry?: boolean }; response?: { status: number } }) => {
    const originalRequest = error.config
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
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
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return api(originalRequest)
    } catch (err) {
      processQueue(err, null)
      clearTokens()
      onLogout?.()
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
