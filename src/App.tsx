import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'
import {
  buildLineChartPoints,
  buildTimeline,
  calculateInsights,
  calculateMonthlyComparison,
  calculateSummary,
  createCategoryBreakdown,
  createDonutGradient,
  createInitialRole,
  createInitialTheme,
  createInitialTransactions,
  defaultFormState,
  filterTransactions,
  getCategoryOptions,
  type Role,
  type SortKey,
  type Transaction,
  type TransactionFormState,
  storageKeys,
} from './financeDashboard'
import FinanceDashboardView from './components/FinanceDashboardView'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(createInitialTheme)
  const [role, setRole] = useState<Role>(createInitialRole)
  const [transactions, setTransactions] = useState(createInitialTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formState, setFormState] = useState<TransactionFormState>(defaultFormState)

  useEffect(() => {
    localStorage.setItem(storageKeys.theme, theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    localStorage.setItem(storageKeys.role, role)
  }, [role])

  useEffect(() => {
    localStorage.setItem(storageKeys.transactions, JSON.stringify(transactions))
  }, [transactions])

  const categoryOptions = useMemo(() => getCategoryOptions(transactions), [transactions])

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, searchTerm, categoryFilter, sortKey),
    [transactions, searchTerm, categoryFilter, sortKey],
  )

  const summary = useMemo(() => calculateSummary(transactions), [transactions])

  const timeline = useMemo(() => buildTimeline(transactions), [transactions])

  const spendingBreakdown = useMemo(() => createCategoryBreakdown(transactions), [transactions])
  const monthlyComparison = useMemo(() => calculateMonthlyComparison(transactions), [transactions])

  const insights = useMemo(() => calculateInsights(transactions, spendingBreakdown), [spendingBreakdown, transactions])

  const lineChart = useMemo(() => buildLineChartPoints(timeline), [timeline])

  const donutGradient = useMemo(() => createDonutGradient(spendingBreakdown), [spendingBreakdown])

  const handleAddOrUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (role !== 'admin') return

    const trimmedDescription = formState.description.trim()
    const trimmedCategory = formState.category.trim()
    const amountValue = Number(formState.amount)
    if (!trimmedDescription || !trimmedCategory || Number.isNaN(amountValue)) return

    const payload: Transaction = {
      id: editingId ?? Date.now(),
      date: formState.date,
      description: trimmedDescription,
      category: trimmedCategory,
      amount: amountValue,
      type: formState.type,
    }

    setTransactions((current) =>
      editingId === null ? [payload, ...current] : current.map((transaction) => (transaction.id === editingId ? payload : transaction)),
    )
    setEditingId(null)
    setFormState(defaultFormState)
  }

  const startEditing = (transaction: Transaction) => {
    if (role !== 'admin') return
    setEditingId(transaction.id)
    setFormState({ date: transaction.date, description: transaction.description, category: transaction.category, amount: transaction.amount.toString(), type: transaction.type })
    document.getElementById('role-based-ui')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const deleteTransaction = (id: number) => {
    if (role !== 'admin') return
    setTransactions((current) => current.filter((transaction) => transaction.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setFormState(defaultFormState)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormState(defaultFormState)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setSortKey('date-desc')
  }

  return (
    <FinanceDashboardView
      theme={theme}
      setTheme={setTheme}
      role={role}
      setRole={setRole}
      summary={summary}
      transactions={transactions}
      categoryOptions={categoryOptions}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      categoryFilter={categoryFilter}
      setCategoryFilter={setCategoryFilter}
      sortKey={sortKey}
      setSortKey={setSortKey}
      filteredTransactions={filteredTransactions}
      lineChart={lineChart}
      donutGradient={donutGradient}
      spendingBreakdown={spendingBreakdown}
      insights={insights}
      monthlyComparison={monthlyComparison}
      formState={formState}
      setFormState={setFormState}
      editingId={editingId}
      handleAddOrUpdate={handleAddOrUpdate}
      startEditing={startEditing}
      deleteTransaction={deleteTransaction}
      resetForm={resetForm}
      clearFilters={clearFilters}
    />
  )
}

export default App
