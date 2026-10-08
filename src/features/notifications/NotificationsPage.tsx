import { useState } from 'react'
import { Alert, Box, Button, Pagination, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { EmptyState } from '../../components/EmptyState'
import { getErrorMessage } from '../../services/api-client'
import { NotificationList } from './components/NotificationList'
import { useMarkNotificationRead, useNotifications } from './queries'

const pageSize = 20

export function NotificationsPage() {
  const [page, setPage] = useState(1)
  const query = useNotifications(page, pageSize)
  const readMutation = useMarkNotificationRead()
  const { enqueueSnackbar } = useSnackbar()
  const notifications = query.data?.data ?? []

  const openNotification = async (notification: (typeof notifications)[number]) => {
    if (notification.isRead) return
    try {
      await readMutation.mutateAsync(notification.id)
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, 'به‌روزرسانی وضعیت اعلان انجام نشد.'), { variant: 'error' })
    }
  }

  return <Stack spacing={2.5}>
    <Box><Typography variant="h4" sx={{ fontWeight: 700 }}>اعلان‌ها</Typography><Typography color="text.secondary" sx={{ mt: 0.75 }}>یادآوری سررسید و وضعیت اقساط</Typography></Box>
    {query.isLoading ? <Stack spacing={1}><Skeleton height={56} /><Skeleton height={90} /><Skeleton height={90} /></Stack>
      : query.error ? <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void query.refetch()}>تلاش دوباره</Button>}>{getErrorMessage(query.error, 'دریافت اعلان‌ها ناموفق بود.')}</Alert>
        : notifications.length === 0 ? <EmptyState title="اعلانی برای نمایش ندارید." description="یادآوری‌های مربوط به اقساط در این بخش نمایش داده می‌شوند." />
          : <>
            <Paper variant="outlined"><NotificationList items={notifications} onOpen={(notification) => void openNotification(notification)} /></Paper>
            <Box className="flex justify-center"><Pagination page={page} count={query.data?.totalPages ?? 1} onChange={(_, nextPage) => setPage(nextPage)} color="primary" /></Box>
          </>}
  </Stack>
}