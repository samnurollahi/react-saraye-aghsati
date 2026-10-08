import { Chip } from '@mui/material'

const labels: Record<string, string> = {
  pending: 'در انتظار بررسی', approved: 'تأیید شده', rejected: 'رد شده',
  active: 'فعال', completed: 'تکمیل شده', defaulted: 'معوق',
  paid: 'پرداخت شده', overdue: 'معوق',
}

const colors: Record<string, 'default' | 'success' | 'error' | 'warning' | 'info'> = {
  pending: 'warning', approved: 'success', rejected: 'error', active: 'success',
  completed: 'info', defaulted: 'error', paid: 'success', overdue: 'error',
}

export function LoanStatusChip({ status }: { status: string }) {
  return <Chip size="small" color={colors[status] ?? 'default'} label={labels[status] ?? status} />
}