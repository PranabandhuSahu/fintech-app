import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import apiClient, { closeAccount } from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import { formatCurrency, formatDateTime } from '../utils/format.js'

export default function AccountDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [account, setAccount] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [showTransferPopup, setShowTransferPopup] = useState(false)
  const [destinationAccountId, setDestinationAccountId] = useState('')
  const [closeSubmitting, setCloseSubmitting] = useState(false)

  const isClosed = account?.status === 'CLOSED'

  const loadData = async (fromDate, toDate) => {
    setLoading(true)
    try {
      let txUrl = `/api/transactions?accountId=${id}`
      if (fromDate) txUrl += `&from=${fromDate}`
      if (toDate) txUrl += `&to=${toDate}`
      const [accRes, txRes, accountsRes] = await Promise.all([
        apiClient.get(`/api/accounts/${id}`),
        apiClient.get(txUrl),
        apiClient.get('/api/accounts')
      ])
      setAccount(accRes.data)
      setTransactions(txRes.data)
      setAccounts(accountsRes.data.filter((a) => String(a.id) !== id && a.status === 'ACTIVE'))
    } catch (err) {
      toast.error(err.userMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(dateFrom, dateTo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleFilterApply = () => {
    loadData(dateFrom, dateTo)
  }

  const handleFilterClear = () => {
    setDateFrom('')
    setDateTo('')
    loadData('', '')
  }

  const startAction = (type) => {
    setAction(type)
    setAmount('')
    setDescription('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const value = Number(amount)
    if (!amount || Number.isNaN(value) || value <= 0) {
      setError('Enter an amount greater than zero')
      return
    }
    if (action === 'withdraw' && account && value > Number(account.balance)) {
      setError('Insufficient funds for this withdrawal')
      return
    }
    setSubmitting(true)
    try {
      await apiClient.post(`/api/accounts/${id}/${action}`, { amount: value, description })
      toast.success(`${action === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`)
      setAction(null)
      loadData(dateFrom, dateTo)
    } catch (err) {
      toast.error(err.userMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseClick = () => {
    if (isClosed) {
      toast.error('This account is already closed')
      return
    }
    if (Number(account.balance) > 0) {
      if (accounts.length === 0) {
        toast.error('Open another account first to receive the remaining balance')
        return
      }
      setDestinationAccountId(String(accounts[0].id))
      setShowTransferPopup(true)
    } else if (Number(account.balance) < 0) {
      toast.error('Account has a negative balance. Deposit sufficient funds before closing.')
    } else {
      setShowCloseConfirm(true)
    }
  }

  const handleCloseConfirm = async () => {
    setCloseSubmitting(true)
    try {
      await closeAccount(Number(id), null)
      toast.success('Account closed successfully')
      setShowCloseConfirm(false)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.userMessage)
    } finally {
      setCloseSubmitting(false)
    }
  }

  const handleTransferAndClose = async (e) => {
    e.preventDefault()
    if (!destinationAccountId) {
      toast.error('Select a destination account')
      return
    }
    setCloseSubmitting(true)
    try {
      await closeAccount(Number(id), Number(destinationAccountId))
      toast.success('Account closed and balance transferred successfully')
      setShowTransferPopup(false)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.userMessage)
    } finally {
      setCloseSubmitting(false)
    }
  }

  const accountLabel = (a) =>
    `${a.accountType} ••${a.accountNumber.slice(-4)} — ${formatCurrency(a.balance)}`

  if (loading && !account) {
    return <div className="page"><div className="card empty-state"><div className="spinner" /></div></div>
  }

  if (!account) {
    return (
      <div className="page">
        <div className="card empty-state">
          <p>Account not found.</p>
          <Link to="/dashboard" className="btn btn-ghost">Back to dashboard</Link>
        </div>
      </div>
    )
  }

  const txSummary = {
    deposits: transactions.filter((t) => t.type === 'DEPOSIT' || t.type === 'TRANSFER_IN').reduce((s, t) => s + Number(t.amount), 0),
    withdrawals: transactions.filter((t) => t.type === 'WITHDRAWAL' || t.type === 'TRANSFER_OUT').reduce((s, t) => s + Number(t.amount), 0),
    count: transactions.length
  }

  return (
    <div className="page">
      <Link to="/dashboard" className="back-link">&larr; Back to dashboard</Link>

      <section className="card detail-header">
        <div>
          <span className={`badge badge-${account.accountType.toLowerCase()}`}>{account.accountType}</span>
          {isClosed && <span className="badge badge-closed">CLOSED</span>}
          <p className="detail-number">Account No. {account.accountNumber}</p>
          <p className="detail-holder">{account.holderName}</p>
        </div>
        <div className="detail-balance">
          <p className="balance-label">Available balance</p>
          <p className="balance-amount">{formatCurrency(account.balance)}</p>
        </div>
      </section>

      <section className="summary-row">
        <div className="summary-stat">
          <span className="summary-label">Transactions</span>
          <span className="summary-value">{txSummary.count}</span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Total credits</span>
          <span className="summary-value amount-positive">{formatCurrency(txSummary.deposits)}</span>
        </div>
        <div className="summary-stat">
          <span className="summary-label">Total debits</span>
          <span className="summary-value amount-negative">{formatCurrency(txSummary.withdrawals)}</span>
        </div>
      </section>

      {!isClosed && (
        <section className="action-bar">
          <button className="btn btn-primary" onClick={() => startAction('deposit')}>Deposit</button>
          <button className="btn btn-secondary" onClick={() => startAction('withdraw')}>Withdraw</button>
          <button className="btn btn-danger" onClick={handleCloseClick}>Close Account</button>
        </section>
      )}

      {action && (
        <section className="card form-card">
          <h2 className="card-title">{action === 'deposit' ? 'Make a deposit' : 'Make a withdrawal'}</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount (USD)</label>
                <input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={error ? 'input-error' : ''}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description (optional)</label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={action === 'deposit' ? 'e.g. Salary' : 'e.g. Rent'}
                />
              </div>
            </div>
            {error && <span className="field-error">{error}</span>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Processing…' : `Confirm ${action}`}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setAction(null)}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {showCloseConfirm && (
        <section className="card form-card">
          <h2 className="card-title">Close account</h2>
          <p>Are you sure you want to close this account? This action cannot be undone.</p>
          <div className="form-actions">
            <button className="btn btn-danger" onClick={handleCloseConfirm} disabled={closeSubmitting}>
              {closeSubmitting ? 'Closing…' : 'Yes, close account'}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowCloseConfirm(false)}>
              Cancel
            </button>
          </div>
        </section>
      )}

      {showTransferPopup && (
        <section className="card form-card">
          <h2 className="card-title">Transfer balance before closing</h2>
          <p>This account has a balance of {formatCurrency(account.balance)}. Select another account to receive the funds.</p>
          <form onSubmit={handleTransferAndClose} noValidate>
            <div className="form-group">
              <label htmlFor="destinationAccount">Destination account</label>
              <select
                id="destinationAccount"
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
              >
                <option value="">Select destination account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{accountLabel(a)}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-danger" disabled={closeSubmitting}>
                {closeSubmitting ? 'Closing…' : 'Transfer and close account'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowTransferPopup(false)}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section>
        <div className="section-header-row">
          <h2 className="section-title">Transaction history</h2>
        </div>
        <div className="date-filter-row">
          <div className="form-group compact">
            <label htmlFor="dateFrom">From</label>
            <input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="form-group compact">
            <label htmlFor="dateTo">To</label>
            <input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleFilterApply}>Apply</button>
          {(dateFrom || dateTo) && (
            <button className="btn btn-ghost btn-sm" onClick={handleFilterClear}>Clear</button>
          )}
        </div>
        {transactions.length === 0 ? (
          <div className="card empty-state">
            <p>No transactions found.</p>
            <p className="muted">{dateFrom || dateTo ? 'Try adjusting your date range.' : 'Deposits and withdrawals will appear here.'}</p>
          </div>
        ) : (
          <div className="card table-card">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th className="right">Amount</th>
                  <th className="right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isDebit = tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER_OUT'
                  return (
                    <tr key={tx.id}>
                      <td>{formatDateTime(tx.createdAt)}</td>
                      <td>
                        <span className={`tx-type tx-${isDebit ? 'withdrawal' : 'deposit'}`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{tx.description || '\u2014'}</td>
                      <td className={`right ${isDebit ? 'amount-negative' : 'amount-positive'}`}>
                        {isDebit ? '-' : '+'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="right">{formatCurrency(tx.balanceAfter)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
