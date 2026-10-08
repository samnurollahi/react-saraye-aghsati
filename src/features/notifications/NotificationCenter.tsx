import { useState } from 'react'
import { NotificationsNone } from '@mui/icons-material'
import { Alert, Badge, Box, Button, CircularProgress, IconButton, Popover, Stack, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../services/api-client'
import { NotificationList } from './components/NotificationList'
import { useMarkNotificationRead, useNotifications, useUnreadNotificationCount } from './queries'

const pageSize = 20

export function NotificationCenter() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const query = useNotifications(1, pageSize)
  const unreadQuery = useUnreadNotificationCount(pageSize)
  const readMutation = useMarkNotificationRead()
  const { enqueueSnackbar } = useSnackbar()
  const notifications = query.data?.data ?? []
  const unreadCount = unreadQuery.count

  const openNotification = async (notification: (typeof notifications)[number]) => {
    if (notification.isRead) return
    try {
      await readMutation.mutateAsync(notification.id)
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, 'به‌روزرسانی وضعیت اعلان انجام نشد.'), { variant: 'error' })
    }
  }

  return <>
    <IconButton aria-label="اعلان‌ها" onClick={(event) => setAnchor(event.currentTarget)} color="inherit">
      <Badge badgeContent={unreadCount} color="error" max={99}><NotificationsNone /></Badge>
    </IconButton>
    <Popover open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
      <Box dir="rtl" sx={{ width: { xs: 'calc(100vw - 32px)', sm: 380 }, maxWidth: 420 }}>
        <Stack direction="row" sx={{ p: 2, alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}><Typography sx={{ fontWeight: 700 }}>اعلان‌ها</Typography><Button component={Link} to="/user/notifications" size="small" onClick={() => setAnchor(null)}>مشاهده همه</Button></Stack>
        {query.isLoading ? <Stack sx={{ minHeight: 150, alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={26} /></Stack>
          : query.error ? <Alert severity="error" sx={{ m: 2 }} action={<Button color="inherit" size="small" onClick={() => void query.refetch()}>تلاش دوباره</Button>}>{getErrorMessage(query.error, 'دریافت اعلان‌ها ناموفق بود.')}</Alert>
            : notifications.length === 0 ? <Typography color="text.secondary" variant="body2" sx={{ p: 3, textAlign: 'center' }}>اعلانی برای نمایش ندارید.</Typography>
              : <Box sx={{ maxHeight: 420, overflowY: 'auto' }}><NotificationList items={notifications} onOpen={(notification) => void openNotification(notification)} /></Box>}
      </Box>
    </Popover>
  </>
}