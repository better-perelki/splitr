import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useAuth } from '../contexts/AuthContext'
import GroupModal from '../components/GroupModal'
import { groupsApi, type GroupResponse, type GroupCreateRequest } from '../api/groups'

const TYPE_ICONS: Record<string, string> = {
  TRIP: 'landscape',
  APARTMENT: 'home',
  EVENT: 'celebration',
  OTHER: 'category',
}

const recentActivity = [
  { name: 'Aleksandra', title: 'Dinner at Mamma Mia', icon: 'local_pizza', iconColor: 'text-orange-400', amount: '$42.00', status: 'owed', bg: 'bg-orange-900/30' },
  { name: 'Marek', title: 'Airport Transfer', icon: 'local_taxi', iconColor: 'text-blue-400', amount: '$18.50', status: 'owe', bg: 'bg-blue-900/30' },
  { name: 'Piotr', title: 'Weekly Groceries', icon: 'shopping_basket', iconColor: 'text-green-400', amount: '$82.50', status: 'owed', bg: 'bg-green-900/30' },
  { name: 'Marek', title: 'Lunch Break', icon: 'restaurant', iconColor: 'text-purple-400', amount: '$12.00', status: 'owe', bg: 'bg-purple-900/30' },
]

// Fallback mock data when backend is unavailable
const MOCK_GROUPS: GroupResponse[] = [
  { id: '1', name: 'Tatry 2025', icon: '🏔️', currency: 'PLN', type: 'TRIP', balance: 45 },
  { id: '2', name: 'Współlokatorzy', icon: '🏠', currency: 'PLN', type: 'APARTMENT', balance: -320 },
  { id: '3', name: 'Ślub Kaśki', icon: '🎉', currency: 'PLN', type: 'EVENT', balance: 0 },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [groups, setGroups] = useState<GroupResponse[]>(MOCK_GROUPS)

  // Load groups from backend (fallback to mock if unavailable)
  useEffect(() => {
    groupsApi.list()
      .then(data => { setGroups(data) })
      .catch(() => { /* keep mock data */ })
  }, [])

  const handleCreateGroup = async (data: GroupCreateRequest) => {
    try {
      const newGroup = await groupsApi.create(data)
      setGroups(prev => [...prev, newGroup])
    } catch {
      // If backend is unavailable, add locally with mock id
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

  return (
    <div className="p-12 min-h-screen relative overflow-hidden">
      {/* Background glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] emerald-glow -z-10 opacity-40" />
      <div className="fixed bottom-0 left-64 w-[400px] h-[400px] emerald-glow -z-10 opacity-20" />

      {/* Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-2">
            Good morning, {user?.username ?? ''}
          </h2>
          <p className="text-on-surface-variant font-body">
            Here's your financial status for today.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-surface-container-low p-2 pr-6 rounded-full border border-primary/10">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon name="trending_up" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold leading-none">
              Net Balance
            </p>
            <p className="text-xl font-headline font-bold text-primary">
              You are owed $124.50
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Recent Activity */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-xl font-bold tracking-tight">
              Recent Activity
            </h3>
            <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((entry, i) => (
              <div
                key={i}
                className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:bg-surface-container-high/60 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-surface-variant" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center">
                      <Icon name={entry.icon} className={`text-[14px] ${entry.iconColor}`} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">{entry.title}</h4>
                    <p className="text-sm text-on-surface-variant">
                      with {entry.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-headline font-bold text-lg ${
                      entry.status === 'owed' ? 'text-primary' : 'text-error'
                    }`}
                  >
                    {entry.amount}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                      entry.status === 'owed'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-error/10 text-error'
                    }`}
                  >
                    {entry.status === 'owed' ? "You're owed" : 'You owe'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Groups */}
        <section className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-xl font-bold tracking-tight">
              Your Groups
            </h3>
            <button
              onClick={() => setShowGroupModal(true)}
              className="p-2 bg-surface-container-highest rounded-lg hover:text-primary transition-colors"
            >
              <Icon name="add" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {groups.map((group) => (
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
                        <h4 className="font-headline font-bold text-lg">
                          {group.name}
                        </h4>
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
        </section>
      </div>

      <GroupModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onSubmit={handleCreateGroup}
      />
    </div>
  )
}
