import Icon from '../components/Icon'

const notifications = [
  { label: 'Push Notifications', desc: 'Alerts for new expenses and friend requests', on: true },
  { label: 'Monthly Reports', desc: 'Detailed PDF summaries of your spending', on: false },
  { label: 'Email Reminders', desc: 'Weekly alerts for unsettled debts', on: true },
]

export default function ProfilePage() {
  return (
    <div className="p-12 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Avatar & Accounts */}
        <div className="lg:col-span-4 space-y-8">
          {/* Profile Card */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-48 h-48 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 group-hover:rotate-45 transition-transform duration-700" />
              <div className="m-2 w-44 h-44 rounded-full bg-surface-variant overflow-hidden relative flex items-center justify-center">
                <span className="text-5xl font-headline font-bold text-on-surface-variant">
                  A
                </span>
                <div className="absolute inset-0 bg-surface/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Icon name="upload" className="text-primary text-3xl mb-1" />
                  <span className="text-[10px] font-headline uppercase tracking-widest text-primary">
                    Update Photo
                  </span>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
              Alex
            </h2>
            <p className="text-on-surface-variant text-sm font-body">
              @alex_splitr
            </p>
            <div className="mt-8 pt-8 border-t border-outline-variant/10 w-full grid grid-cols-2 gap-4">
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 font-headline">
                  Member Since
                </p>
                <p className="text-on-surface font-headline font-medium">
                  Nov 2023
                </p>
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 font-headline">
                  Status
                </p>
                <div className="flex items-center gap-1.5 text-primary font-headline font-medium">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#42e5b0]" />
                  Premium
                </div>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="p-6 rounded-3xl space-y-6">
            <h3 className="text-xs font-headline font-bold uppercase tracking-widest text-on-surface-variant px-2">
              Connected Accounts
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-surface-container-highest rounded-xl hover:bg-surface-variant transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-sm font-bold">
                    G
                  </div>
                  <span className="font-body font-medium">Google</span>
                </div>
                <span className="text-[10px] font-headline uppercase tracking-widest text-primary">
                  Connected
                </span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-surface-container-highest rounded-xl hover:bg-surface-variant transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-sm font-bold">
                    F
                  </div>
                  <span className="font-body font-medium">Facebook</span>
                </div>
                <span className="text-[10px] font-headline uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">
                  Connect
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-8 space-y-8">
          {/* Account Info */}
          <section className="glass-panel p-10 rounded-3xl">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-8 tracking-tight">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-headline ml-1">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue="Alex"
                  className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all font-body text-on-surface"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-headline ml-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    @
                  </span>
                  <input
                    type="text"
                    defaultValue="alex_splitr"
                    className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-5 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all font-body text-on-surface"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-headline ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="alex.v@ledger.io"
                  className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all font-body text-on-surface"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-headline ml-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 0123 4567"
                  className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all font-body text-on-surface"
                />
              </div>
            </div>
          </section>

          {/* Financial & Regional */}
          <section className="glass-panel p-10 rounded-3xl">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-8 tracking-tight">
              Financial & Regional Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-headline ml-1">
                  Default Currency
                </label>
                <select className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all font-body text-on-surface appearance-none">
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="PLN">PLN - Polish Zloty (zł)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-headline ml-1">
                  Timezone
                </label>
                <select className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-high transition-all font-body text-on-surface appearance-none">
                  <option value="PST">Pacific Standard Time (UTC-8)</option>
                  <option value="EST">Eastern Standard Time (UTC-5)</option>
                  <option value="GMT">Greenwich Mean Time (UTC+0)</option>
                  <option value="CET">Central European Time (UTC+1)</option>
                </select>
              </div>
            </div>

            {/* Notification Toggles */}
            <div className="space-y-6">
              <h4 className="text-xs font-headline font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                Notification Toggles
              </h4>
              {notifications.map((n) => (
                <div
                  key={n.label}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-headline font-medium text-on-surface">
                      {n.label}
                    </p>
                    <p className="text-xs text-on-surface-variant font-body mt-0.5">
                      {n.desc}
                    </p>
                  </div>
                  <button
                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                      n.on ? 'bg-primary' : 'bg-surface-container-highest'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all ${
                        n.on
                          ? 'right-1 bg-on-primary'
                          : 'left-1 bg-on-surface-variant'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 pb-12">
            <button className="text-error font-headline text-xs uppercase tracking-widest hover:brightness-125 transition-all opacity-60 hover:opacity-100 flex items-center gap-2">
              <Icon name="delete_forever" className="text-sm" />
              Delete Account
            </button>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-surface-container-highest text-on-surface font-headline font-bold text-sm tracking-tight rounded-xl border border-primary/10 hover:bg-surface-variant transition-all">
                Cancel Changes
              </button>
              <button className="px-8 py-3 bg-primary-container text-on-primary-container font-headline font-bold text-sm tracking-tight rounded-xl hover:brightness-110 shadow-lg shadow-primary/10 transition-all">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-outline-variant/10 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <h1 className="text-lg font-bold text-emerald-400/40 tracking-tighter font-headline">
            Splitr
          </h1>
          <div className="flex gap-8">
            {['Security', 'Privacy', 'Terms'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-[10px] text-on-surface-variant hover:text-primary font-headline uppercase tracking-widest transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
