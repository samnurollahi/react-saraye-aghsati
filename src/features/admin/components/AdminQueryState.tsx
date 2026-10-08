import { Alert, Button, Skeleton, Stack } from '@mui/material'
import { EmptyState } from '../../../components/EmptyState'
import { getErrorMessage } from '../../../services/api-client'

export function AdminQueryState({ loading, error, empty, onRetry, emptyTitle = 'اطلاعاتی برای نمایش وجود ندارد.' }: { loading: boolean; error: unknown; empty: boolean; onRetry: () => void; emptyTitle?: string }) {
  if (loading) return <Stack spacing={1}><Skeleton height={48} /><Skeleton height={180} variant="rounded" /></Stack>
  if (error) return <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetry}>تلاش دوباره</Button>}>{getErrorMessage(error, 'دریافت اطلاعات با خطا مواجه شد.')}</Alert>
  if (empty) return <EmptyState title={emptyTitle} description="در حال حاضر موردی برای نمایش وجود ندارد." />
  return null
}