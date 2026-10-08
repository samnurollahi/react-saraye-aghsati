import { useState, type FormEvent } from 'react'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../services/api-client'
import { BrandLogo } from '../../components/BrandLogo'
import { useAuth } from './auth-hooks'

export function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user, isRestoring } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const location = useLocation()

  if (!isRestoring && user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const signedInUser = await signIn({ identifier: identifier.trim(), password })
      enqueueSnackbar('با موفقیت وارد شدید.', { variant: 'success' })
      const fallback = signedInUser.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
      const from = (location.state as { from?: string } | null)?.from
      navigate(from?.startsWith(signedInUser.role === 'admin' ? '/admin' : '/user') ? from : fallback, { replace: true })
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'ورود انجام نشد. دوباره تلاش کنید.')
      setError(message)
      enqueueSnackbar(message, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'radial-gradient(ellipse at top right, rgba(0, 169, 157, 0.14), transparent 38%), linear-gradient(145deg, #f2f8f7 0%, #f7faf9 55%, #eaf2f2 100%)' }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 460, p: { xs: 3, sm: 5 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack spacing={3}>
          <Box>
            <BrandLogo />
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>ورود به حساب</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>برای ادامه، شماره موبایل یا کد ملی خود را وارد کنید.</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <Box component="form" onSubmit={submit} className="flex flex-col gap-4">
            <TextField label="شماره موبایل یا کد ملی" value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" required fullWidth slotProps={{ htmlInput: { dir: 'rtl' } }} />
            <TextField label="رمز عبور" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required fullWidth />
            <Button type="submit" variant="contained" size="large" disabled={loading || !identifier.trim() || !password}>{loading ? 'در حال ورود...' : 'ورود'}</Button>
          </Box>
          <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
            حساب ندارید؟ <Link to="/register" className="font-semibold text-emerald-800">ثبت‌نام</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}