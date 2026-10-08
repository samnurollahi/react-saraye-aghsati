import { clearAuth, getAccessToken, getRefreshToken, saveAuth } from './auth-storage'
import type { AuthResponse, User } from '../types/domain'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
let refreshFlight: Promise<string> | null = null

function endpoint(path: string) {
  return `${apiBaseUrl}${path}`
}

function notifySessionExpired() {
  window.dispatchEvent(new Event('saraye:session-expired'))
}

function createApiError(payload: unknown, status: number) {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = payload.message
    if (typeof message === 'string' && message.trim()) return new ApiError(message, status)
  }
  return new ApiError('ارتباط با سرور با خطا مواجه شد. دوباره تلاش کنید.', status)
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearAuth()
    notifySessionExpired()
    throw new ApiError('نشست شما پایان یافته است. دوباره وارد شوید.', 401)
  }

  if (!refreshFlight) {
    refreshFlight = (async () => {
      const response = await fetch(endpoint('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      const payload: unknown = await response.json().catch(() => null)
      if (!response.ok) throw createApiError(payload, response.status)
      const auth = payload as AuthResponse
      saveAuth(auth)
      return auth.accessToken
    })()
  }

  try {
    return await refreshFlight
  } catch (error) {
    clearAuth()
    notifySessionExpired()
    throw error
  } finally {
    refreshFlight = null
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  const accessToken = getAccessToken()
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const response = await fetch(endpoint(path), { ...init, headers })
  const canRefresh = !['/auth/login', '/auth/register', '/auth/refresh'].includes(path)
  if (response.status === 401 && canRefresh) {
    try {
      const nextAccessToken = await refreshAccessToken()
      headers.set('Authorization', `Bearer ${nextAccessToken}`)
      const retry = await fetch(endpoint(path), { ...init, headers })
      const retryPayload: unknown = await retry.json().catch(() => null)
      if (!retry.ok) {
        if (retry.status === 401) {
          clearAuth()
          notifySessionExpired()
        }
        throw createApiError(retryPayload, retry.status)
      }
      return retryPayload as T
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('نشست شما پایان یافته است. دوباره وارد شوید.', 401)
    }
  }

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) throw createApiError(payload, response.status)
  return payload as T
}

export async function restoreSession() {
  await refreshAccessToken()
  return apiRequest<User>('/auth/me')
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}