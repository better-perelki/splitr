import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { groupsApi, type GroupResponse } from '../api/groups'

export default function AddExpensePopover() {
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState<GroupResponse[] | null>(null)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const openExpenseFor = useCallback(
    (groupId: string) => {
      setOpen(false)
      navigate(`/groups/${groupId}?addExpense=1`)
    },
    [navigate],
  )

  const handleTriggerClick = async () => {
    if (loading) return
    if (groups) {
      if (groups.length === 1) {
        openExpenseFor(groups[0].id)
        return
      }
      setOpen((p) => !p)
      return
    }
    setLoading(true)
    try {
      const data = await groupsApi.list()
      setGroups(data)
      if (data.length === 1) openExpenseFor(data[0].id)
      else setOpen(true)
    } catch {
      setGroups([])
      setOpen(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return
    const handleMouseDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={handleTriggerClick}
        disabled={loading}
        className="ml-2 px-6 py-2 bg-primary-container text-on-primary-container font-bold rounded-xl text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
      >
        {loading ? 'Loading…' : 'Add Expense'}
      </button>

      {open && groups && (
        <div className="absolute right-0 top-full mt-3 w-[340px] max-h-[420px] flex flex-col rounded-2xl border border-emerald-500/10 bg-slate-900/95 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_30px_-10px_rgba(66,229,176,0.08)] z-[100] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800/60">
            <h3 className="text-sm font-bold text-slate-100 tracking-tight font-headline">
              Add expense to…
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Pick a group to continue.</p>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center text-slate-400">
                <Icon name="group_off" className="text-3xl mb-2 opacity-50" />
                <p className="text-sm mb-4">You don't belong to any group yet.</p>
                <button
                  onClick={() => {
                    setOpen(false)
                    navigate('/groups')
                  }}
                  className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  Create a group
                </button>
              </div>
            ) : (
              groups.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => openExpenseFor(g.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-800/50 ${
                    i < groups.length - 1 ? 'border-b border-slate-800/30' : ''
                  }`}
                >
                  <span className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center text-lg">
                    {g.icon ?? '📌'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate">{g.name}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{g.type.toLowerCase()}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800/60 px-2 py-1 rounded-md">
                    {g.currency}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
