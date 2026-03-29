import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Icon from './Icon'
import AddExpenseDrawer from './AddExpenseDrawer'

const navItems = [
  { to: '/', icon: 'dashboard', label: 'Dashboard' },
  { to: '/groups', icon: 'group', label: 'Groups' },
  { to: '/friends', icon: 'person_add', label: 'Friends' },
  { to: '/analytics', icon: 'insights', label: 'Analytics' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
  { to: '/profile', icon: 'account_circle', label: 'Profile' },
]

const breadcrumbMap: Record<string, string> = {
  '/': 'Overview / Dashboard',
  '/groups': 'Groups',
  '/friends': 'Social Hub',
  '/analytics': 'Financial Insights',
  '/settings': 'Settings',
  '/profile': 'Settings / Profile',
}

export default function Layout() {
  const location = useLocation()
  const { logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const breadcrumb = breadcrumbMap[location.pathname] ?? ''

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 flex flex-col py-8 border-r border-emerald-500/10 bg-slate-950/40 backdrop-blur-xl shadow-[24px_0_40px_-20px_rgba(0,200,150,0.06)] z-50">
        <div className="px-8 mb-12">
          <h1 className="text-2xl font-bold text-emerald-400 tracking-tighter font-headline">
            Splitr
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 font-headline tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'text-emerald-400 font-bold border-r-2 border-emerald-400 bg-emerald-500/5'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon name={icon} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 mt-auto space-y-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full py-4 bg-primary-container text-on-primary-container rounded-xl font-headline font-bold text-sm tracking-tight hover:brightness-110 active:scale-95 transition-all"
          >
            + Add Expense
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-slate-400 hover:text-error font-medium rounded-xl hover:bg-error/5 transition-all"
          >
            <Icon name="logout" className="text-lg" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="flex items-center justify-between px-12 h-20 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
          <span className="font-headline text-sm uppercase tracking-widest text-slate-400">
            {breadcrumb}
          </span>
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:opacity-80 transition-opacity">
              <Icon name="notifications" />
            </button>
            <button className="text-slate-400 hover:opacity-80 transition-opacity">
              <Icon name="account_balance_wallet" />
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              className="ml-2 px-6 py-2 bg-primary-container text-on-primary-container font-bold rounded-xl text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
            >
              Add Expense
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Add Expense Drawer */}
      <AddExpenseDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
