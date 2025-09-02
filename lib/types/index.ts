export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthFormData {
  email: string
  password: string
  name?: string
}

export interface Poll {
  id: string
  title: string
  description: string
  creatorId: string
  creator: User
  type: 'single' | 'multiple' | 'ranking'
  status: 'draft' | 'active' | 'ended'
  isAnonymous: boolean
  showResults: boolean
  allowMultipleVotes: boolean
  createdAt: Date
  updatedAt: Date
  endDate?: Date
  totalVotes: number
  options: PollOption[]
}

export interface PollOption {
  id: string
  pollId: string
  text: string
  votes: number
  percentage: number
  order: number
}

export interface Vote {
  id: string
  pollId: string
  userId?: string
  optionId: string
  createdAt: Date
}

export interface PollFormData {
  title: string
  description: string
  type: 'single' | 'multiple' | 'ranking'
  endDate?: string
  isAnonymous: boolean
  showResults: boolean
  allowMultipleVotes: boolean
  options: string[]
}

export interface AuthFormData {
  email: string
  password: string
  name?: string
}
