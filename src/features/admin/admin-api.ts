import { apiRequest } from '../../services/api-client'
import type { AdminLoan, AdminLoanRequest, AdminUser, ApiCollection } from '../../types/domain'

export type AdminLoanRequestStatus = AdminLoanRequest['status']

export interface ApproveLoanInput {
  principalAmount: number
  interestRate: number
  installmentCount: number
  startDate: string
  adminNote?: string
}

export function getAdminLoanRequests(status?: AdminLoanRequestStatus) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiRequest<ApiCollection<AdminLoanRequest>>(`/admin/loan-requests${query}`)
}

export function getAdminLoanRequest(id: string) {
  return apiRequest<AdminLoanRequest>(`/admin/loan-requests/${encodeURIComponent(id)}`)
}

export function approveAdminLoanRequest({ id, ...input }: ApproveLoanInput & { id: string }) {
  return apiRequest<AdminLoanRequest>(`/admin/loan-requests/${encodeURIComponent(id)}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function rejectAdminLoanRequest({ id, adminNote }: { id: string; adminNote?: string }) {
  return apiRequest<AdminLoanRequest>(`/admin/loan-requests/${encodeURIComponent(id)}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ adminNote }),
  })
}

export function getAdminLoans() {
  return apiRequest<ApiCollection<AdminLoan>>('/admin/loans')
}

export function getAdminLoan(id: string) {
  return apiRequest<AdminLoan>(`/admin/loans/${encodeURIComponent(id)}`)
}

export function getAdminUsers() {
  return apiRequest<ApiCollection<AdminUser>>('/admin/users')
}