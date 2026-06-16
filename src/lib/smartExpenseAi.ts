// ═══════════════════════════════════════════════════════════════════════
// Smart Expense AI — Budget Optimization & Price Intelligence Engine
// ═══════════════════════════════════════════════════════════════════════
// Operates ONLY within the Expense Tracker module.
// Does NOT access safety data, globe, or authentication.

// ─── Types ───────────────────────────────────────────────────────────

export type ExpenseSnapshot = {
  amount: string
  currency?: string
  category: string
  description?: string | null
  merchant?: string | null
  expenseDate: string
}

export type SmartExpenseAiResponse = {
  summary: string
  breakdown: string[]
  alternatives: string[]
  savingsPotential: string
  confidence: 'High' | 'Medium' | 'Low'
  confidencePercent: number
  notice?: string
  intent: IntentType
}

export type IntentType =
  | 'budget_planning'
  | 'price_comparison'
  | 'subscription_audit'
  | 'expense_optimization'
  | 'safety_redirect'
  | 'general_help'

export type PreferenceMemory = {
  comfort: number
  savings: number
  experiences: number
  lastMinute: number
  totalQueries: number
}

// ─── Currency System ─────────────────────────────────────────────────

const CURRENCY_RATES: Record<string, number> = {
  USD: 1, INR: 0.012, EUR: 1.08, GBP: 1.27, JPY: 0.0067,
  AUD: 0.65, CAD: 0.74, SGD: 0.74, THB: 0.028, AED: 0.27,
  MYR: 0.21, KRW: 0.00074, CHF: 1.12, NZD: 0.60, PHP: 0.018,
  IDR: 0.000063, VND: 0.000040, MXN: 0.058, BRL: 0.19, ZAR: 0.054,
  TRY: 0.031, EGP: 0.020, SEK: 0.095, NOK: 0.092, DKK: 0.145,
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', INR: '₹', EUR: '€', GBP: '£', JPY: '¥',
  AUD: 'A$', CAD: 'C$', SGD: 'S$', THB: '฿', AED: 'د.إ',
  CHF: 'CHF', KRW: '₩', BRL: 'R$', MXN: 'MX$', ZAR: 'R',
}

function formatMoney(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency + ' '
  const absAmount = Math.max(0, Math.round(amount))
  return `${symbol}${absAmount.toLocaleString('en-US')}`
}

function toUsd(amount: number, currency: string): number {
  return amount * (CURRENCY_RATES[currency] ?? 1)
}

function fromUsd(usdAmount: number, currency: string): number {
  const rate = CURRENCY_RATES[currency] ?? 1
  return usdAmount / rate
}

// ─── Destination Profiles ────────────────────────────────────────────

type DestinationProfile = {
  label: string
  region: string
  minDailyUsd: number
  standardDailyUsd: number
  premiumDailyUsd: number
  costIndex: number         // 1.0 = baseline, <1 cheaper, >1 more expensive
  peakMonths: number[]      // 0-indexed month numbers
  peakMultiplier: number
  comparable: string
}

