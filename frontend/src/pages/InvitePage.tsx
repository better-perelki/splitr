import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/client'
import Icon from '../components/Icon'
import type { UserSummary } from '../api/models/UserSummary'

export default function InvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [userId] = useState<string | null>(() => {
    const fromUrl = searchParams.get('userId')
    if (fromUrl) return fromUrl

    const stored = sessionStorage.getItem('pendingFriendId')
    if (stored) {
      sessionStorage.removeItem('pendingFriendId')
      return stored
    }

    return null
  })

  const [status, setStatus] = useState<'loading' | 'success' | 'already_friends' | 'error'>('loading')
  const [targetUser, setTargetUser] = useState<UserSummary | null>(null)
  const hasExecuted = useRef(false)

  useEffect(() => {
    if (authLoading || !userId || hasExecuted.current) return

    if (!isAuthenticated) {
      sessionStorage.setItem('pendingFriendId', userId)
      navigate('/login', { replace: true })
      return
    }

    hasExecuted.current = true

    Promise.all([
      api.post(`/friends/auto-connect/${userId}`),
      api.get(`/users/summary/${userId}`)
    ])
        .then(([connectRes, userRes]) => {
          setTargetUser(userRes.data)
          if (connectRes.data === 'ALREADY_FRIENDS') {
            setStatus('already_friends')
          } else {
            setStatus('success')
          }
        })
        .catch((err) => {
          console.error(err)
          setStatus('error')
        })

  }, [isAuthenticated, authLoading, userId, navigate])

  useEffect(() => {
    if (status !== 'loading') {
      const timer = setTimeout(() => {
        navigate('/friends', { replace: true })
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [status, navigate])

  if (!userId) {
    return <Navigate to="/" replace />
  }

  return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-surface">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] emerald-glow opacity-20 pointer-events-none" />

        <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-white/5 relative flex flex-col items-center text-center">

          {status === 'loading' && (
              <>
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6" />
                <h1 className="font-headline text-xl font-bold tracking-tight mb-2">
                  Connecting...
                </h1>
                <p className="text-on-surface-variant text-sm">
                  Setting up your friendship.
                </p>
              </>
          )}

          {status !== 'loading' && status !== 'error' && targetUser && (
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 overflow-hidden bg-surface-container-high mb-3 flex items-center justify-center">
                {targetUser.avatarUrl ? (
                  <img src={targetUser.avatarUrl} alt={targetUser.username} className="w-full h-full object-cover" />
                ) : (
                  <Icon name="person" className="text-4xl text-on-surface-variant" />
                )}
              </div>
            </div>
          )}

          {status === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 text-primary">
                  <Icon name="check_circle" className="text-4xl" />
                </div>
                <h1 className="font-headline text-2xl font-bold tracking-tight mb-2">
                  You're now friends 🎉
                </h1>
                <p className="text-on-surface-variant text-sm mb-8">
                  You are now connected with <strong className="text-on-surface">{targetUser?.username}</strong>!
                </p>
                <Link to="/friends" className="w-full py-3.5 bg-primary text-on-primary-fixed font-bold rounded-xl text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all block">
                  Go to Friends
                </Link>
              </>
          )}

          {status === 'already_friends' && (
              <>
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-6 text-secondary">
                  <Icon name="people" className="text-4xl" />
                </div>
                <h1 className="font-headline text-2xl font-bold tracking-tight mb-2">
                  Already friends
                </h1>
                <p className="text-on-surface-variant text-sm mb-8">
                  You are already connected with <strong className="text-on-surface">{targetUser?.username}</strong>.
                </p>
                <Link to="/friends" className="w-full py-3.5 bg-primary text-on-primary-fixed font-bold rounded-xl text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all block">
                  View Friends
                </Link>
              </>
          )}

          {status === 'error' && (
              <>
                <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-6 text-error">
                  <Icon name="error" className="text-4xl" />
                </div>
                <h1 className="font-headline text-2xl font-bold tracking-tight mb-2">
                  Something went wrong
                </h1>
                <p className="text-on-surface-variant text-sm mb-8">
                  We couldn't process this invitation. Please try again.
                </p>
                <Link to="/" className="w-full py-3.5 bg-surface-container-high text-on-surface font-bold rounded-xl border border-outline-variant text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all block">
                  Go to Dashboard
                </Link>
              </>
          )}

        </div>
      </div>
  )
}