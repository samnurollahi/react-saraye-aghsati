import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import type { FieldPath, UseFormRegister } from 'react-hook-form'
import { AccountCircle, Dashboard, Logout, Menu, ReceiptLong, Storefront, Visibility, VisibilityOff } from '@mui/icons-material'
import { Alert, AppBar, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Drawer, IconButton, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, Pagination, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { BrandLogo } from '../../components/BrandLogo'
import { ApiError, getErrorMessage } from '../../services/api-client'
import { formatDate, formatMoney } from '../../utils/formatters'
import { useShopAuth } from './shop-auth-hooks'
import { setupShopPassword } from './shop-api'
import { useShopDashboard, useShopProfile, useShopTransactions } from './shop-queries'
import type { ShopTransaction } from './shop-api'

const phoneSchema = z.string().regex(/^09\d{9}$/, 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.')
const loginSchema = z.object({ identifier: phoneSchema, password: z.string().min(1, 'رمز عبور را وارد کنید.') })
const setupSchema = z.object({
  setupToken: z.string().trim().min(1, 'کد تنظیم رمز را وارد کنید.'),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد.').max(72, 'رمز عبور نباید بیشتر از ۷۲ کاراکتر باشد.'),
  confirmation: z.string(),
}).refine((values) => values.password === values.confirmation, { path: ['confirmation'], message: 'تکرار رمز عبور مطابقت ندارد.' })
type SetupFormValues = z.infer<typeof setupSchema>

function normalizeDigits(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))).replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
}

function formError(error: unknown, isSetup = false) {
  if (!(error instanceof ApiError)) return 'ارتباط با سرور برقرار نشد. دوباره تلاش کنید.'
  if (error.status === 401) return isSetup ? 'کد تنظیم رمز نامعتبر، منقضی یا قبلاً استفاده شده است.' : 'شماره موبایل یا رمز عبور صحیح نیست.'
  if (error.status === 400) return isSetup ? 'اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.' : 'اطلاعات ورود معتبر نیست.'
  if (error.status === 409) return 'این درخواست با وضعیت فعلی فروشگاه سازگار نیست.'
  if (error.status === 429) return 'تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.'
  if (error.status >= 500) return 'سرور موقتاً در دسترس نیست. بعداً دوباره تلاش کنید.'
  return 'درخواست انجام نشد. دوباره تلاش کنید.'
}

function PasswordField({ label, error, helperText, ...props }: { label: string; error?: boolean; helperText?: string; name: FieldPath<SetupFormValues>; register: UseFormRegister<SetupFormValues>; autoComplete: string }) {
  const [visible, setVisible] = useState(false)
  return <TextField {...props.register(props.name)} label={label} type={visible ? 'text' : 'password'} error={error} helperText={helperText} autoComplete={props.autoComplete} fullWidth slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={visible ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'} onClick={() => setVisible((value) => !value)} edge="end">{visible ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }} />
}

export function ShopLoginPage() {
  const { signIn, shop, isRestoring } = useShopAuth()
  const navigate = useNavigate()
  const [requestError, setRequestError] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema), defaultValues: { identifier: '', password: '' } })
  if (!isRestoring && shop) return <Navigate to="/shop/dashboard" replace />

  const submit = handleSubmit(async (values) => {
    setRequestError('')
    try {
      await signIn({ identifier: normalizeDigits(values.identifier), password: values.password })
      navigate('/shop/dashboard', { replace: true })
    } catch (error) {
      setRequestError(formError(error))
    }
  })

  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'radial-gradient(ellipse at top right, rgba(0, 169, 157, 0.14), transparent 38%), linear-gradient(145deg, #f2f8f7 0%, #f7faf9 55%, #eaf2f2 100%)' }}>
    <Paper variant="outlined" sx={{ width: '100%', maxWidth: 460, p: { xs: 3, sm: 5 }, borderRadius: 2 }}>
      <Stack spacing={3}>
        <Box><BrandLogo /><Typography variant="h4" sx={{ fontWeight: 700, mt: 2 }}>ورود فروشگاه</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>برای مشاهده تراکنش‌ها و اطلاعات فروشگاه وارد شوید.</Typography></Box>
        {requestError && <Alert severity="error">{requestError}</Alert>}
        <Box component="form" onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
          <TextField {...register('identifier', { onChange: (event) => setValue('identifier', normalizeDigits(event.target.value)) })} label="شماره موبایل" autoComplete="username" inputMode="tel" fullWidth error={Boolean(errors.identifier)} helperText={errors.identifier?.message} slotProps={{ htmlInput: { dir: 'ltr' } }} />
          <TextField {...register('password')} label="رمز عبور" type={passwordVisible ? 'text' : 'password'} autoComplete="current-password" fullWidth error={Boolean(errors.password)} helperText={errors.password?.message} slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={passwordVisible ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'} onClick={() => setPasswordVisible((value) => !value)} edge="end">{passwordVisible ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }} />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}>{isSubmitting ? 'در حال ورود...' : 'ورود به پنل فروشگاه'}</Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>رمز اولیه دارید؟ <Link to="/shop/setup-password" className="font-semibold text-emerald-800">تنظیم رمز عبور</Link></Typography>
      </Stack>
    </Paper>
  </Box>
}