const DESTINATIONS: Record<string, DestinationProfile> = {
  bangkok:    { label: 'Bangkok',    region: 'Southeast Asia', minDailyUsd: 35, standardDailyUsd: 78,  premiumDailyUsd: 180, costIndex: 0.55, peakMonths: [10, 11, 0, 1], peakMultiplier: 1.25, comparable: 'Thailand urban travel' },
  bali:       { label: 'Bali',       region: 'Southeast Asia', minDailyUsd: 38, standardDailyUsd: 85,  premiumDailyUsd: 220, costIndex: 0.60, peakMonths: [6, 7, 11],     peakMultiplier: 1.30, comparable: 'Indonesia tourist hubs' },
  phuket:     { label: 'Phuket',     region: 'Southeast Asia', minDailyUsd: 42, standardDailyUsd: 92,  premiumDailyUsd: 240, costIndex: 0.65, peakMonths: [11, 0, 1, 2], peakMultiplier: 1.35, comparable: 'Thailand resort travel' },
  delhi:      { label: 'Delhi',      region: 'South Asia',     minDailyUsd: 28, standardDailyUsd: 62,  premiumDailyUsd: 150, costIndex: 0.42, peakMonths: [10, 11, 1, 2], peakMultiplier: 1.15, comparable: 'India metro travel' },
  goa:        { label: 'Goa',        region: 'South Asia',     minDailyUsd: 32, standardDailyUsd: 75,  premiumDailyUsd: 190, costIndex: 0.50, peakMonths: [11, 0, 1, 2], peakMultiplier: 1.40, comparable: 'India beach destinations' },
  mumbai:     { label: 'Mumbai',     region: 'South Asia',     minDailyUsd: 38, standardDailyUsd: 88,  premiumDailyUsd: 200, costIndex: 0.58, peakMonths: [10, 11, 0],   peakMultiplier: 1.15, comparable: 'India metro travel' },
  dubai:      { label: 'Dubai',      region: 'Middle East',    minDailyUsd: 80, standardDailyUsd: 175, premiumDailyUsd: 450, costIndex: 1.15, peakMonths: [11, 0, 1, 2], peakMultiplier: 1.35, comparable: 'UAE city travel' },
  istanbul:   { label: 'Istanbul',   region: 'Middle East',    minDailyUsd: 45, standardDailyUsd: 95,  premiumDailyUsd: 230, costIndex: 0.62, peakMonths: [5, 6, 7, 8],  peakMultiplier: 1.20, comparable: 'Turkey city travel' },
  london:     { label: 'London',     region: 'Europe',         minDailyUsd: 110, standardDailyUsd: 225, premiumDailyUsd: 550, costIndex: 1.50, peakMonths: [5, 6, 7, 8],  peakMultiplier: 1.20, comparable: 'UK city travel' },
  paris:      { label: 'Paris',      region: 'Europe',         minDailyUsd: 100, standardDailyUsd: 215, premiumDailyUsd: 520, costIndex: 1.45, peakMonths: [5, 6, 7, 8],  peakMultiplier: 1.25, comparable: 'Western Europe city travel' },
  rome:       { label: 'Rome',       region: 'Europe',         minDailyUsd: 85, standardDailyUsd: 175,  premiumDailyUsd: 420, costIndex: 1.20, peakMonths: [5, 6, 7, 8],  peakMultiplier: 1.20, comparable: 'Italy city travel' },
  barcelona:  { label: 'Barcelona',  region: 'Europe',         minDailyUsd: 80, standardDailyUsd: 165,  premiumDailyUsd: 400, costIndex: 1.10, peakMonths: [5, 6, 7, 8],  peakMultiplier: 1.25, comparable: 'Spain city travel' },
  amsterdam:  { label: 'Amsterdam',  region: 'Europe',         minDailyUsd: 95, standardDailyUsd: 195,  premiumDailyUsd: 480, costIndex: 1.35, peakMonths: [3, 4, 5, 6],  peakMultiplier: 1.20, comparable: 'Netherlands city travel' },
  berlin:     { label: 'Berlin',     region: 'Europe',         minDailyUsd: 75, standardDailyUsd: 155,  premiumDailyUsd: 380, costIndex: 1.05, peakMonths: [5, 6, 7, 8],  peakMultiplier: 1.15, comparable: 'Germany city travel' },
  singapore:  { label: 'Singapore',  region: 'Southeast Asia', minDailyUsd: 90, standardDailyUsd: 185, premiumDailyUsd: 450, costIndex: 1.25, peakMonths: [11, 0, 5, 6], peakMultiplier: 1.15, comparable: 'Singapore city travel' },
  tokyo:      { label: 'Tokyo',      region: 'East Asia',      minDailyUsd: 78, standardDailyUsd: 165, premiumDailyUsd: 420, costIndex: 1.10, peakMonths: [2, 3, 9, 10], peakMultiplier: 1.25, comparable: 'Japan city travel' },
  seoul:      { label: 'Seoul',      region: 'East Asia',      minDailyUsd: 65, standardDailyUsd: 140, premiumDailyUsd: 350, costIndex: 0.95, peakMonths: [3, 4, 9, 10], peakMultiplier: 1.15, comparable: 'South Korea city travel' },
  'new york': { label: 'New York',   region: 'North America',  minDailyUsd: 125, standardDailyUsd: 255, premiumDailyUsd: 600, costIndex: 1.70, peakMonths: [5, 6, 11],    peakMultiplier: 1.20, comparable: 'US major city travel' },
  'los angeles': { label: 'Los Angeles', region: 'North America', minDailyUsd: 110, standardDailyUsd: 230, premiumDailyUsd: 550, costIndex: 1.55, peakMonths: [5, 6, 7], peakMultiplier: 1.15, comparable: 'US west coast travel' },
  toronto:    { label: 'Toronto',    region: 'North America',  minDailyUsd: 95, standardDailyUsd: 195,  premiumDailyUsd: 470, costIndex: 1.30, peakMonths: [5, 6, 7, 8],  peakMultiplier: 1.15, comparable: 'Canada city travel' },
  sydney:     { label: 'Sydney',     region: 'Oceania',        minDailyUsd: 105, standardDailyUsd: 215, premiumDailyUsd: 520, costIndex: 1.45, peakMonths: [11, 0, 1],    peakMultiplier: 1.25, comparable: 'Australia city travel' },
  cairo:      { label: 'Cairo',      region: 'Africa',         minDailyUsd: 30, standardDailyUsd: 68,   premiumDailyUsd: 180, costIndex: 0.45, peakMonths: [10, 11, 1, 2], peakMultiplier: 1.20, comparable: 'Egypt city travel' },
  'cape town':{ label: 'Cape Town',  region: 'Africa',         minDailyUsd: 50, standardDailyUsd: 110,  premiumDailyUsd: 280, costIndex: 0.72, peakMonths: [11, 0, 1, 2], peakMultiplier: 1.30, comparable: 'South Africa city travel' },
  'mexico city': { label: 'Mexico City', region: 'Latin America', minDailyUsd: 40, standardDailyUsd: 90, premiumDailyUsd: 230, costIndex: 0.60, peakMonths: [11, 0, 2, 3], peakMultiplier: 1.15, comparable: 'Mexico city travel' },
  'buenos aires': { label: 'Buenos Aires', region: 'Latin America', minDailyUsd: 38, standardDailyUsd: 85, premiumDailyUsd: 220, costIndex: 0.55, peakMonths: [10, 11, 0, 1], peakMultiplier: 1.20, comparable: 'Argentina city travel' },
}

