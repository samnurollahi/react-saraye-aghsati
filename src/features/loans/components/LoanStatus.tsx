import { Stack, Typography } from '@mui/material'
import { LoanStatusChip } from '../../../components/LoanStatusChip'
import type { Loan } from '../../../types/domain'

export function LoanStatus({ loan }: { loan: Loan }) {
  return <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}><Typography sx={{ fontWeight: 700 }}>وضعیت وام</Typography><LoanStatusChip status={loan.status} /></Stack>
}