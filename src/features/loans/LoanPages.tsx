import { AccountBalanceWallet, ArrowBack } from '@mui/icons-material'
import { Alert, Box, Button, Card, CardContent, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { LoanStatusChip } from '../../components/LoanStatusChip'
import { ApiError, getErrorMessage } from '../../services/api-client'
import { asList } from '../../services/loan-api'
import { formatDate, formatMoney } from '../../utils/formatters'
import { useMyLoans } from './queries'
import { InstallmentsTable } from './components/InstallmentsTable'
import { LoanSummary } from './components/LoanSummary'

function LoanError({ error }: { error: unknown }) {
  const status = error instanceof ApiError ? error.status : 0
  const message = status === 403 ? 'به این وام دسترسی ندارید.' : status === 404 ? 'وام موردنظر پیدا نشد.' : getErrorMessage(error, 'دریافت اطلاعات وام با خطا مواجه شد.')
  return <Alert severity="error">{message}</Alert>
}

export function LoansPage() {
  const query = useMyLoans()
  const navigate = useNavigate()
  const loans = query.data ? asList(query.data) : []
  return <Stack spacing={3}>
    <Box><Typography variant="h4" sx={{ fontWeight: 700 }}>وام‌های من</Typography><Typography color="text.secondary" sx={{ mt: 0.75 }}>وضعیت و جزئیات وام‌های شما</Typography></Box>
    {query.error && <LoanError error={query.error} />}
    {query.isLoading && <Stack spacing={1}>{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} height={72} variant="rounded" />)}</Stack>}
    {!query.isLoading && !query.error && loans.length === 0 && <EmptyState title="وامی برای نمایش ندارید." description="وام‌های تأییدشده پس از ثبت در این بخش نمایش داده می‌شوند." action="مشاهده درخواست‌ها" onAction={() => navigate('/user/loan-requests')} />}
    {!query.isLoading && !query.error && loans.length > 0 && <>
      <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
        <Table aria-label="وام‌های من"><TableHead><TableRow><TableCell>اصل وام</TableCell><TableCell>سود</TableCell><TableCell>مبلغ کل</TableCell><TableCell>تعداد اقساط</TableCell><TableCell>مبلغ قسط</TableCell><TableCell>تاریخ شروع</TableCell><TableCell>وضعیت</TableCell><TableCell>اعتبار قابل استفاده</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>{loans.map((loan) => <TableRow key={loan.id} hover><TableCell>{formatMoney(loan.principalAmount)}</TableCell><TableCell>{formatMoney(loan.interestRate)}٪</TableCell><TableCell>{formatMoney(loan.totalAmount)}</TableCell><TableCell>{new Intl.NumberFormat('fa-IR').format(loan.installmentCount)}</TableCell><TableCell>{formatMoney(loan.installmentAmount)}</TableCell><TableCell>{formatDate(loan.startDate)}</TableCell><TableCell><LoanStatusChip status={loan.status} /></TableCell><TableCell>{formatMoney(loan.remainingBalance)}</TableCell><TableCell><Button component={Link} to={`/user/loans/${encodeURIComponent(loan.id)}`} size="small">جزئیات</Button></TableCell></TableRow>)}</TableBody>
        </Table>
      </Box>
      <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
        {loans.map((loan) => <Card key={loan.id} variant="outlined"><CardContent>
          <Stack spacing={1.25}><Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}><Typography sx={{ fontWeight: 700 }}>{formatMoney(loan.principalAmount)}</Typography><LoanStatusChip status={loan.status} /></Stack>
            <Typography variant="body2">مبلغ کل: {formatMoney(loan.totalAmount)} | تعداد اقساط: {new Intl.NumberFormat('fa-IR').format(loan.installmentCount)}</Typography><Typography variant="body2">هر قسط: {formatMoney(loan.installmentAmount)}</Typography><Typography variant="caption" color="text.secondary">شروع: {formatDate(loan.startDate)} | اعتبار قابل استفاده: {formatMoney(loan.remainingBalance)}</Typography>
            <Button component={Link} to={`/user/loans/${encodeURIComponent(loan.id)}`} size="small" sx={{ alignSelf: 'flex-start' }}>مشاهده جزئیات</Button>
          </Stack>
        </CardContent></Card>)}
      </Stack>
    </>}
  </Stack>
}

export function LoanDetailPage() {
  const { id = '' } = useParams()
  const loansQuery = useMyLoans()
  const loan = loansQuery.data ? asList(loansQuery.data).find((item) => item.id === id) : undefined
  if (loansQuery.isLoading) return <Stack spacing={1}><Skeleton height={48} /><Skeleton height={220} variant="rounded" /></Stack>
  if (loansQuery.error) return <LoanError error={loansQuery.error} />
  if (!loan) return <Stack spacing={2}><Alert severity="error">وام موردنظر پیدا نشد.</Alert><Button component={Link} to="/user/loans" startIcon={<ArrowBack />}>بازگشت به وام‌ها</Button></Stack>

  return <Stack spacing={3}>
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>جزئیات وام</Typography>
      <Button component={Link} to="/user/loans" startIcon={<AccountBalanceWallet />}>وام‌های من</Button>
    </Stack>
    <LoanSummary loan={loan} />
    <Box><Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>اقساط</Typography><InstallmentsTable loanId={loan.id} /></Box>
  </Stack>
}