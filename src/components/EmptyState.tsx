import { InboxOutlined } from '@mui/icons-material'
import { Box, Button, Stack, Typography } from '@mui/material'

export function EmptyState({ title, description, action, onAction }: { title: string; description: string; action?: string; onAction?: () => void }) {
  return (
    <Stack spacing={1.5} sx={{ py: 6, px: 2, textAlign: 'center', alignItems: 'center' }}>
      <Box sx={{ color: 'text.secondary', display: 'flex' }}><InboxOutlined fontSize="large" /></Box>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
      {action && onAction && <Button variant="contained" onClick={onAction}>{action}</Button>}
    </Stack>
  )
}