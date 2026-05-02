import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Calendar, Filter, Trash2, Edit2,
  Utensils, Plane, CreditCard, Film, ShoppingBag, HelpCircle, X
} from 'lucide-react'

const categoryIcons: Record<string, React.ElementType> = {
  food: Utensils, travel: Plane, bills: CreditCard,
  entertainment: Film, shopping: ShoppingBag, other: HelpCircle,
}

const categoryColors: Record<string, string> = {
  food: '#6366F1', travel: '#10B981', bills: '#F59E0B',
  entertainment: '#EF4444', shopping: '#8B5CF6', other: '#6B7280',
}

const categories = ['food', 'travel', 'bills', 'entertainment', 'shopping', 'other'] as const

export default function Expenses() {
  const utils = trpc.useUtils()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    amount: '', category: 'food' as string, description: '',
    paymentMethod: '', merchant: '',
    expenseDate: new Date().toISOString().split('T')[0],
  })

  const { data, isLoading } = trpc.expense.list.useQuery(
    { page, limit: 12, search: search || undefined, category: categoryFilter || undefined }
  )

  const createMutation = trpc.expense.create.useMutation({
    onSuccess: () => { utils.expense.list.invalidate(); utils.expense.getCategories.invalidate(); utils.expense.getRecent.invalidate(); resetForm() },
  })

  const updateMutation = trpc.expense.update.useMutation({
    onSuccess: () => { utils.expense.list.invalidate(); utils.expense.getCategories.invalidate(); resetForm() },
  })

  const deleteMutation = trpc.expense.delete.useMutation({
    onSuccess: () => { utils.expense.list.invalidate(); utils.expense.getCategories.invalidate() },
  })

  const resetForm = () => {
    setFormData({ amount: '', category: 'food', description: '', paymentMethod: '', merchant: '', expenseDate: new Date().toISOString().split('T')[0] })
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || isNaN(Number(formData.amount))) return
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData })
    } else {
      createMutation.mutate({
        amount: formData.amount,
        category: formData.category as any,
        description: formData.description || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        merchant: formData.merchant || undefined,
        expenseDate: formData.expenseDate,
      })
    }
  }

  const handleEdit = (expense: any) => {
    setFormData({
      amount: expense.amount, category: expense.category,
      description: expense.description || '', paymentMethod: expense.paymentMethod || '',
      merchant: expense.merchant || '', expenseDate: expense.expenseDate,
    })
    setEditingId(expense.id)
    setShowForm(true)
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-28 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[32px] font-medium text-[var(--text-primary)]">Expense Management</h1>
          <p className="text-[15px] text-[var(--text-muted)]">Track, categorize, and analyze your spending</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-[var(--accent)] text-white px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-[var(--accent)]/90 transition-all shadow-sm">
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white border border-[var(--border)] rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="text" placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]" />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[var(--border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 appearance-none bg-white cursor-pointer">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-white border border-[var(--border)] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-medium">{editingId ? 'Edit Expense' : 'Add New Expense'}</h3>
              <button onClick={resetForm} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Amount *</label>
                <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" placeholder="0.00" />
              </div>
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Category *</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20">
                  {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Date *</label>
                <input type="date" required value={formData.expenseDate} onChange={e => setFormData({ ...formData, expenseDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
              </div>
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" placeholder="What was this for?" />
              </div>
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Merchant</label>
                <input type="text" value={formData.merchant} onChange={e => setFormData({ ...formData, merchant: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" placeholder="Store or vendor" />
              </div>
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Payment Method</label>
                <input type="text" value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" placeholder="Credit card, cash..." />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3">
                <button type="button" onClick={resetForm}
                  className="px-5 py-2.5 rounded-full border border-[var(--border)] text-[14px] font-medium text-[var(--text-secondary)] hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 rounded-full bg-[var(--accent)] text-white text-[14px] font-medium hover:bg-[var(--accent)]/90 disabled:opacity-50">
                  {editingId ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-[var(--border)] rounded-2xl p-5 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="bg-white border border-[var(--border)] rounded-2xl p-12 text-center shadow-sm">
          <p className="text-[var(--text-muted)] text-[15px]">No expenses found. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {data.items.map((expense, i) => {
              const Icon = categoryIcons[expense.category] || HelpCircle
              const color = categoryColors[expense.category] || '#6B7280'
              return (
                <motion.div key={expense.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(expense)} className="p-1.5 rounded-lg hover:bg-[var(--accent-light)] text-[var(--text-muted)] hover:text-[var(--accent)]">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => { if (confirm('Delete this expense?')) deleteMutation.mutate({ id: expense.id }) }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--text-muted)] hover:text-[var(--danger)]">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-[14px] font-medium text-[var(--text-primary)] mb-1 truncate">{expense.description || expense.category}</div>
                  <div className="text-[24px] font-semibold text-[var(--text-primary)] mb-2">${Number(expense.amount).toLocaleString()}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}15`, color }}>{expense.category}</span>
                    <span className="text-[12px] text-[var(--text-muted)] flex items-center gap-1"><Calendar size={12} /> {expense.expenseDate}</span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-full border border-[var(--border)] text-[13px] font-medium disabled:opacity-50 hover:bg-gray-50">Previous</button>
          <span className="text-[13px] text-[var(--text-muted)] px-3">Page {page} of {data.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages}
            className="px-4 py-2 rounded-full border border-[var(--border)] text-[13px] font-medium disabled:opacity-50 hover:bg-gray-50">Next</button>
        </div>
      )}
    </div>
  )
}
