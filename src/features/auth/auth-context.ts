import { createContext } from 'react'
import type { LoginInput, RegisterInput } from '../../services/auth-api'
import type { User } from '../../types/domain'

export interface AuthContextValue {
  user: User | null
  isRestoring: boolean
  signIn: (input: LoginInput) => Promise<User>
  signUp: (input: RegisterInput) => Promise<User>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)