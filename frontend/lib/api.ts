import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token')
    const csrfToken = Cookies.get('csrftoken')
    
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method || '')) {
      config.headers['X-CSRFToken'] = csrfToken
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('auth_token')
      Cookies.remove('user')
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth API functions
export const authAPI = {
  async login(credentials: { username: string; password: string }) {
    const response = await api.post('/api/auth/login/', credentials)
    return response.data
  },

  async register(userData: {
    username: string
    email: string
    password: string
    password_confirm: string
    first_name?: string
    last_name?: string
  }) {
    const response = await api.post('/api/auth/register/', userData)
    return response.data
  },

  async logout() {
    const response = await api.post('/api/auth/logout/')
    return response.data
  },

  async getProfile() {
    const response = await api.get('/api/auth/profile/')
    return response.data
  },

  async getCsrfToken() {
    const response = await api.get('/api/auth/csrf-token/')
    return response.data
  },
}

// Animals API functions
export const animalsAPI = {
  async getAnimals(params?: {
    page?: number
    search?: string
    sex?: string
    breed?: string
    health_status?: string
    min_age?: number
    max_age?: number
    ordering?: string
  }) {
    const response = await api.get('/api/api/animals/', { params })
    return response.data
  },

  async getAnimal(id: number) {
    const response = await api.get(`/api/api/animals/${id}/`)
    return response.data
  },

  async createAnimal(animalData: {
    name: string
    sex: string
    breed: string
    year_of_birth: number
    father?: number
    mother?: number
    weight?: number
    health_status?: string
    notes?: string
  }) {
    const response = await api.post('/api/api/animals/', animalData)
    return response.data
  },

  async updateAnimal(id: number, animalData: Partial<{
    name: string
    sex: string
    breed: string
    year_of_birth: number
    father: number
    mother: number
    weight: number
    health_status: string
    notes: string
  }>) {
    const response = await api.put(`/api/api/animals/${id}/`, animalData)
    return response.data
  },

  async deleteAnimal(id: number) {
    const response = await api.delete(`/api/api/animals/${id}/`)
    return response.data
  },

  async getStatistics() {
    const response = await api.get('/api/api/animals/statistics/')
    return response.data
  },

  async getParents() {
    const response = await api.get('/api/api/animals/parents/')
    return response.data
  },

  async downloadQRCode(id: number) {
    const response = await api.get(`/api/api/animals/${id}/qr_code/`, {
      responseType: 'blob',
    })
    return response.data
  },
}

export default api
