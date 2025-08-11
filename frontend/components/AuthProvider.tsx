'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { User } from '@/types'
import { authAPI } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { username: string; password: string }) => Promise<void>
  register: (userData: {
    username: string
    email: string
    password: string
    password_confirm: string
    first_name?: string
    last_name?: string
  }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    // Check if user is logged in on app start
    const token = Cookies.get('auth_token')
    const userData = Cookies.get('user')

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        Cookies.remove('auth_token')
        Cookies.remove('user')
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await authAPI.login(credentials)
      
      // Store token and user data
      Cookies.set('auth_token', response.token, { expires: 7 }) // 7 days
      Cookies.set('user', JSON.stringify(response.user), { expires: 7 })
      
      if (response.csrf_token) {
        Cookies.set('csrftoken', response.csrf_token)
      }
      
      setUser(response.user)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  const register = async (userData: {
    username: string
    email: string
    password: string
    password_confirm: string
    first_name?: string
    last_name?: string
  }) => {
    try {
      const response = await authAPI.register(userData)
      
      // Store token and user data
      Cookies.set('auth_token', response.token, { expires: 7 })
      Cookies.set('user', JSON.stringify(response.user), { expires: 7 })
      
      if (response.csrf_token) {
        Cookies.set('csrftoken', response.csrf_token)
      }
      
      setUser(response.user)
    } catch (error: any) {
      const errorMessage = error.response?.data?.username?.[0] || 
                          error.response?.data?.email?.[0] || 
                          error.response?.data?.password?.[0] || 
                          error.response?.data?.message || 
                          'Registration failed'
      throw new Error(errorMessage)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear stored data regardless of API response
      Cookies.remove('auth_token')
      Cookies.remove('user')
      Cookies.remove('csrftoken')
      setUser(null)
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
