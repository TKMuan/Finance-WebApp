import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useGetTransactionBalance, useGetTransactionDashboard, useGetTransactions } from '../hooks'
import type { Transaction, TransactionDashboard } from '../types'
import { LogOut, User } from 'lucide-react'
import { LoadingComponent } from '../components'

interface TransactionDisplayProp {
    record: Transaction,
}

const TransactionDisplayComponent = ({record}: TransactionDisplayProp) => {
  const isDebit = record.type

  return (
    <div className={`transaction-card ${isDebit ? 'transaction-card--debit' : 'transaction-card--credit'}`}>
      <div className="transaction-card__body">
        <p className="transaction-title">{record.description}</p>
        <div className="transaction-meta-row">
          <span className={`transaction-pill transaction-amount-${isDebit ? '--debit' : '--credit'}`}>
            $ {record.amount}
          </span>
          <span className={`transaction-pill ${isDebit ? 'transaction-pill--debit' : 'transaction-pill--credit'}`}>
            {record.methodName}
          </span>
          <span className={`transaction-pill ${isDebit ? 'transaction-pill--debit' : 'transaction-pill--credit'}`}>
            {record.transaction_time.getDate()}-{record.transaction_time.getMonth() + 1}-{record.transaction_time.getFullYear()}
          </span>
        </div>
        <div className="transaction-group-row">
          {record.groups?.map((groupRecord) => (
            <span key={groupRecord.id} id={groupRecord.id} className={`transaction-pill ${isDebit ? 'transaction-pill--debit' : 'transaction-pill--credit'}`}>
              {groupRecord.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const {user, logout, loading} = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const {data: recentTransaction, isPending: gettingTransactions} = useGetTransactions(user?.id || "", 0, 10,{
    "from_amount":  null,
    "to_amount":  null,
    "desc": null,
    "tType": null,
    "method": null,
    "from_date": null,
    "to_date": null,
    "group": null,
    "page": 0,
    "limit": 10
  })
  const {data: dashboardStats, isPending: gettingDashStat} = useGetTransactionDashboard(user?.id || "")
  const {data: balanceData, isPending: gettingBalance} = useGetTransactionBalance(user?.id || "")

  const spendingTotals = useMemo(() => {
    const sumRecords = (records: TransactionDashboard[] = []) =>
      records.reduce((total, record) => total + parseFloat(record.sum), 0)

    return {
      day: sumRecords(dashboardStats?.data?.day),
      month: sumRecords(dashboardStats?.data?.month),
      year: sumRecords(dashboardStats?.data?.year),
    }
  }, [dashboardStats])

  if (loading || gettingTransactions || gettingDashStat || gettingBalance) {
    return <LoadingComponent />
  }

  const statCards = [
    {
      key: 'day',
      title: 'Day Spending Total',
      total: spendingTotals.day,
      items: dashboardStats?.data?.day || [],
      cardClass: 'app-stat-card--day',
      pillClass: 'app-pill--day',
    },
    {
      key: 'month',
      title: 'Month Spending Total',
      total: spendingTotals.month,
      items: dashboardStats?.data?.month || [],
      cardClass: 'app-stat-card--month',
      pillClass: 'app-pill--month',
    },
    {
      key: 'year',
      title: 'Year Spending Total',
      total: spendingTotals.year,
      items: dashboardStats?.data?.year || [],
      cardClass: 'app-stat-card--year',
      pillClass: 'app-pill--year',
    },
    {
      key: 'balance',
      title: 'Methods Balances',
      items: balanceData?.data || [],
      cardClass: 'app-stat-card--balance',
      pillClass: 'app-pill--balance',
    },
  ]

  return (
    <div className="app-page">
      <div className="app-shell">
        <div className="app-frame">
          <header className="app-topbar">
            <div className="app-topbar__row">
              <div>
                <h1 className="app-title">Dashboard</h1>
                <p className="app-subtitle">A sharper view of spending, balances, and recent activity.</p>
              </div>
              <div className="app-topbar__profile">
                <button
                  type="button"
                  className="app-icon-button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  aria-expanded={profileOpen}
                  aria-label="Open profile menu"
                >
                  <User size={20} />
                </button>

                {profileOpen && (
                  <div className="app-menu">
                    <p className="app-menu__text">Username: <span className="app-menu__value">{user?.fname}</span></p>
                    <p className="app-menu__text">Email: <span className="app-menu__value">{user?.email}</span></p>
                    <button
                      type="button"
                      className="app-action"
                      onClick={() => { setProfileOpen(false); logout(); navigate('/info', {replace: true}) }}
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="app-content">
            <p className="app-intro">Welcome to your dashboard!</p>

            <section className="app-section">
              <div className="app-section__header" style={{marginBottom: 12}}>
                <h2 className="app-section__title">Spending Analysis</h2>
                <span className="app-section__tag">Live Overview</span>
              </div>
              <div className="app-grid-4">
                {statCards.map((card) => (
                  <div key={card.key} className={`app-stat-card ${card.cardClass}`}>
                    <p className="app-stat-card__title">{card.title}</p>
                    {'total' in card && typeof card.total === 'number' && (
                      <p className="app-stat-card__total"> $ {card.total}</p>
                    )}
                    <div className="app-pill-row">
                      {card.items.map((record: TransactionDashboard) => (
                        <span key={`${card.key}-${record.name}`} className={`app-pill ${card.pillClass}`}>
                          <span>{record.name}</span>
                          <span>: $ {record.sum}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="app-section">
              <div className="app-section__header">
                <h2 className="app-section__title">Recent Transactions</h2>
              </div>
              <div className="app-list">
                {recentTransaction?.data.map((record) => (
                  <div key={record.id} id={record.id} className="app-list-card">
                    <TransactionDisplayComponent record={record} />
                  </div>
                ))}
              </div>
            </section>

            <div className="app-controls" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="app-button app-button--subtle grow" onClick={() => navigate('/groups')}>
                Manage Groups
              </button>
              <button type="button" className="app-button app-button--subtle grow" onClick={() => navigate('/methods')}>
                Manage Methods
              </button>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <button type="button" className="app-button app-button--primary" style={{ width: '100%' }} onClick={() => navigate('/transactions')}>
                Manage Transactions
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}