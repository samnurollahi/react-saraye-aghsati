import { useState } from 'react'
import { Add, ArrowBack } from '@mui/icons-material'
import { Alert, Box, Button, Card, CardContent, CircularProgress, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { LoanStatusChip } from '../../components/LoanStatusChip'
import { ApiError, getErrorMessage } from '../../services/api-client'
import { asList } from '../../services/loan-api'
import { formatDate, formatMoney } from '../../utils/formatters'
import { useCreateLoanRequest, useMyLoanRequests } from './queries'

function RequestError({ error, fallback }: { error: unknown; fallback: string }) {
  const status = error instanceof ApiError ? error.status : 0
  const prefix = status === 403 ? 'به این اطلاعات دسترسی ندارید.' : status === 404 ? 'درخواست موردنظر پیدا نشد.' : ''
  return <Alert severity="error">{prefix || getErrorMessage(error, fallback)}</Alert>
}

export function NewLoanRequestPage() {
  const [amount, setAmount] = useState('')
  const [purpose, setPurpose] = useState('')
  const [validation, setValidation] = useState('')
  const mutation = useCreateLoanRequest()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsedAmount = Number(amount)
    if (!amount.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setValidation('مبلغ درخواستی باید عددی بزرگ‌تر از صفر باشد.')
      return
    }
    if (!purpose.trim()) {
      setValidation('توضیح نیاز را وارد کنید.')
      return
    }
    setValidation('')
    mutation.mutate({ requestedAmount: parsedAmount, purpose: purpose.trim() }, {
      onSuccess: () => {
        enqueueSnackbar('درخواست وام با موفقیت ثبت شد.', { variant: 'success' })
        navigate('/user/loan-requests', { replace: true })
      },
    })
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 760 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>درخواست وام جدید</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>اطلاعات درخواست خود را وارد کنید.</Typography>
      </Box>
      {validation && <Alert severity="warning">{validation}</Alert>}
      {mutation.error && <RequestError error={mutation.error} fallback="ثبت درخواست با خطا مواجه شد." />}
      <Box component="form" onSubmit={submit} noValidate>
        <Stack spacing={2.5}>
          <TextField
            label="مبلغ درخواستی"
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            slotProps={{ htmlInput: { min: 0, step: 'any', inputMode: 'decimal' } }}
            helperText={amount && Number(amount) > 0 ? `مبلغ: ${formatMoney(amount)}` : 'مبلغ را به‌صورت عددی وارد کنید.'}
            fullWidth
            required
          />
          <TextField
            label="توضیح نیاز"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            multiline
            minRows={4}
            fullWidth
            required
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button type="submit" variant="contained" disabled={mutation.isPending} startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}>
              {mutation.isPending ? 'در حال ثبت...' : 'ثبت درخواست'}
            </Button>
            <Button component={Link} to="/user/loan-requests" variant="text" disabled={mutation.isPending}>انصراف</Button>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}

