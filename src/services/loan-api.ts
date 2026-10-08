import { apiRequest } from './api-client'
import type { ApiCollection, Installment, Loan, LoanRequest } from '../types/domain'

export function getMyLoanRequests() {
  return apiRequest<ApiCollection<LoanRequest>>('/loan-requests/me')
}

export function getMyLoans() {
  return apiRequest<ApiCollection<Loan>>('/loans/me')
}

export function createLoanRequest(input: { requestedAmount: number; purpose: string }) {
  return apiRequest<LoanRequest>('/loan-requests', { method: 'POST', body: JSON.stringify(input) })
}

export function getLoanInstallments(loanId: string) {
  return apiRequest<ApiCollection<Installment>>(`/loans/${encodeURIComponent(loanId)}/installments`)
}

export function asList<T>(collection: ApiCollection<T>) {
  return Array.isArray(collection) ? collection : collection.data
}