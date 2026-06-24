import { useEffect, useState } from 'react'
import apiClient from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import { formatCurrency } from '../utils/format.js'

export default function Transfer() {
  const toast = useToast()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ fromAccountId: '', toAccountId: '', amount: '', description: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await apiClient.get('/api/accounts')
        setAccounts(data)
        if (data.length >= 2) {
          setForm((f) => ({ ...f, fromAccountId: String(data[0].id), toAccountId: String(data[1].id) }))
        } else if (data.length === 1) {
          setForm((f) => ({ ...f, fromAccountId: String(data[0].id) }))
        }
      } catch (err) {
        toast.error(err.userMessage)
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validate = () => {
    const next = {}
    if (!form.fromAccountId) next.fromAccountId = 'Select a source account'
    if (!form.toAccountId) next.toAccountId = 'Select a destination account'
    if (form.fromAccountId && form.toAccountId && form.fromAccountId === form.toAccountId) {
      next.toAccountId = 'Destination must differ from source'
    }
    const amt = Number(form.amount)
    if (!form.amount || Number.isNaN(amt) || amt <= 0) {
      next.amount = 'Enter an amount greater than zero'
    } else {
      const src = accounts.find((a) => String(a.id) === form.fromAccountId)
      if (src && amt > Number(src.balance)) {
        next.amount = 'Insufficient funds in source account'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const { data } = await apiClient.post('/api/accounts/transfer', {
        fromAccountId: Number(form.fromAccountId),
        toAccountId: Number(form.toAccountId),
        amount: Number(form.amount),
        description: form.description || undefined
      })
      setResult(data)
      toast.success('Transfer completed successfully!')
      setForm({ fromAccountId: form.fromAccountId, toAccountId: form.toAccountId, amount: '', description: '' })
      const { data: refreshed } = await apiClient.get('/api/accounts')
      setAccounts(refreshed)
    } catch (err) {
      toast.error(err.userMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const accountLabel = (a) =>
    `${a.accountType} ••${a.accountNumber.slice(-4)} — ${formatCurrency(a.balance)}`

  if (loading) {
    return <div className="page"><div className="card empty-state"><div className="spinner" /></div></div>
  }

  if (accounts.length < 2) {
    return (
      <div className="page">
        <h1 className="page-title">Fund Transfer</h1>
        <div className="card empty-state">
          <p>You need at least two accounts to make a transfer.</p>
          <p className="muted">Open another account from the Dashboard to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="page-title">Fund Transfer</h1>

      <section className="card form-card">
        <h2 className="card-title">Transfer between your accounts</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fromAccount">From account</label>
              <select
                id="fromAccount"
                value={form.fromAccountId}
                onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })}
                className={errors.fromAccountId ? 'input-error' : ''}
              >
                <option value="">Select source account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{accountLabel(a)}</option>
                ))}
              </select>
              {errors.fromAccountId && <span className="field-error">{errors.fromAccountId}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="toAccount">To account</label>
              <select
                id="toAccount"
                value={form.toAccountId}
                onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
                className={errors.toAccountId ? 'input-error' : ''}
              >
                <option value="">Select destination account</option>
                {accounts.filter((a) => String(a.id) !== form.fromAccountId).map((a) => (
                  <option key={a.id} value={a.id}>{accountLabel(a)}</option>
                ))}
              </select>
              {errors.toAccountId && <span className="field-error">{errors.toAccountId}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="transferAmount">Amount (USD)</label>
              <input
                id="transferAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={errors.amount ? 'input-error' : ''}
                placeholder="0.00"
              />
              {errors.amount && <span className="field-error">{errors.amount}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="transferDesc">Description (optional)</label>
              <input
                id="transferDesc"
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Savings top-up"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Transferring…' : 'Transfer funds'}
          </button>
        </form>
      </section>

      {result && (
        <section className="card transfer-receipt">
          <h2 className="card-title">Transfer confirmation</h2>
          <dl className="receipt-grid">
            <div className="receipt-item">
              <dt>Reference ID</dt>
              <dd className="receipt-ref">{result.referenceId}</dd>
            </div>
            <div className="receipt-item">
              <dt>Amount</dt>
              <dd>{formatCurrency(result.amount)}</dd>
            </div>
            <div className="receipt-item">
              <dt>From account</dt>
              <dd>••{result.fromAccountNumber.slice(-4)}</dd>
            </div>
            <div className="receipt-item">
              <dt>To account</dt>
              <dd>••{result.toAccountNumber.slice(-4)}</dd>
            </div>
            <div className="receipt-item">
              <dt>Source balance after</dt>
              <dd>{formatCurrency(result.fromBalanceAfter)}</dd>
            </div>
            <div className="receipt-item">
              <dt>Destination balance after</dt>
              <dd>{formatCurrency(result.toBalanceAfter)}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  )
}
