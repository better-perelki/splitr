import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon'
import {
    expensesApi,
    type ExpenseCategory,
    type ExpenseCreateRequest,
    type ExpenseResponse,
    type PayerInput,
    type SplitInput,
    type SplitType,
} from '../api/expenses'
import type { GroupMemberResponse } from '../api/groups'
import { useAuth } from '../contexts/AuthContext'

interface Props {
    open: boolean
    onClose: () => void
    groupId: string
    members: GroupMemberResponse[]
    currency: string
    expense?: ExpenseResponse | null
    onSaved?: (expense: ExpenseResponse) => void
}

interface CategoryOption {
    value: ExpenseCategory
    icon: string
    label: string
}

const CATEGORIES: CategoryOption[] = [
    { value: 'FOOD', icon: 'restaurant', label: 'Food' },
    { value: 'TRANSPORT', icon: 'directions_car', label: 'Transport' },
    { value: 'ACCOMMODATION', icon: 'hotel', label: 'Stay' },
    { value: 'ENTERTAINMENT', icon: 'celebration', label: 'Fun' },
    { value: 'SHOPPING', icon: 'shopping_bag', label: 'Shop' },
    { value: 'UTILITIES', icon: 'bolt', label: 'Bills' },
    { value: 'OTHER', icon: 'more_horiz', label: 'Other' },
]

const SPLIT_TABS: { value: SplitType; label: string }[] = [
    { value: 'EQUAL', label: 'Equal' },
    { value: 'PERCENTAGE', label: '%' },
    { value: 'EXACT', label: 'Exact' },
    { value: 'SHARES', label: 'Shares' },
    { value: 'ADJUSTMENT', label: 'Adjust' },
]

const todayIso = () => new Date().toISOString().slice(0, 10)

const round2 = (n: number) => Math.round(n * 100) / 100

const sanitizeNumeric = (v: string, allowSigned = false): string => {
    const sign = allowSigned && v.trim().startsWith('-') ? '-' : ''
    const cleaned = v.replace(/[^\d.,]/g, '').replace(/,/g, '.')
    const firstDot = cleaned.indexOf('.')
    const single = firstDot === -1
        ? cleaned
        : cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '')
    return sign + single
}

const parseNum = (v: string): number => {
    const n = Number(sanitizeNumeric(v, true))
    return Number.isFinite(n) ? n : 0
}

interface SplitState {
    [userId: string]: { selected: boolean; value: string }
}

interface PayerState {
    [userId: string]: string
}

