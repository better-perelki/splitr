import { useState } from 'react'
import Icon from './Icon'
import type { BalanceEntry } from '../api/balances'

interface SettleModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: { payeeId: string; amount: number; method: string; notes: string }) => Promise<void>
    debt: BalanceEntry | null
    currency: string
}

const METHODS = [
    { value: 'CASH', label: 'Cash', icon: 'payments' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'account_balance' },
    { value: 'BLIK', label: 'BLIK', icon: 'phone_android' },
    { value: 'OTHER', label: 'Other', icon: 'more_horiz' },
]

export default function SettleModal({ isOpen, onClose, onSubmit, debt, currency }: SettleModalProps) {
    const [amount, setAmount] = useState('')
    const [method, setMethod] = useState('CASH')
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const debtAmount = debt?.amount ?? 0
    const payeeName = debt?.to.username ?? ''
    const payeeId = debt?.to.id ?? ''

    const handleOpen = () => {
        setAmount(debtAmount.toFixed(2))
        setMethod('CASH')
        setNotes('')
        setError(null)
    }

    if (isOpen && amount === '' && debtAmount > 0) {
        handleOpen()
    }

    const parsedAmount = parseFloat(amount)
    const isPartial = !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount < debtAmount
    const isValid = !isNaN(parsedAmount) && parsedAmount > 0

    const handleSubmit = async () => {
        if (!isValid || !payeeId) return
        setSubmitting(true)
        setError(null)
        try {
            await onSubmit({ payeeId, amount: parsedAmount, method, notes: notes.trim() })
            setAmount('')
            onClose()
        } catch (e: unknown) {
            const err = e as { response?: { data?: { error?: string } }; message?: string }
            setError(err.response?.data?.error ?? err.message ?? 'Failed to create settlement')
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md mx-4 animate-slideUp">
                <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="relative p-8 pb-6">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[80px]" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <Icon name="handshake" className="text-primary text-xl" />
                                </div>
                                <div>
                                    <h2 className="font-headline text-xl font-bold text-on-surface">Settle Up</h2>
                                    <p className="text-sm text-on-surface-variant">with {payeeName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-xl bg-surface-container-highest/60 flex items-center justify-center hover:bg-surface-container-highest transition-colors"
                            >
                                <Icon name="close" className="text-on-surface-variant" />
                            </button>
                        </div>
                    </div>

                    <div className="px-8 pb-8 space-y-6">
                        <div className="p-4 rounded-2xl bg-surface-container-high/40 border border-white/5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-on-surface-variant">Total owed</span>
                                <span className="font-headline font-bold text-lg text-primary">
                                    {debtAmount.toFixed(2)} {currency}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-3">
                                Amount
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={debtAmount}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-surface-container-high/60 border border-white/10 rounded-xl px-4 py-3 pr-16 font-headline text-lg font-bold text-on-surface focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-medium">
                                    {currency}
                                </span>
                            </div>
                            {isPartial && (
                                <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                                    <Icon name="info" className="text-sm" />
                                    Partial payment — {(debtAmount - parsedAmount).toFixed(2)} {currency} will remain
                                </p>
                            )}
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => setAmount(debtAmount.toFixed(2))}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        amount === debtAmount.toFixed(2)
                                            ? 'bg-primary/20 text-primary border border-primary/30'
                                            : 'bg-surface-container-highest/60 text-on-surface-variant hover:text-on-surface border border-white/5'
                                    }`}
                                >
                                    Full amount
                                </button>
                                {debtAmount > 2 && (
                                    <button
                                        onClick={() => setAmount((debtAmount / 2).toFixed(2))}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            amount === (debtAmount / 2).toFixed(2)
                                                ? 'bg-primary/20 text-primary border border-primary/30'
                                                : 'bg-surface-container-highest/60 text-on-surface-variant hover:text-on-surface border border-white/5'
                                        }`}
                                    >
                                        Half
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-3">
                                Payment Method
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {METHODS.map((m) => (
                                    <button
                                        key={m.value}
                                        onClick={() => setMethod(m.value)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                            method === m.value
                                                ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_20px_-5px_rgba(66,229,176,0.2)]'
                                                : 'bg-surface-container-high/40 text-on-surface-variant hover:text-on-surface border border-white/5 hover:border-white/10'
                                        }`}
                                    >
                                        <Icon name={m.icon} className="text-lg" />
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-3">
                                Note <span className="normal-case tracking-normal font-normal">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g. Paid via Revolut"
                                className="w-full bg-surface-container-high/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-xl bg-surface-container-highest/60 text-on-surface-variant font-bold hover:bg-surface-container-highest transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!isValid || submitting}
                                className="flex-1 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 emerald-shadow"
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Icon name="check" />
                                        {isPartial ? 'Pay Partially' : 'Settle'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
