import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAdminShop, deleteAdminShop, getAdminShopQr, getAdminShops, provisionAdminShopCredentials, updateAdminShop } from './shops-api'
import type { ShopInput, ShopUpdateInput } from './shops-api'

export const adminShopKeys = {
  all: ['admin', 'shops'] as const,
  list: (page: number, limit: number) => ['admin', 'shops', page, limit] as const,
  qr: (id: string) => ['admin', 'shops', id, 'qr'] as const,
}

export function useAdminShops(page: number, limit: number) {
  return useQuery({ queryKey: adminShopKeys.list(page, limit), queryFn: () => getAdminShops(page, limit) })
}

export function useAdminShopQr(id: string) {
  return useQuery({ queryKey: adminShopKeys.qr(id), queryFn: () => getAdminShopQr(id), enabled: Boolean(id) })
}

export function useCreateAdminShop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ShopInput) => createAdminShop(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminShopKeys.all }),
  })
}

export function useUpdateAdminShop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ShopUpdateInput & { id: string }) => updateAdminShop(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminShopKeys.all }),
  })
}

export function useDeleteAdminShop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdminShop(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminShopKeys.all }),
  })
}

export function useProvisionAdminShopCredentials() {
  return useMutation({ mutationFn: (id: string) => provisionAdminShopCredentials(id), gcTime: 0 })
}