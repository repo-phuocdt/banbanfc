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
  bank_transaction_id?: string | null
  note: string | null
  created_at: string
}

export interface MemberWithTotal extends Member {
  total_contributed: number
}

export interface TransactionWithMember extends Transaction {
  member_name?: string | null
  /** Transfer content from the bank; only admins can read it (RLS), null for everyone else. */
  bank_content?: string | null
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

export interface MemberLeave {
  id: string
  member_id: string
  month: string // 'YYYY-MM'
  note: string | null
  created_at: string
}

export interface MonthlyFee {
  effective_month: string // 'YYYY-MM'; applies from this month until the next row
  amount: number
}

export interface MemberBankIdentity {
  id: string
  member_id: string
  kind: 'name' | 'account'
  value: string
  created_at: string
}

export interface BankTransaction {
  id: string
  sepay_id: number
  gateway: string | null
  transaction_date: string
  account_number: string
  transfer_type: 'in' | 'out'
  amount: number
  content: string
  reference_code: string | null
  status: 'pending' | 'applied' | 'ignored'
  pending_reason: string | null
  matched_via: string | null
  note: string | null
  created_at: string
  resolved_at: string | null
}
