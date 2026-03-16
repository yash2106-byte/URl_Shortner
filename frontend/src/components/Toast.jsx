import { useEffect, useState } from 'react'

let addToast = null

export function useToast() {
  return { toast: (msg, type = 'success') => addToast?.(msg, type) }
}

export default function Toast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    addToast = (message, type = 'success') => {
      const id = Date.now()
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3500)
    }
    return () => { addToast = null }
  }, [])

  const icons = { success: '✅', error: '❌', info: 'ℹ️' }

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{icons[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
