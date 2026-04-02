export type Role = 'viewer' | 'admin'
export type TransactionType = 'income' | 'expense'
export type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

export type Transaction = {
  id: number
  date: string
  description: string
  category: string
  amount: number
  type: TransactionType
}

export type TransactionFormState = {
  date: string
  description: string
  category: string
  amount: string
  type: TransactionType
}

export type CategoryBreakdownEntry = {
  category: string
  amount: number
}

export type TimelinePoint = {
  date: string
  label: string
  balance: number
}

export type LineChartPoint = {
  x: number
  y: number
  balance: number
  label: string
}

export type MonthlyComparison = {
  currentMonth: string
  previousMonth: string
  currentNet: number
  previousNet: number
  difference: number
}

export type Insights = {
  topCategory?: CategoryBreakdownEntry
  largestExpense?: Transaction
  averageExpense: number
}

export const storageKeys = {
  transactions: 'finance-dashboard-transactions',
  role: 'finance-dashboard-role',
  theme: 'finance-dashboard-theme',
} as const

export const initialTransactions: Transaction[] = [
  { id: 1, date: '2026-03-29', description: 'Salary deposit', category: 'Income', amount: 6400, type: 'income' },
  { id: 2, date: '2026-03-30', description: 'Apartment rent', category: 'Housing', amount: 2100, type: 'expense' },
  { id: 3, date: '2026-03-30', description: 'Freelance project', category: 'Income', amount: 1200, type: 'income' },
  { id: 4, date: '2026-03-31', description: 'Weekly groceries', category: 'Food', amount: 165, type: 'expense' },
  { id: 5, date: '2026-04-01', description: 'Ride share and commute', category: 'Transport', amount: 94, type: 'expense' },
  { id: 6, date: '2026-04-01', description: 'Dividend payout', category: 'Investments', amount: 240, type: 'income' },
  { id: 7, date: '2026-04-02', description: 'Internet and utilities', category: 'Utilities', amount: 178, type: 'expense' },
  { id: 8, date: '2026-04-02', description: 'Gym membership', category: 'Health', amount: 72, type: 'expense' },
  { id: 9, date: '2026-04-03', description: 'Client retainer', category: 'Income', amount: 1800, type: 'income' },
  { id: 10, date: '2026-04-03', description: 'Dining out', category: 'Food', amount: 58, type: 'expense' },
  { id: 11, date: '2026-04-03', description: 'Entertainment subscription', category: 'Entertainment', amount: 29, type: 'expense' },
]

export const defaultFormState: TransactionFormState = {
  date: '2026-04-03',
  description: '',
  category: 'Food',
  amount: '',
  type: 'expense',
}

export const formCategoryOptions = ['Food', 'Housing', 'Income', 'Transport'] as const

export const categoryPalette = [
  'rgba(109, 40, 217, 1)',
  'rgba(37, 99, 235, 1)',
  'rgba(14, 165, 233, 1)',
  'rgba(20, 184, 166, 1)',
  'rgba(249, 115, 22, 1)',
  'rgba(244, 63, 94, 1)',
  'rgba(168, 85, 247, 1)',
]

export const chartWidth = 680
export const chartHeight = 200

export function currency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function shortCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

export function monthLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(new Date(`${value}-01T00:00:00`))
}

export function getNetAmount(transaction: Transaction) {
  return transaction.type === 'income' ? transaction.amount : -transaction.amount
}

export function createInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  return localStorage.getItem(storageKeys.theme) === 'light' ? 'light' : 'dark'
}

export function createInitialRole() {
  if (typeof window === 'undefined') return 'viewer'
  return localStorage.getItem(storageKeys.role) === 'admin' ? 'admin' : 'viewer'
}

