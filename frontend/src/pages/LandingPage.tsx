import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

const features = [
  {
    icon: 'receipt_long',
    title: 'Track Expenses',
    description: 'Log shared expenses in seconds and keep a clear record.',
  },
  {
    icon: 'groups',
    title: 'Group Splits',
    description: 'Create groups for trips, roommates, or any occasion.',
  },
  {
    icon: 'account_balance',
    title: 'Smart Settlements',
    description: 'Minimize transactions with optimized debt resolution.',
  },
  {
    icon: 'insights',
    title: 'Analytics',
    description: 'Visualize spending patterns and track balances over time.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-headline text-xl font-bold text-primary tracking-tighter">
            Splitr
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold text-on-surface hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 text-sm font-bold bg-primary text-on-primary-fixed rounded-xl hover:brightness-110 active:scale-95 transition-all"
            >
              Sign up free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] emerald-glow opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] emerald-glow opacity-15 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <Icon name="auto_awesome" className="text-sm" />
            Split expenses effortlessly
          </div>

          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Stop chasing
            <br />
            <span className="text-primary">IOUs.</span>
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            Splitr makes shared expenses simple. Track, split, and settle up
            with friends - all in one beautifully crafted app.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="px-8 py-4 bg-primary text-on-primary-fixed font-bold rounded-xl text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all emerald-shadow"
            >
              Get started — it's free
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 glass-card border border-white/10 text-on-surface font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-surface-container-high/60 active:scale-95 transition-all"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-center mb-16">
            Everything you need to
            <span className="text-primary"> split fairly</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass-card p-6 rounded-2xl border border-white/5 hover:border-primary/20 hover:scale-[1.03] transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Icon name={f.icon} className="text-primary" />
                </div>
                <h3 className="font-headline font-bold text-lg mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center glass-card p-12 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 emerald-glow opacity-10 pointer-events-none" />
          <h2 className="relative font-headline text-3xl font-bold tracking-tight mb-4">
            Ready to simplify your splits?
          </h2>
          <p className="relative text-on-surface-variant mb-8">
            Join Splitr today and never argue about money with friends again.
          </p>
          <Link
            to="/signup"
            className="relative inline-block px-8 py-4 bg-primary text-on-primary-fixed font-bold rounded-xl text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-on-surface-variant">
          <span className="font-headline font-bold text-primary tracking-tighter">
            Splitr
          </span>
        </div>
      </footer>
    </div>
  )
}
