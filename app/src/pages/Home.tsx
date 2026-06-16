import { trpc } from '@/providers/trpc'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  Wallet, Globe, Shield, AlertTriangle,
  TrendingUp, TrendingDown, Plus, ArrowRight, BarChart3,
  Utensils, Plane, CreditCard, Film, ShoppingBag, HelpCircle
} from 'lucide-react'

const categoryIcons: Record<string, React.ElementType> = {
  food: Utensils, travel: Plane, bills: CreditCard,
  entertainment: Film, shopping: ShoppingBag, other: HelpCircle,
}

const categoryColors: Record<string, string> = {
  food: '#6366F1', travel: '#10B981', bills: '#F59E0B',
  entertainment: '#EF4444', shopping: '#8B5CF6', other: '#6B7280',
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
}

export default function Home() {
  const { data: recentExpenses } = trpc.expense.getRecent.useQuery({ limit: 5 })
  const { data: categoryData } = trpc.expense.getCategories.useQuery()
  const { data: safetyDist } = trpc.analytics.safetyDistribution.useQuery()
  const { data: countries } = trpc.country.list.useQuery({
    limit: 68, sortBy: 'overall_score', sortOrder: 'desc',
  })

  const topCountries = countries?.slice(0, 5)
  const criticalCountries = countries?.filter(c => c.advisoryLevel === 'critical' || c.advisoryLevel === 'high_risk').slice(0, 5)

  const totalExpenses = categoryData?.reduce((sum, c) => sum + (c.total || 0), 0) || 0
  const expenseCount = recentExpenses?.length || 0
  const safeCount = safetyDist?.safe || 0
  const alertCount = (safetyDist?.high_risk || 0) + (safetyDist?.critical || 0)

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-28 pb-12">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[var(--accent)] to-[#818CF8] p-8 sm:p-10 mb-6"
      >
        <div className="relative z-10">
          <h1 className="text-[28px] sm:text-[32px] font-medium text-white mb-2">
            Welcome to RoamSense
          </h1>
          <p className="text-[15px] text-white/80 mb-6">
            Track your expenses and explore travel safety insights across the globe.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-white text-[13px] font-medium">
              This Month: ${totalExpenses.toLocaleString()}
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-white text-[13px] font-medium">
              {safeCount} Safe Countries
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-white text-[13px] font-medium">
              {alertCount} Active Alerts
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.5" />
            <ellipse cx="100" cy="100" rx="80" ry="40" fill="none" stroke="white" strokeWidth="0.5" transform="rotate(20 100 100)" />
            <line x1="20" y1="100" x2="180" y2="100" stroke="white" strokeWidth="0.5" />
            <line x1="100" y1="20" x2="100" y2="180" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, trend: '+5.2%', trendUp: true, icon: Wallet },
          { label: 'Transactions', value: expenseCount.toString(), trend: 'This month', trendUp: true, icon: CreditCard },
          { label: 'Countries Tracked', value: (countries?.length || 0).toString(), trend: '+3 new', trendUp: true, icon: Globe },
          { label: 'Active Alerts', value: alertCount.toString(), trend: 'Monitor', trendUp: false, icon: AlertTriangle },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={cardVariants}
              className="bg-[var(--canvas)] border border-[var(--border)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{stat.label}</span>
                <Icon size={18} className="text-[var(--accent)]" />
              </div>
              <div className="text-[28px] font-semibold text-[var(--text-primary)] tracking-tight">{stat.value}</div>
              <div className={`flex items-center gap-1 mt-2 text-[12px] font-medium ${stat.trendUp ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                {stat.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.trend}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariants} className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'Add Expense', icon: Plus, href: '/expenses' },
          { label: 'Check Safety', icon: Shield, href: '/safety' },
          { label: 'View Analytics', icon: BarChart3, href: '/analytics' },
        ].map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.label} to={action.href}
              className="flex items-center gap-2 bg-white border border-[var(--border)] rounded-xl px-5 py-3 text-[14px] font-medium text-[var(--text-primary)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <Icon size={18} className="text-[var(--accent)]" />
              {action.label}
            </Link>
          )
        })}
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Expenses */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={cardVariants}
          className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-medium text-[var(--text-primary)]">Recent Transactions</h3>
            <Link to="/expenses" className="text-[13px] font-medium text-[var(--accent)] flex items-center gap-1 hover:underline">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {!recentExpenses?.length ? (
            <div className="text-center py-8 text-[var(--text-muted)] text-[14px]">
              No transactions yet. Add your first expense!
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const Icon = categoryIcons[expense.category] || HelpCircle
                const color = categoryColors[expense.category] || '#6B7280'
                return (
                  <div key={expense.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--accent-light)]/50 transition-colors">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-[var(--text-primary)] truncate">
                        {expense.description || expense.category}
                      </div>
                      <div className="text-[12px] text-[var(--text-muted)]">{expense.expenseDate}</div>
                    </div>
                    <div className={`text-[14px] font-semibold ${expense.status === 'pending' ? 'text-[var(--warning)]' : 'text-[var(--text-primary)]'}`}>
                      ${Number(expense.amount).toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Safety Overview */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={cardVariants}
          className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-medium text-[var(--text-primary)]">Safety Overview</h3>
            <Link to="/safety" className="text-[13px] font-medium text-[var(--accent)] flex items-center gap-1 hover:underline">
              Explore <ArrowRight size={14} />
            </Link>
          </div>
          {safetyDist && (
            <div className="flex gap-2 mb-4">
              {[
                { label: 'Safe', count: safetyDist.safe, color: 'var(--success)', bg: 'var(--success-light)' },
                { label: 'Moderate', count: safetyDist.moderate, color: 'var(--warning)', bg: 'var(--warning-light)' },
                { label: 'Risk', count: safetyDist.high_risk + safetyDist.critical, color: 'var(--danger)', bg: 'var(--danger-light)' },
              ].map((item) => (
                <div key={item.label} className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: item.bg }}>
                  <div className="text-[20px] font-semibold" style={{ color: item.color }}>{item.count}</div>
                  <div className="text-[11px] font-medium" style={{ color: item.color }}>{item.label}</div>
                </div>
              ))}
            </div>
          )}
          <div className="text-[13px] font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">Highest Risk Areas</div>
          <div className="space-y-2">
            {criticalCountries?.map((country) => (
              <div key={country.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-50 transition-colors">
                <span className="text-[20px]">{country.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-[var(--text-primary)]">{country.name}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[12px] font-semibold ${
                  country.advisoryLevel === 'critical'
                    ? 'bg-[var(--danger-light)] text-[var(--danger)]'
                    : 'bg-[var(--warning-light)] text-[var(--warning)]'
                }`}>
                  {country.overallScore}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Safe Countries */}
      <motion.div custom={7} initial="hidden" animate="visible" variants={cardVariants}
        className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-medium text-[var(--text-primary)]">Safest Destinations</h3>
          <Link to="/safety" className="text-[13px] font-medium text-[var(--accent)] flex items-center gap-1 hover:underline">
            View Globe <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {topCountries?.map((country) => (
            <div key={country.id} className="flex flex-col items-center p-4 rounded-xl bg-[var(--success-light)] hover:scale-105 transition-transform cursor-pointer">
              <span className="text-[32px] mb-2">{country.flag}</span>
              <span className="text-[13px] font-medium text-[var(--text-primary)] text-center">{country.name}</span>
              <span className="text-[12px] font-semibold text-[var(--success)] mt-1">{country.overallScore}/100</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