export function ShopSetupPasswordPage() {
  const navigate = useNavigate()
  const [requestError, setRequestError] = useState('')
  const [complete, setComplete] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof setupSchema>>({ resolver: zodResolver(setupSchema), defaultValues: { setupToken: '', password: '', confirmation: '' } })

  const submit = handleSubmit(async ({ setupToken, password }) => {
    setRequestError('')
    try {
      await setupShopPassword({ setupToken: setupToken.trim(), password })
      reset()
      setComplete(true)
    } catch (error) {
      setRequestError(formError(error, true))
    }
  })

  if (complete) return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}><Paper variant="outlined" sx={{ width: '100%', maxWidth: 480, p: 4 }}><Stack spacing={2}><Alert severity="success">رمز عبور فروشگاه با موفقیت تنظیم شد.</Alert><Button variant="contained" onClick={() => navigate('/shop/login', { replace: true })}>رفتن به ورود فروشگاه</Button></Stack></Paper></Box>

  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'radial-gradient(ellipse at top right, rgba(0, 169, 157, 0.12), transparent 40%), #f3f8f7' }}>
    <Paper variant="outlined" sx={{ width: '100%', maxWidth: 480, p: { xs: 3, sm: 4 } }}><Stack spacing={2.5}>
      <Box><BrandLogo /><Typography variant="h5" sx={{ mt: 2, fontWeight: 700 }}>تنظیم رمز اولیه</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>کد دریافتی از مدیر را وارد کنید. این کد فقط یک‌بار و تا ۳۰ دقیقه معتبر است.</Typography></Box>
      {requestError && <Alert severity="error">{requestError}</Alert>}
      <Box component="form" onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
        <TextField {...register('setupToken')} label="کد تنظیم رمز" autoComplete="off" fullWidth error={Boolean(errors.setupToken)} helperText={errors.setupToken?.message} />
        <PasswordField name="password" register={register} label="رمز عبور جدید" autoComplete="new-password" error={Boolean(errors.password)} helperText={errors.password?.message} />
        <PasswordField name="confirmation" register={register} label="تکرار رمز عبور" autoComplete="new-password" error={Boolean(errors.confirmation)} helperText={errors.confirmation?.message} />
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}>{isSubmitting ? 'در حال ثبت...' : 'ثبت رمز عبور'}</Button>
      </Box>
      <Button component={Link} to="/shop/login">بازگشت به ورود</Button>
    </Stack></Paper>
  </Box>
}

const shopNav = [
  { label: 'داشبورد', path: '/shop/dashboard', icon: <Dashboard /> },
  { label: 'تراکنش‌ها', path: '/shop/transactions', icon: <ReceiptLong /> },
  { label: 'پروفایل فروشگاه', path: '/shop/profile', icon: <Storefront /> },
]

