import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/groups', label: 'Groups' },
  { to: '/friends', label: 'Friends' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
]

export default function Layout() {
  return (
    <div className="flex h-screen">
      <aside className="w-56 shrink-0 bg-gray-900 text-gray-100 flex flex-col p-4">
        <h1 className="text-xl font-bold tracking-tight mb-8">splitr</h1>
        <nav className="flex flex-col gap-1">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <Outlet />
      </main>
    </div>
  )
}
