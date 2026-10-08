import { apiRequest } from '../../services/api-client'

export type NotificationType = 'INSTALLMENT_DUE_SOON' | 'INSTALLMENT_DUE' | 'INSTALLMENT_OVERDUE'

export interface UserNotification {
  id: string
  title: string
  message: string
  createdAt: string
  isRead: boolean
  type: NotificationType | string
}

interface NotificationPagination {
  page?: number
  limit?: number
  total?: number
  totalItems?: number
  totalPages?: number
  unreadCount?: number
}

interface NotificationListPayload {
  data?: UserNotification[]
  items?: UserNotification[]
  meta?: NotificationPagination
  pagination?: NotificationPagination
  page?: number
  limit?: number
  total?: number
  totalItems?: number
  totalPages?: number
  unreadCount?: number
}

export interface NotificationPage {
  data: UserNotification[]
  page: number
  limit: number
  total: number
  totalPages: number
  unreadCount?: number
}

export async function getNotifications(page: number, limit: number): Promise<NotificationPage> {
  const payload = await apiRequest<NotificationListPayload | UserNotification[]>(`/notifications?page=${page}&limit=${limit}`)
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
    unreadCount: payload.unreadCount ?? pagination.unreadCount,
  }
}

export function markNotificationRead(id: string) {
  return apiRequest<UserNotification>(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' })
}