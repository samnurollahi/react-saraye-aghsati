import { apiRequest } from '../../services/api-client'

export interface AdminShop {
  id: string
  name: string
  ownerName: string
  phone: string
  address: string
  description: string | null
  isActive: boolean
  createdAt: string
}

export interface ShopInput {
  name: string
  ownerName: string
  phone: string
  address: string
  description: string
}

export interface ShopUpdateInput extends Partial<ShopInput> {
  isActive?: boolean
}

interface ShopPagination {
  page?: number
  limit?: number
  total?: number
  totalItems?: number
  totalPages?: number
}

interface ShopListPayload {
  data?: AdminShop[]
  items?: AdminShop[]
  meta?: ShopPagination
  pagination?: ShopPagination
  page?: number
  limit?: number
  total?: number
  totalItems?: number
  totalPages?: number
}

export interface AdminShopPage {
  data: AdminShop[]
  page: number
  limit: number
  total: number
}

export interface ShopSetupTokenResponse {
  setupToken: string
  loginIdentifier: string
  expiresAt: string
}

export async function getAdminShops(page: number, limit: number): Promise<AdminShopPage> {
  const payload = await apiRequest<ShopListPayload | AdminShop[]>(`/admin/shops?page=${page}&limit=${limit}`)
  if (Array.isArray(payload)) return { data: payload, page, limit, total: payload.length }

  const pagination = payload.pagination ?? payload.meta ?? payload
  const data = payload.data ?? payload.items ?? []
  return {
    data,
    page: pagination.page ?? page,
    limit: pagination.limit ?? limit,
    total: pagination.total ?? pagination.totalItems ?? data.length,
  }
}

export function createAdminShop(input: ShopInput) {
  return apiRequest<AdminShop>('/admin/shops', { method: 'POST', body: JSON.stringify(input) })
}

export function updateAdminShop({ id, ...input }: ShopUpdateInput & { id: string }) {
  return apiRequest<AdminShop>(`/admin/shops/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) })
}

export function deleteAdminShop(id: string) {
  return apiRequest<void>(`/admin/shops/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function provisionAdminShopCredentials(id: string) {
  return apiRequest<ShopSetupTokenResponse>(`/admin/shops/${encodeURIComponent(id)}/credentials/setup-token`, { method: 'POST' })
}

export async function getAdminShopQr(id: string): Promise<string> {
  const response = await apiRequest<string | { dataUrl?: string; qrCode?: string; qrCodeDataUrl?: string }>(`/admin/shops/${encodeURIComponent(id)}/qr`)
  const dataUrl = typeof response === 'string' ? response : response.dataUrl ?? response.qrCodeDataUrl ?? response.qrCode
  if (!dataUrl?.startsWith('data:image/png')) throw new Error('تصویر QR در پاسخ سرور معتبر نیست.')
  return dataUrl
}