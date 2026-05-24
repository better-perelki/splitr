import { useState, useEffect, useMemo } from 'react'
import Icon from '../components/Icon'
import DateRangePicker from '../components/DateRangePicker'
import { analyticsApi, type GlobalAnalyticsResponse } from '../api/analytics'

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
    '#42e5b0',
    '#ffbca2',
    '#7c8aff',
    '#ffd166',
    '#ff6b8a',
    '#36d1dc',
    '#c792ea',
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
    const threeAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    const from = threeAgo.toISOString().slice(0, 10)
    return { from, to }
}

export default function AnalyticsPage() {
    const [preset, setPreset] = useState<RangePreset>('3months')
    const [customFrom, setCustomFrom] = useState('')
    const [customTo, setCustomTo] = useState('')
    const [data, setData] = useState<GlobalAnalyticsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const dateRange = useMemo(() => {
        if (preset === 'custom' && customFrom && customTo) {
            return { from: customFrom, to: customTo }
        }
        return getDateRange(preset === 'custom' ? '3months' : preset)
    }, [preset, customFrom, customTo])

    useEffect(() => {
        setLoading(true)
        setError(null)
        analyticsApi
            .getGlobal(dateRange.from, dateRange.to)
            .then((res) => setData(res))
            .catch(() => setError('Failed to load analytics'))
            .finally(() => setLoading(false))
    }, [dateRange.from, dateRange.to])

    // Donut arcs
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
                percentage: cat.percentage,
            }
            offset += dashLen
            return arc
        })
    }, [data])

    const maxMonthAmount = useMemo(() => {
        if (!data?.monthlyTrend.length) return 1
        return Math.max(...data.monthlyTrend.map((m) => m.amount), 1)
    }, [data])

    const currentYearMonth = useMemo(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    }, [])

    const maxMemberAmount = useMemo(() => {
        if (!data?.memberRanking.length) return 1
        return Math.max(...data.memberRanking.map((m) => m.amount), 1)
    }, [data])

    const stats = useMemo(() => {
        if (!data) return []
        return [
            {
                label: 'Total Spent',
                value: `${data.totalSpent.toFixed(2)} PLN`,
                icon: 'analytics',
                iconColor: 'text-primary',
                highlight: true,
            },
            {
                label: 'You Owe',
                value: `${data.youOwe.toFixed(2)} PLN`,
                icon: 'outbound',
                iconColor: 'text-error',
                valueColor: data.youOwe > 0 ? 'text-error' : undefined,
            },
            {
                label: 'Owed to You',
                value: `${data.owedToYou.toFixed(2)} PLN`,
                icon: 'account_balance_wallet',
                iconColor: 'text-primary',
                valueColor: 'text-primary',
            },
            {
                label: 'Settlements',
                value: String(data.settlementsCount),
                icon: 'handshake',
                iconColor: 'text-tertiary',
                suffix: 'Finalized',
            },
        ]
    }, [data])

    return (
        <div className="p-12 space-y-12">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-5xl font-bold font-headline tracking-tighter text-on-surface">
                        Financial <span className="text-primary italic">Intelligence</span>
                    </h2>
                    <p className="text-on-surface-variant mt-2 max-w-md">
                        Detailed breakdown of your spending habits and collective debt cycles
                        across all active groups.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/10">
                        <button
                            onClick={() => setPreset('month')}
                            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                                preset === 'month'
                                    ? 'bg-surface-container-highest text-primary font-bold shadow-sm'
                                    : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => setPreset('3months')}
                            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                                preset === '3months'
                                    ? 'bg-surface-container-highest text-primary font-bold shadow-sm'
                                    : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            Last 3 Months
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
                            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
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
            </section>

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
                    {/* Stat Cards */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((s) => (
                            <div
                                key={s.label}
                                className={`glass-card p-8 rounded-3xl border border-outline-variant/10 relative overflow-hidden group ${
                                    s.highlight ? 'emerald-shadow' : ''
                                }`}
                            >
                                {s.highlight && (
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                                )}
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-xs font-headline uppercase tracking-widest text-on-surface-variant">
                                        {s.label}
                                    </span>
                                    <Icon name={s.icon} className={s.iconColor} />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span
                                        className={`text-4xl font-headline font-bold ${s.valueColor ?? 'text-on-surface'}`}
                                    >
                                        {s.value}
                                    </span>
                                    {s.suffix && (
                                        <span className="text-sm text-on-surface-variant font-medium ml-2">
                                            {s.suffix}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Charts Row */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Donut Chart */}
                        <div className="lg:col-span-5 glass-card p-10 rounded-3xl border border-outline-variant/10">
                            <h3 className="text-xl font-headline font-bold mb-8 text-on-surface">
                                Spending by Category
                            </h3>
                            {data.categoryBreakdown.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
                                    <Icon name="pie_chart" className="text-4xl mb-3 opacity-30" />
                                    <p className="text-sm opacity-60">No data for this period</p>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                                    <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
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
                                            <span className="text-2xl font-headline font-bold">
                                                {data.totalSpent >= 1000
                                                    ? `${(data.totalSpent / 1000).toFixed(1)}k PLN`
                                                    : `${data.totalSpent.toFixed(0)} PLN`}
                                            </span>
                                            <span className="text-[10px] uppercase text-on-surface-variant tracking-widest">
                                                Total
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full space-y-4">
                                        {data.categoryBreakdown.map((cat, i) => (
                                            <div key={cat.category} className="flex items-center gap-3">
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

                        {/* Bar Chart */}
                        <div className="lg:col-span-7 glass-card p-10 rounded-3xl border border-outline-variant/10">
                            <div className="flex justify-between items-start mb-8">
                                <h3 className="text-xl font-headline font-bold text-on-surface">
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
                                <div className="h-48 flex justify-between gap-4">
                                    {data.monthlyTrend.map((m) => {
                                        const heightPct = (m.amount / maxMonthAmount) * 100
                                        const isCurrent = m.yearMonth === currentYearMonth
                                        return (
                                            <div
                                                key={m.yearMonth}
                                                className="flex-1 flex flex-col items-center gap-4 group"
                                            >
                                                <div className="text-[10px] font-bold text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {m.amount.toFixed(0)} PLN
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

                        {/* Top Spenders */}
                        <div className="lg:col-span-12 glass-card p-10 rounded-3xl border border-outline-variant/10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-xl font-headline font-bold text-on-surface">
                                        Top Spenders in Your Groups
                                    </h3>
                                    <p className="text-sm text-on-surface-variant">
                                        Ranked members by gross contribution volume.
                                    </p>
                                </div>
                            </div>
                            {data.memberRanking.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
                                    <Icon name="group" className="text-4xl mb-3 opacity-30" />
                                    <p className="text-sm opacity-60">No spending data for this period</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {data.memberRanking.map((sp, i) => {
                                        const barPct = (sp.amount / maxMemberAmount) * 100
                                        const isTop = i === 0
                                        return (
                                            <div
                                                key={sp.user.id}
                                                className={`flex items-center gap-6 group ${
                                                    i > 0
                                                        ? 'opacity-70 hover:opacity-100 transition-opacity'
                                                        : ''
                                                }`}
                                            >
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                        isTop
                                                            ? 'bg-primary/20 text-primary border border-primary/30'
                                                            : 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/10'
                                                    }`}
                                                >
                                                    {i + 1}
                                                </div>
                                                <div
                                                    className={`h-12 w-12 rounded-full bg-surface-container-highest border-2 shrink-0 flex items-center justify-center text-sm font-bold overflow-hidden ${
                                                        isTop
                                                            ? 'border-primary text-primary'
                                                            : 'border-outline-variant/20 text-on-surface-variant'
                                                    }`}
                                                >
                                                    {sp.user.avatarUrl ? (
                                                        <img
                                                            src={sp.user.avatarUrl}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        sp.user.username[0].toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="font-headline font-bold text-on-surface">
                                                            {sp.user.username}
                                                        </span>
                                                        <span
                                                            className={`font-headline font-bold ${
                                                                isTop ? 'text-primary' : 'text-on-surface'
                                                            }`}
                                                        >
                                                            {sp.amount.toFixed(2)} PLN
                                                        </span>
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
                                                <div className="w-16 text-right">
                                                    <span className="text-xs font-bold text-on-surface-variant">
                                                        {sp.percentage.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    )
}
