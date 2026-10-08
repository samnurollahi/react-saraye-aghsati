import { QrCodeScanner } from '@mui/icons-material'
import { Alert, Box, Button, Card, CardContent, Chip, Skeleton, Stack, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { Link } from 'react-router-dom'
import { useMyLoanRequests } from '../loan-requests/queries'
import { useMyLoans } from '../loans/queries'
import { useMyTransactions } from '../transactions/queries'
import { useInstallmentsForLoans } from '../loans/queries'
import { useMarkNotificationRead, useNotifications } from '../notifications/queries'
import { NotificationList } from '../notifications/components/NotificationList'
import { InstallmentStatusChip } from '../../components/InstallmentStatusChip'
import { asList } from '../../services/loan-api'
import { getErrorMessage } from '../../services/api-client'
import type { Loan, LoanRequest } from '../../types/domain'
import { formatDate, formatMoney, sumDecimalAmounts } from '../../utils/formatters'

const countStatuses = (requests: LoanRequest[], wanted: string[]) =>
  requests.filter((request) => wanted.includes(request.status.trim().toLowerCase())).length

const emptyRequests: LoanRequest[] = []
const emptyLoans: Loan[] = []

function SummaryCard({ title, value, detail, color }: { title: string; value: string; detail: string; color: 'primary' | 'success' | 'error' | 'warning' }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography color="text.secondary" variant="body2">{title}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{value}</Typography>
          </Box>
          <Chip size="small" color={color} variant="outlined" label={detail} />
        </Stack>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const requestsQuery = useMyLoanRequests()
  const loansQuery = useMyLoans()
  const transactionsQuery = useMyTransactions(1, 5)
  const notificationsQuery = useNotifications(1, 5)
  const markNotificationRead = useMarkNotificationRead()
  const { enqueueSnackbar } = useSnackbar()
  const requests = requestsQuery.data ? asList(requestsQuery.data) : emptyRequests
  const loans = loansQuery.data ? asList(loansQuery.data) : emptyLoans
  const installmentQueries = useInstallmentsForLoans(loans.map((loan) => loan.id))
  const installments = installmentQueries.flatMap((query) => query.data ? asList(query.data) : [])
  const unpaidInstallments = installments.filter((installment) => installment.status !== 'paid')
  const nextInstallment = [...unpaidInstallments].sort((first, second) => new Date(first.dueDate).getTime() - new Date(second.dueDate).getTime())[0]
  const activeLoans = loans.filter((loan) => ['active', 'جاری', 'فعال'].includes(loan.status.trim().toLowerCase()))
  const summary = {
    pending: countStatuses(requests, ['pending', 'waiting', 'در انتظار', 'در انتظار بررسی']),
    approved: countStatuses(requests, ['approved', 'accepted', 'تایید شده', 'تأیید شده']),
    rejected: countStatuses(requests, ['rejected', 'declined', 'رد شده']),
    activeLoans: activeLoans.length,
    balance: formatMoney(activeLoans.length === 0 ? '0' : sumDecimalAmounts(activeLoans.map((loan) => loan.remainingBalance))),
    outstanding: formatMoney(sumDecimalAmounts(unpaidInstallments.map((installment) => String(installment.amount)))),
  }

  const error = requestsQuery.error ?? loansQuery.error
  const loading = requestsQuery.isLoading || loansQuery.isLoading
  const installmentError = installmentQueries.find((query) => query.error)?.error
  const installmentLoading = installmentQueries.some((query) => query.isLoading)

  const openNotification = async (notification: NonNullable<typeof notificationsQuery.data>['data'][number]) => {
    if (notification.isRead) return
    try {
      await markNotificationRead.mutateAsync(notification.id)
    } catch (readError) {
      enqueueSnackbar(getErrorMessage(readError, 'به‌روزرسانی وضعیت اعلان انجام نشد.'), { variant: 'error' })
    }
  }

  return (
    <Stack spacing={3}>
      <Box className="flex flex-wrap items-end justify-between gap-3">
        <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>داشبورد</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>نمای کلی درخواست‌ها و وام‌های شما</Typography>
        </Box>
        <Button component={Link} to="/user/purchase" variant="contained" startIcon={<QrCodeScanner />}>خرید با اسکن QR</Button>
      </Box>
      {error && (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => { void requestsQuery.refetch(); void loansQuery.refetch() }}>تلاش دوباره</Button>}>
          {getErrorMessage(error, 'دریافت اطلاعات داشبورد با خطا مواجه شد.')}
        </Alert>
      )}
      {!error && <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 7 }, (_, index) => <Card key={index} variant="outlined"><CardContent><Skeleton width="55%" /><Skeleton height={48} width="35%" /><Skeleton width="40%" /></CardContent></Card>)
          : <>
              <SummaryCard title="درخواست‌های در انتظار" value={String(summary.pending)} detail="در حال بررسی" color="warning" />
              <SummaryCard title="درخواست‌های تأییدشده" value={String(summary.approved)} detail="تأیید شده" color="success" />
              <SummaryCard title="درخواست‌های ردشده" value={String(summary.rejected)} detail="رد شده" color="error" />
              <SummaryCard title="وام‌های فعال" value={String(summary.activeLoans)} detail="فعال" color="primary" />
              <SummaryCard title="اعتبار قابل استفاده" value={summary.balance ?? '—'} detail="برای خرید" color="primary" />
              <SummaryCard title="بدهی اقساط پرداخت‌نشده" value={installmentLoading ? '…' : installmentError ? '—' : summary.outstanding} detail="مجموع اقساط پرداخت‌نشده" color="error" />
              <SummaryCard title="قسط بعدی" value={installmentLoading ? '…' : nextInstallment ? formatMoney(nextInstallment.amount) : '—'} detail={nextInstallment ? formatDate(nextInstallment.dueDate) : 'قسط پرداخت‌نشده‌ای نیست'} color={nextInstallment?.status === 'overdue' ? 'error' : 'warning'} />
            </>}
      </Box>}
      {installmentError && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void Promise.all(installmentQueries.map((query) => query.refetch()))}>تلاش دوباره</Button>}>دریافت وضعیت اقساط برای محاسبه بدهی ناموفق بود.</Alert>}
      {nextInstallment && !installmentLoading && !installmentError && <Box className="flex items-center gap-2"><Typography variant="body2" color="text.secondary">وضعیت قسط بعدی:</Typography><InstallmentStatusChip status={nextInstallment.status} /></Box>}
      <Box>
        <Box className="mb-3 flex items-center justify-between gap-2"><Typography variant="h6" sx={{ fontWeight: 700 }}>اعلان‌های اخیر</Typography><Button component={Link} to="/user/notifications" size="small">مشاهده همه</Button></Box>
        {notificationsQuery.isLoading ? <Stack spacing={1}><Skeleton height={64} /><Skeleton height={64} /></Stack>
          : notificationsQuery.error ? <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void notificationsQuery.refetch()}>تلاش دوباره</Button>}>دریافت اعلان‌های اخیر ناموفق بود.</Alert>
            : notificationsQuery.data?.data.length ? <Card variant="outlined"><NotificationList items={notificationsQuery.data.data} onOpen={(notification) => void openNotification(notification)} /></Card>
              : <Alert severity="info">اعلانی برای نمایش ندارید.</Alert>}
      </Box>
      <Box>
        <Box className="mb-3 flex items-center justify-between gap-2">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>تراکنش‌های اخیر</Typography>
          <Button component={Link} to="/user/transactions" size="small">مشاهده همه</Button>
        </Box>
        {transactionsQuery.isLoading ? <Stack spacing={1}>{Array.from({ length: 2 }, (_, index) => <Card key={index} variant="outlined"><CardContent><Skeleton width="35%" /><Skeleton width="60%" /></CardContent></Card>)}</Stack>
          : transactionsQuery.error ? <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void transactionsQuery.refetch()}>تلاش دوباره</Button>}>دریافت تراکنش‌های اخیر ناموفق بود.</Alert>
            : transactionsQuery.data?.data.length ? <Stack spacing={1}>{transactionsQuery.data.data.map((transaction) => <Card key={transaction.id} variant="outlined"><CardContent className="flex flex-wrap items-center justify-between gap-2" sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}><Box><Typography sx={{ fontWeight: 600 }}>{transaction.shopName ?? (typeof transaction.shop === 'object' ? transaction.shop?.name : null) ?? 'فروشگاه'}</Typography><Typography color="text.secondary" variant="caption">{formatDate(transaction.createdAt)}</Typography></Box><Typography sx={{ fontWeight: 700 }}>{formatMoney(transaction.amount)}</Typography></CardContent></Card>)}</Stack>
              : <Alert severity="info">هنوز تراکنشی انجام نداده‌اید.</Alert>}
      </Box>
    </Stack>
  )
}