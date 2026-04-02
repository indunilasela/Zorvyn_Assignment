import {
  categoryPalette,
  chartHeight,
  chartWidth,
  currency,
  formCategoryOptions,
  formatDate,
  shortCurrency,
  type CategoryBreakdownEntry,
  type LineChartPoint,
  type MonthlyComparison,
  type Role,
  type SortKey,
  type Transaction,
  type TransactionFormState,
  type TransactionType,
  type Insights,
} from '../financeDashboard'
import type { Dispatch, FormEvent, SetStateAction } from 'react'

type FinanceDashboardViewProps = {
  theme: 'light' | 'dark'
  setTheme: Dispatch<SetStateAction<'light' | 'dark'>>
  role: Role
  setRole: (value: Role) => void
  summary: {
    income: number
    expenses: number
    balance: number
    savingsRate: number
  }
  transactions: Transaction[]
  categoryOptions: string[]
  searchTerm: string
  setSearchTerm: (value: string) => void
  categoryFilter: string
  setCategoryFilter: (value: string) => void
  sortKey: SortKey
  setSortKey: (value: SortKey) => void
  filteredTransactions: Transaction[]
  lineChart: { polyline: string; points: LineChartPoint[] }
  donutGradient: string
  spendingBreakdown: CategoryBreakdownEntry[]
  insights: Insights
  monthlyComparison: MonthlyComparison
  formState: TransactionFormState
  setFormState: Dispatch<SetStateAction<TransactionFormState>>
  editingId: number | null
  handleAddOrUpdate: (event: FormEvent<HTMLFormElement>) => void
  startEditing: (transaction: Transaction) => void
  deleteTransaction: (id: number) => void
  resetForm: () => void
  clearFilters: () => void
}

