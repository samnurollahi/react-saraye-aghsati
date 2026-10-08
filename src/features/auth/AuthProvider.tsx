import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { clearAuth, getRefreshToken, saveAuth, saveUser } from '../../services/auth-storage'
import { login, register, type LoginInput, type RegisterInput } from '../../services/auth-api'
import { restoreSession } from '../../services/api-client'
import type { AuthResponse, User } from '../../types/domain'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isRestoring, setIsRestoring] = useState(() => Boolean(getRefreshToken()))
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    let active = true

    const onExpired = () => {
      clearAuth()
      setUser(null)
      queryClient.clear()
      enqueueSnackbar('نشست شما پایان یافته است. دوباره وارد شوید.', { variant: 'warning' })
    }
    window.addEventListener('saraye:session-expired', onExpired)
    const cleanup = () => {
      active = false
      window.removeEventListener('saraye:session-expired', onExpired)
    }

    if (!getRefreshToken()) {
      clearAuth()
      return cleanup
    }

    void (async () => {
      try {
        const restoredUser = await restoreSession()
        if (!active) return
        saveUser(restoredUser)
        setUser(restoredUser)
        queryClient.setQueryData(['current-user'], restoredUser)
      } catch {
        clearAuth()
        setUser(null)
      } finally {
        if (active) setIsRestoring(false)
      }
    })()

    return cleanup
  }, [enqueueSnackbar, queryClient])

  const acceptAuth = (response: AuthResponse) => {
    saveAuth(response)
    setUser(response.user)
    queryClient.setQueryData(['current-user'], response.user)
    return response.user
  }

  const signIn = async (input: LoginInput) => acceptAuth(await login(input))
  const signUp = async (input: RegisterInput) => acceptAuth(await register(input))
  const signOut = () => {
    clearAuth()
    setUser(null)
    queryClient.clear()
  }

  return <AuthContext.Provider value={{ user, isRestoring, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}