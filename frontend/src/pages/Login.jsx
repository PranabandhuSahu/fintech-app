import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import apiClient from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: undefined })
  }

  const validate = () => {
    const next = {}
    if (!form.username.trim()) next.username = 'Username is required'
    if (!form.password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const { data } = await apiClient.post('/api/auth/login', form)
      login(data)
      toast.success(`Welcome back, ${data.fullName || data.username}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.userMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to your NovaBank account</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              className={errors.username ? 'input-error' : ''}
              placeholder="Enter your username"
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
