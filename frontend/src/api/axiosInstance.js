import axios from 'axios'
import { getToken, removeToken } from '../utils/token'

const BASE_URL = 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401 → clear stale token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      removeToken()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
