import { AccountBalanceWallet, CheckCircleOutlined, HourglassTop, HighlightOff, PaymentsOutlined, Storefront, WarningAmber } from '@mui/icons-material'
import { Alert, Box, Button, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { LoanStatusChip } from '../../components/LoanStatusChip'
import { getErrorMessage } from '../../services/api-client'
import { asList } from '../../services/loan-api'
import { useAdminLoanRequests, useAdminLoans } from './queries'
import { useAdminShops } from './shop-queries'
import { useAdminInstallments } from './installment-queries'

const cards = [
  { key: 'pending', label: 'در انتظار بررسی', icon: <HourglassTop />, color: 'warning.main' },
  { key: 'approved', label: 'تأیید شده', icon: <CheckCircleOutlined />, color: 'success.main' },
  { key: 'rejected', label: 'رد شده', icon: <HighlightOff />, color: 'error.main' },
  { key: 'active', label: 'وام فعال', icon: <AccountBalanceWallet />, color: 'primary.main' },
  { key: 'shops', label: 'فروشگاه‌ها', icon: <Storefront />, color: 'info.main' },
  { key: 'pendingInstallments', label: 'اقساط در انتظار', icon: <PaymentsOutlined />, color: 'warning.main' },
  { key: 'overdueInstallments', label: 'اقساط معوق', icon: <WarningAmber />, color: 'error.main' },
] as const

export function AdminDashboardPage() {
  const requestsQuery = useAdminLoanRequests()
  const loansQuery = useAdminLoans()
  const shopsQuery = useAdminShops(1, 1)
  const pendingInstallmentsQuery = useAdminInstallments({ status: 'pending', page: 1, limit: 1 })
  const overdueInstallmentsQuery = useAdminInstallments({ status: 'overdue', page: 1, limit: 1 })
  const requests = requestsQuery.data ? asList(requestsQuery.data) : []
  const loans = loansQuery.data ? asList(loansQuery.data) : []
  const totals = {
    pending: requests.filter((request) => request.status === 'pending').length,
    approved: requests.filter((request) => request.status === 'approved').length,
    rejected: requests.filter((request) => request.status === 'rejected').length,
    active: loans.filter((loan) => loan.status === 'active').length,
    shops: shopsQuery.data?.total ?? 0,
    pendingInstallments: pendingInstallmentsQuery.data?.total ?? 0,
    overdueInstallments: overdueInstallmentsQuery.data?.total ?? 0,
  }

  const allQueries = [requestsQuery, loansQuery, shopsQuery, pendingInstallmentsQuery, overdueInstallmentsQuery]
  const dashboardError = allQueries.find((query) => query.error)?.error
  if (allQueries.some((query) => query.isLoading)) return <Stack spacing={2}><Skeleton height={38} width={220} /> <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 2 }}>{cards.map((card) => <Skeleton key={card.key} height={128} variant="rounded" />)}</Box></Stack>
  if (dashboardError) return <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void Promise.all(allQueries.map((query) => query.refetch()))}>تلاش دوباره</Button>}>{getErrorMessage(dashboardError, 'دریافت آمار داشبورد با خطا مواجه شد.')}</Alert>
  if (!requestsQuery.data || !loansQuery.data || !shopsQuery.data || !pendingInstallmentsQuery.data || !overdueInstallmentsQuery.data) return <EmptyState title="آماری برای نمایش وجود ندارد." description="پس از دریافت اطلاعات، آمار در این بخش نمایش داده می‌شود." />

  return <Stack spacing={3}>
    <Box><Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>داشبورد مدیریت</Typography><Typography color="text.secondary">نمای کلی درخواست‌ها و وام‌ها</Typography></Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 2 }}>
      {cards.map((card) => <Card key={card.key} component={Link} to={card.key === 'active' ? '/admin/loans' : card.key === 'shops' ? '/admin/shops' : card.key === 'pendingInstallments' || card.key === 'overdueInstallments' ? '/admin/installments' : '/admin/loan-requests'} sx={{ color: 'inherit', textDecoration: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: 'none', '&:hover': { borderColor: card.color } }}>
        <CardContent><Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}><Box><Typography color="text.secondary" variant="body2">{card.label}</Typography><Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{new Intl.NumberFormat('fa-IR').format(totals[card.key])}</Typography></Box><Box sx={{ color: card.color, display: 'flex' }}>{card.icon}</Box></Stack></CardContent>
      </Card>)}
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}><Typography color="text.secondary">وضعیت‌ها:</Typography><LoanStatusChip status="pending" /><LoanStatusChip status="approved" /><LoanStatusChip status="rejected" /></Box>
  </Stack>
}