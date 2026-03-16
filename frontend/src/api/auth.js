import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

// Auth routes are public — no token needed
const authApi = axios.create({ baseURL: BASE_URL })

export async function signup({ firstname, lastname, email, password }) {
  const res = await authApi.post('/user/signup', { firstname, lastname, email, password })
  return res.data // { data: { userId } }
}

export async function login({ email, password }) {
  const res = await authApi.post('/user/login', { email, password })
  return res.data // { message, token }
}
