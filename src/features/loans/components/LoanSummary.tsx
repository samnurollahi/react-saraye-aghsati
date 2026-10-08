import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import type { Loan } from '../../../types/domain'
import { formatDate } from '../../../utils/formatters'
import { LoanFinancialInfo } from './LoanFinancialInfo'
import { LoanStatus } from './LoanStatus'

export function LoanSummary({ loan }: { loan: Loan }) {
  return <Stack spacing={2.5}>
    <Card variant="outlined"><CardContent>
      <Stack spacing={2}><Box><Typography variant="h5" sx={{ fontWeight: 700 }}>خلاصه وام</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>تاریخ شروع: {formatDate(loan.startDate)}</Typography></Box><LoanStatus loan={loan} /></Stack>
    </CardContent></Card>
    <LoanFinancialInfo loan={loan} />
  </Stack>
}