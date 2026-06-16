import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, Sparkles, WalletCards, Plane, Repeat, ShieldCheck } from 'lucide-react'
import {
  type ExpenseSnapshot,
  type SmartExpenseAiResponse,
  generateSmartExpenseAiResponse,
} from '@/lib/smartExpenseAi'

type ChatMessage = {
  id: number
  role: 'user' | 'assistant'
  content?: string
  response?: SmartExpenseAiResponse
}

type SmartExpenseAIProps = {
  expenses: ExpenseSnapshot[]
}

type PreferenceMemory = {
  comfort: number
  savings: number
  experiences: number
  lastMinute: number
}

const starterResponse: SmartExpenseAiResponse = {
  summary: 'Ask me to build a budget, compare travel costs, or find recurring expense savings.',
  breakdown: [
    'I use only the Expense Tracker module and the currently loaded expenses.',
    'Budget plans include an emergency reserve by default.',
    'Flight, subscription, and accommodation comparisons are estimates until live pricing is connected.',
  ],
  alternatives: [
    'Build a trip budget from a total amount.',
    'Compare direct flights with cheaper mixed transport.',
    'Audit subscriptions and recurring bills.',
  ],
  savingsPotential: 'Savings estimate appears after you ask a specific budget or comparison question.',
  confidence: 'High',
}

const quickPrompts = [
  { label: 'Trip budget', icon: WalletCards, prompt: 'Build a $1,200 trip budget for 5 days in Bangkok. I prefer experiences.' },
  { label: 'Flight compare', icon: Plane, prompt: 'Compare a $650 direct flight ticket with cheaper train, bus, or flexible-date alternatives.' },
  { label: 'Subscriptions', icon: Repeat, prompt: 'Find overlapping subscriptions and recurring costs from my logged expenses.' },
  { label: 'Budget control', icon: ShieldCheck, prompt: 'Optimize my recent expenses and suggest a monthly budget control plan.' },
]

function loadPreferenceMemory(): PreferenceMemory {
  try {
    const raw = sessionStorage.getItem('smart-expense-ai-preferences')
    if (!raw) return { comfort: 0, savings: 0, experiences: 0, lastMinute: 0 }
    return { comfort: 0, savings: 0, experiences: 0, lastMinute: 0, ...JSON.parse(raw) }
  } catch {
    return { comfort: 0, savings: 0, experiences: 0, lastMinute: 0 }
  }
}

function storePreferenceMemory(prompt: string) {
  const lower = prompt.toLowerCase()
  const next = loadPreferenceMemory()

  if (/(comfort|hotel|private|convenient|easy)/.test(lower)) next.comfort += 1
  if (/(cheap|save|lowest|budget|frugal)/.test(lower)) next.savings += 1
  if (/(experience|activity|foodie|museum|concert)/.test(lower)) next.experiences += 1
  if (/(last minute|tomorrow|tonight|urgent)/.test(lower)) next.lastMinute += 1

  sessionStorage.setItem('smart-expense-ai-preferences', JSON.stringify(next))
  return next
}

function preferenceHint(memory: PreferenceMemory) {
  const entries: Array<[string, number]> = [
    ['comfort', memory.comfort],
    ['savings', memory.savings],
    ['experiences', memory.experiences],
    ['last-minute flexibility', memory.lastMinute],
  ]
  const [topLabel, topValue] = entries.sort((a, b) => b[1] - a[1])[0]
  return topValue > 0 ? `Based on this session, you lean toward ${topLabel}.` : 'Session-only learning is ready once you ask a few questions.'
}

