import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveAdminLoanRequest,
  getAdminLoan,
  getAdminLoanRequest,
  getAdminLoanRequests,
  getAdminLoans,
  getAdminUsers,
  rejectAdminLoanRequest,
} from './admin-api'
import type { AdminLoanRequestStatus } from './admin-api'

export const adminKeys = {
  requests: ['admin', 'loan-requests'] as const,
  request: (id: string) => ['admin', 'loan-requests', id] as const,
  loans: ['admin', 'loans'] as const,
  loan: (id: string) => ['admin', 'loans', id] as const,
  users: ['admin', 'users'] as const,
}

export function useAdminLoanRequests(status?: AdminLoanRequestStatus) {
  return useQuery({ queryKey: [...adminKeys.requests, status ?? 'all'], queryFn: () => getAdminLoanRequests(status) })
}

export function useAdminLoanRequest(id: string) {
  return useQuery({ queryKey: adminKeys.request(id), queryFn: () => getAdminLoanRequest(id), enabled: Boolean(id) })
}

export function useApproveLoanRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveAdminLoanRequest,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminKeys.requests }),
        queryClient.invalidateQueries({ queryKey: adminKeys.request(variables.id) }),
        queryClient.invalidateQueries({ queryKey: adminKeys.loans }),
      ])
    },
  })
}

export function useRejectLoanRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rejectAdminLoanRequest,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminKeys.requests }),
        queryClient.invalidateQueries({ queryKey: adminKeys.request(variables.id) }),
      ])
    },
  })
}

export function useAdminLoans() {
  return useQuery({ queryKey: adminKeys.loans, queryFn: getAdminLoans })
}

export function useAdminLoan(id: string) {
  return useQuery({ queryKey: adminKeys.loan(id), queryFn: () => getAdminLoan(id), enabled: Boolean(id) })
}

export function useAdminUsers() {
  return useQuery({ queryKey: adminKeys.users, queryFn: getAdminUsers })
}