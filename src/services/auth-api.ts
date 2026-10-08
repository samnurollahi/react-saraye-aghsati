import { apiRequest } from './api-client'
import type { AuthResponse, User } from '../types/domain'

export interface RegisterInput {
  fullName: string
  nationalCode: string
  phone: string
  email?: string
  password: string
}

export interface LoginInput {
  identifier: string
  password: string
}

export function login(input: LoginInput) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) })
}

export function register(input: RegisterInput) {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) })
}

export function getCurrentUser() {
  return apiRequest<User>('/auth/me')
}