import { useState, type FormEvent } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import { useSnackbar } from 'notistack'
import { getErrorMessage } from '../../../services/api-client'
import { formatMoney } from '../../../utils/formatters'
import { useApproveLoanRequest } from '../queries'

interface ApproveLoanDialogProps {
  open: boolean
  requestId: string
  requestedAmount: string
  onClose: () => void
}

function validStartDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function ApproveLoanDialog({ open, requestId, requestedAmount, onClose }: ApproveLoanDialogProps) {
  const [principalAmount, setPrincipalAmount] = useState(requestedAmount)
  const [interestRate, setInterestRate] = useState('')
  const [installmentCount, setInstallmentCount] = useState('')
  const [startDate, setStartDate] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const mutation = useApproveLoanRequest()
  const { enqueueSnackbar } = useSnackbar()

  const principal = Number(principalAmount)
  const rate = Number(interestRate)
  const count = Number(installmentCount)
  const valid = Number.isFinite(principal) && principal > 0 && Number.isFinite(rate) && rate >= 0 && rate <= 100 && Number.isInteger(count) && count > 0 && validStartDate(startDate)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!valid || mutation.isPending) return
    try {
      await mutation.mutateAsync({ id: requestId, principalAmount: principal, interestRate: rate, installmentCount: count, startDate, ...(adminNote.trim() ? { adminNote: adminNote.trim() } : {}) })
      enqueueSnackbar('درخواست تأیید شد و وام ایجاد شد.', { variant: 'success' })
      onClose()
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, 'تأیید درخواست با خطا مواجه شد.'), { variant: 'error' })
    }
  }

  return <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} fullWidth maxWidth="sm">
    <DialogTitle>تأیید درخواست وام</DialogTitle>
    <form onSubmit={submit}>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        <Alert severity="info">مبلغ درخواستی: {formatMoney(requestedAmount)}</Alert>
        <TextField label="مبلغ اصل وام" type="number" value={principalAmount} onChange={(event) => setPrincipalAmount(event.target.value)} required slotProps={{ htmlInput: { min: 0.01, step: 'any' } }} />
        <TextField label="درصد سود" type="number" value={interestRate} onChange={(event) => setInterestRate(event.target.value)} required slotProps={{ htmlInput: { min: 0, max: 100, step: 'any' } }} />
        <TextField label="تعداد اقساط" type="number" value={installmentCount} onChange={(event) => setInstallmentCount(event.target.value)} required slotProps={{ htmlInput: { min: 1, step: 1 } }} />
        <TextField label="تاریخ شروع" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="یادداشت ادمین" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} multiline minRows={2} />
        {interestRate && (rate < 0 || rate > 100) && <Alert severity="warning">درصد سود باید بین صفر تا صد باشد.</Alert>}
      </Stack></DialogContent>
      <DialogActions><Button onClick={onClose} disabled={mutation.isPending}>انصراف</Button><Button type="submit" variant="contained" disabled={!valid || mutation.isPending}>{mutation.isPending ? 'در حال ثبت...' : 'تأیید و ایجاد وام'}</Button></DialogActions>
    </form>
  </Dialog>
}