import { useEffect, useRef } from 'react'
import { Download, Print } from '@mui/icons-material'
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { getErrorMessage } from '../../../services/api-client'
import { useAdminShopQr } from '../shop-queries'
import type { AdminShop } from '../shops-api'

export function ShopQrDialog({ shop, onClose }: { shop: AdminShop | null; onClose: () => void }) {
  const shopId = shop?.id ?? ''
  const query = useAdminShopQr(shopId)
  const { enqueueSnackbar } = useSnackbar()
  const printFrame = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
      if (query.error) enqueueSnackbar(getErrorMessage(query.error, 'دریافت QR با خطا مواجه شد.'), { variant: 'error' })
    }, [enqueueSnackbar, query.error])

  const download = () => {
    if (!query.data || !shop) return
    const link = document.createElement('a')
    link.href = query.data
    link.download = `shop-${shop.id}-qr.png`
    link.click()
  }

  const print = () => {
    if (!query.data || !shop || !printFrame.current?.contentWindow) return
    const frame = printFrame.current
    const document = frame.contentDocument
    if (!document) return
    document.open()
    document.close()
    const title = document.createElement('h1')
    title.textContent = shop.name
    const status = document.createElement('p')
    status.textContent = shop.isActive ? 'فعال' : 'غیرفعال'
    const image = document.createElement('img')
    image.src = query.data
    image.alt = `QR فروشگاه ${shop.name}`
    image.width = 320
    image.height = 320
    document.body.append(title, status, image)
    image.onload = () => frame.contentWindow?.print()
    image.onerror = () => enqueueSnackbar('آماده‌سازی QR برای چاپ با خطا مواجه شد.', { variant: 'error' })
  }

  return <Dialog open={Boolean(shop)} onClose={onClose} fullWidth maxWidth="xs" dir="rtl">
    <DialogTitle>QR Code فروشگاه</DialogTitle>
    <DialogContent>
      {shop && <Stack spacing={2} sx={{ alignItems: 'center', py: 1 }}>
        <Typography variant="h6" sx={{ textAlign: 'center' }}>{shop.name}</Typography>
        <Chip size="small" color={shop.isActive ? 'success' : 'default'} label={shop.isActive ? 'فعال' : 'غیرفعال'} />
        {query.isLoading && <CircularProgress aria-label="در حال دریافت QR" />}
        {query.error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void query.refetch()}>تلاش دوباره</Button>}>{getErrorMessage(query.error, 'دریافت QR با خطا مواجه شد.')}</Alert>}
        {query.data && <Box component="img" src={query.data} alt={`QR فروشگاه ${shop.name}`} width={280} height={280} sx={{ maxWidth: '100%', height: 'auto', imageRendering: 'pixelated' }} />}
      </Stack>}
      <Box component="iframe" ref={printFrame} title="نسخه چاپ QR" aria-hidden="true" sx={{ position: 'absolute', width: 0, height: 0, border: 0 }} />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>بستن</Button>
      <Button startIcon={<Download />} onClick={download} disabled={!query.data}>دانلود QR</Button>
      <Button startIcon={<Print />} onClick={print} disabled={!query.data}>چاپ QR</Button>
    </DialogActions>
  </Dialog>
}