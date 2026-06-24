import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { formatCurrency } from '../utils/format.js'

const ACCOUNT_TYPES = ['SAVINGS', 'CHECKING', 'CURRENT']

export default function Dashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [accounts, setAccounts] = useState([])
  const [recentTxns, setRecentTxns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ accountType: 'SAVINGS', initialDeposit: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [accRes, txRes] = await Promise.all([
        apiClient.get('/api/accounts'),
        apiClient.get('/api/transactions')
      ])
      setAccounts(accRes.data)
      setRecentTxns(txRes.data.slice(0, 5))
    } catch (err) {
      toast.error(err.userMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validate = () => {
    const next = {}
    if (!ACCOUNT_TYPES.includes(form.accountType)) next.accountType = 'Select an account type'
    if (form.initialDeposit === '' || form.initialDeposit === null) {
      next.initialDeposit = 'Initial deposit is required'
    } else if (Number(form.initialDeposit) < 0) {
      next.initialDeposit = 'Initial deposit cannot be negative'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleOpenAccount = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await apiClient.post('/api/accounts', {
        accountType: form.accountType,
        holderName: user?.fullName,
        initialDeposit: Number(form.initialDeposit)
      })
      toast.success('Account opened successfully!')
      setShowForm(false)
      setForm({ accountType: 'SAVINGS', initialDeposit: '' })
      loadData()
    } catch (err) {
      toast.error(err.userMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0)

  return (
    <div className="page">
      <section className="balance-banner">
        <div>
          <p className="balance-label">Total balance</p>
          <p className="balance-amount">{formatCurrency(totalBalance)}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close' : '+ Open account'}
        </button>
      </section>

      {/* Summary cards */}
      <section className="summary-row dashboard-stats">
        <div className="summary-stat">
          <span className="summary-label">Accounts</span>
          <span className="summary-value">{accounts.length}</span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Savings</span>
          <span className="summary-value">{accounts.filter((a) => a.accountType === 'SAVINGS').length}</span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Checking</span>
          <span className="summary-value">{accounts.filter((a) => a.accountType === 'CHECKING').length}</span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Recent activity</span>
          <span className="summary-value">{recentTxns.length} txns</span>
        </div>
      </section>

      {showForm && (
        <section className="card form-card">
          <h2 className="card-title">Open a new account</h2>
          <form onSubmit={handleOpenAccount} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="accountType">Account type</label>
                <select
                  id="accountType"
                  value={form.accountType}
                  onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                {errors.accountType && <span className="field-error">{errors.accountType}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="initialDeposit">Initial deposit (USD)</label>
                <input
                  id="initialDeposit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.initialDeposit}
                  onChange={(e) => setForm({ ...form, initialDeposit: e.target.value })}
                  className={errors.initialDeposit ? 'input-error' : ''}
                  placeholder="0.00"
                />
                {errors.initialDeposit && <span className="field-error">{errors.initialDeposit}</span>}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Opening…' : 'Open account'}
            </button>
          </form>
        </section>
      )}

      <section>
        <h2 className="section-title">Your accounts</h2>
        {loading ? (
          <div className="card empty-state"><div className="spinner" /></div>
        ) : accounts.length === 0 ? (
          <div className="card empty-state">
            <p>You don&apos;t have any accounts yet.</p>
            <p className="muted">Open your first account to get started.</p>
          </div>
        ) : (
          <div className="account-grid">
            {accounts.map((account) => (
              <button
                key={account.id}
                className="account-card"
                onClick={() => navigate(`/accounts/${account.id}`)}
              >
                <div className="account-card-top">
                  <span className={`badge badge-${account.accountType.toLowerCase()}`}>
                    {account.accountType}
                  </span>
                  <span className="account-status">{account.status}</span>
                </div>
                <p className="account-number">&bull;&bull;&bull;&bull; {account.accountNumber.slice(-4)}</p>
                <p className="account-balance">{formatCurrency(account.balance)}</p>
                <p className="account-holder">{account.holderName}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Recent transactions */}
      {recentTxns.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 className="section-title">Recent transactions</h2>
          <div className="card table-card">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th className="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTxns.map((tx) => {
                  const isDebit = tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER_OUT'
                  return (
                    <tr key={tx.id}>
                      <td>&bull;&bull;{tx.accountNumber.slice(-4)}</td>
                      <td>
                        <span className={`tx-type tx-${isDebit ? 'withdrawal' : 'deposit'}`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{tx.description || '\u2014'}</td>
                      <td className={`right ${isDebit ? 'amount-negative' : 'amount-positive'}`}>
                        {isDebit ? '-' : '+'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
