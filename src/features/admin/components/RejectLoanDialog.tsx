import { useState, type FormEvent } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField } from '@mui/material'
import { useSnackbar } from 'notistack'
import { getErrorMessage } from '../../../services/api-client'
import { useRejectLoanRequest } from '../queries'

export function RejectLoanDialog({ open, requestId, onClose }: { open: boolean; requestId: string; onClose: () => void }) {
  const [adminNote, setAdminNote] = useState('')
  const mutation = useRejectLoanRequest()
  const { enqueueSnackbar } = useSnackbar()

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mutation.isPending) return
    try {
      await mutation.mutateAsync({ id: requestId, ...(adminNote.trim() ? { adminNote: adminNote.trim() } : {}) })
      enqueueSnackbar('درخواست وام رد شد.', { variant: 'success' })
      setAdminNote('')
      onClose()
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, 'رد درخواست با خطا مواجه شد.'), { variant: 'error' })
    }
  }

  return <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} fullWidth maxWidth="sm">
    <DialogTitle>رد درخواست وام</DialogTitle>
    <form onSubmit={submit}>
      <DialogContent><Stack spacing={2}><DialogContentText>آیا از رد این درخواست مطمئن هستید؟</DialogContentText><TextField label="یادداشت ادمین" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} multiline minRows={3} /></Stack></DialogContent>
      <DialogActions><Button onClick={onClose} disabled={mutation.isPending}>انصراف</Button><Button type="submit" color="error" variant="contained" disabled={mutation.isPending}>{mutation.isPending ? 'در حال ثبت...' : 'رد درخواست'}</Button></DialogActions>
    </form>
  </Dialog>
}