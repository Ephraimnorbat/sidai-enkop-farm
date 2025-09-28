export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_joined: string
  role?: string
  role_display?: string
  permissions?: {
    can_create_animals: boolean
    can_edit_animals: boolean
    can_delete_animals: boolean
    can_view_reports: boolean
    can_manage_users: boolean
  }
}

export interface Animal {
  id: number
  animal_id: string
  type: AnimalType
  name: string
  sex: 'Male' | 'Female'
  breed: string
  year_of_birth: number
  father?: number
  mother?: number
  father_name?: string
  mother_name?: string
  weight?: number
  health_status: string
  notes: string
  qr_code?: string
  qr_code_url?: string
  age: number
  offspring_count: number
  created_at: string
  updated_at: string
}

export type AnimalType = 'dog' | 'cow' | 'goat' | 'sheep' | 'pig';

export interface AnimalCreate {
  type: AnimalType
  name: string
  sex: 'Male' | 'Female'
  breed: string
  year_of_birth: number
  father?: number
  mother?: number
  weight?: number
  health_status?: string
  notes?: string
}
export const ANIMAL_TYPE_CHOICES: { value: AnimalType; label: string }[] = [
  { value: 'dog', label: 'Dog' },
  { value: 'cow', label: 'Cow' },
  { value: 'goat', label: 'Goat' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'pig', label: 'Pig' },
];

export interface AnimalStatistics {
  total_animals: number
  by_sex: {
    male: number
    female: number
  }
  by_breed: Record<string, number>
  by_health_status: Record<string, number>
  average_age: number
}

export interface Parent {
  id: number
  animal_id: string
  name: string
}

export interface ParentsData {
  fathers: Parent[]
  mothers: Parent[]
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type BreedChoice = 
  | 'Jersey'
  | 'Holstein' 
  | 'Guernsey'
  | 'Ayrshire'
  | 'Brown_Swiss'
  | 'Zebu'
  | 'Crossbreed'

export const BREED_CHOICES: BreedChoice[] = [
  'Jersey',
  'Holstein',
  'Guernsey', 
  'Ayrshire',
  'Brown_Swiss',
  'Zebu',
  'Crossbreed'
]

export const SEX_CHOICES = ['Male', 'Female'] as const

export const HEALTH_STATUS_OPTIONS = [
  'Healthy',
  'Sick',
  'Under Treatment',
  'Quarantine',
  'Recovery',
] as const