// ─── Preference Learning ─────────────────────────────────────────────

const PREFERENCE_KEY = 'smart-expense-ai-preferences'

export function loadPreferences(): PreferenceMemory {
  try {
    const raw = sessionStorage.getItem(PREFERENCE_KEY)
    if (!raw) return { comfort: 0, savings: 0, experiences: 0, lastMinute: 0, totalQueries: 0 }
    return { comfort: 0, savings: 0, experiences: 0, lastMinute: 0, totalQueries: 0, ...JSON.parse(raw) }
  } catch {
    return { comfort: 0, savings: 0, experiences: 0, lastMinute: 0, totalQueries: 0 }
  }
}

export function updatePreferences(prompt: string): PreferenceMemory {
  const lower = prompt.toLowerCase()
  const prefs = loadPreferences()

  // Comfort signals
  if (/(comfort|hotel|private|convenient|easy|luxury|premium|first.?class|upgrade|lounge)/.test(lower)) prefs.comfort += 1
  // Savings signals
  if (/(cheap|save|lowest|budget|frugal|economical|bargain|discount|afford|minimize)/.test(lower)) prefs.savings += 1
  // Experience signals
  if (/(experience|activity|foodie|museum|concert|adventure|explore|tour|culture|local|sightseeing)/.test(lower)) prefs.experiences += 1
  // Last-minute signals
  if (/(last.?minute|tomorrow|tonight|urgent|asap|this week|next week|rush)/.test(lower)) prefs.lastMinute += 1

  prefs.totalQueries += 1
  sessionStorage.setItem(PREFERENCE_KEY, JSON.stringify(prefs))
  return prefs
}

export function getPreferenceInsight(prefs: PreferenceMemory): string {
  if (prefs.totalQueries < 2) return 'Session-only learning is ready — ask a few questions and I\'ll adapt to your style.'

  const entries: [string, number][] = [
    ['comfort over cost', prefs.comfort],
    ['maximum savings', prefs.savings],
    ['experiences and activities', prefs.experiences],
    ['last-minute flexibility', prefs.lastMinute],
  ]
  const [topLabel, topValue] = entries.sort((a, b) => b[1] - a[1])[0]
  if (topValue === 0) return 'No clear preference yet — keep asking and I\'ll learn your style.'
  return `Based on your past choices, you prioritize ${topLabel}. I'll tune recommendations accordingly.`
}

function getDominantPreference(prefs: PreferenceMemory, promptOverride?: string): 'comfort' | 'savings' | 'experiences' {
  if (promptOverride) {
    const lower = promptOverride.toLowerCase()
    if (/(comfort|hotel|private|luxury|premium)/.test(lower)) return 'comfort'
    if (/(cheap|save|budget|frugal|lowest|economical)/.test(lower)) return 'savings'
    if (/(experience|activity|adventure|explore|foodie|culture)/.test(lower)) return 'experiences'
  }
  const entries: [string, number][] = [
    ['comfort', prefs.comfort],
    ['savings', prefs.savings],
    ['experiences', prefs.experiences],
  ]
  const [label] = entries.sort((a, b) => b[1] - a[1])[0]
  if (label === 'comfort') return 'comfort'
  if (label === 'experiences') return 'experiences'
  return 'savings'
}

// ─── Intent Classification ───────────────────────────────────────────

type IntentScore = { type: IntentType; score: number }

const INTENT_KEYWORDS: Record<IntentType, { words: string[]; weight: number }[]> = {
  safety_redirect: [
    { words: ['safe', 'safety', 'crime', 'danger', 'risk score', 'globe', 'advisory', 'threat', 'security', 'war', 'conflict'], weight: 10 },
  ],
  budget_planning: [
    { words: ['budget', 'trip', 'travel', 'destination', 'hotel', 'hostel', 'airbnb', 'accommodation', 'itinerary'], weight: 3 },
    { words: ['days', 'nights', 'week', 'month', 'plan', 'allocate', 'breakdown', 'split'], weight: 2 },
    { words: ['reserve', 'emergency', 'buffer'], weight: 2 },
  ],
  price_comparison: [
    { words: ['flight', 'airline', 'ticket', 'fare', 'layover', 'direct', 'nonstop'], weight: 3 },
    { words: ['compare', 'cheaper', 'alternative', 'versus', 'vs', 'option', 'trade-off'], weight: 2 },
    { words: ['train', 'bus', 'route', 'transport', 'uber', 'taxi', 'rental'], weight: 2 },
  ],
  subscription_audit: [
    { words: ['subscription', 'recurring', 'monthly bill', 'annual plan', 'loyalty', 'membership'], weight: 4 },
    { words: ['netflix', 'spotify', 'apple music', 'prime', 'hulu', 'disney', 'youtube premium', 'gym'], weight: 3 },
    { words: ['overlap', 'duplicate', 'cancel', 'consolidate', 'family plan', 'bundle'], weight: 3 },
  ],
  expense_optimization: [
    { words: ['optimize', 'reduce', 'cut', 'trim', 'control', 'manage', 'review', 'audit'], weight: 3 },
    { words: ['spending', 'expenses', 'costs', 'money', 'overbudget', 'overspending'], weight: 2 },
    { words: ['monthly', 'weekly', 'daily', 'habit', 'pattern', 'trend'], weight: 1 },
  ],
  general_help: [
    { words: ['help', 'what can you', 'how do', 'capabilities', 'features'], weight: 2 },
  ],
}