export function createInitialTransactions() {
  if (typeof window === 'undefined') return initialTransactions
  const stored = localStorage.getItem(storageKeys.transactions)

  if (!stored) return initialTransactions

  try {
    const parsed = JSON.parse(stored) as Transaction[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialTransactions
  } catch {
    return initialTransactions
  }
}

export function createCategoryBreakdown(transactions: Transaction[]) {
  const totals = new Map<string, number>()

  transactions.forEach((transaction) => {
    if (transaction.type !== 'expense') return
    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount)
  })

  return Array.from(totals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((left, right) => right.amount - left.amount)
}

export function getCategoryOptions(transactions: Transaction[]) {
  return Array.from(new Set(transactions.map((transaction) => transaction.category))).sort((left, right) => left.localeCompare(right))
}

export function filterTransactions(transactions: Transaction[], searchTerm: string, categoryFilter: string, sortKey: SortKey) {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  return [...transactions]
    .filter((transaction) => {
      const matchesSearch =
        !normalizedSearch ||
        [transaction.description, transaction.category, transaction.type].join(' ').toLowerCase().includes(normalizedSearch)
      const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((left, right) => {
      if (sortKey === 'date-desc') return +new Date(right.date) - +new Date(left.date)
      if (sortKey === 'date-asc') return +new Date(left.date) - +new Date(right.date)
      const amountDifference = right.amount - left.amount
      return sortKey === 'amount-desc' ? amountDifference : -amountDifference
    })
}

export function calculateSummary(transactions: Transaction[]) {
  const income = transactions.filter((transaction) => transaction.type === 'income').reduce((total, transaction) => total + transaction.amount, 0)
  const expenses = transactions.filter((transaction) => transaction.type === 'expense').reduce((total, transaction) => total + transaction.amount, 0)
  const balance = income - expenses
  const savingsRate = income === 0 ? 0 : (balance / income) * 100
  return { income, expenses, balance, savingsRate }
}

export function buildTimeline(transactions: Transaction[]) {
  const ordered = [...transactions].sort((left, right) => +new Date(left.date) - +new Date(right.date))
  let runningBalance = 0

  return ordered.map((transaction) => {
    runningBalance += getNetAmount(transaction)
    return { date: transaction.date, label: formatDate(transaction.date), balance: runningBalance }
  })
}

export function buildLineChartPoints(timeline: TimelinePoint[]) {
  if (timeline.length === 0) {
    return { polyline: '', points: [] as LineChartPoint[] }
  }

  const minBalance = Math.min(...timeline.map((point) => point.balance))
  const maxBalance = Math.max(...timeline.map((point) => point.balance))
  const spread = Math.max(maxBalance - minBalance, 1)
  const step = timeline.length === 1 ? 0 : chartWidth / (timeline.length - 1)

  const points = timeline.map((point, index) => {
    const x = index * step
    const normalized = (point.balance - minBalance) / spread
    const y = chartHeight - normalized * (chartHeight - 24) - 12
    return { x, y, balance: point.balance, label: point.label }
  })

  return { polyline: points.map((point) => `${point.x},${point.y}`).join(' '), points }
}

export function createDonutGradient(spendingBreakdown: CategoryBreakdownEntry[]) {
  if (spendingBreakdown.length === 0) {
    return 'conic-gradient(rgba(148, 163, 184, 0.25) 0deg 360deg)'
  }

  const total = spendingBreakdown.reduce((sum, item) => sum + item.amount, 0)
  let cursor = 0
  const segments = spendingBreakdown.map((item, index) => {
    const start = cursor
    const percentage = item.amount / total
    cursor += percentage * 360
    const end = index === spendingBreakdown.length - 1 ? 360 : cursor
    return `${categoryPalette[index % categoryPalette.length]} ${start}deg ${end}deg`
  })

  return `conic-gradient(${segments.join(', ')})`
}

export function calculateMonthlyComparison(transactions: Transaction[]): MonthlyComparison {
  const monthTotals = new Map<string, { income: number; expenses: number }>()

  transactions.forEach((transaction) => {
    const month = transaction.date.slice(0, 7)
    const current = monthTotals.get(month) ?? { income: 0, expenses: 0 }
    if (transaction.type === 'income') current.income += transaction.amount
    else current.expenses += transaction.amount
    monthTotals.set(month, current)
  })

  const sortedMonths = Array.from(monthTotals.entries()).sort((left, right) => left[0].localeCompare(right[0]))
  const currentMonth = sortedMonths.at(-1)
  const previousMonth = sortedMonths.at(-2)
  const currentNet = currentMonth ? currentMonth[1].income - currentMonth[1].expenses : 0
  const previousNet = previousMonth ? previousMonth[1].income - previousMonth[1].expenses : 0

  return {
    currentMonth: currentMonth ? monthLabel(currentMonth[0]) : 'Current month',
    previousMonth: previousMonth ? monthLabel(previousMonth[0]) : 'Previous month',
    currentNet,
    previousNet,
    difference: currentNet - previousNet,
  }
}

export function calculateInsights(transactions: Transaction[], spendingBreakdown: CategoryBreakdownEntry[]): Insights {
  const topCategory = spendingBreakdown[0]
  const largestExpense = [...transactions].filter((transaction) => transaction.type === 'expense').sort((left, right) => right.amount - left.amount)[0]
  const averageExpense = spendingBreakdown.reduce((total, item) => total + item.amount, 0) / Math.max(spendingBreakdown.length, 1)
  return { topCategory, largestExpense, averageExpense }
}