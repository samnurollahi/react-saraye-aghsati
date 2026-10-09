import { CircularProgress, Stack } from '@mui/material'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useShopAuth } from './shop-auth-hooks'

export function RequireShopAuth() {
  const { shop, isRestoring } = useShopAuth()
  const location = useLocation()
  if (isRestoring) return <Stack sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Stack>
  if (!shop) return <Navigate to="/shop/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function ShopPublicOnly() {
  const { shop, isRestoring } = useShopAuth()
  if (isRestoring) return <Stack sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Stack>
  if (shop) return <Navigate to="/shop/dashboard" replace />
  return <Outlet />
}