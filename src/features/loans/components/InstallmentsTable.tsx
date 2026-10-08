import { Alert, Box, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { EmptyState } from '../../../components/EmptyState'
import { InstallmentStatusChip } from '../../../components/InstallmentStatusChip'
import { ApiError, getErrorMessage } from '../../../services/api-client'
import { asList } from '../../../services/loan-api'
import { formatDate, formatMoney } from '../../../utils/formatters'
import { useLoanInstallments } from '../queries'

export function InstallmentsTable({ loanId }: { loanId: string }) {
  const query = useLoanInstallments(loanId)
  const installments = query.data ? asList(query.data) : []
  if (query.isLoading) return <Stack spacing={1}><Skeleton height={48} /><Skeleton height={120} variant="rounded" /></Stack>
  if (query.error) {
    const status = query.error instanceof ApiError ? query.error.status : 0
    const message = status === 403 ? 'به اقساط این وام دسترسی ندارید.' : getErrorMessage(query.error, 'دریافت اقساط با خطا مواجه شد.')
    return <Alert severity="error">{message}</Alert>
  }
  if (installments.length === 0) return <EmptyState title="قسطی برای این وام وجود ندارد." description="اطلاعات اقساط در حال حاضر در دسترس نیست." />

  return <>
    <Box sx={{ display: { xs: 'none', sm: 'block' }, overflowX: 'auto' }}>
      <Table aria-label="اقساط وام"><TableHead><TableRow><TableCell>شماره قسط</TableCell><TableCell>تاریخ سررسید</TableCell><TableCell>مبلغ</TableCell><TableCell>وضعیت</TableCell><TableCell>تاریخ پرداخت</TableCell></TableRow></TableHead>
        <TableBody>{installments.map((item) => <TableRow key={item.id}><TableCell>{new Intl.NumberFormat('fa-IR').format(item.installmentNumber)}</TableCell><TableCell>{formatDate(item.dueDate)}</TableCell><TableCell>{formatMoney(item.amount)}</TableCell><TableCell><InstallmentStatusChip status={item.status} /></TableCell><TableCell>{formatDate(item.paidAt)}</TableCell></TableRow>)}</TableBody>
      </Table>
    </Box>
    <Stack spacing={1.5} sx={{ display: { xs: 'flex', sm: 'none' } }}>
      {installments.map((item) => <Box key={item.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
      <Stack spacing={1}><Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}><Typography sx={{ fontWeight: 700 }}>قسط {new Intl.NumberFormat('fa-IR').format(item.installmentNumber)}</Typography><InstallmentStatusChip status={item.status} /></Stack>
          <Typography variant="body2">مبلغ: {formatMoney(item.amount)}</Typography><Typography variant="body2">سررسید: {formatDate(item.dueDate)}</Typography><Typography variant="body2">پرداخت: {formatDate(item.paidAt)}</Typography></Stack>
      </Box>)}
    </Stack>
  </>
}