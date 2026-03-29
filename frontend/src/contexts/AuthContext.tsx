import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'

interface AuthState {
  isAuthenticated: boolean
  user: { email: string; name: string } | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(() => {
    const stored = localStorage.getItem('splitr_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (email: string, _password: string) => {
    const u = { email, name: email.split('@')[0] }
    localStorage.setItem('splitr_user', JSON.stringify(u))
    setUser(u)
  }, [])

  const signup = useCallback(
    async (name: string, email: string, _password: string) => {
      const u = { email, name }
      localStorage.setItem('splitr_user', JSON.stringify(u))
      setUser(u)
    },
    [],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('splitr_user')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated: !!user, user, login, signup, logout }),
    [user, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
