import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../api/auth'
import Spinner from '../components/Spinner'
import Toast, { useToast } from '../components/Toast'

export default function SignupPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Basic client-side validation
    if (!form.firstname.trim()) return setError('First name is required.')
    if (!form.lastname.trim())  return setError('Last name is required.')
    if (!form.email.includes('@')) return setError('Please enter a valid email address.')
    if (form.password.length < 3) return setError('Password must be at least 3 characters.')

    setLoading(true)
    try {
      await signup(form)
      toast('Account created! Please log in.', 'success')
      setTimeout(() => navigate('/login'), 800)
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.'
      setError(typeof msg === 'string' ? msg : 'Validation error. Check your inputs.')
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

          <h2 style={{ marginBottom: '6px' }}>Create your account</h2>
          <p style={{ marginBottom: '28px', fontSize: '0.875rem' }}>
            Start shortening links in seconds.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-row">
              <div className="form-group">
                <label className="form-label" htmlFor="firstname">First Name</label>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  className="form-input"
                  placeholder="Yash"
                  value={form.firstname}
                  onChange={handleChange}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lastname">Last Name</label>
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  className="form-input"
                  placeholder="Sharma"
                  value={form.lastname}
                  onChange={handleChange}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

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
                placeholder="Min. 3 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div className="form-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              id="signup-submit"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  )
}
