import { shopApiRequest } from '../../services/api-client'

export interface ShopProfile {
  id: string
  name: string
  ownerName: string
  phone: string
  address: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ShopAuthResponse {
  accessToken: string
  refreshToken: string
  shop: ShopProfile
}

export interface ShopTransaction {
  id: string
  amount: string
  description: string | null
  status: string
  createdAt: string
}

export interface ShopDashboard {
  shop: ShopProfile
  transactionCount: number
  totalTransactionAmount: string
  recentTransactions: ShopTransaction[]
}

export interface ShopTransactionPage {
  items: ShopTransaction[]
  page: number
  limit: number
  total: number
}

export function loginShop(input: { identifier: string; password: string }) {
  return shopApiRequest<ShopAuthResponse>('/shop-auth/login', { method: 'POST', body: JSON.stringify(input) }, false)
}

export function setupShopPassword(input: { setupToken: string; password: string }) {
  return shopApiRequest<{ message: string }>('/shop-auth/setup-password', { method: 'POST', body: JSON.stringify(input) }, false)
}

export function getShopProfile() {
  return shopApiRequest<ShopProfile>('/shop-auth/me')
}

export function getShopDashboard() {
  return shopApiRequest<ShopDashboard>('/shop-auth/dashboard')
}

export function getShopTransactions(page: number, limit: number) {
  const safeLimit = Math.min(100, Math.max(1, limit))
  return shopApiRequest<ShopTransactionPage>(`/shop-auth/transactions?page=${page}&limit=${safeLimit}`)
}