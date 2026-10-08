import { useQueries, useQuery } from '@tanstack/react-query'
import { getLoanInstallments, getMyLoans } from '../../services/loan-api'

export function useMyLoans() {
  return useQuery({ queryKey: ['loans', 'me'], queryFn: getMyLoans })
}

export function useLoanInstallments(loanId: string) {
  return useQuery({ queryKey: ['loans', loanId, 'installments'], queryFn: () => getLoanInstallments(loanId), enabled: Boolean(loanId) })
}

export function useInstallmentsForLoans(loanIds: string[]) {
  return useQueries({ queries: loanIds.map((loanId) => ({ queryKey: ['loans', loanId, 'installments'], queryFn: () => getLoanInstallments(loanId) })) })
}