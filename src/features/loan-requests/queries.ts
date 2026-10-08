import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createLoanRequest, getMyLoanRequests } from '../../services/loan-api'

export function useMyLoanRequests() {
  return useQuery({ queryKey: ['loan-requests', 'me'], queryFn: getMyLoanRequests })
}

export function useCreateLoanRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createLoanRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['loan-requests', 'me'] })
    },
  })
}