export function ShopLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { shop, signOut } = useShopAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('md'))
  const logout = () => {
    signOut()
    navigate('/shop/login', { replace: true })
  }
  const drawer = <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Toolbar sx={{ gap: 1.5 }}><BrandLogo compact /><Box><Typography sx={{ fontWeight: 700 }}>سرای اقساطی</Typography><Typography variant="caption" color="text.secondary">پنل فروشگاه</Typography></Box></Toolbar><Divider />
    <List sx={{ px: 1.5, py: 2, flex: 1 }}>{shopNav.map((item) => <ListItemButton key={item.path} component={NavLink} to={item.path} onClick={() => setMobileOpen(false)} sx={{ borderRadius: 1.5, mb: 0.5, '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'inherit' } } }}><ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon><ListItemText primary={item.label} /></ListItemButton>)}</List>
    <Divider /><List sx={{ px: 1.5, py: 1 }}><ListItemButton onClick={logout} sx={{ borderRadius: 1.5 }}><ListItemIcon sx={{ minWidth: 40 }}><Logout /></ListItemIcon><ListItemText primary="خروج از پنل فروشگاه" /></ListItemButton></List>
  </Box>
  return <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
    <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', left: 0, right: { md: 264 } }}><Toolbar sx={{ gap: 1.5 }}>{!desktop && <IconButton aria-label="باز کردن منو" onClick={() => setMobileOpen(true)} edge="start"><Menu /></IconButton>}<Box sx={{ flex: 1 }} /><AccountCircle color="action" /><Typography variant="body2" sx={{ fontWeight: 600 }}>{shop?.name}</Typography></Toolbar></AppBar>
    <Box component="nav" aria-label="ناوبری فروشگاه"><Drawer variant="temporary" anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 264, boxSizing: 'border-box' } }}>{drawer}</Drawer><Drawer variant="permanent" open sx={{ display: { xs: 'none', md: 'block' }, width: 264, flexShrink: 0, '& .MuiDrawer-paper': { width: 264, boxSizing: 'border-box', borderRight: '1px solid', borderLeft: 0, borderColor: 'divider' } }}>{drawer}</Drawer></Box>
    <Box component="main" sx={{ flex: 1, minWidth: 0, pt: 10, px: { xs: 2, sm: 3, lg: 4 }, pb: 4 }}><Outlet /></Box>
  </Box>
}

function QueryError({ error, retry }: { error: unknown; retry: () => void }) {
  const message = error instanceof ApiError && error.status >= 500 ? 'سرور موقتاً در دسترس نیست.' : getErrorMessage(error, 'دریافت اطلاعات با خطا مواجه شد.')
  return <Alert severity="error" action={<Button color="inherit" size="small" onClick={retry}>تلاش دوباره</Button>}>{message}</Alert>
}

function StatusChip({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const labels: Record<string, string> = { completed: 'موفق', pending: 'در انتظار', failed: 'ناموفق', cancelled: 'لغوشده', refunded: 'بازپرداخت‌شده', processing: 'در حال پردازش' }
  const color = normalized === 'completed' ? 'success' : normalized === 'failed' || normalized === 'cancelled' ? 'error' : 'default'
  return <Chip size="small" color={color} label={labels[normalized] ?? status} />
}

function TransactionRows({ items }: { items: ShopTransaction[] }) {
  return <TableBody>{items.map((item) => <TableRow key={item.id}><TableCell sx={{ maxWidth: 160, overflowWrap: 'anywhere' }}>{item.id}</TableCell><TableCell>{formatMoney(item.amount)}</TableCell><TableCell>{item.description || '—'}</TableCell><TableCell><StatusChip status={item.status} /></TableCell><TableCell>{formatDate(item.createdAt)}</TableCell></TableRow>)}</TableBody>
}

export function ShopDashboardPage() {
  const query = useShopDashboard()
  if (query.isLoading) return <Stack spacing={2}><Skeleton height={44} /><Skeleton variant="rounded" height={130} /><Skeleton variant="rounded" height={240} /></Stack>
  if (query.error) return <QueryError error={query.error} retry={() => void query.refetch()} />
  if (!query.data) return null
  const dashboard = query.data
  return <Stack spacing={3}>
    <Box><Typography variant="h4" sx={{ fontWeight: 700 }}>{dashboard.shop.name}</Typography><Typography color="text.secondary" sx={{ mt: 0.75 }}>مدیریت فروشگاه و مشاهده عملکرد تراکنش‌ها</Typography></Box>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Paper variant="outlined" sx={{ p: 2.5, flex: 1 }}><Typography color="text.secondary">تعداد کل تراکنش‌ها</Typography><Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>{new Intl.NumberFormat('fa-IR').format(dashboard.transactionCount)}</Typography></Paper>
      <Paper variant="outlined" sx={{ p: 2.5, flex: 1 }}><Typography color="text.secondary">مجموع مبلغ تراکنش‌های موفق</Typography><Typography variant="h4" sx={{ mt: 1, fontWeight: 700, overflowWrap: 'anywhere' }}>{formatMoney(dashboard.totalTransactionAmount)}</Typography></Paper>
    </Stack>
    <Paper variant="outlined" sx={{ p: 2.5 }}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}><Box><Typography variant="h6" sx={{ fontWeight: 700 }}>اطلاعات فروشگاه</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>مدیر فروشگاه: {dashboard.shop.ownerName}</Typography></Box><Chip color={dashboard.shop.isActive ? 'success' : 'default'} label={dashboard.shop.isActive ? 'فعال' : 'غیرفعال'} /></Stack></Paper>
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="h6" sx={{ fontWeight: 700 }}>تراکنش‌های اخیر</Typography><Button component={Link} to="/shop/transactions">همه تراکنش‌ها</Button></Stack>
    {dashboard.recentTransactions.length === 0 ? <EmptyState title="تراکنشی ثبت نشده است." description="تراکنش‌های فروشگاه پس از ثبت در این بخش نمایش داده می‌شوند." /> : <TableContainer component={Paper} variant="outlined"><Table><TableHead><TableRow><TableCell>شناسه</TableCell><TableCell>مبلغ</TableCell><TableCell>توضیحات</TableCell><TableCell>وضعیت</TableCell><TableCell>تاریخ</TableCell></TableRow></TableHead><TransactionRows items={dashboard.recentTransactions} /></Table></TableContainer>}
  </Stack>
}

