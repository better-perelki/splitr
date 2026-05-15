import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationData,
} from '../api/notifications'

const NOTIFICATION_ICONS: Record<string, string> = {
  EXPENSE_ADDED: 'receipt_long',
  SETTLEMENT_RECEIVED: 'payments',
  FRIEND_REQUEST: 'person_add',
  GROUP_ADDED: 'group_add',
}

const NOTIFICATION_COLORS: Record<string, string> = {
  EXPENSE_ADDED: 'text-blue-400',
  SETTLEMENT_RECEIVED: 'text-emerald-400',
  FRIEND_REQUEST: 'text-purple-400',
  GROUP_ADDED: 'text-amber-400',
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateString).toLocaleDateString()
}

export default function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const pollUnread = useCallback(async () => {
    try {
      const count = await fetchUnreadCount()
      setUnreadCount(count)
    } catch {
    }
  }, [])

  useEffect(() => {
    pollUnread()
    const interval = setInterval(pollUnread, 30_000)
    return () => clearInterval(interval)
  }, [pollUnread])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    fetchNotifications(0, 30)
      .then((page) => {
        if (!cancelled) setNotifications(page.content)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleClick = async (n: NotificationData) => {
    if (!n.read) {
      try {
        await markNotificationRead(n.id)
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
        )
        setUnreadCount((c) => Math.max(0, c - 1))
      } catch {
      }
    }
    if (n.link) {
      navigate(n.link)
      setOpen(false)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((x) => ({ ...x, read: true })))
      setUnreadCount(0)
    } catch {
    }
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        id="notification-bell"
        onClick={() => setOpen((p) => !p)}
        className="relative text-slate-400 hover:text-slate-100 transition-colors duration-200 p-1"
      >
        <Icon name="notifications" className={unreadCount > 0 ? 'text-emerald-400' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-slate-950 animate-notifBadge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notification-panel"
          className="absolute right-0 top-full mt-3 w-[400px] max-h-[520px] flex flex-col rounded-2xl border border-emerald-500/10 bg-slate-900/95 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_30px_-10px_rgba(66,229,176,0.08)] animate-notifSlide z-[100] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-tight font-headline">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-slate-500">
                <Icon name="notifications_off" className="text-3xl mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.map((n, i) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-all duration-150 hover:bg-slate-800/50 group ${
                      !n.read ? 'bg-emerald-500/[0.03]' : ''
                    } ${i < notifications.length - 1 ? 'border-b border-slate-800/30' : ''}`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div
                      className={`flex-shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center ${
                        !n.read ? 'bg-slate-800/80' : 'bg-slate-800/40'
                      }`}
                    >
                      <Icon
                        name={NOTIFICATION_ICONS[n.type] || 'notifications'}
                        className={`text-lg ${NOTIFICATION_COLORS[n.type] || 'text-slate-400'}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          !n.read ? 'text-slate-100 font-medium' : 'text-slate-400'
                        }`}
                      >
                        {n.message}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>

                    {!n.read && (
                      <span className="flex-shrink-0 mt-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(66,229,176,0.5)]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
