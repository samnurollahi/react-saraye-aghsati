import { Fragment } from 'react'
import { Circle } from '@mui/icons-material'
import { Divider, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import type { UserNotification } from '../api'
import { formatDate } from '../../../utils/formatters'

const notificationTypeLabels: Record<string, string> = {
  INSTALLMENT_DUE_SOON: 'نزدیک شدن سررسید',
  INSTALLMENT_DUE: 'سررسید قسط',
  INSTALLMENT_OVERDUE: 'قسط معوق',
}

export function NotificationList({ items, onOpen }: { items: UserNotification[]; onOpen: (notification: UserNotification) => void }) {
  return <List disablePadding>
    {items.map((notification, index) => <Fragment key={notification.id}>
      <ListItemButton
        onClick={() => onOpen(notification)}
        alignItems="flex-start"
        sx={{ gap: 1, py: 1.5, bgcolor: notification.isRead ? 'background.paper' : 'action.hover', borderRight: notification.isRead ? 0 : 3, borderColor: 'primary.main' }}
      >
        <Stack sx={{ pt: 0.5, color: notification.isRead ? 'transparent' : 'primary.main' }}><Circle sx={{ fontSize: 9 }} /></Stack>
        <ListItemText
          primary={<Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}><Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 500 : 700 }}>{notification.title}</Typography><Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{formatDate(notification.createdAt)}</Typography></Stack>}
          secondary={<Stack spacing={0.5} component="span"><Typography component="span" variant="body2" color="text.secondary">{notification.message}</Typography><Typography component="span" variant="caption" color="primary.main">{notificationTypeLabels[notification.type] ?? notification.type}</Typography></Stack>}
        />
      </ListItemButton>
      {index < items.length - 1 && <Divider component="li" />}
    </Fragment>)}
  </List>
}