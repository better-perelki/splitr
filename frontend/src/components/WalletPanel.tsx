import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { useAuth } from '../contexts/AuthContext'
import { groupsApi, type GroupResponse } from '../api/groups'
import { balancesApi, type GroupBalanceResponse } from '../api/balances'

interface DebtEntry {
  personName: string
  amount: number
  currency: string
  groupName: string
  groupId: string
  type: 'owe' | 'owed'
}

export default function WalletPanel() {
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState<GroupResponse[]>([])
  const [allBalances, setAllBalances] = useState<Map<string, GroupBalanceResponse>>(new Map())
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const currentUserId = user?.id ?? ''

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await groupsApi.list()
      setGroups(data)
      const balanceMap = new Map<string, GroupBalanceResponse>()
      await Promise.all(
        data.map(async (g) => {
          try {
            const b = await balancesApi.get(g.id)
            balanceMap.set(g.id, b)
          } catch {}
        })
      )
      setAllBalances(balanceMap)
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (open) loadData()
  }, [open, loadData])

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

  const { totalOwed, totalOwe, debts } = useMemo(() => {
    let owed = 0
    let owe = 0
    const entries: DebtEntry[] = []

    for (const [groupId, balance] of allBalances.entries()) {
      const group = groups.find((g) => g.id === groupId)
      const groupName = group?.name ?? 'Group'
      const currency = group?.currency ?? 'PLN'

      for (const debt of balance.simplifiedDebts) {
        if (debt.from.id === currentUserId) {
          owe += debt.amount
          entries.push({
            personName: debt.to.username,
            amount: debt.amount,
            currency,
            groupName,
            groupId,
            type: 'owe',
          })
        }
        if (debt.to.id === currentUserId) {
          owed += debt.amount
          entries.push({
            personName: debt.from.username,
            amount: debt.amount,
            currency,
            groupName,
            groupId,
            type: 'owed',
          })
        }
      }
    }

    entries.sort((a, b) => b.amount - a.amount)
    return { totalOwed: owed, totalOwe: owe, debts: entries }
  }, [allBalances, groups, currentUserId])

  const netBalance = totalOwed - totalOwe
  const netColor = netBalance > 0.01 ? 'text-emerald-400' : netBalance < -0.01 ? 'text-red-400' : 'text-slate-300'
  const netLabel = netBalance > 0.01 ? 'positive' : netBalance < -0.01 ? 'negative' : 'settled'

  return (
    <div ref={panelRef} className="relative">
      {/* Wallet button */}
      <button
        id="wallet-button"
        onClick={() => setOpen((p) => !p)}
        className="relative text-slate-400 hover:text-slate-100 transition-colors duration-200 p-1"
      >
        <Icon name="account_balance_wallet" />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          id="wallet-panel"
          className="absolute right-0 top-full mt-3 w-[380px] max-h-[520px] flex flex-col rounded-2xl border border-emerald-500/10 bg-slate-900/95 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_30px_-10px_rgba(66,229,176,0.08)] animate-notifSlide z-[100] overflow-hidden"
        >
          {/* Header — Net balance */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-800/60">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="account_balance_wallet" className="text-emerald-400 text-lg" />
              <h3 className="text-sm font-bold text-slate-100 tracking-tight font-headline">
                Quick Balance
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Net balance */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className={`font-headline text-3xl font-bold ${netColor}`}>
                    {netBalance > 0 ? '+' : ''}{netBalance.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    PLN · {netLabel}
                  </span>
                </div>

                {/* Owed / Owe pills */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="px-3 py-2.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/10">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                      Owed to you
                    </p>
                    <p className="text-lg font-bold font-headline text-emerald-400">
                      {totalOwed.toFixed(2)}
                    </p>
                  </div>
                  <div className="px-3 py-2.5 rounded-xl bg-red-500/[0.07] border border-red-500/10">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                      You owe
                    </p>
                    <p className="text-lg font-bold font-headline text-red-400">
                      {totalOwe.toFixed(2)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Debt list */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {!loading && debts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <Icon name="check_circle" className="text-3xl mb-2 text-emerald-400/50" />
                <p className="text-sm font-medium">All settled up!</p>
              </div>
            ) : !loading && (
              <div className="py-1">
                {debts.map((entry, i) => (
                  <button
                    key={`${entry.groupId}-${entry.personName}-${entry.type}-${i}`}
                    onClick={() => {
                      navigate(`/groups/${entry.groupId}?tab=balances`)
                      setOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-150 hover:bg-slate-800/50 ${
                      i < debts.length - 1 ? 'border-b border-slate-800/30' : ''
                    }`}
                  >
                    {/* Avatar initial */}
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                        entry.type === 'owed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {entry.personName[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate">
                        {entry.personName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{entry.groupName}</p>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-sm font-bold font-headline ${
                          entry.type === 'owed' ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {entry.type === 'owed' ? '+' : '-'}{entry.amount.toFixed(2)}
                      </p>
                      <p
                        className={`text-[10px] font-bold uppercase ${
                          entry.type === 'owed' ? 'text-emerald-500/60' : 'text-red-500/60'
                        }`}
                      >
                        {entry.type === 'owed' ? 'owed' : 'owe'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-800/60">
            <button
              onClick={() => {
                navigate('/')
                setOpen(false)
              }}
              className="w-full text-center text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              View full dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