function classifyIntent(prompt: string): IntentType {
  const lower = prompt.toLowerCase()
  const scores: IntentScore[] = Object.entries(INTENT_KEYWORDS).map(([type, groups]) => {
    let score = 0
    for (const group of groups) {
      for (const word of group.words) {
        if (lower.includes(word)) {
          score += group.weight
        }
      }
    }
    return { type: type as IntentType, score }
  })

  scores.sort((a, b) => b.score - a.score)
  if (scores[0].score === 0) return 'general_help'
  return scores[0].type
}

// ─── Parsing Utilities ───────────────────────────────────────────────

type BudgetSignal = {
  amount: number | null
  currency: string
  days: number
}

function parseBudgetSignal(prompt: string): BudgetSignal {
  const lower = prompt.toLowerCase()

  // Detect currency
  let currency = 'USD'
  if (lower.includes('inr') || lower.includes('rupee') || lower.includes('rs ') || prompt.includes('₹')) currency = 'INR'
  else if (lower.includes('eur') || prompt.includes('€')) currency = 'EUR'
  else if (lower.includes('gbp') || lower.includes('pound') || prompt.includes('£')) currency = 'GBP'
  else if (lower.includes('yen') || prompt.includes('¥') || lower.includes('jpy')) currency = 'JPY'
  else if (lower.includes('aud') || lower.includes('australian')) currency = 'AUD'
  else if (lower.includes('cad') || lower.includes('canadian')) currency = 'CAD'
  else if (lower.includes('sgd') || lower.includes('singapore dollar')) currency = 'SGD'
  else if (lower.includes('thb') || lower.includes('baht') || prompt.includes('฿')) currency = 'THB'
  else if (lower.includes('aed') || lower.includes('dirham')) currency = 'AED'

  // Extract amount
  const amountMatch = prompt.match(/(?:[$₹€£¥฿]\s*)?([\d,]+(?:\.\d+)?)\s*(?:k\b)?/i)
  let amount = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : null
  if (amount && /k\b/i.test(prompt.slice(prompt.indexOf(amountMatch![0]) + amountMatch![0].length, prompt.indexOf(amountMatch![0]) + amountMatch![0].length + 2))) {
    amount *= 1000
  }

  // Extract duration
  const dayMatch = lower.match(/(\d+)\s*(day|days|night|nights|week|weeks|month|months)/)
  const unit = dayMatch?.[2] ?? ''
  const count = dayMatch ? Number(dayMatch[1]) : 0
  const days = unit.startsWith('week')
    ? count * 7
    : unit.startsWith('month')
      ? count * 30
      : count || (lower.includes('monthly') ? 30 : lower.includes('weekend') ? 3 : 7)

  return { amount, currency, days }
}

function findDestination(prompt: string): DestinationProfile | null {
  const lower = prompt.toLowerCase()
  // Sort by key length descending to match "new york" before "new"
  const entries = Object.entries(DESTINATIONS).sort((a, b) => b[0].length - a[0].length)
  const match = entries.find(([key]) => lower.includes(key))
  return match?.[1] ?? null
}

function getSeasonalMultiplier(dest: DestinationProfile): number {
  const currentMonth = new Date().getMonth()
  return dest.peakMonths.includes(currentMonth) ? dest.peakMultiplier : 1.0
}

// ─── Expense Analysis Utilities ──────────────────────────────────────

function analyzeExpenses(expenses: ExpenseSnapshot[]) {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const count = expenses.length
  const average = count > 0 ? Math.round(total / count) : 0

  // Category breakdown
  const byCategory = new Map<string, { total: number; count: number }>()
  for (const e of expenses) {
    const prev = byCategory.get(e.category) ?? { total: 0, count: 0 }
    prev.total += Number(e.amount)
    prev.count += 1
    byCategory.set(e.category, prev)
  }

  const sortedCategories = [...byCategory.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, data]) => ({
      name, total: data.total, count: data.count,
      percentage: total > 0 ? Math.round((data.total / total) * 100) : 0,
    }))

  // Monthly spending estimation
  const dates = expenses.map(e => new Date(e.expenseDate + 'T00:00:00')).filter(d => !isNaN(d.getTime()))
  let monthlyEstimate = total
  if (dates.length >= 2) {
    const earliest = Math.min(...dates.map(d => d.getTime()))
    const latest = Math.max(...dates.map(d => d.getTime()))
    const spanDays = Math.max(1, (latest - earliest) / (1000 * 60 * 60 * 24))
    monthlyEstimate = (total / spanDays) * 30
  }

  // Detect recurring-looking expenses
  const recurringCandidates = expenses.filter(e => {
    const text = `${e.description ?? ''} ${e.merchant ?? ''}`.toLowerCase()
    return e.category === 'bills' || e.category === 'entertainment'
      || /(netflix|spotify|apple|prime|hulu|disney|subscription|phone|gym|internet|insurance|rent|utility|electric|water|gas|cloud|storage|youtube|icloud|office|adobe)/.test(text)
  })

  return {
    total, count, average, sortedCategories, monthlyEstimate,
    recurringCandidates,
    topCategory: sortedCategories[0] ?? null,
    currency: expenses[0]?.currency || 'USD',
  }
}

