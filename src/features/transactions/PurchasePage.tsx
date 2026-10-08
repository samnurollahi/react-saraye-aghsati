import { useCallback, useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowBack, CheckCircleOutlined, QrCodeScanner, Refresh } from '@mui/icons-material'
import { Alert, Box, Button, Card, CardContent, CircularProgress, Divider, Skeleton, Stack, TextField, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { Link } from 'react-router-dom'
import { useMyLoans } from '../loans/queries'
import { asList } from '../../services/loan-api'
import { getErrorMessage } from '../../services/api-client'
import { formatMoney, sumDecimalAmounts } from '../../utils/formatters'
import { QrCameraScanner } from './QrCameraScanner'
import { getCameraErrorMessage, getTransactionErrorMessage } from './errors'
import { normalizeAmount, purchaseSchema, type PurchaseFormValues } from './purchase-schema'
import { useCreateTransaction, useScanShop } from './queries'
import type { ScannedShop } from './types'

function ShopDetails({ shop }: { shop: ScannedShop }) {
  const details = [
    ['نام فروشگاه', shop.name],
    ['صاحب فروشگاه', shop.ownerName],
    ['تلفن', shop.phone],
    ['آدرس', shop.address],
    ['توضیحات', shop.description || '—'],
  ]
  return <Stack spacing={1.5}>{details.map(([label, value]) => <Box key={label} className="grid grid-cols-[7rem_1fr] gap-3"><Typography color="text.secondary" variant="body2">{label}</Typography><Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{value}</Typography></Box>)}</Stack>
}

export function PurchasePage() {
  const [shop, setShop] = useState<ScannedShop | null>(null)
  const [qrToken, setQrToken] = useState('')
  const [cameraError, setCameraError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [scannerKey, setScannerKey] = useState(0)
  const { enqueueSnackbar } = useSnackbar()
  const loansQuery = useMyLoans()
  const scanMutation = useScanShop()
  const purchaseMutation = useCreateTransaction()
  const { control, handleSubmit, formState: { errors } } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { amount: '', description: '' },
  })
  const loans = loansQuery.data ? asList(loansQuery.data) : []
  const scanShop = scanMutation.mutateAsync
  const activeLoans = loans.filter((loan) => loan.status === 'active')
  const availableBalance = sumDecimalAmounts(activeLoans.map((loan) => loan.remainingBalance))
  const result = purchaseMutation.data

  const handleScan = useCallback((token: string) => {
    if (!token) {
      setCameraError('QR نامعتبر است. کد فروشگاه را دوباره اسکن کنید.')
      return
    }
    setCameraError('')
    setQrToken(token)
  }, [])

  useEffect(() => {
    if (!qrToken) return
    let active = true
    const lookupShop = async () => {
      try {
        const scannedShop = await scanShop(qrToken)
        if (active) setShop(scannedShop)
      } catch (error) {
        if (active) setCameraError(getTransactionErrorMessage(error, 'QR فروشگاه معتبر نیست.'))
      } finally {
        if (active) setQrToken('')
      }
    }
    void lookupShop()
    return () => { active = false }
  }, [qrToken, scanShop])

  const handleCameraError = useCallback((error: unknown) => {
    setCameraError(getCameraErrorMessage(error))
  }, [])

  const resetFlow = () => {
    setShop(null)
    setQrToken('')
    setConfirmed(false)
    setCameraError('')
    setScannerKey((key) => key + 1)
    scanMutation.reset()
    purchaseMutation.reset()
  }

  const retryScan = () => {
    setCameraError('')
    scanMutation.reset()
    setScannerKey((key) => key + 1)
  }

  const submitPurchase = handleSubmit(async (values) => {
    if (!shop || !confirmed) return
    try {
      await purchaseMutation.mutateAsync({
        shopId: shop.id,
        amount: Number(normalizeAmount(values.amount)),
        description: values.description.trim(),
      })
      enqueueSnackbar('خرید با موفقیت ثبت شد.', { variant: 'success' })
      setConfirmed(true)
    } catch {
      return
    }
  })

  return (
    <Stack spacing={3} sx={{ maxWidth: 760, mx: 'auto' }}>
      <Box>
        <Button component={Link} to="/user/dashboard" startIcon={<ArrowBack />} sx={{ mb: 1 }}>بازگشت</Button>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>خرید با وام</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>فروشگاه را اسکن و پیش از تأیید خرید، اطلاعات آن را بررسی کنید.</Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5}>
            <Box className="flex flex-wrap items-center justify-between gap-2">
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>اعتبار قابل استفاده</Typography>
                {loansQuery.isLoading ? <Skeleton width={140} height={34} /> : loansQuery.error ? <Typography color="error" variant="body2">{getErrorMessage(loansQuery.error, 'دریافت موجودی ناموفق بود.')}</Typography> : <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatMoney(availableBalance)}</Typography>}
              </Box>
              <Button component={Link} to="/user/transactions" variant="text">تراکنش‌های من</Button>
            </Box>

            {purchaseMutation.isSuccess && result ? (
              <>
                <Divider />
                <Alert icon={<CheckCircleOutlined />} severity="success">خرید با موفقیت ثبت شد.</Alert>
                <ShopDetails shop={shop!} />
                <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Box><Typography color="text.secondary" variant="body2">مبلغ خرید</Typography><Typography sx={{ fontWeight: 700 }}>{formatMoney(result.transaction.amount)}</Typography></Box>
                  <Box><Typography color="text.secondary" variant="body2">اعتبار قابل استفاده پس از خرید</Typography><Typography sx={{ fontWeight: 700 }}>{formatMoney(result.remainingBalance)}</Typography></Box>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button component={Link} to="/user/transactions" variant="contained">مشاهده تراکنش‌ها</Button>
                  <Button component={Link} to="/user/dashboard">بازگشت به داشبورد</Button>
                  <Button onClick={resetFlow} startIcon={<Refresh />}>خرید دیگر</Button>
                </Stack>
              </>
            ) : !shop ? (
              <>
                <Divider />
                <Stack spacing={2}>
                  {cameraError && <Alert severity="error" action={<Button color="inherit" size="small" onClick={retryScan}>تلاش دوباره</Button>}>{cameraError}</Alert>}
                  {scanMutation.isPending ? <Box className="flex min-h-64 items-center justify-center"><Stack spacing={1} sx={{ alignItems: 'center' }}><CircularProgress /><Typography>در حال دریافت اطلاعات فروشگاه...</Typography></Stack></Box> : <QrCameraScanner key={scannerKey} onScan={handleScan} onError={handleCameraError} />}
                </Stack>
              </>
            ) : (
              <>
                <Divider />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>تأیید فروشگاه</Typography>
                {shop.isActive === false && <Alert severity="error">این فروشگاه غیرفعال است و امکان خرید از آن وجود ندارد.</Alert>}
                <ShopDetails shop={shop} />
                {!confirmed ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button disabled={shop.isActive === false} variant="contained" onClick={() => setConfirmed(true)}>فروشگاه درست است، ادامه</Button>
                    <Button onClick={resetFlow} startIcon={<QrCodeScanner />}>اسکن فروشگاه دیگر</Button>
                  </Stack>
                ) : (
                  <Stack component="form" onSubmit={submitPurchase} spacing={2} noValidate>
                    {purchaseMutation.isError && <Alert severity="error">{getTransactionErrorMessage(purchaseMutation.error, 'ثبت خرید با خطا مواجه شد.')}{/insufficient|موجودی وام/i.test(getTransactionErrorMessage(purchaseMutation.error, '')) && !loansQuery.error && <Box sx={{ mt: 0.5 }}>موجودی فعلی: {formatMoney(availableBalance)}</Box>}</Alert>}
                    <Controller control={control} name="amount" render={({ field }) => <TextField {...field} value={field.value ? formatMoney(field.value) : ''} onChange={(event) => field.onChange(normalizeAmount(event.target.value))} label="مبلغ خرید" inputMode="decimal" dir="ltr" error={Boolean(errors.amount)} helperText={errors.amount?.message} fullWidth />} />
                    <Controller control={control} name="description" render={({ field }) => <TextField {...field} label="توضیحات (اختیاری)" multiline minRows={2} error={Boolean(errors.description)} helperText={errors.description?.message} fullWidth />} />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button type="submit" variant="contained" disabled={purchaseMutation.isPending || shop.isActive === false} startIcon={purchaseMutation.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}>تأیید خرید</Button>
                      <Button onClick={resetFlow} disabled={purchaseMutation.isPending}>بازگشت به اسکن</Button>
                    </Stack>
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}