export function ShopTransactionsPage() {
  const [page, setPage] = useState(1)
  const limit = 20
  const query = useShopTransactions(page, limit)
  const items = query.data?.items ?? []
  return <Stack spacing={2.5}>
    <Box><Typography variant="h4" sx={{ fontWeight: 700 }}>تراکنش‌های فروشگاه</Typography><Typography color="text.secondary" sx={{ mt: 0.75 }}>تاریخچه تراکنش‌های ثبت‌شده برای فروشگاه شما</Typography></Box>
    {query.isLoading ? <Stack spacing={1}><Skeleton height={48} /><Skeleton variant="rounded" height={240} /></Stack>
      : query.error ? <QueryError error={query.error} retry={() => void query.refetch()} />
        : items.length === 0 ? <EmptyState title="تراکنشی برای نمایش وجود ندارد." description="تراکنش‌های فروشگاه در این بخش نمایش داده می‌شوند." />
          : <>
            <TableContainer component={Paper} variant="outlined" sx={{ display: { xs: 'none', sm: 'block' } }}><Table><TableHead><TableRow><TableCell>شناسه تراکنش</TableCell><TableCell>مبلغ</TableCell><TableCell>توضیحات</TableCell><TableCell>وضعیت</TableCell><TableCell>تاریخ</TableCell></TableRow></TableHead><TransactionRows items={items} /></Table></TableContainer>
            <Stack spacing={1.5} sx={{ display: { xs: 'flex', sm: 'none' } }}>{items.map((item) => <Card key={item.id} variant="outlined"><CardContent><Stack spacing={1}><Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}><Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{item.id}</Typography><StatusChip status={item.status} /></Stack><Typography sx={{ fontWeight: 700 }}>{formatMoney(item.amount)}</Typography>{item.description && <Typography color="text.secondary" variant="body2">{item.description}</Typography>}<Typography color="text.secondary" variant="caption">{formatDate(item.createdAt)}</Typography></Stack></CardContent></Card>)}</Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="body2" color="text.secondary">{new Intl.NumberFormat('fa-IR').format(query.data?.total ?? 0)} تراکنش</Typography><Pagination count={Math.max(1, Math.ceil((query.data?.total ?? 0) / limit))} page={page} onChange={(_, value) => setPage(value)} color="primary" /></Stack>
          </>}
  </Stack>
}

export function ShopProfilePage() {
  const query = useShopProfile()
  if (query.isLoading) return <Stack spacing={1}><Skeleton height={48} /><Skeleton variant="rounded" height={220} /></Stack>
  if (query.error) return <QueryError error={query.error} retry={() => void query.refetch()} />
  if (!query.data) return null
  const profile = query.data
  const values = [['نام فروشگاه', profile.name], ['نام مالک', profile.ownerName], ['شماره تماس', profile.phone], ['نشانی', profile.address], ['توضیحات', profile.description || '—'], ['تاریخ ایجاد', formatDate(profile.createdAt)]]
  return <Stack spacing={2.5}><Box><Typography variant="h4" sx={{ fontWeight: 700 }}>پروفایل فروشگاه</Typography><Typography color="text.secondary" sx={{ mt: 0.75 }}>اطلاعات ثبت‌شده فروشگاه</Typography></Box><Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}><Stack spacing={2.5}><Chip sx={{ alignSelf: 'flex-start' }} color={profile.isActive ? 'success' : 'default'} label={profile.isActive ? 'فعال' : 'غیرفعال'} />{values.map(([label, value]) => <Box key={label}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography sx={{ mt: 0.4, overflowWrap: 'anywhere' }} dir={label === 'شماره تماس' ? 'ltr' : undefined}>{value}</Typography></Box>)}</Stack></Paper></Stack>
}