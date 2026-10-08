import type { AuthResponse, User } from '../types/domain'

const ACCESS_TOKEN_KEY = 'saraye.accessToken'
const REFRESH_TOKEN_KEY = 'saraye.refreshToken'
const USER_KEY = 'saraye.user'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function saveAuth(response: AuthResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(response.user))
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}