import { Box, Card, CardContent, Typography } from '@mui/material'
import type { Loan } from '../../../types/domain'
import { formatMoney } from '../../../utils/formatters'

export function LoanFinancialInfo({ loan }: { loan: Loan }) {
  const items = [
    ['اصل وام', formatMoney(loan.principalAmount)],
    ['نرخ سود', `${formatMoney(loan.interestRate)}٪`],
    ['مبلغ کل', formatMoney(loan.totalAmount)],
    ['تعداد اقساط', new Intl.NumberFormat('fa-IR').format(loan.installmentCount)],
    ['مبلغ هر قسط', formatMoney(loan.installmentAmount)],
    ['اعتبار قابل استفاده', formatMoney(loan.remainingBalance)],
  ]
  return <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {items.map(([label, value]) => <Card key={label} variant="outlined"><CardContent>
      <Typography color="text.secondary" variant="body2">{label}</Typography>
      <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>{value}</Typography>
    </CardContent></Card>)}
  </Box>
}