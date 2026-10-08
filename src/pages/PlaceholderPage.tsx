import { Alert, Stack, Typography } from '@mui/material'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>{title}</Typography>
      <Alert severity="info">این بخش در مرحله بعدی تکمیل می‌شود.</Alert>
    </Stack>
  )
}