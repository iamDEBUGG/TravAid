import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Send, Sparkles, WalletCards, Plane, Repeat, ShieldCheck,
  TrendingDown, Zap, RotateCcw, ChevronDown, ChevronUp,
} from 'lucide-react'
import {
  type ExpenseSnapshot,
  type SmartExpenseAiResponse,
  type PreferenceMemory,
  type IntentType,
  generateSmartExpenseAiResponse,
  loadPreferences,
  updatePreferences,
  getPreferenceInsight,
} from '@/lib/smartExpenseAi'

// ─── Types ───────────────────────────────────────────────────────────

type ChatMessage = {
  id: number
  role: 'user' | 'assistant'
  content?: string
  response?: SmartExpenseAiResponse
  timestamp: number
}

type SmartExpenseAIProps = {
  expenses: ExpenseSnapshot[]
}

// ─── Constants ───────────────────────────────────────────────────────

const INTENT_COLORS: Record<IntentType, string> = {
  budget_planning: '#6366F1',
  price_comparison: '#10B981',
  subscription_audit: '#F59E0B',
  expense_optimization: '#8B5CF6',
  safety_redirect: '#EF4444',
  general_help: '#6B7280',
}

const INTENT_LABELS: Record<IntentType, string> = {
  budget_planning: 'Budget Planning',
  price_comparison: 'Price Comparison',
  subscription_audit: 'Subscription Audit',
  expense_optimization: 'Expense Optimization',
  safety_redirect: 'Safety Redirect',
  general_help: 'General Help',
}

const quickPrompts = [
  { label: 'Trip Budget', icon: WalletCards, prompt: 'Build a $1,200 trip budget for 5 days in Bangkok. I prefer experiences.' },
  { label: 'Flight Compare', icon: Plane, prompt: 'Compare a $650 direct flight ticket with cheaper train, bus, or flexible-date alternatives.' },
  { label: 'Subscriptions', icon: Repeat, prompt: 'Find overlapping subscriptions and recurring costs from my logged expenses.' },
  { label: 'Optimize Spending', icon: TrendingDown, prompt: 'Analyze my expenses and suggest a monthly budget control plan.' },
  { label: 'Budget Check', icon: ShieldCheck, prompt: 'Is $500 realistic for 3 days in London? Break it down.' },
  { label: 'Quick Savings', icon: Zap, prompt: 'What are the fastest ways to cut my top spending category by 15%?' },
]

const starterResponse: SmartExpenseAiResponse = {
  summary: 'I\'m your budget optimization and price intelligence assistant. Ask me anything about expenses!',
  breakdown: [
    '🎯 **Budget Planning** — Give me a destination + budget + duration and I\'ll build a complete plan.',
    '✈️ **Price Comparison** — Compare flights, transport, or accommodation with trade-off analysis.',
    '🔄 **Subscription Audit** — Find overlap, calculate annual vs. monthly savings, suggest family plans.',
    '📊 **Expense Optimization** — I\'ll analyze patterns and suggest targeted cuts.',
    'I use only the Expense Tracker module and respect your data privacy — all learning is session-scoped.',
  ],
  alternatives: [
    'Try a quick prompt from the sidebar →',
    'Or type a custom question below.',
  ],
  savingsPotential: 'Ask a specific question and I\'ll estimate your savings potential.',
  confidence: 'High',
  confidencePercent: 95,
  intent: 'general_help',
}

// ─── Confidence Meter ────────────────────────────────────────────────

function ConfidenceMeter({ percent, label }: { percent: number; label: string }) {
  const color = percent >= 70 ? '#10B981' : percent >= 40 ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[12px] font-medium" style={{ color }}>
        {label} ({percent}%)
      </span>
    </div>
  )
}

// ─── Typing Indicator ────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--canvas)] px-4 py-3 flex items-center gap-1.5">
        <motion.div
          className="w-2 h-2 rounded-full bg-[var(--accent)]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-[var(--accent)]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-[var(--accent)]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </div>
  )
}

// ─── Response Block ──────────────────────────────────────────────────

