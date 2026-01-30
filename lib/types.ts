export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  initials: string | null
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  status: 'active' | 'completed' | 'done'
  start_date: string
  due_date: string
  accountability_partner: string | null
  created_at: string
  updated_at: string
  milestones?: Milestone[]
}

export interface Milestone {
  id: string
  goal_id: string
  title: string
  completed: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface VisionBoardImage {
  id: string
  user_id: string
  image_url: string
  created_at: string
}
