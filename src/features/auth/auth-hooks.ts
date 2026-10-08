import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '../../services/auth-api'
import { AuthContext } from './auth-context'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function useCurrentUser() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    enabled: Boolean(user),
    initialData: user ?? undefined,
  })
}