function FinanceDashboardView({
  theme,
  setTheme,
  role,
  setRole,
  summary,
  transactions,
  categoryOptions,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  sortKey,
  setSortKey,
  filteredTransactions,
  lineChart,
  donutGradient,
  spendingBreakdown,
  insights,
  monthlyComparison,
  formState,
  setFormState,
  editingId,
  handleAddOrUpdate,
  startEditing,
  deleteTransaction,
  resetForm,
  clearFilters,
}: FinanceDashboardViewProps) {
  return (
    <main className="dashboard-shell">
      <nav className="top-nav card" aria-label="Dashboard navigation">
        <div>
          <p className="eyebrow">FinTrack</p>
        </div>

        <div className="nav-right">
          <div className="nav-links">
            <a href="#overview">Overview</a>
            <a href="#analytics">Analytics</a>
            <a href="#transactions">Transactions</a>
            <a href="#insights">Insights</a>
          </div>

          <div className="nav-controls">
            <div className="control-group nav-control-group">
              <div className={`theme-slider-wrap ${theme}`}>
                <label className="theme-slider-label" aria-label="Theme switch">
                  <input
                    className="theme-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="1"
                    value={theme === 'dark' ? 1 : 0}
                    onChange={(event) => setTheme(event.target.value === '1' ? 'dark' : 'light')}
                  />
                  <span className="theme-slider-track" />
                  <span className="theme-slider-thumb" />
                  <span className={theme === 'dark' ? 'theme-mode theme-mode-left active' : 'theme-mode theme-mode-right'}>
                    {theme === 'dark' ? 'Light' : 'Dark'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <section className="hero-panel" id="overview">
        <div className="hero-copy">
          
          <h1>Smart Finance Dashboard</h1>
          <p className="hero-text">A responsive finance dashboard for tracking income, expenses, and financial trends. Includes interactive charts, transaction management, role-based UI, and insightful analytics to better understand money flow.</p>
        </div>

        <div className="hero-controls card">
          <div className="control-group">
            <span>Role</span>
            <div className={`role-switch ${role}`} role="group" aria-label="Role selector">
              <button className="role-option" type="button" aria-pressed={role === 'viewer'} onClick={() => setRole('viewer')}>
                Viewer
              </button>
              <button className="role-option" type="button" aria-pressed={role === 'admin'} onClick={() => setRole('admin')}>
                Admin
              </button>
            </div>
          </div>

          <div className="control-group">
            <span>Theme</span>
            <p className="card-meta">Use the top navigation switch to change the theme.</p>
          </div>
        </div>
      </section>

      <section className="summary-grid" aria-label="Summary cards">
        <article className="card summary-card primary-card">
          <div>
            <p className="card-label">Total balance</p>
            <h2>{currency(summary.balance)}</h2>
          </div>
          <span className={`status-chip ${summary.balance >= 0 ? 'positive' : 'negative'}`}>{summary.balance >= 0 ? 'Healthy cash position' : 'Needs attention'}</span>
        </article>

        <article className="card summary-card">
          <div>
            <p className="card-label">Income</p>
            <h2>{currency(summary.income)}</h2>
          </div>
          <p className="card-meta">{transactions.filter((item) => item.type === 'income').length} entries</p>
        </article>

        <article className="card summary-card">
          <div>
            <p className="card-label">Expenses</p>
            <h2>{currency(summary.expenses)}</h2>
          </div>
          <p className="card-meta">{transactions.filter((item) => item.type === 'expense').length} entries</p>
        </article>

        <article className="card summary-card">
          <div>
            <p className="card-label">Savings rate</p>
            <h2>{summary.savingsRate.toFixed(1)}%</h2>
          </div>
          <p className="card-meta">Net income retained this period</p>
        </article>
      </section>

      <section className="content-grid">
        <div className="main-column">
          <section className="card chart-card" id="analytics">
            <div className="section-header">
              <div>
                <p className="card-label">Time trend</p>
                <h3>Balance movement over time</h3>
              </div>
              <p className="card-meta">Running balance after each transaction</p>
            </div>

            <div className="line-chart-wrap">
              {lineChart.points.length > 0 ? (
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="line-chart" role="img" aria-label="Balance trend chart">
                  <defs>
                    <linearGradient id="trend-line" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                      <stop offset="50%" stopColor="rgba(34, 197, 94, 0.9)" />
                      <stop offset="100%" stopColor="rgba(244, 114, 182, 0.95)" />
                    </linearGradient>
                    <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    </linearGradient>
                  </defs>

                  <path d={`M 0 ${chartHeight} L ${lineChart.points.map((point) => `${point.x} ${point.y}`).join(' L ')} L ${chartWidth} ${chartHeight} Z`} fill="url(#trend-fill)" />
                  <polyline points={lineChart.polyline} fill="none" stroke="url(#trend-line)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />

                  {lineChart.points.map((point) => (
                    <g key={`${point.label}-${point.balance}`}>
                      <circle cx={point.x} cy={point.y} r="5.5" fill="var(--surface)" />
                      <circle cx={point.x} cy={point.y} r="3.25" fill="var(--accent)" />
                    </g>
                  ))}
                </svg>
              ) : (
                <div className="empty-state compact"><p>No timeline data yet.</p></div>
              )}
            </div>

            <div className="chart-axis">
              {lineChart.points.slice(0, 3).map((point) => (
                <span key={point.label}>{point.label}</span>
              ))}
              {lineChart.points.length > 4 && <span>...</span>}
              {lineChart.points.slice(-2).map((point) => (
                <span key={`${point.label}-${point.balance}`}>{point.label}</span>
              ))}
            </div>
          </section>

          <section className="card chart-card two-column-chart">
            <div>
              <div className="section-header">
                <div>
                  <p className="card-label">Categorical view</p>
                  <h3>Spending breakdown</h3>
                </div>
                <p className="card-meta">Expense categories ranked by total</p>
              </div>

              <div className="donut-wrap">
                <div className="donut" style={{ backgroundImage: donutGradient }}>
                  <div className="donut-center">
                    <span>{shortCurrency(summary.expenses)}</span>
                    <small>Expenses</small>
                  </div>
                </div>

                <div className="legend-list">
                  {spendingBreakdown.length > 0 ? (
                    spendingBreakdown.map((entry, index) => {
                      const percent = summary.expenses === 0 ? 0 : (entry.amount / summary.expenses) * 100
                      return (
                        <div className="legend-row" key={entry.category}>
                          <span className="legend-swatch" style={{ backgroundColor: categoryPalette[index % categoryPalette.length] }} />
                          <div>
                            <strong>{entry.category}</strong>
                            <p>{percent.toFixed(0)}% of expenses</p>
                          </div>
                          <span>{currency(entry.amount)}</span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="empty-state compact"><p>No expense categories available.</p></div>
                  )}
                </div>
              </div>
            </div>

            <div className="insight-stack">
              <div className="mini-stat card-soft">
                <p className="card-label">Top category</p>
                <strong>{insights.topCategory ? insights.topCategory.category : 'None'}</strong>
                <span>{insights.topCategory ? currency(insights.topCategory.amount) : 'No expense data'}</span>
              </div>

              <div className="mini-stat card-soft">
                <p className="card-label">Largest expense</p>
                <strong>{insights.largestExpense ? insights.largestExpense.description : 'None'}</strong>
                <span>{insights.largestExpense ? currency(insights.largestExpense.amount) : 'No data'}</span>
              </div>

              <div className="mini-stat card-soft">
                <p className="card-label">Average category spend</p>
                <strong>{currency(insights.averageExpense)}</strong>
                <span>Across tracked expense groups</span>
              </div>
            </div>
          </section>

          <section className="card transactions-card" id="transactions">
            <div className="section-header">
              <div>
                <p className="card-label">Transactions</p>
                <h3>Search, filter, and sort the ledger</h3>
              </div>
              <div className="section-actions">
                <button className="ghost-button" type="button" onClick={clearFilters}>Clear filters</button>
              </div>
            </div>

            <div className="filters-row">
              <label>
                <span>Search</span>
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} type="search" placeholder="Search description, category, or type" />
              </label>

              <label>
                <span>Category</span>
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                  <option value="all">All categories</option>
                  {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>

              <label>
                <span>Sort</span>
                <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
                  <option value="date-desc">Newest first</option>
                  <option value="date-asc">Oldest first</option>
                  <option value="amount-desc">Largest amount</option>
                  <option value="amount-asc">Smallest amount</option>
                </select>
              </label>
            </div>

            {filteredTransactions.length > 0 ? (
              <div className="transaction-list">
                {filteredTransactions.map((transaction) => (
                  <article className="transaction-row" key={transaction.id}>
                    <div className="transaction-main">
                      <span className={`type-pill ${transaction.type}`}>{transaction.type}</span>
                      <div>
                        <h4>{transaction.description}</h4>
                        <p>{formatDate(transaction.date)} · {transaction.category}</p>
                      </div>
                    </div>

                    <div className="transaction-meta">
                      <strong className={transaction.type}>{transaction.type === 'income' ? '+' : '-'}{currency(transaction.amount)}</strong>
                      <span>{transaction.category}</span>
                    </div>

                    <div className="transaction-actions">
                      {role === 'admin' ? (
                        <>
                          <button type="button" onClick={() => startEditing(transaction)}>Edit</button>
                          <button type="button" className="danger-button" onClick={() => deleteTransaction(transaction.id)}>Delete</button>
                        </>
                      ) : (
                        <span className="viewer-note">Viewer mode</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h4>No matching transactions</h4>
                <p>Adjust the search, category, or sorting filters to reveal more data.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="side-column" id="insights">
          <section className="card insight-card">
            <div className="section-header">
              <div>
                <p className="card-label">Monthly comparison</p>
                <h3>Current vs previous month</h3>
              </div>
            </div>

            <div className="comparison-grid">
              <div>
                <span>{monthlyComparison.currentMonth}</span>
                <strong>{currency(monthlyComparison.currentNet)}</strong>
              </div>
              <div>
                <span>{monthlyComparison.previousMonth}</span>
                <strong>{currency(monthlyComparison.previousNet)}</strong>
              </div>
            </div>

            <p className={`comparison-note ${monthlyComparison.difference >= 0 ? 'positive' : 'negative'}`}>
              {monthlyComparison.difference >= 0 ? 'Up' : 'Down'} {currency(Math.abs(monthlyComparison.difference))} versus the previous month.
            </p>
          </section>

          <section className="card admin-card" id="role-based-ui">
            <div className="section-header">
              <div>
                <p className="card-label">Role-based</p>
                <h3>{role === 'admin' ? 'Admin controls' : 'Read-only access'}</h3>
              </div>
            </div>

            {role === 'admin' ? (
              <form className="transaction-form" onSubmit={handleAddOrUpdate}>
                <label>
                  <span>Date</span>
                  <input value={formState.date} onChange={(event) => setFormState((current) => ({ ...current, date: event.target.value }))} type="date" />
                </label>

                <label>
                  <span>Description</span>
                  <input value={formState.description} onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))} type="text" placeholder="What changed?" />
                </label>

                <div className="two-up-fields">
                  <label>
                    <span>Category</span>
                    <select value={formState.category} onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))}>
                      {formCategoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Amount</span>
                    <input value={formState.amount} onChange={(event) => setFormState((current) => ({ ...current, amount: event.target.value }))} type="number" min="0" step="1" placeholder="0" />
                  </label>
                </div>

                <label>
                  <span>Type</span>
                  <select value={formState.type} onChange={(event) => setFormState((current) => ({ ...current, type: event.target.value as TransactionType }))}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </label>

                <div className="form-actions">
                  <button className="primary-button" type="submit">{editingId === null ? 'Add transaction' : 'Update transaction'}</button>
                  <button type="button" className="ghost-button" onClick={resetForm}>Reset</button>
                </div>
              </form>
            ) : (
              <div className="read-only-panel">
                <p>Viewer mode is locked to exploration only. Switch to admin to add, edit, or delete transactions.</p>
                <div className="role-badge-row">
                  <span className="status-chip neutral">View only</span>
                  <span className="status-chip neutral">No writes</span>
                </div>
              </div>
            )}
          </section>

          <section className="card insight-card">
            <div className="section-header">
              <div>
                <p className="card-label">What stands out</p>
                <h3>Quick observations</h3>
              </div>
            </div>

            <ul className="insight-list">
              <li>The highest expense bucket is {insights.topCategory?.category ?? 'not yet available'}.</li>
              <li>The current net result is {summary.balance >= 0 ? 'positive' : 'negative'}, which helps reveal how much room is left after spending.</li>
              <li>Use the filters above to isolate recurring costs or larger one-off purchases.</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  )
}

export default FinanceDashboardView