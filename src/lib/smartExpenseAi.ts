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
  notice?: string
}

type BudgetSignal = {
  amount: number | null
  currency: string
  days: number
}

type DestinationProfile = {
  label: string
  minDailyUsd: number
  standardDailyUsd: number
  comparable: string
}

const destinationProfiles: Record<string, DestinationProfile> = {
  bangkok: { label: 'Bangkok', minDailyUsd: 38, standardDailyUsd: 82, comparable: 'Thailand urban travel' },
  bali: { label: 'Bali', minDailyUsd: 42, standardDailyUsd: 90, comparable: 'Indonesia tourist hubs' },
  delhi: { label: 'Delhi', minDailyUsd: 32, standardDailyUsd: 72, comparable: 'India metro travel' },
  goa: { label: 'Goa', minDailyUsd: 36, standardDailyUsd: 86, comparable: 'India beach destinations' },
  mumbai: { label: 'Mumbai', minDailyUsd: 42, standardDailyUsd: 95, comparable: 'India metro travel' },
  dubai: { label: 'Dubai', minDailyUsd: 85, standardDailyUsd: 180, comparable: 'UAE city travel' },
  london: { label: 'London', minDailyUsd: 115, standardDailyUsd: 230, comparable: 'UK city travel' },
  paris: { label: 'Paris', minDailyUsd: 105, standardDailyUsd: 220, comparable: 'Western Europe city travel' },
  singapore: { label: 'Singapore', minDailyUsd: 95, standardDailyUsd: 190, comparable: 'Singapore city travel' },
  tokyo: { label: 'Tokyo', minDailyUsd: 82, standardDailyUsd: 170, comparable: 'Japan city travel' },
  'new york': { label: 'New York', minDailyUsd: 130, standardDailyUsd: 260, comparable: 'US major city travel' },
}

const currencyToUsd: Record<string, number> = {
  USD: 1,
  INR: 0.012,
  EUR: 1.08,
  GBP: 1.27,
}

const quickStopWords = new Set([
  'with',
  'from',
  'this',
  'that',
  'have',
  'want',
  'need',
  'budget',
  'expense',
  'expenses',
  'ticket',
  'tickets',
  'compare',
])

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)))
}

function toUserCurrency(usdAmount: number, currency: string) {
  const rate = currencyToUsd[currency] ?? 1
  return usdAmount / rate
}

function toUsd(amount: number, currency: string) {
  return amount * (currencyToUsd[currency] ?? 1)
}

function parseBudgetSignal(prompt: string): BudgetSignal {
  const lower = prompt.toLowerCase()
  const currency = lower.includes('inr') || lower.includes('rupee') || lower.includes('rs ') || prompt.includes('₹')
    ? 'INR'
    : lower.includes('eur') || prompt.includes('€')
      ? 'EUR'
      : lower.includes('gbp') || lower.includes('pound') || prompt.includes('£')
        ? 'GBP'
        : 'USD'

  const amountMatch = prompt.match(/(?:[$₹€£]\s*)?(\d[\d,]*(?:\.\d+)?)/)
  const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : null
  const dayMatch = lower.match(/(\d+)\s*(day|days|night|nights|week|weeks|month|months)/)
  const unit = dayMatch?.[2] ?? ''
  const count = dayMatch ? Number(dayMatch[1]) : 0
  const days = unit.startsWith('week') ? count * 7 : unit.startsWith('month') ? count * 30 : count || (lower.includes('monthly') ? 30 : 7)

  return { amount, currency, days }
}

function findDestination(prompt: string) {
  const lower = prompt.toLowerCase()
  const match = Object.entries(destinationProfiles).find(([key]) => lower.includes(key))
  return match?.[1] ?? null
}

function estimatePreference(prompt: string, expenses: ExpenseSnapshot[]) {
  const lower = prompt.toLowerCase()
  if (lower.includes('comfort') || lower.includes('hotel') || lower.includes('convenient')) return 'comfort'
  if (lower.includes('cheap') || lower.includes('save') || lower.includes('lowest')) return 'savings'
  if (lower.includes('experience') || lower.includes('activities') || lower.includes('foodie')) return 'experiences'

  const travelAndEntertainment = expenses
    .filter((expense) => ['travel', 'entertainment', 'food'].includes(expense.category))
    .reduce((sum, expense) => sum + Number(expense.amount), 0)
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  return total > 0 && travelAndEntertainment / total > 0.55 ? 'experiences' : 'savings'
}

