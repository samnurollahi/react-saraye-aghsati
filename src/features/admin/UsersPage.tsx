import { Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Stack } from '@mui/material'
import { formatDate } from '../../utils/formatters'
import { asList } from '../../services/loan-api'
import { useAdminUsers } from './queries'
import { AdminQueryState } from './components/AdminQueryState'

export function AdminUsersPage() {
  const query = useAdminUsers()
  const users = query.data ? asList(query.data) : []

  return <Stack spacing={2.5}>
    <Box><Typography variant="h5" sx={{ fontWeight: 700 }}>کاربران</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>اطلاعات حساب‌ها و وضعیت دسترسی</Typography></Box>
    <AdminQueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.error && users.length === 0} onRetry={() => void query.refetch()} emptyTitle="کاربری پیدا نشد." />
    {!query.isLoading && !query.error && users.length > 0 && <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: 'none', overflowX: 'auto' }}>
      <Table size="small" aria-label="کاربران" sx={{ minWidth: 820 }}><TableHead><TableRow><TableCell>نام</TableCell><TableCell>کد ملی</TableCell><TableCell>موبایل</TableCell><TableCell>ایمیل</TableCell><TableCell>نقش</TableCell><TableCell>وضعیت حساب</TableCell><TableCell>تاریخ عضویت</TableCell></TableRow></TableHead><TableBody>{users.map((user) => <TableRow key={user.id} hover><TableCell>{user.fullName}</TableCell><TableCell>{user.nationalCode}</TableCell><TableCell dir="ltr" align="right">{user.phone}</TableCell><TableCell>{user.email || '—'}</TableCell><TableCell>{user.role === 'admin' ? 'مدیر' : 'کاربر'}</TableCell><TableCell><Chip size="small" color={user.isActive ? 'success' : 'default'} label={user.isActive ? 'فعال' : 'غیرفعال'} /></TableCell><TableCell>{formatDate(user.createdAt)}</TableCell></TableRow>)}</TableBody></Table>
    </TableContainer>}
  </Stack>
}