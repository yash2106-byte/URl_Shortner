import api from './axiosInstance'

export async function getMyCodes() {
  const res = await api.get('/myCodes')
  return res.data.your_codes // array of url objects
}

export async function shortenUrl({ url, code }) {
  const body = { url }
  if (code && code.trim()) body.code = code.trim()
  const res = await api.post('/shorten', body)
  return res.data // { id, shortCode }
}

export async function resolveCode(code) {
  // Returns the redirect — we call it manually to handle auth
  const res = await api.get(`/${code}`, { maxRedirects: 0, validateStatus: (s) => s < 400 })
  return res
}
