import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon'

interface DateRangePickerProps {
    from: string
    to: string
    onChange: (from: string, to: string) => void
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

function parseISO(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
}

function formatISO(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function startOfDay(date: Date): Date {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

function formatRange(from: string, to: string): string {
    const f = parseISO(from)
    const t = parseISO(to)
    const fMonth = MONTHS[f.getMonth()].slice(0, 3)
    const tMonth = MONTHS[t.getMonth()].slice(0, 3)
    if (f.getFullYear() === t.getFullYear()) {
        if (f.getMonth() === t.getMonth()) {
            return `${fMonth} ${f.getDate()} – ${t.getDate()}, ${f.getFullYear()}`
        }
        return `${fMonth} ${f.getDate()} – ${tMonth} ${t.getDate()}, ${f.getFullYear()}`
    }
    return `${fMonth} ${f.getDate()}, ${f.getFullYear()} – ${tMonth} ${t.getDate()}, ${t.getFullYear()}`
}

function buildMonthGrid(view: Date): Date[] {
    const firstOfMonth = new Date(view.getFullYear(), view.getMonth(), 1)
    const dayOfWeek = (firstOfMonth.getDay() + 6) % 7 // Mon=0 .. Sun=6
    const start = new Date(firstOfMonth)
    start.setDate(firstOfMonth.getDate() - dayOfWeek)
    return Array.from({ length: 42 }, (_, i) => {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        return startOfDay(d)
    })
}

export default function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
    const [open, setOpen] = useState(false)
    const [view, setView] = useState(() => parseISO(from || formatISO(new Date())))
    const [pendingFrom, setPendingFrom] = useState<Date | null>(null)
    const [hover, setHover] = useState<Date | null>(null)
    const rootRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        function onDocClick(e: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false)
                setPendingFrom(null)
                setHover(null)
            }
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setOpen(false)
                setPendingFrom(null)
                setHover(null)
            }
        }
        document.addEventListener('mousedown', onDocClick)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onDocClick)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    const fromDate = useMemo(() => (from ? startOfDay(parseISO(from)) : null), [from])
    const toDate = useMemo(() => (to ? startOfDay(parseISO(to)) : null), [to])
    const grid = useMemo(() => buildMonthGrid(view), [view])
    const today = useMemo(() => startOfDay(new Date()), [])

    const [rangeStart, rangeEnd] = useMemo<[Date | null, Date | null]>(() => {
        if (pendingFrom) {
            const end = hover ?? pendingFrom
            return pendingFrom <= end ? [pendingFrom, end] : [end, pendingFrom]
        }
        return [fromDate, toDate]
    }, [pendingFrom, hover, fromDate, toDate])

    function handleDayClick(date: Date) {
        if (date > today) return
        if (pendingFrom === null) {
            setPendingFrom(date)
            setHover(null)
            return
        }
        const [a, b] = pendingFrom <= date ? [pendingFrom, date] : [date, pendingFrom]
        onChange(formatISO(a), formatISO(b))
        setPendingFrom(null)
        setHover(null)
        setOpen(false)
    }

    function shiftMonth(delta: number) {
        setView(new Date(view.getFullYear(), view.getMonth() + delta, 1))
    }

    return (
        <div className="relative" ref={rootRef}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-3 bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface hover:border-primary/40 focus:border-primary focus:outline-none transition-colors"
            >
                <Icon name="calendar_month" className="text-primary text-lg" />
                <span className="font-medium">
                    {from && to ? formatRange(from, to) : 'Select range'}
                </span>
                <Icon
                    name={open ? 'expand_less' : 'expand_more'}
                    className="text-on-surface-variant text-base"
                />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 z-50 glass-panel rounded-2xl border border-outline-variant/20 shadow-2xl p-4 w-[320px] animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={() => shiftMonth(-1)}
                            className="w-8 h-8 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                            aria-label="Previous month"
                        >
                            <Icon name="chevron_left" className="text-base" />
                        </button>
                        <div className="font-headline font-bold text-on-surface text-sm">
                            {MONTHS[view.getMonth()]} {view.getFullYear()}
                        </div>
                        <button
                            type="button"
                            onClick={() => shiftMonth(1)}
                            className="w-8 h-8 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                            aria-label="Next month"
                        >
                            <Icon name="chevron_right" className="text-base" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {WEEKDAYS.map((w) => (
                            <div
                                key={w}
                                className="text-center text-[10px] uppercase tracking-widest font-bold text-on-surface-variant"
                            >
                                {w}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {grid.map((d, i) => {
                            const inMonth = d.getMonth() === view.getMonth()
                            const isFuture = d > today
                            const isStart = !!rangeStart && d.getTime() === rangeStart.getTime()
                            const isEnd = !!rangeEnd && d.getTime() === rangeEnd.getTime()
                            const inRange =
                                !!rangeStart && !!rangeEnd && d >= rangeStart && d <= rangeEnd
                            const isEdge = isStart || isEnd
                            const isMiddle = inRange && !isEdge
                            const isToday = d.getTime() === today.getTime()

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    disabled={isFuture}
                                    onClick={() => handleDayClick(d)}
                                    onMouseEnter={() => pendingFrom && !isFuture && setHover(d)}
                                    className={`h-9 text-sm rounded-lg transition-colors ${
                                        isFuture
                                            ? 'text-on-surface-variant/25 cursor-not-allowed'
                                            : isEdge
                                              ? 'bg-primary text-on-primary font-bold'
                                              : isMiddle
                                                ? 'bg-primary/15 text-on-surface'
                                                : inMonth
                                                  ? 'text-on-surface hover:bg-surface-container-highest'
                                                  : 'text-on-surface-variant/40 hover:bg-surface-container-highest/50'
                                    } ${isToday && !isEdge ? 'ring-1 ring-primary/40' : ''}`}
                                >
                                    {d.getDate()}
                                </button>
                            )
                        })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-outline-variant/10 text-xs text-on-surface-variant text-center">
                        {pendingFrom ? 'Now pick an end date' : 'Pick a start date'}
                    </div>
                </div>
            )}
        </div>
    )
}
