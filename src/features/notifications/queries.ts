import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markNotificationRead } from './api'
import type { NotificationPage } from './api'

export const notificationKeys = {
  all: ['notifications'] as const,
  page: (page: number, limit: number) => ['notifications', page, limit] as const,
}

export function useNotifications(page: number, limit: number) {
  return useQuery({ queryKey: notificationKeys.page(page, limit), queryFn: () => getNotifications(page, limit) })
}

export function useUnreadNotificationCount(limit = 20) {
  const firstPage = useNotifications(1, limit)
  const remainingPages = useQueries({
    queries: Array.from({ length: Math.max(0, (firstPage.data?.unreadCount === undefined ? firstPage.data?.totalPages ?? 1 : 1) - 1) }, (_, index) => {
      const page = index + 2
      return { queryKey: notificationKeys.page(page, limit), queryFn: () => getNotifications(page, limit) }
    }),
  })
  const notifications = [firstPage.data, ...remainingPages.map((query) => query.data)].flatMap((page) => page?.data ?? [])
  return {
    count: firstPage.data?.unreadCount ?? notifications.filter((notification) => !notification.isRead).length,
    isLoading: firstPage.isLoading || remainingPages.some((query) => query.isLoading),
  }
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      const previous = queryClient.getQueriesData<NotificationPage>({ queryKey: notificationKeys.all })
      queryClient.setQueriesData<NotificationPage>({ queryKey: notificationKeys.all }, (page) => {
        if (!page) return page
        const wasUnread = page.data.some((item) => item.id === id && !item.isRead)
        return {
          ...page,
          data: page.data.map((item) => item.id === id ? { ...item, isRead: true } : item),
          unreadCount: page.unreadCount === undefined ? undefined : Math.max(0, page.unreadCount - Number(wasUnread)),
        }
      })
      return { previous }
    },
    onError: (_error, _id, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}