function findLoggedConflict(prompt: string, expenses: ExpenseSnapshot[]) {
  const tokens = prompt
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4 && !quickStopWords.has(token))

  return expenses.find((expense) => {
    const haystack = `${expense.description ?? ''} ${expense.merchant ?? ''}`.toLowerCase()
    return tokens.some((token) => haystack.includes(token))
  })
}

function summarizeExpenses(expenses: ExpenseSnapshot[]) {
  const byCategory = new Map<string, number>()
  let total = 0

  for (const expense of expenses) {
    const amount = Number(expense.amount)
    total += amount
    byCategory.set(expense.category, (byCategory.get(expense.category) ?? 0) + amount)
  }

  const topCategory = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0]
  return { total, topCategory }
}

function subscriptionResponse(prompt: string, expenses: ExpenseSnapshot[]): SmartExpenseAiResponse {
  const recurringCandidates = expenses.filter((expense) => {
    const text = `${expense.description ?? ''} ${expense.merchant ?? ''}`.toLowerCase()
    return expense.category === 'bills' || expense.category === 'entertainment' || /(netflix|spotify|apple|prime|hulu|disney|subscription|phone)/.test(text)
  })
  const recurringTotal = recurringCandidates.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const serviceNames = recurringCandidates.map((expense) => expense.merchant || expense.description || expense.category).slice(0, 4)
  const targetSavings = recurringTotal > 0 ? recurringTotal * 0.22 : 18
  const conflict = findLoggedConflict(prompt, expenses)

  return {
    summary: recurringCandidates.length
      ? `Audit ${serviceNames.join(', ')} first; overlapping media or bill subscriptions are the fastest budget win.`
      : 'Start with a subscription inventory, then cancel overlap before chasing smaller savings.',
    breakdown: [
      `${formatMoney(recurringTotal || 80, 'USD')} estimated monthly recurring base from logged subscription-like expenses${recurringCandidates.length ? '' : ' or a typical starter stack'}.`,
      'Check overlap by function: music, video, cloud storage, phone, gym, news, and delivery memberships.',
      'Compare monthly vs. annual only for services you used in at least 8 of the last 12 months.',
      'Family or bundle plans are useful when they are legal, shared with real household members, and cheaper per active user.',
      conflict ? `This conflicts with your logged expense of ${formatMoney(Number(conflict.amount), conflict.currency ?? 'USD')} for ${conflict.merchant || conflict.description || conflict.category}. Adjust existing entry?` : 'No direct conflict found in the currently loaded expense entries.',
    ],
    alternatives: [
      'Keep one primary streaming service and rotate the rest monthly; cheaper, but you lose always-on access.',
      'Switch eligible services to annual billing; higher upfront cash use, but often 10-20% cheaper.',
      'Replace duplicate music/video subscriptions with one shared legal plan; lower cost, but needs coordinated users.',
    ],
    savingsPotential: `${formatMoney(targetSavings, 'USD')}/month estimated, or ${formatMoney(targetSavings * 12, 'USD')}/year if overlap is removed.`,
    confidence: recurringCandidates.length ? 'Medium' : 'Low',
  }
}

function flightResponse(prompt: string, expenses: ExpenseSnapshot[]): SmartExpenseAiResponse {
  const budget = parseBudgetSignal(prompt)
  const base = budget.amount ?? 420
  const currency = budget.currency
  const direct = base
  const flexible = base * 0.78
  const mixed = base * 0.62
  const conflict = findLoggedConflict(prompt, expenses)

  return {
    summary: 'Use the direct flight only if time matters most; flexible dates or mixed transport usually win on price.',
    breakdown: [
      `Direct flight estimate: ${formatMoney(direct, currency)}; best for time and convenience.`,
      `Flexible date or nearby-airport flight estimate: ${formatMoney(flexible, currency)}; lower price with moderate schedule friction.`,
      `Train plus overnight bus or split-ticket route estimate: ${formatMoney(mixed, currency)}; cheapest, but slower and less comfortable.`,
      'Compare total trip cost, not ticket cost alone: baggage, airport transfers, meals during layovers, and missed accommodation nights matter.',
      conflict ? `This conflicts with your logged expense of ${formatMoney(Number(conflict.amount), conflict.currency ?? currency)} for ${conflict.merchant || conflict.description || conflict.category}. Adjust existing entry?` : 'No matching logged ticket expense found in the current expense list.',
    ],
    alternatives: [
      'Shift departure by 1-3 days; often cheaper, but may cost an extra hotel night.',
      'Use one checked bag instead of two or choose carry-on only; cheaper, but packing flexibility drops.',
      'Compare nearby airports plus train transfer; cheaper on popular routes, but adds planning risk.',
    ],
    savingsPotential: `${formatMoney(direct - mixed, currency)} vs. the direct/default ticket estimate.`,
    confidence: 'Low',
    notice: 'Live airline inventory is not connected, so these are planning estimates rather than bookable fares.',
  }
}

