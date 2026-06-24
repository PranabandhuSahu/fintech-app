import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import { formatCurrency, formatDateTime } from '../utils/format.js'

function initials(name) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

export default function Profile() {
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [meRes, accRes] = await Promise.all([
          apiClient.get('/api/auth/me'),
          apiClient.get('/api/accounts')
        ])
        setProfile(meRes.data)
        setAccounts(accRes.data)
      } catch (err) {
        toast.error(err.userMessage)
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <div className="page"><div className="card empty-state"><div className="spinner" /></div></div>
  }

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0)

  return (
    <div className="page">
      <h1 className="page-title">Account &amp; Profile Details</h1>

      <section className="card profile-header">
        <div className="avatar">{initials(profile?.fullName)}</div>
        <div>
          <p className="profile-name">{profile?.fullName}</p>
          <p className="muted">@{profile?.username}</p>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Profile details</h2>
        <dl className="detail-list">
          <div className="detail-item">
            <dt>Full name</dt>
            <dd>{profile?.fullName}</dd>
          </div>
          <div className="detail-item">
            <dt>Username</dt>
            <dd>{profile?.username}</dd>
          </div>
          <div className="detail-item">
            <dt>Email</dt>
            <dd>{profile?.email}</dd>
          </div>
          <div className="detail-item">
            <dt>Customer ID</dt>
            <dd>#{String(profile?.userId).padStart(6, '0')}</dd>
          </div>
          <div className="detail-item">
            <dt>Member since</dt>
            <dd>{formatDateTime(profile?.memberSince)}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <div className="card-header-row">
          <h2 className="card-title">Account details</h2>
          <Link to="/dashboard" className="back-link">Manage accounts →</Link>
        </div>

        <div className="summary-row">
          <div className="summary-stat">
            <span className="summary-label">Total accounts</span>
            <span className="summary-value">{accounts.length}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Total balance</span>
            <span className="summary-value">{formatCurrency(totalBalance)}</span>
          </div>
        </div>

        {accounts.length === 0 ? (
          <p className="muted" style={{ marginTop: 16 }}>
            You don&apos;t have any accounts yet. <Link to="/dashboard">Open one</Link>.
          </p>
        ) : (
          <div className="table-card" style={{ marginTop: 16 }}>
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Account number</th>
                  <th>Type</th>
                  <th>Holder</th>
                  <th>Status</th>
                  <th className="right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.accountNumber}</td>
                    <td><span className={`badge badge-${a.accountType.toLowerCase()}`}>{a.accountType}</span></td>
                    <td>{a.holderName}</td>
                    <td><span className="account-status">{a.status}</span></td>
                    <td className="right">{formatCurrency(a.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
