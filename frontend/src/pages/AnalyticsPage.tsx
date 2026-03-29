import Icon from '../components/Icon'

const stats = [
  { label: 'Total Spent', value: '4,285.50', prefix: '$', icon: 'analytics', iconColor: 'text-primary', trend: '12.4% vs last period', highlight: true },
  { label: 'You Owe', value: '842.20', prefix: '$', icon: 'outbound', iconColor: 'text-error', sub: 'Pending across 4 groups' },
  { label: 'Owed to You', value: '1,120.00', prefix: '$', icon: 'account_balance_wallet', iconColor: 'text-primary', valueColor: 'text-primary', sub: 'Collectable from 12 friends' },
  { label: 'Settlements', value: '18', icon: 'handshake', iconColor: 'text-tertiary', sub: 'This quarter', suffix: 'Finalized' },
]

const categories = [
  { name: 'Dining Out', pct: 45, color: 'bg-primary' },
  { name: 'Travel', pct: 25, color: 'bg-tertiary' },
  { name: 'Groceries', pct: 15, color: 'bg-primary-fixed-dim' },
  { name: 'Others', pct: 15, color: 'bg-surface-container-high' },
]

const months = [
  { label: 'Jan', height: '60%', fill: '40%', active: false },
  { label: 'Feb', height: '85%', fill: '60%', active: false },
  { label: 'Mar', height: '45%', fill: '30%', active: false },
  { label: 'Apr', height: '100%', fill: '75%', active: true },
  { label: 'May', height: '70%', fill: '50%', active: false },
  { label: 'Jun', height: '55%', fill: '35%', active: false },
]

const topSpenders = [
  { name: 'Piotr Kowalski', amount: '1,842.00', pct: 85, color: 'bg-primary', borderColor: 'border-primary' },
  { name: 'Zofia Nowak', amount: '1,240.50', pct: 62, color: 'bg-tertiary', borderColor: 'border-tertiary' },
  { name: 'You', amount: '842.20', pct: 42, color: 'bg-on-surface-variant', borderColor: 'border-outline-variant/30', dim: true },
]

export default function AnalyticsPage() {
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
        <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/10">
          <button className="px-6 py-2 text-sm font-medium rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">
            This Month
          </button>
          <button className="px-6 py-2 text-sm font-bold rounded-lg bg-surface-container-highest text-primary shadow-sm">
            Last 3 Months
          </button>
          <button className="px-6 py-2 text-sm font-medium rounded-lg text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-2">
            Custom
            <Icon name="calendar_today" className="text-xs" />
          </button>
        </div>
      </section>

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
              {s.prefix && (
                <span className="text-on-surface-variant opacity-50 font-headline">
                  {s.prefix}
                </span>
              )}
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
            {s.trend && (
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary">
                <Icon name="trending_up" className="text-sm" />
                <span>{s.trend}</span>
              </div>
            )}
            {s.sub && (
              <p className="mt-4 text-xs text-on-surface-variant">{s.sub}</p>
            )}
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
          <div className="flex items-center justify-between gap-8">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3.8" />
                <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#42e5b0" strokeWidth="4" strokeDasharray="45, 100" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#ffbca2" strokeWidth="4" strokeDasharray="25, 100" strokeDashoffset="-45" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#3adfab" strokeWidth="4" strokeDasharray="15, 100" strokeDashoffset="-70" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#25293a" strokeWidth="4" strokeDasharray="15, 100" strokeDashoffset="-85" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-headline font-bold">$4.2k</span>
                <span className="text-[10px] uppercase text-on-surface-variant tracking-widest">
                  Total
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                  <div className="flex-1 flex justify-between text-sm">
                    <span className="text-on-surface-variant">{cat.name}</span>
                    <span className="font-bold text-on-surface">{cat.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          <div className="h-48 flex items-end justify-between gap-4">
            {months.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-4 group">
                <div
                  className={`w-full rounded-t-lg relative transition-all duration-300 ${
                    m.active ? '' : 'bg-surface-container-high group-hover:bg-primary/20'
                  }`}
                  style={{ height: m.height }}
                >
                  <div
                    className={`absolute inset-x-0 bottom-0 rounded-t-lg ${
                      m.active
                        ? 'bg-primary shadow-[0_-8px_20px_rgba(66,229,176,0.3)]'
                        : 'bg-primary/40'
                    }`}
                    style={{ height: m.fill }}
                  />
                </div>
                <span
                  className={`text-[10px] font-headline uppercase ${
                    m.active
                      ? 'text-primary font-bold'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
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
            <button className="text-primary font-headline text-sm font-bold flex items-center gap-2 hover:opacity-80">
              View All Groups{' '}
              <Icon name="arrow_forward" className="text-sm" />
            </button>
          </div>
          <div className="space-y-8">
            {topSpenders.map((sp) => (
              <div
                key={sp.name}
                className={`flex items-center gap-6 group ${sp.dim ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}`}
              >
                <div
                  className={`h-12 w-12 rounded-full bg-surface-container-highest border-2 ${sp.borderColor} shrink-0 flex items-center justify-center text-sm font-bold text-on-surface-variant`}
                >
                  {sp.name[0]}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-headline font-bold text-on-surface">
                      {sp.name}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-on-surface-variant font-headline">
                        $
                      </span>
                      <span
                        className={`font-headline font-bold ${sp.name === 'Piotr Kowalski' ? 'text-primary' : 'text-on-surface'}`}
                      >
                        {sp.amount}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sp.color}`}
                      style={{ width: `${sp.pct}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right">
                  <span className="text-xs font-bold text-on-surface-variant">
                    {sp.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
