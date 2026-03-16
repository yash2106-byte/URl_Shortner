import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'

export default function RedirectPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // 'loading' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function doRedirect() {
      try {
        // We call the backend which will 302 redirect.
        // axios follows the redirect — so the response.request.responseURL is the final URL.
        const response = await api.get(`/${code}`, {
          maxRedirects: 5,
          validateStatus: () => true
        })

        // If redirected the window location should have changed when browser follows server redirect
        // But since axios intercepts redirect, we get the final URL from response.request.responseURL
        const finalUrl = response.request?.responseURL
        if (finalUrl && finalUrl !== window.location.href) {
          window.location.href = finalUrl
        } else if (response.status === 404) {
          setStatus('error')
          setErrorMsg(`The short code "${code}" does not exist.`)
        } else if (response.status >= 200 && response.status < 400) {
          // Server returned the redirect target in location header
          const location = response.headers?.location
          if (location) {
            window.location.href = location
          } else {
            setStatus('error')
            setErrorMsg('Could not resolve redirect target.')
          }
        } else {
          setStatus('error')
          setErrorMsg(`Unexpected error (status ${response.status}).`)
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setStatus('error')
          setErrorMsg(`The short code "${code}" does not exist.`)
        } else {
          setStatus('error')
          setErrorMsg('An error occurred. Please try again.')
        }
      }
    }
    doRedirect()
  }, [code])

  if (status === 'error') {
    return (
      <div className="redirect-shell">
        <div className="redirect-box">
          <div className="redirect-icon">🔗</div>
          <h2 style={{ marginBottom: 8 }}>Invalid Link</h2>
          <p style={{ marginBottom: 24 }}>{errorMsg}</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="redirect-shell">
      <div className="redirect-box">
        <div className="redirect-icon" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>✂️</div>
        <h2 style={{ marginTop: 16, marginBottom: 8 }}>Redirecting…</h2>
        <p>Taking you to your destination via <strong>/{code}</strong></p>
      </div>
    </div>
  )
}
