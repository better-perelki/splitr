import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import GroupModal from '../components/GroupModal'
import { groupsApi, type GroupResponse, type GroupCreateRequest, type GroupType } from '../api/groups'

const TYPE_ICONS: Record<string, string> = {
  TRIP: 'landscape',
  APARTMENT: 'home',
  EVENT: 'celebration',
  OTHER: 'category',
}

const TYPE_LABELS: Record<GroupType, string> = {
  TRIP: 'Trip',
  APARTMENT: 'Apartment',
  EVENT: 'Event',
  OTHER: 'Other',
}

const MOCK_GROUPS: GroupResponse[] = [
  { id: '1', name: 'Tatry 2025', icon: '🏔️', currency: 'PLN', type: 'TRIP', balance: 45 },
  { id: '2', name: 'Współlokatorzy', icon: '🏠', currency: 'PLN', type: 'APARTMENT', balance: -320 },
  { id: '3', name: 'Ślub Kaśki', icon: '🎉', currency: 'PLN', type: 'EVENT', balance: 0 },
]

export default function GroupsPage() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<GroupResponse[]>(MOCK_GROUPS)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<GroupType | 'ALL'>('ALL')

  useEffect(() => {
    groupsApi.list()
      .then(data => setGroups(data))
      .catch(() => { /* keep mock data */ })
  }, [])

  const handleCreateGroup = async (data: GroupCreateRequest) => {
    try {
      const newGroup = await groupsApi.create(data)
      setGroups(prev => [...prev, newGroup])
    } catch {
      setGroups(prev => [...prev, {
        id: crypto.randomUUID(),
        name: data.name,
        icon: data.icon ?? null,
        currency: data.currency,
        type: data.type,
        balance: 0,
      }])
    }
  }

  const filtered = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'ALL' || g.type === filterType
    return matchesSearch && matchesType
  })

  const totalOwed = groups.reduce((sum, g) => sum + (g.balance > 0 ? g.balance : 0), 0)
  const totalOwe = groups.reduce((sum, g) => sum + (g.balance < 0 ? Math.abs(g.balance) : 0), 0)

  return (
    <div className="p-12 min-h-screen relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] emerald-glow -z-10 opacity-40" />
      <div className="fixed bottom-0 left-64 w-[400px] h-[400px] emerald-glow -z-10 opacity-20" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-2">
            Your Groups
          </h2>
          <p className="text-on-surface-variant font-body">
            Manage and view all your shared expense groups.
          </p>
        </div>
        <button
          onClick={() => setShowGroupModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary-container rounded-xl font-headline font-bold text-sm tracking-tight hover:brightness-110 active:scale-95 transition-all"
        >
          <Icon name="add" />
          New Group
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon name="groups" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Total Groups</p>
            <p className="text-2xl font-headline font-bold text-on-surface">{groups.length}</p>
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon name="trending_up" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">You're Owed</p>
            <p className="text-2xl font-headline font-bold text-primary">+{totalOwed.toFixed(2)}</p>
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error">
            <Icon name="trending_down" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">You Owe</p>
            <p className="text-2xl font-headline font-bold text-error">-{totalOwe.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg" />
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-white/5 rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'TRIP', 'APARTMENT', 'EVENT', 'OTHER'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filterType === t
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-surface-container-low text-on-surface-variant border border-white/5 hover:bg-surface-container-high'
              }`}
            >
              {t === 'ALL' ? 'All' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card p-16 rounded-2xl flex flex-col items-center justify-center text-center">
          <Icon name="search_off" className="text-5xl text-on-surface-variant/30 mb-4" />
          <p className="text-on-surface-variant font-headline font-bold text-lg">No groups found</p>
          <p className="text-on-surface-variant/60 text-sm mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(group => (
            <div
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`)}
              className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon name={TYPE_ICONS[group.type] ?? 'category'} className="text-6xl" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{group.icon ?? '📌'}</span>
                    <div>
                      <h4 className="font-headline font-bold text-lg">{group.name}</h4>
                      <p className="text-xs text-on-surface-variant font-medium capitalize">
                        {group.type.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-lg font-bold">
                    {group.currency}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                      Balance
                    </p>
                    <p
                      className={`text-xl font-headline font-bold ${
                        group.balance > 0
                          ? 'text-primary'
                          : group.balance < 0
                            ? 'text-error'
                            : 'text-on-surface'
                      }`}
                    >
                      {group.balance > 0 ? '+' : ''}{group.balance.toFixed(2)} {group.currency}
                    </p>
                  </div>
                  <div
                    className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-lg ${
                      group.balance > 0
                        ? 'bg-primary/10 text-primary'
                        : group.balance < 0
                          ? 'bg-error/10 text-error'
                          : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    {group.balance > 0 ? "You're owed" : group.balance < 0 ? 'You owe' : 'Balanced'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <GroupModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onSubmit={handleCreateGroup}
      />
    </div>
  )
}
