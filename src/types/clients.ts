export type ClientStatus =
  | 'new_lead'
  | 'proposal_sent'
  | 'approved'
  | 'in_progress'
  | 'delivered'
  | 'awaiting_payment'
  | 'paid'
  | 'rejected'
  | 'on_hold'

export type StatusColorKey = 'Lead' | 'Active' | 'Inactive'
  
export type ClientView = {
  id: string
  email?: string
  full_name: string
  notes?: string
  enterprise: string
  note?: string
  status: StatusColorKey
  phone?: string
  country?: string
  estimated_revenue: number
}

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
} | null

export type State = { 
  clients: ClientView[], 
  pagination: Pagination, 
  currentPage: number
  loading: boolean 
}