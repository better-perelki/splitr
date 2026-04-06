import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react'
import api, {
  setTokens,
  clearTokens,
  getRefreshToken,
  setLogoutHandler,
} from '../api/client'

export interface UserProfile {
  id: string
  email: string
  phone: string | null
  username: string
  avatarUrl: string | null
  defaultCurrency: string
  timezone: string
  createdAt: string
}

interface AuthState {
  isAuthenticated: boolean
  user: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: UserProfile) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
  }, [])

  useEffect(() => {
    setLogoutHandler(logout)
  }, [logout])

  useEffect(() => {
    const rt = getRefreshToken()
    if (rt) {
      api
        .post<{ accessToken: string; refreshToken: string; user: UserProfile }>('/auth/refresh-token', { refreshToken: rt })
        .then(({ data }) => {
          setTokens(data.accessToken, data.refreshToken)
          setUser(data.user)
        })
        .catch(() => clearTokens())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    setTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
  }, [])

  const signup = useCallback(
    async (username: string, email: string, password: string) => {
      const { data } = await api.post('/auth/register', {
        username,
        email,
        password,
      })
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
    },
    [],
  )

  const value = useMemo(
    () => ({ isAuthenticated: !!user, user, loading, login, signup, logout, setUser }),
    [user, loading, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
