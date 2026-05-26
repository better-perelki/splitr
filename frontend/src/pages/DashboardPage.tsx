import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useAuth } from '../contexts/AuthContext'
import GroupModal from '../components/GroupModal'
import { groupsApi, type GroupResponse, type GroupCreateRequest } from '../api/groups'
import { useWalletSummary } from '../hooks/useWalletSummary'

const TYPE_ICONS: Record<string, string> = {
  TRIP: 'landscape',
  APARTMENT: 'home',
  EVENT: 'celebration',
  OTHER: 'category',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [groups, setGroups] = useState<GroupResponse[]>([])
  const { totalOwed, totalOwe, debts, groupBalances } = useWalletSummary()

  useEffect(() => {
    groupsApi.list().then(setGroups).catch(() => {})
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
        type: data.type,
        balance: 0,
      }])
    }
  }

  const recentDebts = useMemo(() => debts.slice(0, 5), [debts])

  const groupBalanceMap = useMemo(
    () => new Map(groupBalances.map(g => [g.groupId, g.balance])),
    [groupBalances],
  )
  const getGroupBalance = (groupId: string): number => groupBalanceMap.get(groupId) ?? 0

  return (
    <div className="p-12 min-h-screen relative overflow-hidden">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] emerald-glow -z-10 opacity-40" />
      <div className="fixed bottom-0 left-64 w-[400px] h-[400px] emerald-glow -z-10 opacity-20" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-2">
            Good morning, {user?.username ?? ''}
          </h2>
          <p className="text-on-surface-variant font-body">
            Here's your financial status for today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="relative overflow-hidden p-8 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-transparent to-transparent glass-card group hover:scale-[1.01] transition-all duration-300">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/10 rounded-full blur-[60px] group-hover:blur-[80px] transition-all" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Icon name="arrow_downward" className="text-primary" />
                </div>
                <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                  Owed to you
                </span>
              </div>
              <div className="font-headline text-4xl font-bold text-primary mb-2">
                {totalOwed.toFixed(2)} {user?.defaultCurrency ?? 'PLN'}
              </div>
              <p className="text-sm text-on-surface-variant">
                {totalOwed > 0 ? 'across your groups' : 'No one owes you'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Icon name="trending_up" className="text-3xl text-primary" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden p-8 rounded-3xl border border-error/15 bg-gradient-to-br from-error/5 via-transparent to-transparent glass-card group hover:scale-[1.01] transition-all duration-300">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-error/10 rounded-full blur-[60px] group-hover:blur-[80px] transition-all" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-error/15 flex items-center justify-center">
                  <Icon name="arrow_upward" className="text-error" />
                </div>
                <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                  You owe
                </span>
              </div>
              <div className="font-headline text-4xl font-bold text-error mb-2">
                {totalOwe.toFixed(2)} {user?.defaultCurrency ?? 'PLN'}
              </div>
              <p className="text-sm text-on-surface-variant">
                {totalOwe > 0 ? 'across your groups' : "You're all settled!"}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center">
              <Icon name="trending_down" className="text-3xl text-error" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-xl font-bold tracking-tight">
              Outstanding Balances
            </h3>
          </div>
          {recentDebts.length === 0 && (
            <div className="glass-card p-10 rounded-2xl flex flex-col items-center text-on-surface-variant">
              <Icon name="check_circle" className="text-5xl text-primary mb-4" />
              <p className="font-headline font-bold text-lg text-on-surface mb-1">All settled up!</p>
              <p className="text-sm opacity-60">No outstanding balances across your groups.</p>
            </div>
          )}
          <div className="space-y-4">
            {recentDebts.map((entry) => (
              <div
                key={`${entry.groupId}-${entry.counterparty.id}-${entry.type}`}
                onClick={() => navigate(`/groups/${entry.groupId}?tab=balances`)}
                className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:bg-surface-container-high/60 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                      entry.type === 'owed'
                        ? 'bg-primary/10 border-2 border-primary/20 text-primary'
                        : 'bg-error/10 border-2 border-error/20 text-error'
                    }`}>
                      {entry.counterparty.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center">
                      <Icon
                        name={entry.type === 'owed' ? 'arrow_downward' : 'arrow_upward'}
                        className={`text-[14px] ${entry.type === 'owed' ? 'text-primary' : 'text-error'}`}
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">
                      {entry.counterparty.username}
                    </h4>
                    <p className="text-sm text-on-surface-variant">
                      {entry.groupName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p
                      className={`font-headline font-bold text-lg ${
                        entry.type === 'owed' ? 'text-primary' : 'text-error'
                      }`}
                    >
                      {entry.amount.toFixed(2)} {entry.currency}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                        entry.type === 'owed'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-error/10 text-error'
                      }`}
                    >
                      {entry.type === 'owed' ? "You're owed" : 'You owe'}
                    </span>
                  </div>
                  {entry.type === 'owe' && (
                    <div className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Settle
                      <Icon name="arrow_forward" className="text-sm" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

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
            {groups.map((group) => {
              const bal = getGroupBalance(group.id)
              return (
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
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                          Balance
                        </p>
                        <p
                          className={`text-xl font-headline font-bold ${
                            bal > 0.01
                              ? 'text-primary'
                              : bal < -0.01
                                ? 'text-error'
                                : 'text-on-surface'
                          }`}
                        >
                          {bal > 0.01 ? '+' : ''}{bal.toFixed(2)} {user?.defaultCurrency ?? 'PLN'}
                        </p>
                      </div>
                      <div
                        className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-lg ${
                          bal > 0.01
                            ? 'bg-primary/10 text-primary'
                            : bal < -0.01
                              ? 'bg-error/10 text-error'
                              : 'bg-surface-container-highest text-on-surface-variant'
                        }`}
                      >
                        {bal > 0.01 ? "You're owed" : bal < -0.01 ? 'You owe' : 'Settled'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {groups.length === 0 && (
              <div className="glass-card p-10 rounded-2xl flex flex-col items-center text-on-surface-variant">
                <Icon name="group_add" className="text-5xl mb-4 opacity-30" />
                <p className="font-headline font-bold text-lg text-on-surface mb-1">No groups yet</p>
                <p className="text-sm opacity-60 mb-4">Create your first group to start splitting expenses.</p>
                <button
                  onClick={() => setShowGroupModal(true)}
                  className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Icon name="add" />
                  Create Group
                </button>
              </div>
            )}
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

