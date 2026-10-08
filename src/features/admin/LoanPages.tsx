import { ArrowBack, Visibility } from '@mui/icons-material'
import { Alert, Box, Button, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { Link, useParams } from 'react-router-dom'
import { LoanStatusChip } from '../../components/LoanStatusChip'
import { formatDate, formatMoney } from '../../utils/formatters'
import { asList } from '../../services/loan-api'
import { useAdminLoan, useAdminLoans } from './queries'
import { AdminQueryState } from './components/AdminQueryState'

export function AdminLoansPage() {
  const query = useAdminLoans()
  const loans = query.data ? asList(query.data) : []

  return <Stack spacing={2.5}>
    <Box><Typography variant="h5" sx={{ fontWeight: 700 }}>وام‌ها</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>وام‌های ایجادشده و مانده بازپرداخت</Typography></Box>
    <AdminQueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.error && loans.length === 0} onRetry={() => void query.refetch()} emptyTitle="وامی پیدا نشد." />
    {!query.isLoading && !query.error && loans.length > 0 && <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: 'none', overflowX: 'auto' }}>
      <Table size="small" aria-label="وام‌ها" sx={{ minWidth: 1050 }}><TableHead><TableRow><TableCell>کاربر</TableCell><TableCell>اصل وام</TableCell><TableCell>نرخ سود</TableCell><TableCell>مبلغ کل</TableCell><TableCell>تعداد اقساط</TableCell><TableCell>مبلغ قسط</TableCell><TableCell>تاریخ شروع</TableCell><TableCell>وضعیت</TableCell><TableCell>مانده</TableCell><TableCell>جزئیات</TableCell></TableRow></TableHead>
        <TableBody>{loans.map((loan) => <TableRow key={loan.id} hover><TableCell>{loan.user.fullName}</TableCell><TableCell>{formatMoney(loan.principalAmount)}</TableCell><TableCell>{loan.interestRate}%</TableCell><TableCell>{formatMoney(loan.totalAmount)}</TableCell><TableCell>{new Intl.NumberFormat('fa-IR').format(loan.installmentCount)}</TableCell><TableCell>{formatMoney(loan.installmentAmount)}</TableCell><TableCell>{formatDate(loan.startDate)}</TableCell><TableCell><LoanStatusChip status={loan.status} /></TableCell><TableCell>{formatMoney(loan.remainingBalance)}</TableCell><TableCell><Button size="small" component={Link} to={`/admin/loans/${encodeURIComponent(loan.id)}`} startIcon={<Visibility />}>مشاهده</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </TableContainer>}
  </Stack>
}

export function AdminLoanDetailPage() {
  const { id = '' } = useParams()
  const query = useAdminLoan(id)
  const loan = query.data

  if (query.isLoading) return <Stack spacing={2}><Skeleton height={44} width={220} /><Skeleton height={200} variant="rounded" /></Stack>
  if (query.error) return <Alert severity="error">{query.error instanceof Error ? query.error.message : 'دریافت جزئیات وام با خطا مواجه شد.'}<Button color="inherit" onClick={() => void query.refetch()}>تلاش دوباره</Button></Alert>
  if (!loan) return <Alert severity="warning">وام موردنظر پیدا نشد.</Alert>

  return <Stack spacing={3}>
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}><Button component={Link} to="/admin/loans" startIcon={<ArrowBack />}>بازگشت</Button><Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>جزئیات وام</Typography><LoanStatusChip status={loan.status} /></Stack>
    <Box component="section" sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2.5 }}><Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>اطلاعات وام</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
      <DetailItem label="کاربر" value={loan.user.fullName} /><DetailItem label="کد ملی" value={loan.user.nationalCode} /><DetailItem label="موبایل" value={loan.user.phone} /><DetailItem label="اصل وام" value={formatMoney(loan.principalAmount)} /><DetailItem label="نرخ سود" value={`${loan.interestRate}%`} /><DetailItem label="مبلغ کل" value={formatMoney(loan.totalAmount)} /><DetailItem label="تعداد اقساط" value={new Intl.NumberFormat('fa-IR').format(loan.installmentCount)} /><DetailItem label="مبلغ هر قسط" value={formatMoney(loan.installmentAmount)} /><DetailItem label="تاریخ شروع" value={formatDate(loan.startDate)} /><DetailItem label="اعتبار قابل استفاده" value={formatMoney(loan.remainingBalance)} />
    </Box></Box>
    <Box component="section"><Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>اقساط</Typography><InstallmentsTable installments={loan.installments ?? []} /></Box>
  </Stack>
}

function InstallmentsTable({ installments }: { installments: NonNullable<NonNullable<ReturnType<typeof useAdminLoan>['data']>['installments']> }) {
  if (installments.length === 0) return <AdminQueryState loading={false} error={null} empty onRetry={() => undefined} emptyTitle="قسطی برای این وام وجود ندارد." />
  return <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: 'none', overflowX: 'auto' }}><Table size="small" aria-label="اقساط وام" sx={{ minWidth: 620 }}><TableHead><TableRow><TableCell>شماره</TableCell><TableCell>سررسید</TableCell><TableCell>مبلغ</TableCell><TableCell>وضعیت</TableCell><TableCell>پرداخت‌شده در</TableCell></TableRow></TableHead><TableBody>{installments.map((item) => <TableRow key={item.id}><TableCell>{new Intl.NumberFormat('fa-IR').format(item.installmentNumber)}</TableCell><TableCell>{formatDate(item.dueDate)}</TableCell><TableCell>{formatMoney(item.amount)}</TableCell><TableCell><LoanStatusChip status={item.status} /></TableCell><TableCell>{formatDate(item.paidAt)}</TableCell></TableRow>)}</TableBody></Table></TableContainer>
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>{value}</Typography></Box>
}