function ResponseBlock({ response }: { response: SmartExpenseAiResponse }) {
  return (
    <div className="space-y-4">
      {response.notice && (
        <div className="rounded-xl bg-[var(--warning-light)] px-4 py-3 text-[13px] text-[var(--text-primary)]">
          {response.notice}
        </div>
      )}

      <section>
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">[Summary]</h4>
        <p className="text-[14px] text-[var(--text-primary)]">{response.summary}</p>
      </section>

      <section>
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">[Breakdown]</h4>
        <ul className="space-y-2">
          {response.breakdown.map((item) => (
            <li key={item} className="flex gap-2 text-[13px] text-[var(--text-secondary)]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">[Alternatives]</h4>
        <div className="grid gap-2">
          {response.alternatives.map((item) => (
            <div key={item} className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[13px] text-[var(--text-secondary)]">
              {item}
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
        <div className="rounded-xl bg-[var(--success-light)] px-4 py-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">[Savings Potential]</h4>
          <p className="text-[14px] font-medium text-[var(--text-primary)]">{response.savingsPotential}</p>
        </div>
        <div className="rounded-xl bg-[var(--accent-light)] px-4 py-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">[Confidence]</h4>
          <p className="text-[14px] font-medium text-[var(--text-primary)]">{response.confidence}</p>
        </div>
      </div>
    </div>
  )
}

export default function SmartExpenseAI({ expenses }: SmartExpenseAIProps) {
  const [input, setInput] = useState('')
  const [memory, setMemory] = useState<PreferenceMemory>(() => loadPreferenceMemory())
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: 'assistant', response: starterResponse },
  ])

  const expenseContext = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
    const topCategory = expenses
      .reduce<Record<string, number>>((acc, expense) => {
        acc[expense.category] = (acc[expense.category] ?? 0) + Number(expense.amount)
        return acc
      }, {})
    const top = Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0]

    return {
      total,
      count: expenses.length,
      topCategory: top?.[0] ?? 'none',
    }
  }, [expenses])

  const submitPrompt = (prompt: string) => {
    const trimmed = prompt.trim()
    if (!trimmed) return

    const nextMemory = storePreferenceMemory(trimmed)
    const response = generateSmartExpenseAiResponse(trimmed, expenses)
    setMemory(nextMemory)
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: 'user', content: trimmed },
      { id: Date.now() + 1, role: 'assistant', response },
    ])
    setInput('')
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-[var(--border)] bg-[var(--accent-light)] p-5 lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-white">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="text-[20px] font-semibold text-[var(--text-primary)]">Smart Expense AI</h2>
              <p className="text-[13px] text-[var(--text-secondary)]">Budget optimization and price intelligence</p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/80 px-3 py-2">
              <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Entries</p>
              <p className="text-[18px] font-semibold text-[var(--text-primary)]">{expenseContext.count}</p>
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2">
              <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Loaded</p>
              <p className="text-[18px] font-semibold text-[var(--text-primary)]">${Math.round(expenseContext.total).toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2">
              <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Top</p>
              <p className="truncate text-[18px] font-semibold capitalize text-[var(--text-primary)]">{expenseContext.topCategory}</p>
            </div>
          </div>

          <p className="mb-3 text-[13px] text-[var(--text-secondary)]">{preferenceHint(memory)}</p>
          <div className="grid gap-2">
            {quickPrompts.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => submitPrompt(item.prompt)}
                  className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-left text-[13px] font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="flex min-h-[520px] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((message) => (
              <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                {message.role === 'user' ? (
                  <div className="max-w-[82%] rounded-2xl bg-[var(--accent)] px-4 py-3 text-[14px] text-white">
                    {message.content}
                  </div>
                ) : (
                  <div className="max-w-[920px] rounded-2xl border border-[var(--border)] bg-[var(--canvas)] p-4">
                    {message.response && <ResponseBlock response={message.response} />}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              submitPrompt(input)
            }}
            className="border-t border-[var(--border)] bg-white p-4"
          >
            <div className="flex items-end gap-3">
              <div className="relative flex-1">
                <Sparkles size={16} className="absolute left-3 top-3.5 text-[var(--text-muted)]" />
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={2}
                  placeholder="Ask for a trip budget, subscription audit, flight comparison, or cheaper alternative..."
                  className="min-h-[48px] w-full resize-none rounded-2xl border border-[var(--border)] py-3 pl-10 pr-4 text-[14px] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                />
              </div>
              <button
                type="submit"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition hover:bg-[var(--accent)]/90 disabled:opacity-50"
                disabled={!input.trim()}
                title="Send"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.section>
  )
}
