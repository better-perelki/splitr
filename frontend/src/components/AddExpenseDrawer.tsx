import Icon from './Icon'

interface Props {
  open: boolean
  onClose: () => void
}

const categories = [
  { icon: 'restaurant', label: 'Food', active: true },
  { icon: 'directions_car', label: 'Transport' },
  { icon: 'hotel', label: 'Stay' },
  { icon: 'celebration', label: 'Fun' },
  { icon: 'shopping_bag', label: 'Shop' },
  { icon: 'more_horiz', label: 'Other' },
]

const splitMethods = ['Equal', 'Exact', '%', 'Shares']

export default function AddExpenseDrawer({ open, onClose }: Props) {
  return (
    <div className={`fixed inset-0 z-[60] ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-[480px] bg-surface-container border-l border-outline-variant/20 shadow-2xl z-10 flex flex-col overflow-hidden transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors"
            >
              <Icon name="close" className="text-on-surface-variant" />
            </button>
            <h2 className="text-xl font-bold font-headline tracking-tight">
              Add Expense
            </h2>
          </div>
          <div className="flex items-center gap-2 text-primary-fixed-dim">
            <Icon name="auto_awesome" className="text-sm" />
            <span className="text-[10px] font-headline uppercase tracking-widest font-bold">
              New Entry
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-8 pb-12 space-y-10">
          {/* Amount */}
          <section className="relative group">
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-1">
                Amount
              </label>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-light text-primary/50">
                  $
                </span>
                <input
                  autoFocus
                  type="text"
                  placeholder="0.00"
                  className="w-full bg-transparent border-none text-6xl font-headline font-bold text-on-surface focus:ring-0 focus:outline-none placeholder:text-surface-variant"
                />
              </div>
            </div>
          </section>

          {/* Description, Date, Group */}
          <section className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-1">
                Description
              </label>
              <div className="bg-surface-container-low px-4 py-3 rounded-xl flex items-center gap-3 focus-within:bg-surface-container-high transition-colors group">
                <Icon
                  name="edit_note"
                  className="text-surface-variant group-focus-within:text-primary transition-colors"
                />
                <input
                  type="text"
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
                <span className="text-sm font-medium">Mar 28, 2026</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-1">
                Group
              </label>
              <div className="bg-surface-container-low px-4 py-3 rounded-xl flex items-center gap-3">
                <Icon name="grid_view" className="text-surface-variant text-sm" />
                <span className="text-sm font-medium">Euro Trip '23</span>
              </div>
            </div>
          </section>

          {/* Category Grid */}
          <section className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-1">
              Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map(({ icon, label, active }) => (
                <button
                  key={label}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-colors ${
                    active
                      ? 'bg-surface-container-high border-primary/20 shadow-[0_0_15px_rgba(66,229,176,0.1)]'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container-high'
                  }`}
                >
                  <Icon
                    name={icon}
                    className={active ? 'text-primary' : 'text-on-surface-variant'}
                    filled={active}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-tighter">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Paid By */}
          <section className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-1">
                Paid By
              </label>
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container rounded-full text-sm font-bold">
                  <div className="w-5 h-5 rounded-full bg-on-primary-container/20" />
                  <span>You</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-full text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  <Icon name="add_circle" className="text-sm" />
                  <span>Multiple</span>
                </button>
              </div>
            </div>

            {/* Split Method */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-1">
                Split Method
              </label>
              <div className="flex bg-surface-container-low p-1 rounded-xl">
                {splitMethods.map((method, i) => (
                  <button
                    key={method}
                    className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg ${
                      i === 0
                        ? 'bg-surface-container-highest text-primary shadow-sm'
                        : 'text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Member List */}
              <div className="space-y-1">
                {['You', 'Sarah Miller'].map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl group hover:bg-surface-container-high transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-surface-variant" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-surface flex items-center justify-center">
                          <Icon
                            name="check"
                            className="text-[10px] text-on-primary font-bold"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{name}</p>
                        <p className="text-[10px] text-on-surface-variant">
                          Split included
                        </p>
                      </div>
                    </div>
                    <p className="font-headline font-bold text-on-surface-variant group-hover:text-primary transition-colors">
                      $0.00
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 opacity-50 bg-surface-container-low/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-variant grayscale" />
                    <div>
                      <p className="text-sm font-bold">Marco Rossi</p>
                      <p className="text-[10px] text-on-surface-variant">Excluded</p>
                    </div>
                  </div>
                  <Icon name="toggle_off" className="text-surface-variant" />
                </div>
              </div>
            </div>
          </section>

          {/* Receipt Upload */}
          <section className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-1">
              Receipt
            </label>
            <div className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="cloud_upload" className="text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">Drop your receipt here</p>
                <p className="text-[10px] text-on-surface-variant">
                  PDF, JPG or PNG (Max 10MB)
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <footer className="p-8 bg-surface-container border-t border-outline-variant/10">
          <button className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-headline font-bold text-lg flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(0,200,150,0.3)] active:scale-[0.98] transition-all">
            <span>Add Expense</span>
            <Icon name="arrow_forward" />
          </button>
          <p className="text-center text-[10px] text-on-surface-variant mt-4 font-medium uppercase tracking-[0.1em]">
            Split will be calculated automatically
          </p>
        </footer>
      </div>

      {/* Decorative glow */}
      <div className={`absolute top-20 right-[500px] w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}