function tripBudgetResponse(prompt: string, expenses: ExpenseSnapshot[]): SmartExpenseAiResponse {
  const budget = parseBudgetSignal(prompt)
  const destination = findDestination(prompt)
  const preference = estimatePreference(prompt, expenses)
  const currency = budget.currency
  const amount = budget.amount ?? toUserCurrency((destination?.standardDailyUsd ?? 95) * budget.days, currency)
  const usdBudget = toUsd(amount, currency)
  const minUsd = (destination?.minDailyUsd ?? 55) * budget.days
  const emergencyRate = prompt.toLowerCase().includes('no emergency') || prompt.toLowerCase().includes('without emergency') ? 0 : 0.12
  const usable = amount * (1 - emergencyRate)
  const accommodationRate = preference === 'comfort' ? 0.42 : preference === 'experiences' ? 0.28 : 0.32
  const foodRate = preference === 'experiences' ? 0.24 : 0.2
  const activitiesRate = preference === 'experiences' ? 0.28 : preference === 'comfort' ? 0.14 : 0.18
  const transportRate = 1 - accommodationRate - foodRate - activitiesRate
  const emergency = amount * emergencyRate
  const standard = toUserCurrency((destination?.standardDailyUsd ?? 95) * budget.days, currency)
  const minimum = toUserCurrency(minUsd, currency)

  if (usdBudget < minUsd) {
    return {
      summary: `That budget looks unrealistic for ${destination?.label ?? 'this destination'}; start near ${formatMoney(minimum, currency)} for a viable ${budget.days}-day plan.`,
      breakdown: [
        `Provided budget: ${formatMoney(amount, currency)} for ${budget.days} days.`,
        `Minimum viable estimate: ${formatMoney(minimum, currency)} before luxury upgrades.`,
        `Emergency buffer target: ${formatMoney(minimum * 0.12, currency)} for delays, medical basics, or missed transfers.`,
        destination ? `Destination basis: ${destination.comparable}.` : 'Pricing data limited for this region. Estimates based on mid-cost international city travel.',
      ],
      alternatives: [
        'Reduce trip length by 1-2 days; strongest savings with the least quality drop.',
        'Move from private hotel to hostel/private guesthouse; cheaper, but less privacy.',
        'Keep paid activities to one anchor experience and use free walking routes for the rest.',
      ],
      savingsPotential: `${formatMoney(standard - amount, currency)} gap vs. a standard/default plan, but the current budget needs more room to be practical.`,
      confidence: destination ? 'Medium' : 'Low',
      notice: destination ? undefined : 'Pricing data limited for this region. Estimates based on mid-cost international city travel.',
    }
  }

  return {
    summary: `${formatMoney(amount, currency)} can work for ${budget.days} days if you reserve ${formatMoney(emergency, currency)} and bias toward ${preference}.`,
    breakdown: [
      `Accommodation: ${formatMoney(usable * accommodationRate, currency)} for ${preference === 'comfort' ? 'reliable hotels or private rooms' : 'hostels, guesthouses, or value stays'}.`,
      `Food: ${formatMoney(usable * foodRate, currency)} with a mix of local meals, groceries, and a few planned treats.`,
      `Transport: ${formatMoney(usable * transportRate, currency)} for local transit, airport transfers, and route flexibility.`,
      `Activities: ${formatMoney(usable * activitiesRate, currency)} for paid experiences after prioritizing free/low-cost options.`,
      emergencyRate > 0 ? `Emergency reserve: ${formatMoney(emergency, currency)} held back at 12%.` : 'Emergency reserve: declined in the prompt, so all funds are allocated.',
    ],
    alternatives: [
      `Savings-first: cap accommodation at ${formatMoney(usable * 0.26, currency)} and shift more to transit/food; less comfort.`,
      `Experience-first: move ${formatMoney(usable * 0.08, currency)} from lodging to activities; better memories, leaner stays.`,
      `Comfort-first: spend ${formatMoney(usable * 0.45, currency)} on lodging and reduce paid attractions; calmer trip, fewer extras.`,
    ],
    savingsPotential: `${formatMoney(Math.max(0, standard - amount), currency)} vs. a standard/default ${destination?.label ?? 'destination'} plan.`,
    confidence: destination ? 'Medium' : 'Low',
    notice: destination ? undefined : 'Pricing data limited for this region. Estimates based on mid-cost international city travel.',
  }
}

