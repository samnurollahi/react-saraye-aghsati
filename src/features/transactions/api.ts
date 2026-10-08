import { apiRequest } from '../../services/api-client'
import type { ScannedShop, TransactionPage, TransactionRecord, CreateTransactionResult } from './types'

interface TransactionPagination {
  page?: number
  limit?: number
  total?: number
  totalItems?: number
  totalPages?: number
}

interface TransactionListPayload {
  data?: TransactionRecord[]
  items?: TransactionRecord[]
  meta?: TransactionPagination
  pagination?: TransactionPagination
  page?: number
  limit?: number
  total?: number
  totalItems?: number
  totalPages?: number
}

interface CreateTransactionPayload {
  transaction?: TransactionRecord
  loan?: { remainingBalance?: string | number }
  remainingBalance?: string | number
}

export function scanShop(qrCodeToken: string) {
  return apiRequest<ScannedShop>(`/shops/scan/${encodeURIComponent(qrCodeToken)}`)
}

export async function getMyTransactions(page: number, limit: number): Promise<TransactionPage> {
  const payload = await apiRequest<TransactionListPayload | TransactionRecord[]>(`/transactions/me?page=${page}&limit=${limit}`)
  if (Array.isArray(payload)) return { data: payload, page, limit, total: payload.length, totalPages: 1 }

  const pagination = payload.pagination ?? payload.meta ?? payload
  const data = payload.data ?? payload.items ?? []
  const total = pagination.total ?? pagination.totalItems ?? data.length
  return {
    data,
    page: pagination.page ?? page,
    limit: pagination.limit ?? limit,
    total,
    totalPages: pagination.totalPages ?? Math.max(1, Math.ceil(total / (pagination.limit ?? limit))),
  }
}

export async function createTransaction(input: { shopId: string; amount: number; description: string }): Promise<CreateTransactionResult> {
  const payload = await apiRequest<CreateTransactionPayload & TransactionRecord>('/transactions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  const transaction = payload.transaction ?? payload
  return {
    transaction,
    remainingBalance: payload.loan?.remainingBalance ?? payload.remainingBalance,
  }
}