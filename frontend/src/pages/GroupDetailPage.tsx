import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import GroupModal from '../components/GroupModal'
import GroupMembersManager from '../components/GroupMembersManager'
import AddExpenseDrawer from '../components/AddExpenseDrawer'
import ExpenseDetailModal from '../components/ExpenseDetailModal'
import { groupsApi, type GroupDetailsResponse, type GroupUpdateRequest, type GroupMemberResponse } from '../api/groups'
import { expensesApi, type ExpenseResponse } from '../api/expenses'
import { useAuth } from '../contexts/AuthContext'

type TabType = 'expenses' | 'balances' | 'analytics' | 'members'

const CATEGORY_EMOJI: Record<string, string> = {
    FOOD: '🍕',
    TRANSPORT: '🚗',
    ACCOMMODATION: '🏨',
    ENTERTAINMENT: '🎉',
    SHOPPING: '🛒',
    UTILITIES: '⚡',
    OTHER: '📌',
}

function formatExpenseDate(iso: string) {
    const d = new Date(iso + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000)
    const formatted = d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
    if (diffDays === 0) return `Today, ${formatted}`
    if (diffDays === 1) return `Yesterday, ${formatted}`
    return formatted
}

export default function GroupDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [group, setGroup] = useState<GroupDetailsResponse | null>(null)
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
    const [expensesLoading, setExpensesLoading] = useState(true)
    const [expensesError, setExpensesError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('expenses')
    const [showEditModal, setShowEditModal] = useState(false)
    const [showAddDrawer, setShowAddDrawer] = useState(false)
    const [selectedExpense, setSelectedExpense] = useState<ExpenseResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const contentRef = useRef<HTMLDivElement>(null)

    const { user } = useAuth()
    const currentUserId = user?.id || ''

    const currentUserRole = group?.members.find((m) => m.user.id === currentUserId)?.role || 'MEMBER'

    const tabs: { key: TabType; label: string }[] = [
        { key: 'expenses', label: 'Expenses' },
        { key: 'balances', label: 'Balances' },
        { key: 'analytics', label: 'Analytics' },
        { key: 'members', label: 'Members & Settings' },
    ]

    const fetchGroupDetails = useCallback(() => {
        if (!id) return
        groupsApi
            .get(id)
            .then((data) => setGroup(data))
            .catch(() => setGroup(null))
            .finally(() => setLoading(false))
    }, [id])

    const fetchExpenses = useCallback(() => {
        if (!id) return
        expensesApi
            .list(id, 0, 50)
            .then((data) => {
                setExpenses(data.items)
                setExpensesError(null)
            })
            .catch((e: unknown) => {
                const err = e as { response?: { data?: { error?: string } }; message?: string }
                setExpensesError(err.response?.data?.error ?? err.message ?? 'Failed to load expenses')
            })
            .finally(() => setExpensesLoading(false))
    }, [id])

    useEffect(() => {
        fetchGroupDetails()
    }, [fetchGroupDetails])

    useEffect(() => {
        fetchExpenses()
    }, [fetchExpenses])

    const handleUpdateGroup = async (data: GroupUpdateRequest) => {
        if (!id || !group) return
        const updated = await groupsApi.update(id, data)
        setGroup({ ...group, ...updated })
    }

    const expensesByDate = useMemo(() => {
        const groups = new Map<string, ExpenseResponse[]>()
        for (const e of expenses) {
            const key = e.expenseDate
            if (!groups.has(key)) groups.set(key, [])
            groups.get(key)!.push(e)
        }
        return Array.from(groups.entries()).sort(([a], [b]) => (a < b ? 1 : -1))
    }, [expenses])

    const userBalance = useMemo(() => {
        let owed = 0
        for (const e of expenses) {
            const paid = e.payers.find((p) => p.user.id === currentUserId)?.amount ?? 0
            const share = e.splits.find((s) => s.user.id === currentUserId)?.amount ?? 0
            owed += paid - share
        }
        return owed
    }, [expenses, currentUserId])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    if (!group) {
        return (
            <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
                Group not found
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <section className="relative h-[320px] w-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 via-surface to-surface" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-12 w-full flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                                {group.type}
                            </span>
                            <span className="text-on-surface-variant font-headline text-sm tracking-widest uppercase opacity-70">
                                Active Expedition
                            </span>
                        </div>
                        <h1 className="font-headline text-5xl font-bold tracking-tighter text-on-surface mb-4">
                            {group.icon} {group.name}
                        </h1>
                        <div className="flex items-center gap-6">
                            <div className="flex -space-x-3">
                                {group.members.slice(0, 3).map((m: GroupMemberResponse) => (
                                    <div
                                        key={m.user.id}
                                        className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high ring-2 ring-primary/30 flex items-center justify-center text-xs font-bold text-primary shadow-lg overflow-hidden"
                                    >
                                        {m.user.avatarUrl ? (
                                            <img src={m.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            m.user.username[0].toUpperCase()
                                        )}
                                    </div>
                                ))}
                                {group.members.length > 3 && (
                                    <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-xs font-bold text-primary">
                                        +{group.members.length - 3}
                                    </div>
                                )}
                            </div>
                            <div className="h-8 w-px bg-outline-variant/30" />
                            <div className="flex items-baseline gap-2">
                                <span className="text-on-surface-variant text-sm font-medium">Group Currency:</span>
                                <span className="font-headline text-lg font-bold text-primary">{group.currency}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="bg-surface-container-highest/60 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/5 font-bold hover:bg-surface-container-highest transition-colors flex items-center gap-2"
                        >
                            <Icon name="edit" />
                            Edit
                        </button>
                        <button
                            onClick={() => setShowAddDrawer(true)}
                            className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 emerald-shadow"
                        >
                            <Icon name="add" filled />
                            New Expense
                        </button>
                    </div>
                </div>
            </section>

            <div className="px-12 border-b border-outline-variant/10 sticky top-0 bg-surface/80 backdrop-blur-md z-30">
                <div className="flex gap-12">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`py-6 border-b-2 font-medium tracking-wide relative ${
                                activeTab === tab.key
                                    ? 'border-primary text-primary font-bold'
                                    : 'border-transparent text-on-surface-variant hover:text-on-surface transition-colors'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.key && (
                                <div className="absolute -bottom-[2px] left-0 w-full h-[2px] bg-primary shadow-[0_0_12px_rgba(66,229,176,0.8)]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div ref={contentRef} className="px-12 py-10 grid grid-cols-12 gap-10">
                <div className="col-span-8 space-y-12">
                    {activeTab === 'members' && (
                        <div className="animate-fadeIn">
                            <GroupMembersManager
                                groupId={group.id}
                                members={group.members}
                                currentUserId={currentUserId}
                                currentUserRole={currentUserRole}
                                onMemberAdded={fetchGroupDetails}
                                onMemberRemoved={fetchGroupDetails}
                                onGroupLeft={() => navigate('/groups')}
                                onGroupDeleted={() => navigate('/groups')}
                            />
                        </div>
                    )}

                    {activeTab === 'expenses' && (
                        <>
                            {expensesLoading && (
                                <div className="flex justify-center py-20">
                                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                </div>
                            )}
                            {expensesError && (
                                <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                                    {expensesError}
                                </div>
                            )}
                            {!expensesLoading && expenses.length === 0 && !expensesError && (
                                <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                                    <Icon name="receipt_long" className="text-6xl mb-4 opacity-30" />
                                    <p className="font-headline text-lg font-bold mb-1">No expenses yet</p>
                                    <p className="text-sm opacity-60 mb-6">Add the first expense to start splitting.</p>
                                    <button
                                        onClick={() => setShowAddDrawer(true)}
                                        className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all flex items-center gap-2"
                                    >
                                        <Icon name="add" />
                                        Add Expense
                                    </button>
                                </div>
                            )}
                            {expensesByDate.map(([date, items]) => (
                                <div key={date}>
                                    <h3 className="font-headline text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-6 flex items-center gap-4">
                                        {formatExpenseDate(date)}
                                        <span className="flex-1 h-px bg-outline-variant/10" />
                                    </h3>
                                    <div className="space-y-4">
                                        {items.map((item) => {
                                            const payerName = item.payers[0]?.user.username ?? 'Unknown'
                                            const userPaid = item.payers.find((p) => p.user.id === currentUserId)?.amount ?? 0
                                            const userOwes = item.splits.find((s) => s.user.id === currentUserId)?.amount ?? 0
                                            const net = userPaid - userOwes
                                            const noteType: 'owe' | 'lent' | 'none' = net > 0.001 ? 'lent' : net < -0.001 ? 'owe' : 'none'
                                            const note =
                                                noteType === 'owe'
                                                    ? `You owe ${Math.abs(net).toFixed(2)}`
                                                    : noteType === 'lent'
                                                        ? `You lent ${net.toFixed(2)}`
                                                        : 'Settled'
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setSelectedExpense(item)}
                                                    className="group relative w-full text-left bg-surface-container-low hover:bg-surface-container transition-all duration-300 p-5 rounded-2xl flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 rounded-full bg-surface-container-high border-2 border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-inner">
                                                                {payerName[0]?.toUpperCase()}
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-container-high rounded-full flex items-center justify-center text-xs border border-white/5">
                                                                {CATEGORY_EMOJI[item.category] ?? '📌'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                                                                {item.description}
                                                            </h4>
                                                            <p className="text-sm text-on-surface-variant">
                                                                Paid by {payerName} • {item.splits.length} {item.splits.length === 1 ? 'person' : 'people'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-10">
                                                        <div className="text-right">
                                                            <div className="font-headline text-xl font-bold">
                                                                {item.amount.toFixed(2)}{' '}
                                                                <span className="text-sm opacity-50">{item.currency}</span>
                                                            </div>
                                                            <div
                                                                className={`text-xs font-medium ${
                                                                    noteType === 'owe'
                                                                        ? 'text-error'
                                                                        : noteType === 'lent'
                                                                            ? 'text-primary'
                                                                            : 'text-on-surface-variant'
                                                                }`}
                                                            >
                                                                {note}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {activeTab === 'balances' && (
                        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                            <Icon name="account_balance" className="text-6xl mb-4 opacity-30" />
                            <p className="font-headline text-lg font-bold mb-1">Balances coming soon</p>
                            <p className="text-sm opacity-60">Settlement plan will appear once we wire up the balance service.</p>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                            <Icon name="analytics" className="text-6xl mb-4 opacity-30" />
                            <p className="font-headline text-lg font-bold mb-1">Analytics Coming Soon</p>
                            <p className="text-sm opacity-60">Charts and spending insights will appear here.</p>
                        </div>
                    )}
                </div>

                <div className="col-span-4">
                    <div className="glass-panel p-8 rounded-3xl overflow-hidden relative border border-primary/10">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[100px]" />
                        <h3 className="font-headline text-xl font-bold mb-8 flex items-center gap-3">
                            <Icon name="account_balance_wallet" className="text-primary" />
                            Your Position
                        </h3>
                        <div className="p-6 bg-surface-container-high/40 rounded-2xl border border-white/5 mb-8">
                            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-2 font-bold">
                                {userBalance >= 0 ? 'You are owed' : 'You owe'}
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="font-headline text-3xl font-bold text-primary">
                                    {Math.abs(userBalance).toFixed(2)}
                                </span>
                                <span className="text-on-surface-variant text-sm font-medium">{group.currency}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-8 border border-outline-variant/10 rounded-3xl">
                        <h4 className="font-headline text-sm font-bold mb-6 uppercase tracking-widest text-on-surface-variant flex items-center justify-between">
                            <span>Members ({group.members.length})</span>
                            <button
                                onClick={() => {
                                    setActiveTab('members')
                                    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
                                }}
                                className="text-[10px] text-primary hover:underline font-bold tracking-widest bg-primary/10 px-3 py-1 rounded-lg transition-all active:scale-95"
                            >
                                Manage
                            </button>
                        </h4>
                        <div className="space-y-3">
                            {group.members.slice(0, 5).map((m) => (
                                <div key={m.user.id} className="flex items-center gap-3 p-2 rounded-2xl bg-surface-container-low/40 border border-white/[0.02] hover:bg-surface-container-low transition-all">
                                    <div className="w-9 h-9 rounded-full bg-surface-container-high border-2 border-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden flex-shrink-0">
                                        {m.user.avatarUrl ? (
                                            <img src={m.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            m.user.username[0].toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-on-surface">{m.user.username}</p>
                                        <p className="text-[10px] text-on-surface-variant">{m.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 p-8 border border-outline-variant/10 rounded-3xl">
                        <h4 className="font-headline text-sm font-bold mb-4 uppercase tracking-widest text-on-surface-variant">
                            Quick Stats
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-surface-container-low rounded-xl">
                                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                                    Total Spent
                                </div>
                                <div className="font-headline font-bold text-lg">
                                    {expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}{' '}
                                    <span className="text-xs opacity-50">{group.currency}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-surface-container-low rounded-xl">
                                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                                    Items
                                </div>
                                <div className="font-headline font-bold text-lg">{expenses.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <GroupModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleUpdateGroup}
                editGroup={group}
            />

            <AddExpenseDrawer
                open={showAddDrawer}
                onClose={() => setShowAddDrawer(false)}
                groupId={group.id}
                members={group.members}
                currency={group.currency}
                onSaved={() => {
                    fetchExpenses()
                    setShowAddDrawer(false)
                }}
            />

            <ExpenseDetailModal
                expense={selectedExpense}
                onClose={() => setSelectedExpense(null)}
                onChanged={() => fetchExpenses()}
                groupId={group.id}
                members={group.members}
                currency={group.currency}
            />
        </div>
    )
}
