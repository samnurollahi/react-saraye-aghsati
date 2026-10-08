import { useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Chip, Pagination, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { getErrorMessage } from '../../services/api-client'
import { formatDate, formatMoney } from '../../utils/formatters'
import { getTransactionErrorMessage } from './errors'
import { useMyTransactions } from './queries'
import type { TransactionRecord } from './types'

const pageSize = 20

function shopName(transaction: TransactionRecord) {
  if (transaction.shopName) return transaction.shopName
  if (transaction.shop && typeof transaction.shop === 'object') return transaction.shop.name
  return '—'
}

function StatusChip({ status }: { status: string }) {
  const completed = status.toLowerCase() === 'completed'
  return <Chip size="small" color={completed ? 'success' : 'error'} label={completed ? 'موفق' : status.toLowerCase() === 'failed' ? 'ناموفق' : status} />
}

function TransactionDetails({ transaction }: { transaction: TransactionRecord }) {
  return (
    <Stack spacing={1}>
      <Box className="flex items-start justify-between gap-3"><Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{shopName(transaction)}</Typography><StatusChip status={transaction.status} /></Box>
      <Typography sx={{ fontWeight: 700 }}>{formatMoney(transaction.amount)}</Typography>
      {transaction.description && <Typography color="text.secondary" variant="body2" sx={{ overflowWrap: 'anywhere' }}>{transaction.description}</Typography>}
      <Typography color="text.secondary" variant="caption">{formatDate(transaction.createdAt)}{transaction.id ? ` | شناسه: ${transaction.id}` : ''}</Typography>
    </Stack>
  )
}

export function TransactionHistoryPage() {
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const query = useMyTransactions(page, pageSize)
  const transactions = query.data?.data ?? []

  return (
    <Stack spacing={3}>
      <Box className="flex flex-wrap items-end justify-between gap-3">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>تراکنش‌های من</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>تاریخچه خریدهای انجام‌شده با وام</Typography>
        </Box>
        <Button component={Link} to="/user/purchase" variant="contained">خرید با اسکن QR</Button>
      </Box>

      {query.isLoading ? <Stack spacing={1}><Skeleton height={52} /><Skeleton height={220} variant="rounded" /></Stack>
        : query.error ? <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void query.refetch()}>تلاش دوباره</Button>}>{getTransactionErrorMessage(query.error, getErrorMessage(query.error, 'دریافت تراکنش‌ها ناموفق بود.'))}</Alert>
          : transactions.length === 0 ? <Card variant="outlined"><EmptyState title="هنوز تراکنشی انجام نداده‌اید." description="خریدهای شما پس از ثبت در این بخش نمایش داده می‌شوند." action="خرید با وام" onAction={() => navigate('/user/purchase')} /></Card>
            : <>
                <TableContainer component={Card} variant="outlined" sx={{ display: { xs: 'none', sm: 'block' }, borderRadius: 2 }}>
                  <Table>
                    <TableHead><TableRow><TableCell>فروشگاه</TableCell><TableCell>مبلغ</TableCell><TableCell>توضیحات</TableCell><TableCell>وضعیت</TableCell><TableCell>تاریخ</TableCell><TableCell>شناسه</TableCell></TableRow></TableHead>
                    <TableBody>{transactions.map((transaction) => <TableRow key={transaction.id}>
                      <TableCell>{shopName(transaction)}</TableCell><TableCell>{formatMoney(transaction.amount)}</TableCell><TableCell>{transaction.description || '—'}</TableCell><TableCell><StatusChip status={transaction.status} /></TableCell><TableCell>{formatDate(transaction.createdAt)}</TableCell><TableCell sx={{ maxWidth: 150, overflowWrap: 'anywhere' }}>{transaction.id}</TableCell>
                    </TableRow>)}</TableBody>
                  </Table>
                </TableContainer>
                <Stack spacing={1.5} sx={{ display: { xs: 'flex', sm: 'none' } }}>
                  {transactions.map((transaction) => <Card key={transaction.id} variant="outlined" sx={{ borderRadius: 2 }}><CardContent><TransactionDetails transaction={transaction} /></CardContent></Card>)}
                </Stack>
                <Box className="flex justify-center"><Pagination page={page} count={query.data?.totalPages ?? 1} onChange={(_, nextPage) => setPage(nextPage)} color="primary" /></Box>
              </>}
    </Stack>
  )
}