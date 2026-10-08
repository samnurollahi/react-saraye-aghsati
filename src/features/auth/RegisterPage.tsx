import { useState, type FormEvent } from 'react'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../services/api-client'
import { BrandLogo } from '../../components/BrandLogo'
import { useAuth } from './auth-hooks'

interface RegisterValues {
  fullName: string
  nationalCode: string
  phone: string
  email: string
  password: string
  confirmPassword: string
}

const emptyValues: RegisterValues = { fullName: '', nationalCode: '', phone: '', email: '', password: '', confirmPassword: '' }

function validate(values: RegisterValues) {
  if (values.fullName.trim().length < 3) return 'نام و نام خانوادگی را کامل وارد کنید.'
  if (!/^\d{10}$/.test(values.nationalCode)) return 'کد ملی باید ۱۰ رقم باشد.'
  if (!/^09\d{9}$/.test(values.phone)) return 'شماره موبایل معتبر نیست.'
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return 'ایمیل معتبر نیست.'
  if (values.password.length < 8) return 'رمز عبور باید حداقل ۸ نویسه باشد.'
  if (values.password !== values.confirmPassword) return 'تکرار رمز عبور مطابقت ندارد.'
  return ''
}

export function RegisterPage() {
  const [values, setValues] = useState(emptyValues)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, user, isRestoring } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  if (!isRestoring && user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />

  const update = (field: keyof RegisterValues) => (value: string) => setValues((current) => ({ ...current, [field]: value }))

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationMessage = validate(values)
    if (validationMessage) {
      setError(validationMessage)
      return
    }
    setError('')
    setLoading(true)
    try {
      const createdUser = await signUp({
        fullName: values.fullName.trim(),
        nationalCode: values.nationalCode,
        phone: values.phone,
        email: values.email.trim() || undefined,
        password: values.password,
      })
      enqueueSnackbar('حساب کاربری شما ساخته شد.', { variant: 'success' })
      navigate(createdUser.role === 'admin' ? '/admin/dashboard' : '/user/dashboard', { replace: true })
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'ثبت‌نام انجام نشد. دوباره تلاش کنید.')
      setError(message)
      enqueueSnackbar(message, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'radial-gradient(ellipse at top right, rgba(0, 169, 157, 0.14), transparent 38%), linear-gradient(145deg, #f2f8f7 0%, #f7faf9 55%, #eaf2f2 100%)' }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 540, p: { xs: 3, sm: 5 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack spacing={3}>
          <Box>
            <BrandLogo />
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>ساخت حساب کاربری</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>اطلاعات هویتی خود را برای ثبت‌نام وارد کنید.</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <Box component="form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="نام و نام خانوادگی" value={values.fullName} onChange={(event) => update('fullName')(event.target.value)} autoComplete="name" required fullWidth />
            <TextField label="کد ملی" value={values.nationalCode} onChange={(event) => update('nationalCode')(event.target.value)} slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 10 } }} required fullWidth />
            <TextField label="شماره موبایل" value={values.phone} onChange={(event) => update('phone')(event.target.value)} autoComplete="tel" slotProps={{ htmlInput: { inputMode: 'tel' } }} required fullWidth />
            <TextField label="ایمیل (اختیاری)" type="email" value={values.email} onChange={(event) => update('email')(event.target.value)} autoComplete="email" fullWidth />
            <TextField label="رمز عبور" type="password" value={values.password} onChange={(event) => update('password')(event.target.value)} autoComplete="new-password" required fullWidth />
            <TextField label="تکرار رمز عبور" type="password" value={values.confirmPassword} onChange={(event) => update('confirmPassword')(event.target.value)} autoComplete="new-password" required fullWidth />
            <Button type="submit" variant="contained" size="large" disabled={loading} className="sm:col-span-2">{loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}</Button>
          </Box>
          <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
            قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login" className="font-semibold text-emerald-800">ورود</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}