export default function AddExpenseDrawer({
                                             open,
                                             onClose,
                                             groupId,
                                             members,
                                             currency,
                                             expense,
                                             onSaved,
                                         }: Props) {
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [expenseDate, setExpenseDate] = useState(todayIso())
    const [category, setCategory] = useState<ExpenseCategory>('FOOD')
    const [splitType, setSplitType] = useState<SplitType>('EQUAL')
    const [payers, setPayers] = useState<PayerState>({})
    const [splits, setSplits] = useState<SplitState>({})
    const [receiptFile, setReceiptFile] = useState<File | null>(null)
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const { user } = useAuth()
    const currentUserId = user?.id ?? ''

    const isEdit = Boolean(expense)
    const totalNumber = parseNum(amount)

    useEffect(() => {
        if (!open) return
        if (expense) {
            setAmount(String(expense.amount))
            setDescription(expense.description)
            setExpenseDate(expense.expenseDate)
            setCategory(expense.category)
            setSplitType(expense.splitType)
            setReceiptFile(null)
            setReceiptPreview(expense.receiptUrl ?? null)
            const nextPayers: PayerState = {}
            for (const p of expense.payers) nextPayers[p.user.id] = String(p.amount)
            setPayers(nextPayers)
            const nextSplits: SplitState = {}
            for (const s of expense.splits) {
                const v =
                    expense.splitType === 'EXACT'
                        ? String(s.amount)
                        : expense.splitType === 'PERCENTAGE'
                            ? String(s.percentage ?? '')
                            : expense.splitType === 'SHARES'
                                ? String(s.share ?? '')
                                : expense.splitType === 'ADJUSTMENT'
                                    ? String(s.adjustment ?? '')
                                    : ''
                nextSplits[s.user.id] = { selected: true, value: v }
            }
            for (const m of members) {
                if (!nextSplits[m.user.id]) nextSplits[m.user.id] = { selected: false, value: '' }
            }
            setSplits(nextSplits)
        } else {
            setAmount('')
            setDescription('')
            setExpenseDate(todayIso())
            setCategory('FOOD')
            setSplitType('EQUAL')
            setReceiptFile(null)
            setReceiptPreview(null)
            const me = members.find((m) => m.user.id === currentUserId) ?? members[0]
            setPayers(me ? { [me.user.id]: '' } : {})
            const initialSplits: SplitState = {}
            for (const m of members) initialSplits[m.user.id] = { selected: true, value: '' }
            setSplits(initialSplits)
        }
        setError(null)
    }, [open, expense, members, currentUserId])

    useEffect(() => {
        const ids = Object.keys(payers)
        if (ids.length !== 1) return
        const onlyId = ids[0]
        if (payers[onlyId] === amount) return
        setPayers({ [onlyId]: amount })
    }, [amount, payers])

    const selectedSplitIds = useMemo(
        () => Object.entries(splits).filter(([, s]) => s.selected).map(([id]) => id),
        [splits],
    )

    const computedSplits = useMemo(() => {
        const result: Record<string, number> = {}
        if (selectedSplitIds.length === 0 || totalNumber <= 0) return result

        if (splitType === 'EQUAL') {
            const base = Math.floor((totalNumber * 100) / selectedSplitIds.length) / 100
            const sortedIds = [...selectedSplitIds].sort()
            sortedIds.forEach((id) => (result[id] = base))
            const remainder = Math.round((totalNumber - base * selectedSplitIds.length) * 100)
            for (let i = 0; i < remainder; i++) {
                const id = sortedIds[i % sortedIds.length]
                result[id] = round2(result[id] + 0.01)
            }
        } else if (splitType === 'EXACT') {
            for (const id of selectedSplitIds) result[id] = parseNum(splits[id].value)
        } else if (splitType === 'PERCENTAGE') {
            for (const id of selectedSplitIds) {
                const pct = parseNum(splits[id].value)
                result[id] = round2((totalNumber * pct) / 100)
            }
        } else if (splitType === 'SHARES') {
            const total = selectedSplitIds.reduce((sum, id) => sum + parseNum(splits[id].value), 0)
            if (total <= 0) return result
            for (const id of selectedSplitIds) {
                const share = parseNum(splits[id].value)
                result[id] = round2((totalNumber * share) / total)
            }
        } else if (splitType === 'ADJUSTMENT') {
            const base = round2(totalNumber / selectedSplitIds.length)
            for (const id of selectedSplitIds) {
                result[id] = round2(base + parseNum(splits[id].value))
            }
        }
        return result
    }, [selectedSplitIds, splitType, splits, totalNumber])

    const splitsTotal = useMemo(
        () => round2(Object.values(computedSplits).reduce((a, b) => a + b, 0)),
        [computedSplits],
    )

    const payersTotal = useMemo(
        () => round2(Object.values(payers).reduce((acc, v) => acc + parseNum(v), 0)),
        [payers],
    )

    const togglePayer = (userId: string) => {
        setPayers((prev) => {
            const next = { ...prev }
            if (next[userId] != null) delete next[userId]
            else next[userId] = ''
            return next
        })
    }

    const setPayerAmount = (userId: string, value: string) => {
        setPayers((prev) => ({ ...prev, [userId]: value }))
    }

    const toggleSplitMember = (userId: string) => {
        setSplits((prev) => ({
            ...prev,
            [userId]: { ...prev[userId], selected: !prev[userId]?.selected, value: prev[userId]?.value ?? '' },
        }))
    }

    const setSplitValue = (userId: string, value: string) => {
        setSplits((prev) => ({
            ...prev,
            [userId]: { selected: prev[userId]?.selected ?? true, value },
        }))
    }

    const handleFile = (file: File | null) => {
        setReceiptFile(file)
        if (file) setReceiptPreview(URL.createObjectURL(file))
        else setReceiptPreview(expense?.receiptUrl ?? null)
    }

    const buildPayload = (): ExpenseCreateRequest | null => {
        if (totalNumber <= 0) {
            setError('Amount must be greater than zero')
            return null
        }
        if (!description.trim()) {
            setError('Description is required')
            return null
        }
        const payerEntries: PayerInput[] = Object.entries(payers)
            .filter(([, v]) => parseNum(v) > 0)
            .map(([userId, v]) => ({ userId, amount: parseNum(v) }))
        if (payerEntries.length === 0) {
            setError('At least one payer is required')
            return null
        }
        if (Math.abs(payersTotal - totalNumber) > 0.001) {
            setError(`Payer amounts (${payersTotal.toFixed(2)}) must sum to total (${totalNumber.toFixed(2)})`)
            return null
        }

        if (selectedSplitIds.length === 0) {
            setError('Select at least one participant')
            return null
        }

        const splitInputs: SplitInput[] = selectedSplitIds.map((userId) => {
            const v = splits[userId]?.value ?? ''
            const value = parseNum(v)
            switch (splitType) {
                case 'EQUAL':
                    return { userId }
                case 'EXACT':
                    return { userId, amount: value }
                case 'PERCENTAGE':
                    return { userId, percentage: value }
                case 'SHARES':
                    return { userId, share: value }
                case 'ADJUSTMENT':
                    return { userId, adjustment: value }
            }
        })

        if (splitType === 'PERCENTAGE') {
            const sum = round2(splitInputs.reduce((s, x) => s + (x.percentage ?? 0), 0))
            if (Math.abs(sum - 100) > 0.001) {
                setError(`Percentages must sum to 100, got ${sum.toFixed(2)}`)
                return null
            }
        }
        if (splitType === 'EXACT') {
            const sum = round2(splitInputs.reduce((s, x) => s + (x.amount ?? 0), 0))
            if (Math.abs(sum - totalNumber) > 0.001) {
                setError(`Exact amounts must sum to total (${totalNumber.toFixed(2)}), got ${sum.toFixed(2)}`)
                return null
            }
        }
        if (splitType === 'ADJUSTMENT') {
            const sum = round2(splitInputs.reduce((s, x) => s + (x.adjustment ?? 0), 0))
            if (Math.abs(sum) > 0.001) {
                setError(`Adjustments must sum to 0, got ${sum.toFixed(2)}`)
                return null
            }
        }

        return {
            amount: totalNumber,
            currency,
            description: description.trim(),
            expenseDate,
            category,
            splitType,
            payers: payerEntries,
            splits: splitInputs,
        }
    }

    const handleSubmit = async () => {
        const payload = buildPayload()
        if (!payload) return
        setSubmitting(true)
        setError(null)
        try {
            const saved = isEdit && expense
                ? await expensesApi.update(expense.id, payload)
                : await expensesApi.create(groupId, payload)
            const finalExpense = receiptFile
                ? await expensesApi.uploadReceipt(saved.id, receiptFile)
                : saved
            onSaved?.(finalExpense)
            onClose()
        } catch (e: unknown) {
            const err = e as { response?: { data?: { error?: string } }; message?: string }
            setError(err.response?.data?.error ?? err.message ?? 'Failed to save expense')
        } finally {
            setSubmitting(false)
        }
    }

    const splitTypeHint = (() => {
        switch (splitType) {
            case 'EQUAL':
                return 'Total split equally between selected members'
            case 'PERCENTAGE':
                return `Percentages must sum to 100`
            case 'EXACT':
                return `Amounts must sum to ${totalNumber.toFixed(2)} ${currency}`
            case 'SHARES':
                return 'Weights are scaled proportionally (e.g. adult=1, child=0.5)'
            case 'ADJUSTMENT':
                return 'Equal split + adjustments per member (must sum to 0)'
        }
    })()

    return (
        <div className={`fixed inset-0 z-[60] ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            <div
                className={`absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm transition-opacity duration-300 ${
                    open ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={onClose}
            />

            <div
                className={`absolute right-0 top-0 h-full w-full max-w-[520px] bg-surface-container border-l border-outline-variant/20 shadow-2xl z-10 flex flex-col overflow-hidden transition-transform duration-300 ease-out ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <header className="flex items-center justify-between px-8 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors"
                        >
                            <Icon name="close" className="text-on-surface-variant" />
                        </button>
                        <h2 className="text-xl font-bold font-headline tracking-tight">
                            {isEdit ? 'Edit Expense' : 'Add Expense'}
                        </h2>
                    </div>
                    <span className="text-[10px] font-headline uppercase tracking-widest font-bold text-primary-fixed-dim">
                        {currency}
                    </span>
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar px-8 pb-12 space-y-8">
                    <section className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-1">
                            Amount
                        </label>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-headline font-light text-primary/50">{currency}</span>
                            <input
                                autoFocus
                                inputMode="decimal"
                                value={amount}
                                onChange={(e) => setAmount(sanitizeNumeric(e.target.value))}
                                placeholder="0.00"
                                className="w-full bg-transparent border-none text-5xl font-headline font-bold text-on-surface focus:ring-0 focus:outline-none placeholder:text-surface-variant"
                            />
                        </div>
                    </section>

                    <section className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-1">
                                Description
                            </label>
                            <div className="bg-surface-container-low px-4 py-3 rounded-xl flex items-center gap-3 focus-within:bg-surface-container-high transition-colors">
                                <Icon name="edit_note" className="text-surface-variant" />
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What was it for?"
                                    className="bg-transparent border-none w-full focus:ring-0 focus:outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-1">
                                Date
                            </label>
                            <div className="bg-surface-container-low px-4 py-3 rounded-xl flex items-center gap-3">
                                <Icon name="calendar_today" className="text-surface-variant text-sm" />
                                <input
                                    type="date"
                                    value={expenseDate}
                                    onChange={(e) => setExpenseDate(e.target.value)}
                                    className="bg-transparent border-none w-full text-sm font-medium focus:ring-0 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-1">
                                Members
                            </label>
                            <div className="bg-surface-container-low px-4 py-3 rounded-xl flex items-center gap-3">
                                <Icon name="group" className="text-surface-variant text-sm" />
                                <span className="text-sm font-medium">{members.length}</span>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-1">
                            Category
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {CATEGORIES.map((c) => {
                                const active = c.value === category
                                return (
                                    <button
                                        key={c.value}
                                        onClick={() => setCategory(c.value)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-colors ${
                                            active
                                                ? 'bg-surface-container-high border-primary/30'
                                                : 'bg-surface-container-low border-transparent hover:bg-surface-container-high'
                                        }`}
                                    >
                                        <Icon
                                            name={c.icon}
                                            className={active ? 'text-primary' : 'text-on-surface-variant'}
                                            filled={active}
                                        />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">{c.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">
                                Paid By
                            </label>
                            <span
                                className={`text-[10px] font-bold uppercase tracking-widest ${
                                    Math.abs(payersTotal - totalNumber) < 0.01 ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                {payersTotal.toFixed(2)} / {totalNumber.toFixed(2)} {currency}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {members.map((m) => {
                                const isPayer = payers[m.user.id] != null
                                return (
                                    <button
                                        key={m.user.id}
                                        onClick={() => togglePayer(m.user.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                            isPayer
                                                ? 'bg-primary-container text-on-primary-container'
                                                : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
                                        }`}
                                    >
                                        <span>{m.user.username}</span>
                                    </button>
                                )
                            })}
                        </div>
                        {Object.keys(payers).length > 0 && (
                            <div className="space-y-2">
                                {Object.keys(payers).map((userId) => {
                                    const member = members.find((m) => m.user.id === userId)
                                    if (!member) return null
                                    return (
                                        <div
                                            key={userId}
                                            className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl gap-3"
                                        >
                                            <span className="text-sm font-bold">{member.user.username}</span>
                                            <input
                                                inputMode="decimal"
                                                value={payers[userId]}
                                                onChange={(e) => setPayerAmount(userId, sanitizeNumeric(e.target.value))}
                                                placeholder="0.00"
                                                className="w-28 bg-surface-container-highest text-right px-3 py-1.5 rounded-lg text-sm font-bold focus:ring-1 focus:ring-primary/40 focus:outline-none"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">
                                Split
                            </label>
                            <span
                                className={`text-[10px] font-bold uppercase tracking-widest ${
                                    Math.abs(splitsTotal - totalNumber) < 0.01 ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                {splitsTotal.toFixed(2)} / {totalNumber.toFixed(2)} {currency}
                            </span>
                        </div>
                        <div className="flex bg-surface-container-low p-1 rounded-xl">
                            {SPLIT_TABS.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setSplitType(tab.value)}
                                    className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg ${
                                        splitType === tab.value
                                            ? 'bg-surface-container-highest text-primary shadow-sm'
                                            : 'text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-on-surface-variant ml-1">{splitTypeHint}</p>
                        <div className="space-y-1">
                            {members.map((m) => {
                                const state = splits[m.user.id] ?? { selected: false, value: '' }
                                const computed = computedSplits[m.user.id]
                                return (
                                    <div
                                        key={m.user.id}
                                        className={`flex items-center justify-between gap-3 p-3 rounded-2xl transition-all ${
                                            state.selected ? 'bg-surface-container-low' : 'bg-surface-container-low/40 opacity-60'
                                        }`}
                                    >
                                        <button
                                            onClick={() => toggleSplitMember(m.user.id)}
                                            className="flex items-center gap-3 flex-1 text-left"
                                        >
                                            <div
                                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                                    state.selected
                                                        ? 'bg-primary border-primary'
                                                        : 'border-outline-variant/40'
                                                }`}
                                            >
                                                {state.selected && <Icon name="check" className="text-[12px] text-on-primary" />}
                                            </div>
                                            <span className="text-sm font-bold">{m.user.username}</span>
                                        </button>
                                        {state.selected && splitType !== 'EQUAL' && (
                                            <input
                                                inputMode="decimal"
                                                value={state.value}
                                                onChange={(e) =>
                                                    setSplitValue(m.user.id, sanitizeNumeric(e.target.value, splitType === 'ADJUSTMENT'))
                                                }
                                                placeholder={
                                                    splitType === 'PERCENTAGE'
                                                        ? '%'
                                                        : splitType === 'SHARES'
                                                            ? 'weight'
                                                            : splitType === 'ADJUSTMENT'
                                                                ? '+/-'
                                                                : '0.00'
                                                }
                                                className="w-24 bg-surface-container-highest text-right px-3 py-1.5 rounded-lg text-sm font-bold focus:ring-1 focus:ring-primary/40 focus:outline-none"
                                            />
                                        )}
                                        {state.selected && computed != null && (
                                            <span className="text-xs font-bold text-on-surface-variant w-20 text-right">
                                                {computed.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-1">
                            Receipt
                        </label>
                        <div
                            onDragOver={(e) => {
                                e.preventDefault()
                                setDragOver(true)
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault()
                                setDragOver(false)
                                handleFile(e.dataTransfer.files?.[0] ?? null)
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                                dragOver
                                    ? 'border-primary/50 bg-primary/5'
                                    : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                            />
                            {receiptPreview ? (
                                <img src={receiptPreview} alt="receipt" className="max-h-40 rounded-lg" />
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                                        <Icon name="cloud_upload" className="text-primary" />
                                    </div>
                                    <p className="text-sm font-bold">Drop your receipt here</p>
                                    <p className="text-[10px] text-on-surface-variant">JPG / PNG / WEBP</p>
                                </>
                            )}
                            {receiptFile && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleFile(null)
                                    }}
                                    className="text-[10px] uppercase tracking-widest text-primary font-bold hover:underline"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </section>

                    {error && (
                        <div className="text-sm text-error bg-error/10 border border-error/20 px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}
                </div>

                <footer className="p-8 bg-surface-container border-t border-outline-variant/10">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-headline font-bold text-lg flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(0,200,150,0.3)] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {submitting ? (
                            <span className="w-5 h-5 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>{isEdit ? 'Save Changes' : 'Add Expense'}</span>
                                <Icon name="arrow_forward" />
                            </>
                        )}
                    </button>
                </footer>
            </div>
        </div>
    )
}
