import { useState } from 'react'
import Icon from './Icon'
import AddExpenseDrawer from './AddExpenseDrawer'
import { expensesApi, type ExpenseResponse } from '../api/expenses'
import type { GroupMemberResponse } from '../api/groups'

interface Props {
    expense: ExpenseResponse | null
    onClose: () => void
    onChanged?: (expense: ExpenseResponse | null) => void
    groupId: string
    members: GroupMemberResponse[]
    currency: string
}

const CATEGORY_ICONS: Record<string, string> = {
    FOOD: 'restaurant',
    TRANSPORT: 'directions_car',
    ACCOMMODATION: 'hotel',
    ENTERTAINMENT: 'celebration',
    SHOPPING: 'shopping_bag',
    UTILITIES: 'bolt',
    OTHER: 'more_horiz',
}

export default function ExpenseDetailModal({ expense, onClose, onChanged, groupId, members, currency }: Props) {
    const [editing, setEditing] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!expense) return null

    const handleDelete = async () => {
        if (!confirm('Delete this expense?')) return
        setDeleting(true)
        try {
            await expensesApi.remove(expense.id)
            onChanged?.(null)
            onClose()
        } catch (e: unknown) {
            const err = e as { response?: { data?: { error?: string } }; message?: string }
            setError(err.response?.data?.error ?? err.message ?? 'Failed to delete')
        } finally {
            setDeleting(false)
        }
    }

    if (editing) {
        return (
            <AddExpenseDrawer
                open={true}
                onClose={() => setEditing(false)}
                groupId={groupId}
                members={members}
                currency={currency}
                expense={expense}
                onSaved={(saved) => {
                    onChanged?.(saved)
                    setEditing(false)
                }}
            />
        )
    }

    const categoryIcon = CATEGORY_ICONS[expense.category] ?? 'more_horiz'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg mx-4 bg-surface-container rounded-3xl border border-outline-variant/20 shadow-2xl animate-slideUp overflow-hidden"
            >
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative px-8 pt-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Icon name={categoryIcon} className="text-primary" filled />
                        </div>
                        <div>
                            <h2 className="font-headline text-2xl font-bold tracking-tight">{expense.description}</h2>
                            <p className="text-xs text-on-surface-variant">
                                {expense.expenseDate} • {expense.category}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-surface-container-highest/60 hover:bg-surface-container-highest transition-colors flex items-center justify-center text-on-surface-variant"
                    >
                        <Icon name="close" />
                    </button>
                </div>

                <div className="relative px-8 pb-8 space-y-6">
                    <div className="flex items-baseline gap-2">
                        <span className="font-headline text-4xl font-bold text-primary">
                            {expense.amount.toFixed(2)}
                        </span>
                        <span className="text-sm text-on-surface-variant font-bold">{expense.currency}</span>
                    </div>

                    {expense.receiptUrl && (
                        <a
                            href={expense.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-2xl overflow-hidden border border-outline-variant/20"
                        >
                            <img src={expense.receiptUrl} alt="Receipt" className="w-full max-h-64 object-cover" />
                        </a>
                    )}

                    <div>
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-3">
                            Paid by
                        </h3>
                        <div className="space-y-2">
                            {expense.payers.map((p) => (
                                <div
                                    key={p.user.id}
                                    className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl"
                                >
                                    <span className="text-sm font-bold">{p.user.username}</span>
                                    <span className="text-sm font-bold text-primary">
                                        {p.amount.toFixed(2)} {expense.currency}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-3">
                            Split ({expense.splitType.toLowerCase()})
                        </h3>
                        <div className="space-y-2">
                            {expense.splits.map((s) => (
                                <div
                                    key={s.user.id}
                                    className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl"
                                >
                                    <span className="text-sm font-bold">{s.user.username}</span>
                                    <span className="text-sm font-bold text-on-surface-variant">
                                        {s.amount.toFixed(2)} {expense.currency}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-error bg-error/10 border border-error/20 px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex-1 py-3 rounded-xl border border-error/20 text-error font-bold hover:bg-error/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Icon name="delete" />
                            Delete
                        </button>
                        <button
                            onClick={() => setEditing(true)}
                            className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Icon name="edit" />
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