function findConflicts(prompt: string, expenses: ExpenseSnapshot[]): ExpenseSnapshot | null {
  const tokens = prompt.toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length >= 4 && !STOP_WORDS.has(t))

  if (tokens.length === 0) return null

  return expenses.find(e => {
    const haystack = `${e.description ?? ''} ${e.merchant ?? ''} ${e.category}`.toLowerCase()
    return tokens.some(t => haystack.includes(t))
  }) ?? null
}

const STOP_WORDS = new Set([
  'with', 'from', 'this', 'that', 'have', 'want', 'need', 'budget', 'expense',
  'expenses', 'ticket', 'tickets', 'compare', 'much', 'does', 'cost', 'would',
  'should', 'could', 'about', 'more', 'than', 'some', 'what', 'your', 'please',
  'help', 'find', 'show', 'tell', 'give', 'make', 'like', 'just', 'also',
])

// ─── Response Generators ─────────────────────────────────────────────

function safetyRedirectResponse(): SmartExpenseAiResponse {
  return {
    summary: 'For safety information, please check the Safety Globe feature.',
    breakdown: [
      'I only operate inside the Expense Tracker module.',
      'I can help you build trip budgets, compare travel costs, audit subscriptions, and optimize spending patterns.',
      'Safety data, country risk scores, and travel advisories are available in the Safety Globe section of RoamSense.',
    ],
    alternatives: [
      'Ask me to build a destination budget with safety-appropriate accommodation.',
      'Ask for a price comparison on flights or transport options.',
      'Ask me to audit your recurring expenses and subscriptions.',
    ],
    savingsPotential: 'No expense calculation for this request — it\'s outside my module.',
    confidence: 'High',
    confidencePercent: 95,
    intent: 'safety_redirect',
  }
}

function generalHelpResponse(expenses: ExpenseSnapshot[], prefs: PreferenceMemory): SmartExpenseAiResponse {
  const { count, total, currency } = analyzeExpenses(expenses)
  const prefInsight = getPreferenceInsight(prefs)

  return {
    summary: 'I\'m your budget optimization and price intelligence assistant. Here\'s what I can do.',
    breakdown: [
      `You currently have ${count} expense${count !== 1 ? 's' : ''} loaded, totaling ${formatMoney(total, currency)}.`,
      '🎯 **Budget Planning** — Give me a total budget + destination + trip length, and I\'ll generate a full expense breakdown with emergency buffer.',
      '✈️ **Price Comparison** — Ask me to compare flights, transport modes, or accommodation types with trade-off analysis.',
      '🔄 **Subscription Audit** — I\'ll find overlapping subscriptions, calculate annual vs. monthly savings, and suggest family plan optimizations.',
      '📊 **Expense Optimization** — I\'ll analyze your spending patterns, identify your top category, and suggest targeted cuts.',
      prefInsight,
    ],
    alternatives: [
      'Try: "Build a $1,200 trip budget for 5 days in Bangkok. I prefer experiences."',
      'Try: "Compare a $650 direct flight with cheaper alternatives."',
      'Try: "Audit my subscriptions and find overlap."',
    ],
    savingsPotential: count > 0 ? `With ${count} logged expenses, I can estimate ${formatMoney(total * 0.15, currency)} in potential savings.` : 'Add some expenses first, then I can estimate savings.',
    confidence: 'High',
    confidencePercent: 90,
    intent: 'general_help',
  }
}

