import { useQuery } from '@tanstack/react-query'
import { getMyLoans, getMyLoanRequests } from '../../services/loan-api'

export function useMyLoanRequests() {
  return useQuery({ queryKey: ['loan-requests', 'me'], queryFn: getMyLoanRequests })
}

export function useMyLoans() {
  return useQuery({ queryKey: ['loans', 'me'], queryFn: getMyLoans })
}