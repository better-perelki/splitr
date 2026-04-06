import { useState, useEffect, useRef } from 'react'
import { useAuth, type UserProfile } from '../contexts/AuthContext'
import api from '../api/client'
import Icon from '../components/Icon'
import axios from 'axios'

const currencies = [
  { value: 'USD', label: 'USD - US Dollar ($)' },
  { value: 'EUR', label: 'EUR - Euro (\u20ac)' },
  { value: 'GBP', label: 'GBP - British Pound (\u00a3)' },
  { value: 'PLN', label: 'PLN - Polish Zloty (z\u0142)' },
]

const timezones = [
  { value: 'America/Los_Angeles', label: 'Pacific Standard Time (UTC-8)' },
  { value: 'America/New_York', label: 'Eastern Standard Time (UTC-5)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (UTC+0)' },
  { value: 'Europe/Warsaw', label: 'Central European Time (UTC+1)' },
]

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    defaultCurrency: 'PLN',
    timezone: 'Europe/Warsaw',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username,
        email: user.email,
        phone: user.phone ?? '',
        defaultCurrency: user.defaultCurrency,
        timezone: user.timezone,
      })
    }
  }, [user])

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const { data } = await api.put<UserProfile>('/users/me', {
        username: form.username,
        phone: form.phone || null,
        defaultCurrency: form.defaultCurrency,
        timezone: form.timezone,
      })
      setUser(data)
      setMessage({ type: 'success', text: 'Profile updated!' })
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setMessage({ type: 'error', text: err.response.data.error })
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile.' })
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await api.post<UserProfile>('/users/me/avatar', formData)
      setUser(data)
    } catch {
      setMessage({ type: 'error', text: 'Failed to upload avatar.' })
    }
  }

  const initials = user?.username?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="p-12 max-w-6xl mx-auto">
      {message && (
        <div className={`mb-6 p-3 rounded-xl text-sm text-center ${
          message.type === 'success'
            ? 'bg-primary/10 border border-primary/20 text-primary'
            : 'bg-error/10 border border-error/20 text-error'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Avatar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-48 h-48 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 group-hover:rotate-45 transition-transform duration-700" />
              <div
                className="m-2 w-44 h-44 rounded-full bg-surface-variant overflow-hidden relative flex items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-headline font-bold text-on-surface-variant">
                    {initials}
                  </span>
                )}
                <div className="absolute inset-0 bg-surface/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Icon name="upload" className="text-primary text-3xl mb-1" />
                  <span className="text-[10px] font-headline uppercase tracking-widest text-primary">
                    Update Photo
                  </span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
              {user?.username ?? ''}
            </h2>
            <p className="text-on-surface-variant text-sm font-body">
              @{user?.username ?? ''}
            </p>
            <div className="mt-8 pt-8 border-t border-outline-variant/10 w-full grid grid-cols-2 gap-4">
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 font-headline">
                  Member Since
                </p>
                <p className="text-on-surface font-headline font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : ''}
                </p>
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 font-headline">
                  Status
                </p>
                <div className="flex items-center gap-1.5 text-primary font-headline font-medium">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#42e5b0]" />
                  Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-8 space-y-8">
          <section className="glass-panel p-10 rounded-3xl">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-8 tracking-tight">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-headline ml-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant">@</span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-5 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all font-body text-on-surface"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-headline ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 font-body text-on-surface-variant opacity-60 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-headline ml-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all font-body text-on-surface"
                  placeholder="+48 123 456 789"
                />
              </div>
            </div>
          </section>

          <section className="glass-panel p-10 rounded-3xl">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-8 tracking-tight">
              Financial & Regional Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-headline ml-1">
                  Default Currency
                </label>
                <select
                  value={form.defaultCurrency}
                  onChange={(e) => setForm((f) => ({ ...f, defaultCurrency: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all font-body text-on-surface appearance-none"
                >
                  {currencies.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-headline ml-1">
                  Timezone
                </label>
                <select
                  value={form.timezone}
                  onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all font-body text-on-surface appearance-none"
                >
                  {timezones.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-4 pt-4 pb-12">
            <button
              onClick={() => {
                if (user) setForm({
                  username: user.username,
                  email: user.email,
                  phone: user.phone ?? '',
                  defaultCurrency: user.defaultCurrency,
                  timezone: user.timezone,
                })
                setMessage(null)
              }}
              className="px-8 py-3 bg-surface-container-highest text-on-surface font-headline font-bold text-sm tracking-tight rounded-xl border border-primary/10 hover:bg-surface-variant transition-all"
            >
              Cancel Changes
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-primary-container text-on-primary-container font-headline font-bold text-sm tracking-tight rounded-xl hover:brightness-110 shadow-lg shadow-primary/10 transition-all disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
