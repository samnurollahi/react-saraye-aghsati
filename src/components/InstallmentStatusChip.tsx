import { Chip } from '@mui/material'

const labels = { pending: 'در انتظار پرداخت', paid: 'پرداخت شده', overdue: 'معوق' } as const

export function InstallmentStatusChip({ status }: { status: keyof typeof labels }) {
  const color = status === 'paid' ? 'success' : status === 'overdue' ? 'error' : 'warning'
  return <Chip size="small" color={color} label={labels[status]} />
}