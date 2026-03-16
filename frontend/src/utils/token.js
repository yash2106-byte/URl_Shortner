// Token helpers — single source of truth for localStorage
const KEY = 'authToken'

export const getToken   = () => localStorage.getItem(KEY)
export const setToken   = (t) => localStorage.setItem(KEY, t)
export const removeToken = () => localStorage.removeItem(KEY)
export const isLoggedIn = () => !!getToken()
