import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { setToken } from '../utils/token'
import Spinner from '../components/Spinner'
import Toast, { useToast } from '../components/Toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email.trim()) return setError('Email is required.')
    if (form.password.length < 3) return setError('Password must be at least 3 characters.')

    setLoading(true)
    try {
      const data = await login(form)
      setToken(data.token)
      toast('Welcome back! 🎉', 'success')
      setTimeout(() => navigate('/dashboard'), 500)
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.'
      setError(typeof msg === 'string' ? msg : 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toast />
      <div className="auth-shell">
        <div className="auth-box">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">✂️</div>
            <span className="auth-logo-name">Snip</span>
          </div>

          <h2 style={{ marginBottom: '6px' }}>Welcome back</h2>
          <p style={{ marginBottom: '28px', fontSize: '0.875rem' }}>
            Sign in to manage your short links.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="form-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/signup">Sign up for free</Link>
          </div>
        </div>
      </div>
    </>
  )
}
