import { createContext } from 'react'
import type { ShopProfile } from './shop-api'

export interface ShopAuthContextValue {
  shop: ShopProfile | null
  isRestoring: boolean
  signIn: (input: { identifier: string; password: string }) => Promise<void>
  signOut: () => void
}

export const ShopAuthContext = createContext<ShopAuthContextValue | null>(null)