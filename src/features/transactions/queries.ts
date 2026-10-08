import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTransaction, getMyTransactions, scanShop } from './api'

export const transactionKeys = {
  all: ['transactions'] as const,
  mine: ['transactions', 'me'] as const,
  page: (page: number, limit: number) => ['transactions', 'me', page, limit] as const,
}

export function useScanShop() {
  return useMutation({ mutationFn: scanShop })
}

export function useMyTransactions(page: number, limit: number) {
  return useQuery({ queryKey: transactionKeys.page(page, limit), queryFn: () => getMyTransactions(page, limit) })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['loans', 'me'] }),
        queryClient.invalidateQueries({ queryKey: transactionKeys.all }),
      ])
    },
  })
}