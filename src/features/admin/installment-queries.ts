import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { confirmAdminInstallmentPayment, getAdminInstallments } from './installments-api'
import type { AdminInstallmentFilters } from './installments-api'

export const adminInstallmentKeys = {
  page: (filters: AdminInstallmentFilters) => ['admin', 'installments', filters] as const,
}

export function useAdminInstallments(filters: AdminInstallmentFilters) {
  return useQuery({ queryKey: adminInstallmentKeys.page(filters), queryFn: () => getAdminInstallments(filters) })
}

export function useConfirmAdminInstallmentPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: confirmAdminInstallmentPayment,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
        queryClient.invalidateQueries({ queryKey: ['loans'] }),
      ])
    },
  })
}