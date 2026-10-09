import { useContext } from 'react'
import { ShopAuthContext } from './shop-auth-context'

export function useShopAuth() {
  const context = useContext(ShopAuthContext)
  if (!context) throw new Error('useShopAuth must be used within ShopAuthProvider')
  return context
}