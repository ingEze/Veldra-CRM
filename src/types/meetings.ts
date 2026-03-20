export interface QuestionItem {
  question: string
  answer?: string
}

export interface LinkItem {
  label: string
  url: string
}

export interface Meeting {
  id: string
  title: string
  meeting_date: string
  type: 'phone_call' | 'video_call' | 'in_person' | 'chat' | 'other'
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  questions: string[] | QuestionItem[]
  notes?: string
  links?: LinkItem[]
  client_id?: string
  clients?: { full_name?: string; enterprise?: string }
  created_at: string
  updated_at: string
}
