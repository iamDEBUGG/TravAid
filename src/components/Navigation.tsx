import { Link, useLocation } from 'react-router'
import { LayoutDashboard, Wallet, Globe, BarChart3 } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/expenses', label: 'Expenses', icon: Wallet },
  { path: '/safety', label: 'Safety', icon: Globe },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-[720px] px-4">
      <div className="flex items-center justify-between bg-white/92 backdrop-blur-xl border border-[var(--border)] rounded-full px-2 py-1.5 shadow-sm">
        <Link to="/" className="flex items-center gap-2 pl-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#818CF8] flex items-center justify-center">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <span className="text-[15px] font-semibold text-[var(--text-primary)]">RoamSense</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="pr-3">
          <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" title="Online" />
        </div>
      </div>
    </nav>
  )
}
