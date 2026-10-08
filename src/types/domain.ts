export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  fullName: string
  nationalCode: string
  phone: string
  email?: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface Installment {
  id: string
  installmentNumber: number
  dueDate: string
  amount: string
  status: 'pending' | 'paid' | 'overdue'
  paidAt: string | null
}

export interface LoanRequest {
  id: string
  userId: string
  requestedAmount: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected'
  adminNote: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminLoanRequest extends Omit<LoanRequest, 'userId'> {
  user: Pick<User, 'id' | 'fullName' | 'nationalCode' | 'phone' | 'email'>
  loan?: Loan
}

export interface Loan {
  id: string
  principalAmount: string
  interestRate: string
  totalAmount: string
  installmentCount: number
  installmentAmount: string
  startDate: string
  status: 'active' | 'completed' | 'defaulted'
  remainingBalance: string
  createdAt: string
}

export interface AdminLoan extends Omit<Loan, 'createdAt'> {
  createdAt?: string
  user: Pick<User, 'id' | 'fullName' | 'nationalCode' | 'phone' | 'email'>
  installments?: Installment[]
}

export type AdminUser = Omit<User, 'updatedAt'> & { updatedAt?: string }

export type ApiCollection<T> = T[] | { data: T[] }