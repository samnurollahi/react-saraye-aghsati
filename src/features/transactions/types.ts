export interface ScannedShop {
  id: string
  name: string
  ownerName: string
  phone: string
  address: string
  description: string | null
  isActive?: boolean
}

export interface TransactionRecord {
  id: string
  shopId: string
  shop?: { id?: string; name: string } | string
  shopName?: string
  amount: string | number
  description: string | null
  status: 'completed' | 'failed' | string
  createdAt: string
}

export interface TransactionPage {
  data: TransactionRecord[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface CreateTransactionResult {
  transaction: TransactionRecord
  remainingBalance?: string | number
}