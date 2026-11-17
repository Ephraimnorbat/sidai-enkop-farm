// Gallery API functions
export const galleryAPI = {
  async getImages() {
    const response = await api.get('/api/gallery/gallery/')
    return response.data.results || response.data
  },
  async uploadImage(imageData: FormData) {
    const response = await api.post('/api/gallery/gallery/', imageData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  async updateImage(id: number, imageData: FormData) {
    const response = await api.patch(`/api/gallery/gallery/${id}/`, imageData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  async deleteImage(id: number) {
    const response = await api.delete(`/api/gallery/gallery/${id}/`)
    return response.data
  },
}

// News API functions
export const newsAPI = {
  async getNews() {
    const response = await api.get('/api/news/news/')
    return response.data.results || response.data
  },
  async createNews(newsData: FormData) {
    const response = await api.post('/api/news/news/', newsData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  async updateNews(id: number, newsData: FormData) {
    const response = await api.patch(`/api/news/news/${id}/`, newsData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  async deleteNews(id: number) {
    const response = await api.delete(`/api/news/news/${id}/`)
    return response.data
  },
}

export const farmAPI = {
  async getTaskAssignees() {
    const response = await api.get('/api/staff/assignees/')
    return response.data as { id: number; name: string; username: string; role: string }[]
  },
  async getTasks(params?: { start?: string; end?: string }) {
    const response = await api.get('/api/staff/tasks/', { params })
    return response.data
  },
  async createTask(data: { title: string; description?: string; task_date: string; staff?: number }) {
    const response = await api.post('/api/staff/tasks/', data)
    return response.data
  },
  async updateTask(id: number, data: { status?: 'pending' | 'completed'; title?: string; description?: string; task_date?: string }) {
    const response = await api.patch(`/api/staff/tasks/${id}/`, data)
    return response.data
  },
  async getPerformance(params?: { period?: 'week' | 'month'; start?: string; end?: string }) {
    const response = await api.get('/api/staff/performance/', { params })
    return response.data
  },
  async exportTasks(params: { period: 'week' | 'month'; start?: string; end?: string }) {
    const response = await api.get('/api/staff/tasks-export/', { params, responseType: 'blob' })
    return response.data as Blob
  },
  async getInventory(params?: { search?: string; low_stock?: boolean }) {
    const response = await api.get('/api/inventory/', { params })
    return response.data
  },
  async createInventoryItem(data: { name: string; category?: string; quantity: number; unit: string; reorder_level: number; notes?: string }) {
    const response = await api.post('/api/inventory/', data)
    return response.data
  },
  async updateInventoryItem(id: number, data: Partial<{ name: string; category: string; quantity: number; unit: string; reorder_level: number; notes: string }>) {
    const response = await api.patch(`/api/inventory/${id}/`, data)
    return response.data
  },
  async deleteInventoryItem(id: number) {
    const response = await api.delete(`/api/inventory/${id}/`)
    return response.data
  },
}
import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '/'

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

  async getUsers() {
    const response = await api.get('/api/auth/users/')
    return response.data
  },

  async createUser(data: { user: Record<string, unknown>; profile: Record<string, unknown> }) {
    const response = await api.post('/api/auth/users/create/', data)
    return response.data
  },

  async updateUser(userId: number, data: Record<string, unknown>) {
    const response = await api.patch(`/api/auth/users/${userId}/`, data)
    return response.data
  },

  async deleteUser(userId: number) {
    const response = await api.delete(`/api/auth/users/${userId}/`)
    return response.data
  },

  async updateUserRole(userId: number, role: string) {
    const response = await api.put(`/api/auth/users/${userId}/role/`, { role })
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