function tripBudgetResponse(prompt: string, expenses: ExpenseSnapshot[], prefs: PreferenceMemory): SmartExpenseAiResponse {
  const budget = parseBudgetSignal(prompt)
  const destination = findDestination(prompt)
  const preference = getDominantPreference(prefs, prompt)
  const currency = budget.currency
  const seasonalMult = destination ? getSeasonalMultiplier(destination) : 1.0

  const dailyCost = destination
    ? destination.standardDailyUsd * seasonalMult
    : 95

  const amount = budget.amount ?? fromUsd(dailyCost * budget.days, currency)
  const usdBudget = toUsd(amount, currency)
  const minUsd = (destination?.minDailyUsd ?? 50) * budget.days * seasonalMult
  const minViable = fromUsd(minUsd, currency)

  const wantsEmergency = !/(no emergency|without emergency|skip emergency|no buffer|without buffer)/.test(prompt.toLowerCase())
  const emergencyRate = wantsEmergency ? 0.12 : 0
  const usable = amount * (1 - emergencyRate)
  const emergency = amount * emergencyRate

  // Allocation rates based on preference
  const allocationProfiles = {
    comfort:     { accommodation: 0.42, food: 0.18, transport: 0.16, activities: 0.14, misc: 0.10 },
    savings:     { accommodation: 0.28, food: 0.22, transport: 0.20, activities: 0.18, misc: 0.12 },
    experiences: { accommodation: 0.28, food: 0.22, transport: 0.14, activities: 0.28, misc: 0.08 },
  }
  const alloc = allocationProfiles[preference]

  const standardBudget = fromUsd((destination?.standardDailyUsd ?? 95) * budget.days * seasonalMult, currency)
  const conflict = findConflicts(prompt, expenses)

  // Check if budget is unrealistic
  if (usdBudget < minUsd * 0.8) {
    return {
      summary: `⚠️ That budget is unrealistic for ${destination?.label ?? 'this destination'}. Minimum viable: ${formatMoney(minViable, currency)} for ${budget.days} days.`,
      breakdown: [
        `Your budget: ${formatMoney(amount, currency)} for ${budget.days} days = ${formatMoney(amount / budget.days, currency)}/day.`,
        `Minimum viable daily cost: ${formatMoney(fromUsd((destination?.minDailyUsd ?? 50) * seasonalMult, currency), currency)}/day (hostels, street food, public transit).`,
        `Minimum total needed: ${formatMoney(minViable, currency)} before any emergency buffer.`,
        destination ? `Based on: ${destination.comparable} with cost index ${destination.costIndex}x baseline.` : 'Pricing data limited for this region. Estimates based on mid-cost international city travel.',
        seasonalMult > 1 ? `⚡ Peak season premium: prices are ~${Math.round((seasonalMult - 1) * 100)}% higher right now.` : 'Current season: normal pricing.',
      ],
      alternatives: [
        `Reduce trip to ${Math.max(1, Math.floor(usdBudget / ((destination?.minDailyUsd ?? 50) * seasonalMult)))} days to stay within budget.`,
        'Switch from private accommodation to hostel dorms — saves 40-60% on lodging.',
        'Consider a cheaper destination with similar appeal (I can suggest alternatives).',
      ],
      savingsPotential: `Gap of ${formatMoney(minViable - amount, currency)} to reach minimum viability.`,
      confidence: destination ? 'Medium' : 'Low',
      confidencePercent: destination ? 55 : 30,
      intent: 'budget_planning',
      notice: 'Budget appears below minimum viable — consider adjusting duration or destination.',
    }
  }

  return {
    summary: `${formatMoney(amount, currency)} for ${budget.days} days${destination ? ' in ' + destination.label : ''} — optimized for ${preference}. ${wantsEmergency ? formatMoney(emergency, currency) + ' reserved for emergencies.' : 'No emergency buffer (you opted out).'}`,
    breakdown: [
      `🏨 Accommodation: ${formatMoney(usable * alloc.accommodation, currency)} — ${preference === 'comfort' ? 'mid-range hotels or quality private rooms' : preference === 'experiences' ? 'hostels, guesthouses, or mixed stays' : 'budget hostels and guesthouses'}.`,
      `🍽️ Food & Dining: ${formatMoney(usable * alloc.food, currency)} — mix of local meals, groceries, and ${preference === 'experiences' ? 'signature food experiences' : 'practical eating'}.`,
      `🚌 Transport: ${formatMoney(usable * alloc.transport, currency)} — local transit, airport transfers, and route flexibility.`,
      `🎯 Activities: ${formatMoney(usable * alloc.activities, currency)} — ${preference === 'experiences' ? 'prioritized: tours, museums, cultural experiences' : 'selective: prioritize free/low-cost options first'}.`,
      `📦 Miscellaneous: ${formatMoney(usable * alloc.misc, currency)} — SIMs, tips, incidentals, small purchases.`,
      wantsEmergency ? `🛡️ Emergency Reserve: ${formatMoney(emergency, currency)} (${Math.round(emergencyRate * 100)}%) — untouched unless needed for medical, delays, or missed transfers.` : '⚠️ No emergency reserve — all funds allocated. Consider adding 10-15% buffer.',
      conflict ? `\n⚠️ Conflict detected: you have a logged expense of ${formatMoney(Number(conflict.amount), conflict.currency ?? currency)} for "${conflict.merchant || conflict.description || conflict.category}". Adjust existing entry?` : '',
    ].filter(Boolean),
    alternatives: [
      `💰 Savings-first: cap lodging at ${formatMoney(usable * 0.24, currency)} and shift extra to food/transport — less comfort, more flexibility.`,
      `✨ Experience-first: move ${formatMoney(usable * 0.08, currency)} from lodging to activities — better memories, leaner stays.`,
      `🛏️ Comfort-first: spend ${formatMoney(usable * 0.45, currency)} on lodging and cut paid attractions — calmer trip, fewer extras.`,
    ],
    savingsPotential: standardBudget > amount
      ? `Your budget is ${formatMoney(standardBudget - amount, currency)} below standard — already saving vs. typical travelers.`
      : `${formatMoney(amount - standardBudget * 0.75, currency)} potential savings vs. your current allocation if you trim flexible categories by 15%.`,
    confidence: destination ? 'Medium' : 'Low',
    confidencePercent: destination ? 65 : 35,
    intent: 'budget_planning',
    notice: destination ? (seasonalMult > 1 ? `📅 Peak season for ${destination.label} — prices are ~${Math.round((seasonalMult - 1) * 100)}% higher than off-season.` : undefined) : 'Pricing data limited for this region. Estimates based on nearest comparable destination.',
  }
}

