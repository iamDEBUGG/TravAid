import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts'
import { BarChart3, TrendingUp, PieChart as PieIcon, Wallet } from 'lucide-react'

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | '1Y'>('30D')

  const now = new Date()
  const startDate = timeRange === '30D'
    ? new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0]
    : timeRange === '90D'
      ? new Date(now.getTime() - 90 * 86400000).toISOString().split('T')[0]
      : new Date(now.getTime() - 365 * 86400000).toISOString().split('T')[0]
  const endDate = now.toISOString().split('T')[0]

  const { data: categoryData } = trpc.analytics.categoryBreakdown.useQuery({ startDate, endDate })
  const { data: trendData } = trpc.analytics.spendingTrend.useQuery({ startDate, endDate, granularity: timeRange === '1Y' ? 'monthly' : 'daily' })
  const { data: monthlySummary } = trpc.analytics.monthlySummary.useQuery({ year: now.getFullYear(), month: now.getMonth() + 1 })
  const { data: safetyDist } = trpc.analytics.safetyDistribution.useQuery()
  const { data: regionalSummary } = trpc.analytics.regionalSummary.useQuery()

  const pieData = categoryData?.map(c => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    value: c.totalAmount, count: c.transactionCount,
  })) || []

  const trendChartData = trendData?.map(t => ({ period: t.period, amount: Number(t.totalAmount) || 0 })) || []

  const safetyPieData = safetyDist ? [
    { name: 'Safe', value: safetyDist.safe, color: '#10B981' },
    { name: 'Moderate', value: safetyDist.moderate, color: '#F59E0B' },
    { name: 'High Risk', value: safetyDist.high_risk, color: '#EF4444' },
    { name: 'Critical', value: safetyDist.critical, color: '#7C3AED' },
  ].filter(d => d.value > 0) : []

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-28 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[32px] font-medium text-[var(--text-primary)]">Analytics Dashboard</h1>
          <p className="text-[15px] text-[var(--text-muted)]">Deep insights into your finances and travel safety</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-[var(--border)] rounded-full p-1 shadow-sm">
          {(['30D', '90D', '1Y'] as const).map((range) => (
            <button key={range} onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${timeRange === range ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-gray-100'}`}>
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'This Month Spending', value: `$${(monthlySummary?.totalExpenses || 0).toLocaleString()}`, icon: Wallet, color: 'var(--accent)' },
          { label: 'Budget Used', value: `${monthlySummary?.budgetUsed || 0}%`, icon: TrendingUp, color: monthlySummary && monthlySummary.budgetUsed > 80 ? 'var(--danger)' : 'var(--success)' },
          { label: 'Top Category', value: monthlySummary?.topCategory ? monthlySummary.topCategory.charAt(0).toUpperCase() + monthlySummary.topCategory.slice(1) : 'N/A', icon: PieIcon, color: 'var(--warning)' },
          { label: 'Transactions', value: (monthlySummary?.transactionCount || 0).toString(), icon: BarChart3, color: 'var(--accent)' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={cardVariants}
              className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{stat.label}</span>
                <Icon size={18} style={{ color: stat.color }} />
              </div>
              <div className="text-[24px] font-semibold text-[var(--text-primary)] tracking-tight">{stat.value}</div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariants}
          className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <h3 className="text-[16px] font-medium text-[var(--text-primary)] mb-4">Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendChartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(15,23,41,0.08)', boxShadow: '0 4px 16px rgba(15,23,41,0.08)', fontSize: 13 }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
              <Area type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div custom={5} initial="hidden" animate="visible" variants={cardVariants}
          className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <h3 className="text-[16px] font-medium text-[var(--text-primary)] mb-4">Category Breakdown</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(15,23,41,0.08)', fontSize: 13 }}
                  formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[13px] text-[var(--text-secondary)] flex-1">{entry.name}</span>
                  <span className="text-[13px] font-semibold text-[var(--text-primary)]">${entry.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div custom={6} initial="hidden" animate="visible" variants={cardVariants}
          className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <h3 className="text-[16px] font-medium text-[var(--text-primary)] mb-4">Global Safety Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={safetyPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {safetyPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(15,23,41,0.08)', fontSize: 13 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div custom={7} initial="hidden" animate="visible" variants={cardVariants}
          className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <h3 className="text-[16px] font-medium text-[var(--text-primary)] mb-4">Regional Safety Scores</h3>
          <div className="space-y-4">
            {regionalSummary?.map((region) => {
              const barColor = region.avgScore >= 80 ? '#10B981' : region.avgScore >= 60 ? '#F59E0B' : '#EF4444'
              return (
                <div key={region.region}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[14px] font-medium text-[var(--text-primary)]">{region.region}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-[var(--text-muted)]">{region.countryCount} countries</span>
                      <span className="text-[14px] font-semibold" style={{ color: barColor }}>{region.avgScore}</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${region.avgScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full" style={{ backgroundColor: barColor }} />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
