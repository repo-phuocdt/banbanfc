export interface Member {
  id: string
  name: string
  status: 'active' | 'inactive' | 'paused' | 'deleted'
  joined_at: string
  note: string | null
  created_at: string
  updated_at: string
}

export interface Contribution {
  id: string
  member_id: string
  month: string // 'YYYY-MM'
  amount: number
  paid_at: string
  note: string | null
  created_at: string
}

export interface Transaction {
  id: string
  date: string | null
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  member_id: string | null
  contribution_id: string | null
  note: string | null
  created_at: string
}

export interface MemberWithTotal extends Member {
  total_contributed: number
}

export interface TransactionWithMember extends Transaction {
  member_name?: string | null
}

export interface QrCode {
  id: string
  title: string
  bank_name: string | null
  account_name: string | null
  account_number: string | null
  description: string | null
  image_data: string
  image_mime: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}
