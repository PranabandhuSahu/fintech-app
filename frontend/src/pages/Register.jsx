import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: undefined })
  }

  const validate = () => {
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Full name is required'
    if (!form.username.trim()) next.username = 'Username is required'
    else if (form.username.trim().length < 3) next.username = 'Username must be at least 3 characters'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address'
    if (!form.password) next.password = 'Password is required'
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const { confirmPassword, ...payload } = form
      const { data } = await apiClient.post('/api/auth/register', payload)
      login(data)
      toast.success('Account created successfully!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.userMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const fields = [
    { name: 'fullName', label: 'Full name', type: 'text', placeholder: 'Jane Doe', autoComplete: 'name' },
    { name: 'username', label: 'Username', type: 'text', placeholder: 'janedoe', autoComplete: 'username' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com', autoComplete: 'email' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'At least 6 characters', autoComplete: 'new-password' },
    { name: 'confirmPassword', label: 'Confirm password', type: 'password', placeholder: 'Re-enter your password', autoComplete: 'new-password' }
  ]

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Open a NovaBank account in minutes</p>
        <form onSubmit={handleSubmit} noValidate>
          {fields.map((f) => (
            <div className="form-group" key={f.name}>
              <label htmlFor={f.name}>{f.label}</label>
              <input
                id={f.name}
                name={f.name}
                type={f.type}
                autoComplete={f.autoComplete}
                value={form[f.name]}
                onChange={handleChange}
                className={errors[f.name] ? 'input-error' : ''}
                placeholder={f.placeholder}
              />
              {errors[f.name] && <span className="field-error">{errors[f.name]}</span>}
            </div>
          ))}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
