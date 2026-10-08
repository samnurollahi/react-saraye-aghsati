import { useEffect } from 'react'
import type { Html5Qrcode as Html5QrcodeInstance } from 'html5-qrcode'
import { Box, Typography } from '@mui/material'

interface QrCameraScannerProps {
  onScan: (value: string) => void
  onError: (error: unknown) => void
}

export function QrCameraScanner({ onScan, onError }: QrCameraScannerProps) {
  useEffect(() => {
    let active = true
    let scanner: Html5QrcodeInstance | undefined

    const start = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (!active) return
        scanner = new Html5Qrcode('purchase-qr-camera', { verbose: false })
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText) => {
            if (!active) return
            active = false
            await scanner?.stop().catch(() => undefined)
            onScan(decodedText.trim())
          },
          () => undefined,
        )
        if (!active && scanner.isScanning) await scanner.stop().catch(() => undefined)
      } catch (error) {
        if (active) onError(error)
      }
    }

    void start()
    return () => {
      active = false
      if (scanner?.isScanning) void scanner.stop().catch(() => undefined)
    }
  }, [onError, onScan])

  return (
    <Box>
      <Box id="purchase-qr-camera" sx={{ width: '100%', minHeight: 280, overflow: 'hidden', borderRadius: 1, bgcolor: 'common.black', '& video': { width: '100%', maxHeight: 420, objectFit: 'cover' } }} />
      <Typography color="text.secondary" variant="body2" sx={{ mt: 1.5, textAlign: 'center' }}>
        کد QR فروشگاه را داخل کادر دوربین قرار دهید.
      </Typography>
    </Box>
  )
}