export function LoanRequestsPage() {
  const query = useMyLoanRequests()
  const navigate = useNavigate()
  const requests = query.data ? asList(query.data) : []
  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>درخواست‌های وام</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>وضعیت و جزئیات درخواست‌های ثبت‌شده</Typography>
        </Box>
        <Button component={Link} to="/user/loan-requests/new" variant="contained" startIcon={<Add />}>درخواست وام جدید</Button>
      </Stack>
      {query.error && <RequestError error={query.error} fallback="دریافت درخواست‌ها با خطا مواجه شد." />}
      {query.isLoading && <Stack spacing={1}>{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} height={68} variant="rounded" />)}</Stack>}
      {!query.isLoading && !query.error && requests.length === 0 && <EmptyState title="هنوز درخواست وامی ثبت نکرده‌اید." description="برای شروع، درخواست وام جدیدی ثبت کنید." action="درخواست وام جدید" onAction={() => navigate('/user/loan-requests/new')} />}
      {!query.isLoading && !query.error && requests.length > 0 && <>
        <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
          <Table size="medium" aria-label="درخواست‌های وام">
            <TableHead><TableRow><TableCell>مبلغ</TableCell><TableCell>توضیح</TableCell><TableCell>وضعیت</TableCell><TableCell>تاریخ ثبت</TableCell><TableCell>تاریخ بررسی</TableCell><TableCell>یادداشت مدیر</TableCell><TableCell /></TableRow></TableHead>
            <TableBody>{requests.map((request) => <TableRow key={request.id} hover>
              <TableCell>{formatMoney(request.requestedAmount)}</TableCell>
              <TableCell sx={{ minWidth: 180, maxWidth: 300 }}>{request.purpose}</TableCell>
              <TableCell><LoanStatusChip status={request.status} /></TableCell>
              <TableCell>{formatDate(request.createdAt)}</TableCell>
              <TableCell>{formatDate(request.reviewedAt)}</TableCell>
              <TableCell sx={{ minWidth: 160 }}>{request.adminNote || '—'}</TableCell>
              <TableCell><Button component={Link} to={`/user/loan-requests/${encodeURIComponent(request.id)}`} size="small">جزئیات</Button></TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </Box>
        <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
          {requests.map((request) => <Card key={request.id} variant="outlined"><CardContent>
            <Stack spacing={1.25}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>{formatMoney(request.requestedAmount)}</Typography>
                <LoanStatusChip status={request.status} />
              </Stack>
              <Typography variant="body2">{request.purpose}</Typography>
              <Typography variant="caption" color="text.secondary">ثبت: {formatDate(request.createdAt)} | بررسی: {formatDate(request.reviewedAt)}</Typography>
              {request.adminNote && <Typography variant="body2">یادداشت مدیر: {request.adminNote}</Typography>}
              <Button component={Link} to={`/user/loan-requests/${encodeURIComponent(request.id)}`} size="small" sx={{ alignSelf: 'flex-start' }}>مشاهده جزئیات</Button>
            </Stack>
          </CardContent></Card>)}
        </Stack>
      </>}
    </Stack>
  )
}

export function LoanRequestDetailPage() {
  const { id = '' } = useParams()
  const query = useMyLoanRequests()
  const request = query.data ? asList(query.data).find((item) => item.id === id) : undefined
  if (query.isLoading) return <Stack spacing={1}><Skeleton height={48} /><Skeleton height={180} variant="rounded" /></Stack>
  if (query.error) return <RequestError error={query.error} fallback="دریافت جزئیات درخواست با خطا مواجه شد." />
  if (!request) return <Stack spacing={2}><Alert severity="error">درخواست موردنظر پیدا نشد.</Alert><Button component={Link} to="/user/loan-requests" startIcon={<ArrowBack />}>بازگشت به درخواست‌ها</Button></Stack>

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <Button component={Link} to="/user/loan-requests" startIcon={<ArrowBack />}>درخواست‌ها</Button>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>جزئیات درخواست</Typography>
      </Stack>
      <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card variant="outlined"><CardContent><Typography color="text.secondary">مبلغ درخواستی</Typography><Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{formatMoney(request.requestedAmount)}</Typography></CardContent></Card>
        <Card variant="outlined"><CardContent><Typography color="text.secondary">وضعیت</Typography><Box sx={{ mt: 1 }}><LoanStatusChip status={request.status} /></Box></CardContent></Card>
        <Card variant="outlined"><CardContent><Typography color="text.secondary">تاریخ ثبت</Typography><Typography sx={{ mt: 1 }}>{formatDate(request.createdAt)}</Typography></CardContent></Card>
        <Card variant="outlined"><CardContent><Typography color="text.secondary">تاریخ بررسی</Typography><Typography sx={{ mt: 1 }}>{formatDate(request.reviewedAt)}</Typography></CardContent></Card>
      </Box>
      <Card variant="outlined"><CardContent><Typography sx={{ fontWeight: 700 }}>توضیح نیاز</Typography><Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{request.purpose}</Typography></CardContent></Card>
      {request.adminNote && <Alert severity={request.status === 'rejected' ? 'error' : 'info'}><strong>{request.status === 'rejected' ? 'دلیل رد درخواست: ' : 'یادداشت مدیر: '}</strong>{request.adminNote}</Alert>}
      {request.status === 'approved' && <Button component={Link} to="/user/loans" variant="contained" sx={{ alignSelf: 'flex-start' }}>مشاهده وام‌های من</Button>}
    </Stack>
  )
}