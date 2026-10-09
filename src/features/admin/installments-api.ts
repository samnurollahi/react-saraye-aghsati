import { apiRequest } from '../../services/api-client'

export interface AdminInstallment {
  id: string
  installmentNumber: number
  amount: string | number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  paidAt?: string | null
  user?: { id?: string; fullName?: string; nationalCode?: string, phone?: string }
  userName?: string
  loan?: { id?: string }
}

interface InstallmentPagination {
  page?: number
  limit?: number
  total?: number
  totalItems?: number
  totalPages?: number
}

interface InstallmentListPayload {
  data?: AdminInstallment[]
  items?: AdminInstallment[]
  meta?: InstallmentPagination
  pagination?: InstallmentPagination
  page?: number
  limit?: number
  total?: number
  totalItems?: number
  totalPages?: number
}

export interface AdminInstallmentPage {
  data: AdminInstallment[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AdminInstallmentFilters {
  status?: 'pending' | 'overdue'
  dueBefore?: string
  page: number
  limit: number
}

export async function getAdminInstallments(filters: AdminInstallmentFilters): Promise<AdminInstallmentPage> {
  const search = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit) })
  if (filters.status) search.set('status', filters.status)
  if (filters.dueBefore) search.set('dueBefore', filters.dueBefore)

  const payload = await apiRequest<InstallmentListPayload | AdminInstallment[]>(`/admin/installments?${search}`)
  if (Array.isArray(payload)) return { data: payload, page: filters.page, limit: filters.limit, total: payload.length, totalPages: 1 }

  const pagination = payload.pagination ?? payload.meta ?? payload
  const data = payload.data ?? payload.items ?? []
  const page = pagination.page ?? filters.page
  const limit = pagination.limit ?? filters.limit
  const total = pagination.total ?? pagination.totalItems ?? data.length
  return { data, page, limit, total, totalPages: pagination.totalPages ?? Math.max(1, Math.ceil(total / limit)) }
}

export function confirmAdminInstallmentPayment(id: string) {
  return apiRequest<AdminInstallment>(`/admin/installments/${encodeURIComponent(id)}/confirm-payment`, { method: 'PATCH' })
}