import { useState, useEffect, useMemo } from 'react'
import Icon from './Icon'
import DateRangePicker from './DateRangePicker'
import { analyticsApi, type GroupAnalyticsResponse } from '../api/analytics'

const CATEGORY_EMOJI: Record<string, string> = {
    FOOD: '🍕',
    TRANSPORT: '🚗',
    ACCOMMODATION: '🏨',
    ENTERTAINMENT: '🎉',
    SHOPPING: '🛒',
    UTILITIES: '⚡',
    OTHER: '📌',
}

const CATEGORY_COLORS = [
    '#42e5b0', // primary green
    '#ffbca2', // warm peach
    '#7c8aff', // purple-blue
    '#ffd166', // gold
    '#ff6b8a', // pink
    '#36d1dc', // cyan
    '#c792ea', // lavender
]

type RangePreset = 'month' | '3months' | 'custom'

function formatYearMonth(ym: string): string {
    const [y, m] = ym.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(m, 10) - 1]} ${y.slice(2)}`
}

function getDateRange(preset: RangePreset): { from: string; to: string } {
    const now = new Date()
    const to = now.toISOString().slice(0, 10)

    if (preset === 'month') {
        const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
        return { from, to }
    }

    // 3 months
    const threeAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    const from = threeAgo.toISOString().slice(0, 10)
    return { from, to }
}

interface Props {
    groupId: string
    currency: string
}

export default function GroupAnalyticsTab({ groupId, currency }: Props) {
    const [preset, setPreset] = useState<RangePreset>('month')
    const [customFrom, setCustomFrom] = useState('')
    const [customTo, setCustomTo] = useState('')
    const [data, setData] = useState<GroupAnalyticsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const dateRange = useMemo(() => {
        if (preset === 'custom' && customFrom && customTo) {
            return { from: customFrom, to: customTo }
        }
        return getDateRange(preset === 'custom' ? 'month' : preset)
    }, [preset, customFrom, customTo])

    useEffect(() => {
        setLoading(true)
        setError(null)
        analyticsApi
            .get(groupId, dateRange.from, dateRange.to)
            .then((res) => setData(res))
            .catch(() => setError('Failed to load analytics'))
            .finally(() => setLoading(false))
    }, [groupId, dateRange.from, dateRange.to])

    // ---- Donut helpers ----
    const donutArcs = useMemo(() => {
        if (!data?.categoryBreakdown.length) return []
        const radius = 15.9
        const circumference = 2 * Math.PI * radius
        let offset = 0
        return data.categoryBreakdown.map((cat, i) => {
            const pct = cat.percentage / 100
            const dashLen = pct * circumference
            const arc = {
                dasharray: `${dashLen} ${circumference - dashLen}`,
                offset: -offset,
                color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                category: cat.category,
                amount: cat.amount,
                percentage: cat.percentage,
            }
            offset += dashLen
            return arc
        })
    }, [data])

    // ---- Bar chart helpers ----
    const maxMonthAmount = useMemo(() => {
        if (!data?.monthlyTrend.length) return 1
        return Math.max(...data.monthlyTrend.map((m) => m.amount), 1)
    }, [data])

    const currentYearMonth = useMemo(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    }, [])

    // ---- Ranking helpers ----
    const maxMemberAmount = useMemo(() => {
        if (!data?.memberRanking.length) return 1
        return Math.max(...data.memberRanking.map((m) => m.amount), 1)
    }, [data])

    return (
        <div className="space-y-10 animate-fadeIn">
            {/* Date Range Picker */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">
                        Group Analytics
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                        Spending insights for this group
                    </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/10">
                        <button
                            onClick={() => setPreset('month')}
                            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                                preset === 'month'
                                    ? 'bg-surface-container-highest text-primary font-bold shadow-sm'
                                    : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => setPreset('3months')}
                            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                                preset === '3months'
                                    ? 'bg-surface-container-highest text-primary font-bold shadow-sm'
                                    : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            3 Months
                        </button>
                        <button
                            onClick={() => {
                                if (preset !== 'custom') {
                                    const range = getDateRange('3months')
                                    setCustomFrom(range.from)
                                    setCustomTo(range.to)
                                }
                                setPreset('custom')
                            }}
                            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                                preset === 'custom'
                                    ? 'bg-surface-container-highest text-primary font-bold shadow-sm'
                                    : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            Custom
                            <Icon name="calendar_today" className="text-xs" />
                        </button>
                    </div>
                    {preset === 'custom' && (
                        <div className="animate-fadeIn">
                            <DateRangePicker
                                from={customFrom}
                                to={customTo}
                                onChange={(f, t) => {
                                    setCustomFrom(f)
                                    setCustomTo(t)
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Loading / Error */}
            {loading && (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            )}

            {error && (
                <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                    {error}
                </div>
            )}

            {!loading && !error && data && (
                <>
                    {/* Total Card */}
                    <div className="glass-card p-6 rounded-2xl border border-outline-variant/10 flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Icon name="analytics" className="text-primary text-2xl" />
                        </div>
                        <div>
                            <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
                                Total Spent
                            </p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="font-headline text-3xl font-bold text-on-surface">
                                    {data.totalSpent.toFixed(2)}
                                </span>
                                <span className="text-sm text-on-surface-variant font-medium">
                                    {currency}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Donut Chart — Categories */}
                        <div className="lg:col-span-5 glass-card p-8 rounded-3xl border border-outline-variant/10">
                            <h3 className="text-lg font-headline font-bold mb-6 text-on-surface">
                                Spending by Category
                            </h3>
                            {data.categoryBreakdown.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
                                    <Icon name="pie_chart" className="text-4xl mb-3 opacity-30" />
                                    <p className="text-sm opacity-60">No data for this period</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-6 overflow-hidden">
                                    <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="15.9"
                                                fill="transparent"
                                                stroke="rgba(255,255,255,0.05)"
                                                strokeWidth="3.8"
                                            />
                                            {donutArcs.map((arc, i) => (
                                                <circle
                                                    key={i}
                                                    cx="18"
                                                    cy="18"
                                                    r="15.9"
                                                    fill="transparent"
                                                    stroke={arc.color}
                                                    strokeWidth="4"
                                                    strokeDasharray={arc.dasharray}
                                                    strokeDashoffset={arc.offset}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-700"
                                                />
                                            ))}
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-xl font-headline font-bold">
                                                {data.totalSpent >= 1000
                                                    ? `${(data.totalSpent / 1000).toFixed(1)}k`
                                                    : data.totalSpent.toFixed(0)}
                                            </span>
                                            <span className="text-[10px] uppercase text-on-surface-variant tracking-widest">
                                                {currency}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-3 overflow-hidden">
                                        {data.categoryBreakdown.map((cat, i) => (
                                            <div key={cat.category} className="flex items-center gap-3 min-w-0 overflow-hidden">
                                                <div
                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{
                                                        backgroundColor:
                                                            CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                                                    }}
                                                />
                                                <span className="text-sm flex-shrink-0">
                                                    {CATEGORY_EMOJI[cat.category] ?? '📌'}
                                                </span>
                                                <div className="flex-1 min-w-0 flex justify-between gap-2 text-sm">
                                                    <span className="text-on-surface-variant capitalize truncate" title={cat.category.toLowerCase()}>
                                                        {cat.category.toLowerCase()}
                                                    </span>
                                                    <span className="font-bold text-on-surface flex-shrink-0">
                                                        {cat.percentage.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bar Chart — Monthly Trend */}
                        <div className="lg:col-span-7 glass-card p-8 rounded-3xl border border-outline-variant/10">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-lg font-headline font-bold text-on-surface">
                                    Monthly Trend
                                </h3>
                                <div className="flex items-center gap-2 text-xs font-headline text-on-surface-variant">
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                    Spending
                                </div>
                            </div>
                            {data.monthlyTrend.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
                                    <Icon name="bar_chart" className="text-4xl mb-3 opacity-30" />
                                    <p className="text-sm opacity-60">No data for this period</p>
                                </div>
                            ) : (
                                <div className="h-52 flex justify-between gap-3">
                                    {data.monthlyTrend.map((m) => {
                                        const heightPct = (m.amount / maxMonthAmount) * 100
                                        const isCurrent = m.yearMonth === currentYearMonth
                                        return (
                                            <div
                                                key={m.yearMonth}
                                                className="flex-1 flex flex-col items-center gap-3 group"
                                            >
                                                {/* Amount tooltip on hover */}
                                                <div className="text-[10px] font-bold text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {m.amount.toFixed(0)}
                                                </div>
                                                <div className="w-full flex-1 flex items-end">
                                                    <div
                                                        className={`w-full rounded-t-lg transition-all duration-500 ${
                                                            isCurrent
                                                                ? 'bg-primary shadow-[0_-8px_20px_rgba(66,229,176,0.3)]'
                                                                : 'bg-primary/30 group-hover:bg-primary/50'
                                                        }`}
                                                        style={{
                                                            height: `${Math.max(heightPct, 2)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    className={`text-[10px] font-headline uppercase ${
                                                        isCurrent
                                                            ? 'text-primary font-bold'
                                                            : 'text-on-surface-variant'
                                                    }`}
                                                >
                                                    {formatYearMonth(m.yearMonth)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Member Ranking */}
                    <div className="glass-card p-8 rounded-3xl border border-outline-variant/10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-headline font-bold text-on-surface">
                                    Top Spenders
                                </h3>
                                <p className="text-sm text-on-surface-variant">
                                    Ranked members by gross payment volume
                                </p>
                            </div>
                        </div>
                        {data.memberRanking.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
                                <Icon name="group" className="text-4xl mb-3 opacity-30" />
                                <p className="text-sm opacity-60">No spending data for this period</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {data.memberRanking.map((member, i) => {
                                    const barPct = (member.amount / maxMemberAmount) * 100
                                    const isTop = i === 0
                                    return (
                                        <div
                                            key={member.user.id}
                                            className={`flex items-center gap-5 group ${
                                                i > 0 ? 'opacity-80 hover:opacity-100 transition-opacity' : ''
                                            }`}
                                        >
                                            {/* Rank badge */}
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                    isTop
                                                        ? 'bg-primary/20 text-primary border border-primary/30'
                                                        : 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/10'
                                                }`}
                                            >
                                                {i + 1}
                                            </div>
                                            {/* Avatar */}
                                            <div
                                                className={`h-11 w-11 rounded-full bg-surface-container-highest border-2 shrink-0 flex items-center justify-center text-sm font-bold overflow-hidden ${
                                                    isTop
                                                        ? 'border-primary text-primary'
                                                        : 'border-outline-variant/20 text-on-surface-variant'
                                                }`}
                                            >
                                                {member.user.avatarUrl ? (
                                                    <img
                                                        src={member.user.avatarUrl}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    member.user.username[0].toUpperCase()
                                                )}
                                            </div>
                                            {/* Name + bar */}
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="font-headline font-bold text-on-surface">
                                                        {member.user.username}
                                                    </span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xs text-on-surface-variant font-headline">
                                                            {currency}
                                                        </span>
                                                        <span
                                                            className={`font-headline font-bold ${
                                                                isTop ? 'text-primary' : 'text-on-surface'
                                                            }`}
                                                        >
                                                            {member.amount.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${
                                                            isTop ? 'bg-primary' : 'bg-primary/40'
                                                        }`}
                                                        style={{ width: `${barPct}%` }}
                                                    />
                                                </div>
                                            </div>
                                            {/* Percentage */}
                                            <div className="w-14 text-right">
                                                <span className="text-xs font-bold text-on-surface-variant">
                                                    {member.percentage.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
