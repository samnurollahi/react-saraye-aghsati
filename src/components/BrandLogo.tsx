import { Box } from '@mui/material'
import brandImage from '../assets/icon.png'

interface BrandLogoProps {
  compact?: boolean
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  if (compact) {
    return (
      <Box sx={{ width: 44, height: 30, flexShrink: 0, overflow: 'hidden', borderRadius: 1, bgcolor: '#fff' }}>
        <Box component="img" src={brandImage} alt="" sx={{ display: 'block', width: 44, height: 44, objectFit: 'cover', objectPosition: 'top' }} />
      </Box>
    )
  }

  return <Box component="img" src={brandImage} alt="سرای اقساطی" sx={{ display: 'block', width: 124, height: 124, objectFit: 'contain', borderRadius: 2 }} />
}