function priceComparisonResponse(prompt: string, expenses: ExpenseSnapshot[]): SmartExpenseAiResponse {
  const budget = parseBudgetSignal(prompt)
  const base = budget.amount ?? 420
  const currency = budget.currency

  // Flight tiers
  const direct = base
  const flexible = Math.round(base * 0.76)
  const budget_option = Math.round(base * 0.58)
  const mixed = Math.round(base * 0.42)

  const conflict = findConflicts(prompt, expenses)

  return {
    summary: `Direct ticket at ${formatMoney(direct, currency)} vs. alternatives as low as ${formatMoney(mixed, currency)}. Best choice depends on your time/comfort trade-off.`,
    breakdown: [
      `✈️ **Direct flight**: ${formatMoney(direct, currency)} — fastest, most convenient. Best for: tight schedules, long-haul comfort.`,
      `📅 **Flexible dates** (±3 days): ${formatMoney(flexible, currency)} — same route, off-peak departure. Saves ${formatMoney(direct - flexible, currency)}.`,
      `💺 **Budget airline**: ${formatMoney(budget_option, currency)} — basic economy, no frills. Add ${formatMoney(Math.round(base * 0.08), currency)} for checked bag. Saves ${formatMoney(direct - budget_option, currency)}.`,
      `🚂 **Mixed transport** (train + bus or split-ticket): ${formatMoney(mixed, currency)} — cheapest but 3-8 hours longer. Saves ${formatMoney(direct - mixed, currency)}.`,
      '⚠️ Compare **total trip cost**, not ticket cost alone — factor in baggage, transfers, meals during layovers, and extra accommodation nights.',
      conflict ? `\n⚠️ Conflict: logged expense of ${formatMoney(Number(conflict.amount), conflict.currency ?? currency)} for "${conflict.merchant || conflict.description || conflict.category}". Adjust?` : '',
    ].filter(Boolean),
    alternatives: [
      `Shift departure by 2-4 days — often ${formatMoney(Math.round(base * 0.15), currency)} cheaper, but may cost an extra hotel night.`,
      'Fly carry-on only — saves baggage fees and speeds up transit, but limits packing.',
      'Check nearby airports + ground transfer — cheaper on popular routes, adds 1-2 hours planning.',
    ],
    savingsPotential: `Up to ${formatMoney(direct - mixed, currency)} (${Math.round(((direct - mixed) / direct) * 100)}% savings) vs. the direct/default option.`,
    confidence: 'Low',
    confidencePercent: 30,
    intent: 'price_comparison',
    notice: '📡 Live airline inventory is not connected — these are planning estimates, not bookable fares. Verify on booking platforms.',
  }
}

function subscriptionAuditResponse(prompt: string, expenses: ExpenseSnapshot[]): SmartExpenseAiResponse {
  const analysis = analyzeExpenses(expenses)
  const { recurringCandidates } = analysis
  const currency = analysis.currency

  const recurringTotal = recurringCandidates.reduce((sum, e) => sum + Number(e.amount), 0)
  const serviceNames = [...new Set(
    recurringCandidates.map(e => e.merchant || e.description || e.category).filter(Boolean)
  )].slice(0, 6)

  const estimatedMonthlySubs = recurringTotal > 0 ? recurringTotal : 85
  const overlapSavings = estimatedMonthlySubs * 0.25
  const annualSavings = estimatedMonthlySubs * 0.15

  const conflict = findConflicts(prompt, expenses)

  if (recurringCandidates.length === 0) {
    return {
      summary: 'No recurring expenses detected in your logged data. Here\'s a general subscription optimization framework.',
      breakdown: [
        'No bills or entertainment expenses found that look like subscriptions.',
        '📋 **Step 1**: List all active subscriptions — streaming, cloud, fitness, news, delivery, software.',
        '🔍 **Step 2**: Group by function — music, video, storage, fitness. If 2+ services share a function, one should go.',
        '📊 **Step 3**: Check usage — cancel anything unused in the last 30 days.',
        '💰 **Step 4**: Switch annual billing for services used 8+ months/year — saves 10-20%.',
        '👨‍👩‍👧‍👦 **Step 5**: Family/shared plans where legal — splits cost 2-4x.',
      ],
      alternatives: [
        'Log your subscriptions as "bills" category expenses — I\'ll give specific optimization advice.',
        'Try: "I spend $50/month on Netflix, Spotify, and iCloud. Find overlap."',
        'Try: "Optimize my entertainment spending."',
      ],
      savingsPotential: 'Typical household saves $15-40/month by removing subscription overlap.',
      confidence: 'Low',
      confidencePercent: 25,
      intent: 'subscription_audit',
    }
  }

  return {
    summary: `Found ${recurringCandidates.length} recurring-looking expense${recurringCandidates.length !== 1 ? 's' : ''}: ${serviceNames.join(', ')}. Estimated ${formatMoney(overlapSavings, currency)}/month in potential overlap savings.`,
    breakdown: [
      `💳 Recurring base: ${formatMoney(recurringTotal, currency)} across ${recurringCandidates.length} entries.`,
      `🔍 Services detected: ${serviceNames.join(', ')}.`,
      '**Overlap check**: Group by function — if 2+ services handle music, video, or storage, keep the one you use most and cancel others.',
      `📅 **Annual billing**: switching eligible services saves ~${formatMoney(annualSavings, currency)}/month (higher upfront, 10-20% cheaper long-term).`,
      '👨‍👩‍👧‍👦 **Family plans**: legal shared plans typically cost 30-50% less per user.',
      `🧮 **Break-even**: annual plans pay off after month ~10. Only commit if you\'ve used the service 8+ of the last 12 months.`,
      conflict ? `\n⚠️ Conflict: logged expense "${conflict.merchant || conflict.description}" at ${formatMoney(Number(conflict.amount), conflict.currency ?? currency)}. Adjust?` : '',
    ].filter(Boolean),
    alternatives: [
      `Keep one primary streaming service + rotate others monthly — saves ${formatMoney(overlapSavings * 0.6, currency)}/month, but lose always-on access.`,
      `Switch all eligible services to annual billing — saves ${formatMoney(annualSavings, currency)}/month, needs upfront cash.`,
      'Replace duplicate music/video with one shared family plan — lower cost per user, needs coordination.',
    ],
    savingsPotential: `${formatMoney(overlapSavings, currency)}/month estimated (${formatMoney(overlapSavings * 12, currency)}/year) if overlap is removed and billing is optimized.`,
    confidence: recurringCandidates.length >= 3 ? 'Medium' : 'Low',
    confidencePercent: recurringCandidates.length >= 3 ? 60 : 35,
    intent: 'subscription_audit',
  }
}