function expenseOptimizationResponse(prompt: string, expenses: ExpenseSnapshot[]): SmartExpenseAiResponse {
  const { total, topCategory } = summarizeExpenses(expenses)
  const currency = expenses[0]?.currency ?? parseBudgetSignal(prompt).currency
  const topLabel = topCategory?.[0] ?? 'uncategorized'
  const topAmount = topCategory?.[1] ?? 0
  const targetSavings = total > 0 ? total * 0.15 : 120
  const conflict = findLoggedConflict(prompt, expenses)

  return {
    summary: expenses.length
      ? `${topLabel} is the best first category to optimize because it currently leads your loaded spending.`
      : 'Add a few expenses first; meanwhile, use a 50/30/20-style split with a separate travel buffer.',
    breakdown: [
      `Loaded spend: ${formatMoney(total, currency)} across ${expenses.length} entries.`,
      `Top category: ${topLabel} at ${formatMoney(topAmount, currency)}.`,
      'Budget guardrail: set one weekly cap for variable spending and one monthly cap for recurring bills.',
      'Use a 10-15% emergency buffer before allocating money to optional upgrades.',
      conflict ? `This conflicts with your logged expense of ${formatMoney(Number(conflict.amount), conflict.currency ?? currency)} for ${conflict.merchant || conflict.description || conflict.category}. Adjust existing entry?` : 'No specific conflicting logged expense found for this request.',
    ],
    alternatives: [
      'Comfort-preserving trim: keep quality, reduce frequency of the top category by 15%.',
      'Savings-first trim: replace every third discretionary purchase with a lower-cost substitute.',
      'Travel-priority trim: move entertainment and shopping overflow into a dedicated trip fund.',
    ],
    savingsPotential: `${formatMoney(targetSavings, currency)} estimated if you trim the top flexible categories by about 15%.`,
    confidence: expenses.length ? 'Medium' : 'Low',
  }
}

export function generateSmartExpenseAiResponse(prompt: string, expenses: ExpenseSnapshot[]): SmartExpenseAiResponse {
  const lower = prompt.toLowerCase()

  if (/(safe|safety|crime|danger|risk score|globe|advisory)/.test(lower)) {
    return {
      summary: 'For safety information, please check the Safety Globe feature.',
      breakdown: [
        'I only operate inside the Expense Tracker module.',
        'I can help estimate travel budgets, compare cost alternatives, and optimize subscriptions.',
      ],
      alternatives: [
        'Ask for a destination budget estimate.',
        'Ask for cheaper flight or transport structures.',
        'Ask for subscription overlap and recurring cost savings.',
      ],
      savingsPotential: 'No expense savings calculated because this request is outside the expense module.',
      confidence: 'High',
    }
  }

  if (/(subscription|netflix|spotify|apple music|prime|recurring|monthly bill|annual plan|loyalty)/.test(lower)) {
    return subscriptionResponse(prompt, expenses)
  }

  if (/(flight|airline|ticket|train|bus|route|fare|layover)/.test(lower)) {
    return flightResponse(prompt, expenses)
  }

  if (/(trip|travel|destination|hotel|hostel|airbnb|accommodation|itinerary|days|nights|budget)/.test(lower)) {
    return tripBudgetResponse(prompt, expenses)
  }

  return expenseOptimizationResponse(prompt, expenses)
}
