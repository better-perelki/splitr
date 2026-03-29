import Icon from '../components/Icon'

const expenses = [
  {
    date: 'Today, Oct 14',
    items: [
      { title: 'Schronisko Murowaniec', payer: 'Maria', people: 3, amount: '145.00', currency: 'PLN', note: 'You owe $12.40', noteType: 'owe' as const, emoji: '🏨' },
      { title: 'Lunch at Kasprowy', payer: 'Alex', people: 5, amount: '312.50', currency: 'PLN', note: 'You lent $62.50', noteType: 'lent' as const, emoji: '🍕' },
    ],
  },
  {
    date: 'Yesterday, Oct 13',
    items: [
      { title: 'Park Entry Tickets', payer: 'Tom', people: 5, amount: '45.00', currency: 'PLN', note: 'You owe $9.00', noteType: 'owe' as const, emoji: '🏔️' },
    ],
  },
]

const balances = [
  { from: 'Alex', to: 'Maria', amount: '$45.00' },
  { from: 'Tom', to: 'Alex', amount: '$22.00' },
]

export default function GroupDetailPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[320px] w-full overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 via-surface to-surface" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-12 w-full flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                Travel
              </span>
              <span className="text-on-surface-variant font-headline text-sm tracking-widest uppercase opacity-70">
                Active Expedition
              </span>
            </div>
            <h1 className="font-headline text-5xl font-bold tracking-tighter text-on-surface mb-4">
              Tatra Mountains Trip 🏔️
            </h1>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {['A', 'M', 'T'].map((letter) => (
                  <div
                    key={letter}
                    className="w-10 h-10 rounded-full border-2 border-surface bg-surface-variant flex items-center justify-center text-xs font-bold text-on-surface-variant"
                  >
                    {letter}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-xs font-bold text-primary">
                  +2
                </div>
              </div>
              <div className="h-8 w-px bg-outline-variant/30" />
              <div className="flex items-baseline gap-2">
                <span className="text-on-surface-variant text-sm font-medium">
                  Group Currency:
                </span>
                <span className="font-headline text-lg font-bold text-primary">
                  PLN
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="bg-surface-container-highest/60 backdrop-blur-xl px-6 py-3 rounded-xl border border-white/5 font-bold hover:bg-surface-container-highest transition-colors flex items-center gap-2">
              <Icon name="share" />
              Invite
            </button>
            <button className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 emerald-shadow">
              <Icon name="add" filled />
              New Expense
            </button>
          </div>
        </div>
      </section>

      {/* Tab Bar */}
      <div className="px-12 border-b border-outline-variant/10 sticky top-0 bg-surface/80 backdrop-blur-md z-30">
        <div className="flex gap-12">
          {['Expenses', 'Balances', 'Analytics'].map((tab, i) => (
            <button
              key={tab}
              className={`py-6 border-b-2 font-medium tracking-wide relative ${
                i === 0
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface transition-colors'
              }`}
            >
              {tab}
              {i === 0 && (
                <div className="absolute -bottom-[2px] left-0 w-full h-[2px] bg-primary shadow-[0_0_12px_rgba(66,229,176,0.8)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-12 py-10 grid grid-cols-12 gap-10">
        {/* Expenses */}
        <div className="col-span-8 space-y-12">
          {expenses.map((section) => (
            <div key={section.date}>
              <h3 className="font-headline text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-6 flex items-center gap-4">
                {section.date}
                <span className="flex-1 h-px bg-outline-variant/10" />
              </h3>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div
                    key={item.title}
                    className="group relative bg-surface-container-low hover:bg-surface-container transition-all duration-300 p-5 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-surface-variant ring-2 ring-primary/20 flex items-center justify-center text-sm font-bold text-on-surface-variant">
                          {item.payer[0]}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-container-high rounded-full flex items-center justify-center text-xs border border-white/5">
                          {item.emoji}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-sm text-on-surface-variant">
                          Paid by {item.payer} • {item.people} people
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-right">
                        <div className="font-headline text-xl font-bold">
                          {item.amount}{' '}
                          <span className="text-sm opacity-50">
                            {item.currency}
                          </span>
                        </div>
                        <div
                          className={`text-xs font-medium ${
                            item.noteType === 'owe'
                              ? 'text-error'
                              : 'text-primary'
                          }`}
                        >
                          {item.note}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-10 h-10 rounded-lg hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant transition-colors">
                          <Icon name="edit" className="text-[20px]" />
                        </button>
                        <button className="w-10 h-10 rounded-lg hover:bg-error/10 hover:text-error flex items-center justify-center text-on-surface-variant transition-colors">
                          <Icon name="delete" className="text-[20px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Balances Panel */}
        <div className="col-span-4">
          <div className="glass-panel p-8 rounded-3xl overflow-hidden relative border border-primary/10">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[100px]" />
            <h3 className="font-headline text-xl font-bold mb-8 flex items-center gap-3">
              <Icon name="account_balance_wallet" className="text-primary" />
              Group Balances
            </h3>
            <div className="space-y-6 mb-10">
              {balances.map((b) => (
                <div
                  key={`${b.from}-${b.to}`}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-surface-variant border border-primary/20 flex items-center justify-center text-[10px] font-bold">
                      {b.from[0]}
                    </div>
                    <Icon
                      name="arrow_forward"
                      className="text-on-surface-variant text-sm"
                    />
                    <div className="w-8 h-8 rounded-full bg-surface-variant border border-primary/20 flex items-center justify-center text-[10px] font-bold">
                      {b.to[0]}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-headline font-bold text-lg">
                      {b.amount}
                    </div>
                    <button className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                      Mark as Settled
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-surface-container-high/40 rounded-2xl border border-white/5 mb-8">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-2 font-bold">
                Your Status
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-on-surface-variant text-sm font-medium">
                  You are owed
                </span>
                <span className="font-headline text-3xl font-bold text-primary">
                  $38.10
                </span>
              </div>
            </div>

            <button className="w-full py-4 bg-primary/10 border border-primary/20 text-primary rounded-xl font-bold hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
              <Icon name="payments" />
              Settle All
            </button>
          </div>

          {/* Quick Stats */}
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
                  1,420 <span className="text-xs opacity-50">PLN</span>
                </div>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl">
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                  Items
                </div>
                <div className="font-headline font-bold text-lg">12</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
