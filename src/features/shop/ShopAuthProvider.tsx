import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { clearShopTokens, getShopRefreshToken, saveShopTokens } from '../../services/shop-auth-storage'
import { getShopProfile, loginShop } from './shop-api'
import type { ShopProfile } from './shop-api'
import { shopKeys } from './shop-queries'
import { ShopAuthContext } from './shop-auth-context'

export function ShopAuthProvider({ children }: { children: ReactNode }) {
  const [shop, setShop] = useState<ShopProfile | null>(null)
  const [isRestoring, setIsRestoring] = useState(() => Boolean(getShopRefreshToken()))
  const queryClient = useQueryClient()

  useEffect(() => {
    let active = true
    const expireShopSession = () => {
      clearShopTokens()
      setShop(null)
      void queryClient.removeQueries({ queryKey: shopKeys.all })
    }
    window.addEventListener('saraye:shop-session-expired', expireShopSession)

    if (!getShopRefreshToken()) {
      clearShopTokens()
    } else {
      void queryClient.fetchQuery({ queryKey: shopKeys.me, queryFn: getShopProfile, staleTime: 60_000 }).then((profile) => {
        if (!active) return
        setShop(profile)
      }).catch(() => {
        if (active) expireShopSession()
      }).finally(() => {
        if (active) setIsRestoring(false)
      })
    }

    return () => {
      active = false
      window.removeEventListener('saraye:shop-session-expired', expireShopSession)
    }
  }, [queryClient])

  const signIn = async (input: { identifier: string; password: string }) => {
    const response = await loginShop(input)
    await queryClient.removeQueries({ queryKey: shopKeys.all })
    saveShopTokens(response)
    setShop(response.shop)
    queryClient.setQueryData(shopKeys.me, response.shop)
  }

  const signOut = () => {
    clearShopTokens()
    setShop(null)
    void queryClient.removeQueries({ queryKey: shopKeys.all })
  }

  return <ShopAuthContext.Provider value={{ shop, isRestoring, signIn, signOut }}>{children}</ShopAuthContext.Provider>
}