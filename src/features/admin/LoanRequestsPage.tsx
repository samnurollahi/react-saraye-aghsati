import { useState } from 'react'
import { ArrowBack, Check, Close, Visibility } from '@mui/icons-material'
import { Alert, Box, Button, FormControl, InputLabel, Link as MuiLink, MenuItem, Paper, Select, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { LoanStatusChip } from '../../components/LoanStatusChip'
import { formatDate, formatMoney } from '../../utils/formatters'
import { asList } from '../../services/loan-api'
import { useAdminLoanRequest, useAdminLoanRequests } from './queries'
import type { AdminLoanRequestStatus } from './admin-api'
import { AdminQueryState } from './components/AdminQueryState'
import { ApproveLoanDialog } from './components/ApproveLoanDialog'
import { RejectLoanDialog } from './components/RejectLoanDialog'

const filterOptions: { label: string; value: AdminLoanRequestStatus | 'all' }[] = [
  { label: 'همه', value: 'all' },
  { label: 'در انتظار بررسی', value: 'pending' },
  { label: 'تأیید شده', value: 'approved' },
  { label: 'رد شده', value: 'rejected' },
]

export function LoanRequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedStatus = searchParams.get('status')
  const status = filterOptions.some((option) => option.value === requestedStatus) && requestedStatus !== 'all' ? requestedStatus as AdminLoanRequestStatus : undefined
  const query = useAdminLoanRequests(status)
  const rows = query.data ? asList(query.data) : []

  return <Stack spacing={2.5}>
    <Box><Typography variant="h5" sx={{ fontWeight: 700 }}>درخواست‌های وام</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>بررسی و پیگیری درخواست‌های ثبت‌شده</Typography></Box>
    <FormControl size="small" sx={{ maxWidth: 260 }}><InputLabel id="request-status-label">وضعیت</InputLabel><Select labelId="request-status-label" label="وضعیت" value={status ?? 'all'} onChange={(event) => setSearchParams(event.target.value === 'all' ? {} : { status: event.target.value })}>{filterOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</Select></FormControl>
    <AdminQueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.error && rows.length === 0} onRetry={() => void query.refetch()} emptyTitle="درخواستی پیدا نشد." />
    {!query.isLoading && !query.error && rows.length > 0 && <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: 'none', overflowX: 'auto' }}>
      <Table size="small" aria-label="درخواست‌های وام" sx={{ minWidth: 1000 }}><TableHead><TableRow><TableCell>نام کاربر</TableCell><TableCell>کد ملی</TableCell><TableCell>موبایل</TableCell><TableCell>مبلغ درخواستی</TableCell><TableCell>هدف وام</TableCell><TableCell>وضعیت</TableCell><TableCell>تاریخ ثبت</TableCell><TableCell>تاریخ بررسی</TableCell><TableCell>جزئیات</TableCell></TableRow></TableHead>
        <TableBody>{rows.map((request) => <TableRow key={request.id} hover><TableCell>{request.user.fullName}</TableCell><TableCell>{request.user.nationalCode}</TableCell><TableCell dir="ltr" align="right">{request.user.phone}</TableCell><TableCell>{formatMoney(request.requestedAmount)}</TableCell><TableCell>{request.purpose}</TableCell><TableCell><LoanStatusChip status={request.status} /></TableCell><TableCell>{formatDate(request.createdAt)}</TableCell><TableCell>{formatDate(request.reviewedAt)}</TableCell><TableCell><Button size="small" component={Link} to={`/admin/loan-requests/${encodeURIComponent(request.id)}`} startIcon={<Visibility />}>مشاهده</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </TableContainer>}
  </Stack>
}

export function LoanRequestDetailPage() {
  const { id = '' } = useParams()
  const query = useAdminLoanRequest(id)
  const request = query.data
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  if (query.isLoading) return <Stack spacing={2}><Skeleton height={44} width={220} /><Skeleton height={200} variant="rounded" /></Stack>
  if (query.error) return <Alert severity="error" action={<Button color="inherit" onClick={() => void query.refetch()}>تلاش دوباره</Button>}>{query.error instanceof Error ? query.error.message : 'دریافت جزئیات درخواست با خطا مواجه شد.'}</Alert>
  if (!request) return <Alert severity="warning">درخواست موردنظر پیدا نشد.</Alert>

  return <Stack spacing={3}>
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}><Button component={Link} to="/admin/loan-requests" startIcon={<ArrowBack />}>بازگشت</Button><Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>جزئیات درخواست</Typography><LoanStatusChip status={request.status} /></Stack>
    <InfoSection title="اطلاعات کاربر"><DetailItem label="نام" value={request.user.fullName} /><DetailItem label="کد ملی" value={request.user.nationalCode} /><DetailItem label="موبایل" value={request.user.phone} /><DetailItem label="ایمیل" value={request.user.email || '—'} /></InfoSection>
    <InfoSection title="درخواست وام"><DetailItem label="مبلغ درخواستی" value={formatMoney(request.requestedAmount)} /><DetailItem label="هدف وام" value={request.purpose} /><DetailItem label="تاریخ ثبت" value={formatDate(request.createdAt)} /><DetailItem label="آخرین بروزرسانی" value={formatDate(request.updatedAt)} /></InfoSection>
    <InfoSection title="بررسی"><DetailItem label="یادداشت ادمین" value={request.adminNote || '—'} /><DetailItem label="تاریخ بررسی" value={formatDate(request.reviewedAt)} /><DetailItem label="بررسی‌کننده" value={request.reviewedBy || '—'} /></InfoSection>
    {request.loan && <InfoSection title="وام ایجادشده"><DetailItem label="اصل وام" value={formatMoney(request.loan.principalAmount)} /><DetailItem label="نرخ سود" value={`${request.loan.interestRate}%`} /><DetailItem label="تعداد اقساط" value={new Intl.NumberFormat('fa-IR').format(request.loan.installmentCount)} /><DetailItem label="وضعیت وام" value={<LoanStatusChip status={request.loan.status} />} /><MuiLink component={Link} to={`/admin/loans/${encodeURIComponent(request.loan.id)}`} sx={{ gridColumn: '1 / -1' }}>مشاهده جزئیات وام</MuiLink></InfoSection>}
    {request.status === 'pending' && <Stack direction="row" spacing={1.5}><Button variant="contained" color="primary" startIcon={<Check />} onClick={() => setApproveOpen(true)}>تأیید درخواست</Button><Button variant="outlined" color="error" startIcon={<Close />} onClick={() => setRejectOpen(true)}>رد درخواست</Button></Stack>}
    {approveOpen && <ApproveLoanDialog open requestId={request.id} requestedAmount={request.requestedAmount} onClose={() => setApproveOpen(false)} />}
    {rejectOpen && <RejectLoanDialog open requestId={request.id} onClose={() => setRejectOpen(false)} />}
  </Stack>
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <Box component="section" sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2.5 }}><Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{title}</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>{children}</Box></Box>
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>{value}</Typography></Box>
}