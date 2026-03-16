import { useState, useEffect, useCallback } from 'react'
import { getMyCodes, shortenUrl } from '../api/url'
import Sidebar from '../components/Sidebar'
import CopyButton from '../components/CopyButton'
import Toast, { useToast } from '../components/Toast'
import Spinner from '../components/Spinner'

const BASE_URL = 'http://localhost:8000'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function SkeletonRow() {
  return (
    <tr>
      {[130, 180, 260, 90, 80].map((w, i) => (
        <td key={i} style={{ padding: '16px 24px' }}>
          <div className="skeleton" style={{ height: '16px', width: w, borderRadius: 6 }} />
        </td>
      ))}
    </tr>
  )
}

export default function DashboardPage() {
  const { toast } = useToast()

  const [urls, setUrls] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  const [form, setForm] = useState({ url: '', code: '' })
  const [formError, setFormError] = useState('')
  const [creating, setCreating] = useState(false)
  const [newUrl, setNewUrl] = useState(null)

  const fetchUrls = useCallback(async () => {
    setLoadingList(true)
    try {
      const data = await getMyCodes()
      setUrls(data)
    } catch {
      toast('Failed to load your links.', 'error')
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => { fetchUrls() }, [fetchUrls])

  function handleFormChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setFormError('')
    setNewUrl(null)
  }

  async function handleShorten(e) {
    e.preventDefault()
    setFormError('')
    setNewUrl(null)

    if (!form.url.trim()) return setFormError('Please enter a URL to shorten.')
    try { new URL(form.url.trim()) } catch {
      return setFormError('Please enter a valid URL including https:// or http://')
    }

    setCreating(true)
    try {
      const result = await shortenUrl({ url: form.url.trim(), code: form.code.trim() })
      const short = `${BASE_URL}/${result.shortCode}`
      setNewUrl(short)
      setForm({ url: '', code: '' })
      toast('Short link created! 🎉', 'success')
      fetchUrls()
    } catch (err) {
      const msg = err.response?.data?.error
      setFormError(typeof msg === 'string' ? msg : 'Failed to create short link. Try a different code.')
    } finally {
      setCreating(false)
    }
  }

  const totalLinks = urls.length
  const today = new Date().toDateString()
  const todayLinks = urls.filter((u) => new Date(u.created_at).toDateString() === today).length

  return (
    <>
      <Toast />
      <div className="dash-shell">
        <Sidebar />

        <div className="dash-main">
          {/* Top bar */}
          <header className="topbar">
            <div>
              <div className="topbar-title">My Dashboard</div>
              <div className="topbar-sub">Manage all your short links</div>
            </div>
            <div className="topbar-right">
              <div className="avatar">Y</div>
            </div>
          </header>

          <main className="dash-content">
            {/* Stats */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon stat-icon-orange">🔗</div>
                <div className="stat-info">
                  <span className="stat-value">{loadingList ? '—' : totalLinks}</span>
                  <span className="stat-label">Total Links</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue">📅</div>
                <div className="stat-info">
                  <span className="stat-value">{loadingList ? '—' : todayLinks}</span>
                  <span className="stat-label">Created Today</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-green">✂️</div>
                <div className="stat-info">
                  <span className="stat-value">Snip</span>
                  <span className="stat-label">URL Shortener</span>
                </div>
              </div>
            </div>

            {/* Create Form */}
            <div className="create-card">
              <h3>✨ Create a Short Link</h3>
              <form className="create-form" onSubmit={handleShorten} noValidate>
                <div className="create-form-inner">
                  <div className="form-group">
                    <label className="form-label" htmlFor="url">Long URL</label>
                    <input
                      id="url"
                      name="url"
                      type="url"
                      className="form-input"
                      placeholder="https://example.com/very/long/url"
                      value={form.url}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="code">
                      Custom Code <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input
                      id="code"
                      name="code"
                      type="text"
                      className="form-input"
                      placeholder="my-link"
                      value={form.code}
                      onChange={handleFormChange}
                      maxLength={10}
                    />
                  </div>
                </div>

                {formError && (
                  <div className="form-error"><span>⚠️</span> {formError}</div>
                )}

                {newUrl && (
                  <div className="new-url-box">
                    <span className="new-url-text">{newUrl}</span>
                    <CopyButton text={newUrl} label="Copy Link" />
                  </div>
                )}

                <div>
                  <button
                    id="shorten-submit"
                    type="submit"
                    className="btn btn-primary"
                    disabled={creating}
                    style={{ minWidth: 160 }}
                  >
                    {creating ? <><Spinner /> Shortening…</> : '✂️ Shorten URL'}
                  </button>
                </div>
              </form>
            </div>

            {/* URL Table */}
            <div className="url-table-card">
              <div className="url-table-header">
                <h3 style={{ margin: 0 }}>🔗 My Links</h3>
                <span className="badge badge-neutral">{totalLinks} links</span>
              </div>

              {loadingList ? (
                <table className="url-table">
                  <thead>
                    <tr>
                      <th>Short Code</th><th>Short URL</th>
                      <th>Original URL</th><th>Created</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <SkeletonRow /><SkeletonRow /><SkeletonRow />
                  </tbody>
                </table>
              ) : urls.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon">🔗</span>
                  <h3>No links yet</h3>
                  <p>Create your first short link using the form above.</p>
                </div>
              ) : (
                <table className="url-table">
                  <thead>
                    <tr>
                      <th>Short Code</th>
                      <th>Short URL</th>
                      <th>Original URL</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urls.map((u) => {
                      const shortCode = u.shortCode || u.code
                      const shortLink = `${BASE_URL}/${shortCode}`
                      return (
                        <tr key={u.id}>
                          <td>
                            <span className="badge badge-accent">{shortCode}</span>
                          </td>
                          <td>
                            <a
                              href={`/go/${shortCode}`}
                              className="url-short-link"
                              target="_blank"
                              rel="noreferrer"
                            >
                              /{shortCode}
                            </a>
                          </td>
                          <td>
                            <span
                              className="url-original"
                              title={u.targetUrl || u.target_url}
                            >
                              {u.targetUrl || u.target_url}
                            </span>
                          </td>
                          <td>
                            <span className="url-date">
                              {formatDate(u.createdAt || u.created_at)}
                            </span>
                          </td>
                          <td>
                            <CopyButton text={shortLink} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
