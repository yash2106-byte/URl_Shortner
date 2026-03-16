import { useState } from 'react'

export default function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      className={`copy-btn ${copied ? 'copied' : ''}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? '✓ Copied!' : `📋 ${label}`}
    </button>
  )
}