function expenseOptimizationResponse(prompt: string, expenses: ExpenseSnapshot[], prefs: PreferenceMemory): SmartExpenseAiResponse {
  const analysis = analyzeExpenses(expenses)
  const { total, count, average, sortedCategories, monthlyEstimate, currency, topCategory } = analysis
  const preference = getDominantPreference(prefs, prompt)
  const conflict = findConflicts(prompt, expenses)

  if (count === 0) {
    return {
      summary: 'No expenses loaded yet. Add a few expenses first, then I\'ll analyze your spending patterns.',
      breakdown: [
        'Use the "Add Expense" button to log your spending.',
        'Include category, description, and merchant for better analysis.',
        'Once you have 5+ expenses, I can identify patterns, suggest cuts, and build budget controls.',
      ],
      alternatives: [
        'Start with a 50/30/20 rule: 50% needs, 30% wants, 20% savings/travel fund.',
        'Set a weekly spending cap for variable costs (food, entertainment, shopping).',
        'Track daily for 2 weeks to establish your baseline spending pattern.',
      ],
      savingsPotential: 'Add expenses first — then I can estimate savings.',
      confidence: 'Low',
      confidencePercent: 20,
      intent: 'expense_optimization',
    }
  }

  const trimTarget = total * 0.15
  const topCatName = topCategory?.name ?? 'uncategorized'
  const topCatTotal = topCategory?.total ?? 0
  const topCatPct = topCategory?.percentage ?? 0

  // Build category breakdown
  const catBreakdown = sortedCategories.slice(0, 4).map(c =>
    `• ${c.name}: ${formatMoney(c.total, currency)} (${c.percentage}% of total, ${c.count} entries)`
  )

  return {
    summary: `${topCatName} dominates your spending at ${topCatPct}% (${formatMoney(topCatTotal, currency)}). Trimming your top 2 categories by 15% saves ~${formatMoney(trimTarget, currency)}.`,
    breakdown: [
      `📊 **Total loaded**: ${formatMoney(total, currency)} across ${count} expenses.`,
      `📈 **Average per expense**: ${formatMoney(average, currency)}.`,
      `📅 **Estimated monthly run rate**: ${formatMoney(monthlyEstimate, currency)}.`,
      '',
      '**Category Breakdown** (highest first):',
      ...catBreakdown,
      '',
      `🎯 **Optimization target**: ${topCatName} — this is where small cuts produce the biggest results.`,
      conflict ? `\n⚠️ Conflict: logged "${conflict.merchant || conflict.description}" at ${formatMoney(Number(conflict.amount), conflict.currency ?? currency)}. Review this entry?` : '',
    ].filter(Boolean),
    alternatives: [
      `🛡️ Comfort-preserving: keep quality, reduce frequency in ${topCatName} by 15% — saves ${formatMoney(topCatTotal * 0.15, currency)}.`,
      `💰 Savings-first: replace every 3rd discretionary purchase with a lower-cost substitute — saves ${formatMoney(trimTarget, currency)}.`,
      `✈️ Travel-priority: redirect ${topCatName} overflow into a dedicated trip fund — same total spending, different allocation.`,
    ],
    savingsPotential: `${formatMoney(trimTarget, currency)} estimated savings by trimming top flexible categories 15%. Monthly impact: ${formatMoney(monthlyEstimate * 0.15, currency)}/month.`,
    confidence: count >= 10 ? 'High' : count >= 5 ? 'Medium' : 'Low',
    confidencePercent: count >= 10 ? 80 : count >= 5 ? 55 : 30,
    intent: 'expense_optimization',
  }
}

// ─── Main Entry Point ────────────────────────────────────────────────

export function generateSmartExpenseAiResponse(
  prompt: string,
  expenses: ExpenseSnapshot[],
  prefs?: PreferenceMemory,
): SmartExpenseAiResponse {
  const memory = prefs ?? loadPreferences()
  const intent = classifyIntent(prompt)

  switch (intent) {
    case 'safety_redirect':
      return safetyRedirectResponse()
    case 'budget_planning':
      return tripBudgetResponse(prompt, expenses, memory)
    case 'price_comparison':
      return priceComparisonResponse(prompt, expenses)
    case 'subscription_audit':
      return subscriptionAuditResponse(prompt, expenses)
    case 'expense_optimization':
      return expenseOptimizationResponse(prompt, expenses, memory)
    case 'general_help':
    default:
      return generalHelpResponse(expenses, memory)
  }
}
