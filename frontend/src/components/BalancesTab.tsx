import { useState, useEffect, useCallback } from 'react'
import Icon from './Icon'
import SettleModal from './SettleModal'
import { useAuth } from '../contexts/AuthContext'
import {
    balancesApi,
    settlementsApi,
    type GroupBalanceResponse,
    type BalanceEntry,
    type SettlementResponse,
} from '../api/balances'

interface BalancesTabProps {
    groupId: string
    currentUserId: string
    onSettled?: () => void
}

function formatDate(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BalancesTab({ groupId, currentUserId, onSettled }: BalancesTabProps) {
    const { user } = useAuth()
    const currency = user?.defaultCurrency ?? 'PLN'
    const [balances, setBalances] = useState<GroupBalanceResponse | null>(null)
    const [settlements, setSettlements] = useState<SettlementResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [settleDebt, setSettleDebt] = useState<BalanceEntry | null>(null)
    const [showSettleModal, setShowSettleModal] = useState(false)
    const [showHistory, setShowHistory] = useState(false)

    const fetchData = useCallback(() => {
        setLoading(true)
        Promise.all([
            balancesApi.get(groupId),
            settlementsApi.list(groupId),
        ])
            .then(([b, s]) => {
                setBalances(b)
                setSettlements(s)
                setError(null)
            })
            .catch((e: unknown) => {
                const err = e as { response?: { data?: { error?: string } }; message?: string }
                setError(err.response?.data?.error ?? err.message ?? 'Failed to load balances')
            })
            .finally(() => setLoading(false))
    }, [groupId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleSettle = async (data: { payeeId: string; amount: number; method: string; notes: string }) => {
        await settlementsApi.create(groupId, {
            payeeId: data.payeeId,
            amount: data.amount,
            currency,
            method: data.method,
            notes: data.notes || null,
        })
        await fetchData()
        if (onSettled) onSettled()
    }

    // --- NOWA FUNKCJA DO USUWANIA ---
    const handleRevert = async (settlementId: string) => {
        if (!window.confirm('Are you sure you want to revert this settlement?')) return
        try {
            await settlementsApi.delete(groupId, settlementId)
            await fetchData()
            if (onSettled) onSettled()
        } catch (e: any) {
            alert(e.response?.data?.error ?? e.message ?? 'Failed to revert settlement')
        }
    }

    const openSettle = (debt: BalanceEntry) => {
        setSettleDebt(debt)
        setShowSettleModal(true)
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                {error}
            </div>
        )
    }

    if (!balances) return null

    const userDebts = balances.simplifiedDebts.filter(d => d.from.id === currentUserId)
    const userCredits = balances.simplifiedDebts.filter(d => d.to.id === currentUserId)
    const otherDebts = balances.simplifiedDebts.filter(d => d.from.id !== currentUserId && d.to.id !== currentUserId)
    const totalOwed = userCredits.reduce((sum, d) => sum + d.amount, 0)
    const totalOwe = userDebts.reduce((sum, d) => sum + d.amount, 0)

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* ... Statystyki bez zmian ... */}
            <div className="grid grid-cols-2 gap-4">
                <div className="relative overflow-hidden p-6 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-[40px]" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                                <Icon name="arrow_downward" className="text-primary text-sm" />
                            </div>
                            <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                                Owed to you
                            </span>
                        </div>
                        <div className="font-headline text-2xl font-bold text-primary">
                            {totalOwed.toFixed(2)} <span className="text-sm opacity-60">{currency}</span>
                        </div>
                        {userCredits.length > 0 && (
                            <p className="text-xs text-on-surface-variant mt-1">
                                from {userCredits.length} {userCredits.length === 1 ? 'person' : 'people'}
                            </p>
                        )}
                    </div>
                </div>

                <div className="relative overflow-hidden p-6 rounded-2xl border border-error/15 bg-gradient-to-br from-error/5 to-transparent">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-error/10 rounded-full blur-[40px]" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-error/15 flex items-center justify-center">
                                <Icon name="arrow_upward" className="text-error text-sm" />
                            </div>
                            <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                                You owe
                            </span>
                        </div>
                        <div className="font-headline text-2xl font-bold text-error">
                            {totalOwe.toFixed(2)} <span className="text-sm opacity-60">{currency}</span>
                        </div>
                        {userDebts.length > 0 && (
                            <p className="text-xs text-on-surface-variant mt-1">
                                to {userDebts.length} {userDebts.length === 1 ? 'person' : 'people'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ... Sekcje You owe / Owed to you bez zmian ... */}
            {userDebts.length > 0 && (
                <div>
                    <h3 className="font-headline text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-4 flex items-center gap-4">
                        You owe
                        <span className="flex-1 h-px bg-outline-variant/10" />
                    </h3>
                    <div className="space-y-3">
                        {userDebts.map((debt, i) => (
                            <div key={i} className="group p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all duration-300 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-error/10 border-2 border-error/20 flex items-center justify-center text-sm font-bold text-error">
                                        {debt.to.avatarUrl ? <img src={debt.to.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : debt.to.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-headline text-lg font-bold text-on-surface">{debt.to.username}</h4>
                                        <p className="text-sm text-on-surface-variant">You owe them</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="font-headline text-xl font-bold text-error">{debt.amount.toFixed(2)}</div>
                                        <div className="text-xs text-on-surface-variant">{currency}</div>
                                    </div>
                                    <button onClick={() => openSettle(debt)} className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:brightness-110 active:scale-95 transition-all emerald-shadow flex items-center gap-2">
                                        <Icon name="handshake" className="text-base" /> Settle
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {userCredits.length > 0 && (
                <div>
                    <h3 className="font-headline text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-4 flex items-center gap-4">
                        Owed to you
                        <span className="flex-1 h-px bg-outline-variant/10" />
                    </h3>
                    <div className="space-y-3">
                        {userCredits.map((debt, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all duration-300 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                                        {debt.from.avatarUrl ? <img src={debt.from.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : debt.from.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-headline text-lg font-bold text-on-surface">{debt.from.username}</h4>
                                        <p className="text-sm text-on-surface-variant">Owes you</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-headline text-xl font-bold text-primary">{debt.amount.toFixed(2)}</div>
                                    <div className="text-xs text-on-surface-variant">{currency}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ... Inne długi i All settled up bez zmian ... */}
            {otherDebts.length > 0 && (
                <div>
                    <h3 className="font-headline text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-4 flex items-center gap-4">
                        Other debts in group
                        <span className="flex-1 h-px bg-outline-variant/10" />
                    </h3>
                    <div className="space-y-3">
                        {otherDebts.map((debt, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-surface-container-low/60 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-xs font-bold text-on-surface-variant">
                                            {debt.from.username[0].toUpperCase()}
                                        </div>
                                        <Icon name="arrow_forward" className="text-on-surface-variant/40 text-sm mx-1" />
                                        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-xs font-bold text-on-surface-variant">
                                            {debt.to.username[0].toUpperCase()}
                                        </div>
                                    </div>
                                    <span className="text-sm text-on-surface-variant">
                                        {debt.from.username} → {debt.to.username}
                                    </span>
                                </div>
                                <span className="font-headline font-bold text-on-surface-variant">
                                    {debt.amount.toFixed(2)} {currency}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {balances.simplifiedDebts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                        <Icon name="check_circle" className="text-5xl text-primary" />
                    </div>
                    <p className="font-headline text-xl font-bold mb-2 text-on-surface">All settled up!</p>
                    <p className="text-sm opacity-60">No outstanding debts in this group.</p>
                </div>
            )}

            {/* --- ZMODYFIKOWANA HISTORIA Z PRZYCISKIEM USUWANIA --- */}
            {settlements.length > 0 && (
                <div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex items-center justify-between py-4 text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        <h3 className="font-headline text-xs uppercase tracking-[0.2em] flex items-center gap-4">
                            Settlement History ({settlements.length})
                            <span className="flex-1 h-px bg-outline-variant/10" />
                        </h3>
                        <Icon name={showHistory ? 'expand_less' : 'expand_more'} className="text-xl" />
                    </button>
                    {showHistory && (
                        <div className="space-y-3 animate-fadeIn">
                            {settlements.map((s) => (
                                <div
                                    key={s.id}
                                    className="group/item p-4 rounded-2xl bg-surface-container-low/40 border border-white/[0.03] flex items-center justify-between hover:bg-surface-container-low/60 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Icon name="handshake" className="text-primary text-sm" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-on-surface">
                                                {s.payer.username} → {s.payee.username}
                                            </p>
                                            <p className="text-xs text-on-surface-variant">
                                                {s.method && <span className="capitalize">{s.method.toLowerCase().replace('_', ' ')}</span>}
                                                {s.method && s.notes && ' • '}
                                                {s.notes}
                                                {!s.method && !s.notes && formatDate(s.settledAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-headline font-bold text-primary">
                                                {s.amount.toFixed(2)} {s.currency}
                                            </div>
                                            <div className="text-[10px] text-on-surface-variant">
                                                {formatDate(s.settledAt)}
                                            </div>
                                        </div>
                                        {/* PRZYCISK USUWANIA (pokazuje się po najechaniu lub jeśli to Twoje rozliczenie) */}
                                        {(s.payer.id === currentUserId || s.payee.id === currentUserId) && (
                                            <button
                                                onClick={() => handleRevert(s.id)}
                                                className="p-2 rounded-full hover:bg-error/10 text-on-surface-variant hover:text-error transition-all opacity-0 group-hover/item:opacity-100"
                                                title="Revert settlement"
                                            >
                                                <Icon name="delete" className="text-lg" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <SettleModal
                isOpen={showSettleModal}
                onClose={() => {
                    setShowSettleModal(false)
                    setSettleDebt(null)
                }}
                onSubmit={handleSettle}
                debt={settleDebt}
                currency={currency}
            />
        </div>
    )
}