function ResponseBlock({ response }: { response: SmartExpenseAiResponse }) {
  const [breakdownExpanded, setBreakdownExpanded] = useState(true)
  const intentColor = INTENT_COLORS[response.intent]
  const intentLabel = INTENT_LABELS[response.intent]

  return (
    <div className="space-y-4">
      {/* Intent badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${intentColor}15`, color: intentColor }}
        >
          {intentLabel}
        </span>
      </div>

      {/* Notice banner */}
      {response.notice && (
        <div className="rounded-xl bg-[var(--warning-light)] border border-[var(--warning)]/20 px-4 py-3 text-[13px] text-[var(--text-primary)]">
          {response.notice}
        </div>
      )}

      {/* Summary */}
      <section>
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">Summary</h4>
        <p className="text-[14px] font-medium text-[var(--text-primary)] leading-relaxed">{response.summary}</p>
      </section>

      {/* Breakdown — collapsible */}
      <section>
        <button
          type="button"
          onClick={() => setBreakdownExpanded(!breakdownExpanded)}
          className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2 hover:text-[var(--text-primary)] transition-colors"
        >
          Breakdown
          {breakdownExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence>
          {breakdownExpanded && (
            <motion.ul
              className="space-y-2 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {response.breakdown.map((item, idx) => (
                <li key={idx} className="flex gap-2.5 text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  {item.startsWith('•') || item.startsWith('**') || item === '' ? (
                    <span className="pl-2">{item}</span>
                  ) : (
                    <>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </>
                  )}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </section>

      {/* Alternatives */}
      <section>
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Alternatives</h4>
        <div className="grid gap-2">
          {response.alternatives.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-[13px] text-[var(--text-secondary)] leading-relaxed">
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Savings + Confidence */}
      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-xl bg-[var(--success-light)] px-4 py-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Savings Potential</h4>
          <p className="text-[14px] font-medium text-[var(--text-primary)] mt-0.5">{response.savingsPotential}</p>
        </div>
        <div className="rounded-xl bg-[var(--accent-light)] px-4 py-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Confidence</h4>
          <ConfidenceMeter percent={response.confidencePercent} label={response.confidence} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────

export default function SmartExpenseAI({ expenses }: SmartExpenseAIProps) {
  const [input, setInput] = useState('')
  const [memory, setMemory] = useState<PreferenceMemory>(() => loadPreferences())
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: 'assistant', response: starterResponse, timestamp: Date.now() },
  ])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // Expense context for sidebar stats
  const expenseContext = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const categoryMap: Record<string, number> = {}
    for (const e of expenses) {
      categoryMap[e.category] = (categoryMap[e.category] ?? 0) + Number(e.amount)
    }
    const top = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]
    const average = expenses.length > 0 ? Math.round(total / expenses.length) : 0

    return {
      total, count: expenses.length, average,
      topCategory: top?.[0] ?? 'none',
      topCategoryAmount: top?.[1] ?? 0,
    }
  }, [expenses])

  const submitPrompt = (prompt: string) => {
    const trimmed = prompt.trim()
    if (!trimmed || isThinking) return

    const nextMemory = updatePreferences(trimmed)
    setMemory(nextMemory)

    // Add user message
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: 'user', content: trimmed, timestamp: Date.now() },
    ])
    setInput('')
    setIsThinking(true)

    // Simulate thinking delay (300-600ms) then add response
    const delay = 300 + Math.random() * 300
    setTimeout(() => {
      const response = generateSmartExpenseAiResponse(trimmed, expenses, nextMemory)
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', response, timestamp: Date.now() },
      ])
      setIsThinking(false)
    }, delay)
  }

  const clearChat = () => {
    setMessages([
      { id: Date.now(), role: 'assistant', response: starterResponse, timestamp: Date.now() },
    ])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitPrompt(input)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm"
      id="smart-expense-ai"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
        {/* ─── Sidebar ─── */}
        <aside className="border-b border-[var(--border)] bg-gradient-to-b from-[var(--accent-light)] to-white p-5 lg:border-b-0 lg:border-r">
          {/* Header */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#818CF8] text-white shadow-md">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="text-[20px] font-semibold text-[var(--text-primary)]">Smart Expense AI</h2>
              <p className="text-[12px] text-[var(--text-secondary)]">Budget optimization • Price intelligence</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-5 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/80 backdrop-blur-sm border border-[var(--border-subtle)] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Entries</p>
              <p className="text-[20px] font-bold text-[var(--text-primary)] -mt-0.5">{expenseContext.count}</p>
            </div>
            <div className="rounded-xl bg-white/80 backdrop-blur-sm border border-[var(--border-subtle)] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Total</p>
              <p className="text-[20px] font-bold text-[var(--text-primary)] -mt-0.5 truncate">${Math.round(expenseContext.total).toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-white/80 backdrop-blur-sm border border-[var(--border-subtle)] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Average</p>
              <p className="text-[20px] font-bold text-[var(--text-primary)] -mt-0.5 truncate">${expenseContext.average.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-white/80 backdrop-blur-sm border border-[var(--border-subtle)] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Top Category</p>
              <p className="text-[14px] font-bold capitalize text-[var(--text-primary)] mt-0.5 truncate">{expenseContext.topCategory}</p>
            </div>
          </div>

          {/* Preference Insight */}
          <div className="mb-4 rounded-xl bg-white/60 border border-[var(--border-subtle)] px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold mb-1">🧠 Learning</p>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{getPreferenceInsight(memory)}</p>
          </div>

          {/* Quick Prompts */}
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Quick Actions</p>
          <div className="grid gap-1.5">
            {quickPrompts.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => submitPrompt(item.prompt)}
                  disabled={isThinking}
                  className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-left text-[12px] font-medium text-[var(--text-primary)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon size={14} className="shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Clear Chat */}
          {messages.length > 1 && (
            <button
              type="button"
              onClick={clearChat}
              className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors w-full justify-center py-2"
            >
              <RotateCcw size={12} />
              Clear conversation
            </button>
          )}
        </aside>

        {/* ─── Chat Area ─── */}
        <div className="flex min-h-[560px] flex-col">
          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5 scroll-smooth">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.role === 'user' ? (
                    <div className="max-w-[82%] rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[#818CF8] px-4 py-3 text-[14px] text-white shadow-sm">
                      {message.content}
                    </div>
                  ) : (
                    <div className="max-w-[920px] rounded-2xl border border-[var(--border)] bg-[var(--canvas)] p-4 shadow-sm">
                      {message.response && <ResponseBlock response={message.response} />}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <TypingIndicator />
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submitPrompt(input)
            }}
            className="border-t border-[var(--border)] bg-white p-4"
          >
            <div className="flex items-end gap-3">
              <div className="relative flex-1">
                <Sparkles size={16} className="absolute left-3.5 top-3.5 text-[var(--accent)]/50" />
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Ask about budgets, flights, subscriptions, or spending patterns..."
                  disabled={isThinking}
                  className="min-h-[48px] w-full resize-none rounded-2xl border border-[var(--border)] py-3 pl-10 pr-4 text-[14px] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-[var(--text-muted)]"
                />
              </div>
              <button
                type="submit"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[#818CF8] text-white shadow-md transition-all hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                disabled={!input.trim() || isThinking}
                title="Send"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-2 text-center">
              Press Enter to send • Shift+Enter for new line • All data is session-scoped
            </p>
          </form>
        </div>
      </div>
    </motion.section>
  )
}
