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
