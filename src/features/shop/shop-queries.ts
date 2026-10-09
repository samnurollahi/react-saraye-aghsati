import { useQuery } from '@tanstack/react-query'
import { getShopDashboard, getShopProfile, getShopTransactions } from './shop-api'

export const shopKeys = {
  all: ['shop'] as const,
  me: ['shop', 'me'] as const,
  dashboard: ['shop', 'dashboard'] as const,
  transactions: (page: number, limit: number) => ['shop', 'transactions', page, limit] as const,
}

export function useShopProfile() {
  return useQuery({ queryKey: shopKeys.me, queryFn: getShopProfile })
}

export function useShopDashboard() {
  return useQuery({ queryKey: shopKeys.dashboard, queryFn: getShopDashboard })
}

export function useShopTransactions(page: number, limit: number) {
  return useQuery({ queryKey: shopKeys.transactions(page, limit), queryFn: () => getShopTransactions(page, limit) })
}