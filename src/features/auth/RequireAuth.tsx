import { CircularProgress, Stack } from '@mui/material'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './auth-hooks'
import type { UserRole } from '../../types/domain'

export function RequireAuth({ role }: { role?: UserRole }) {
  const { user, isRestoring } = useAuth()
  const location = useLocation()

  if (isRestoring) return <Stack sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Stack>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />
  }
  return <Outlet />
}