'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { 
  UserPlusIcon, 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await register(formData)
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="max-w-md w-full">
        <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-8 glow-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <UserPlusIcon className="h-8 w-8 text-dark-900" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Join Sidai Enkop
            </h2>
            <p className="text-dark-300 mt-2">
              Create your account to start managing your ranch
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-dark-200 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <IdentificationIcon className="h-5 w-5 text-dark-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input-cyber w-full pl-10 pr-4 py-3 rounded-lg"
                    placeholder="First name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-dark-200 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <IdentificationIcon className="h-5 w-5 text-dark-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input-cyber w-full pl-10 pr-4 py-3 rounded-lg"
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-dark-200 mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <UserIcon className="h-5 w-5 text-dark-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input-cyber w-full pl-10 pr-4 py-3 rounded-lg"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-200 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <EnvelopeIcon className="h-5 w-5 text-dark-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-cyber w-full pl-10 pr-4 py-3 rounded-lg"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-200 mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <LockClosedIcon className="h-5 w-5 text-dark-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-cyber w-full pl-10 pr-4 py-3 rounded-lg"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-dark-200 mb-2">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <LockClosedIcon className="h-5 w-5 text-dark-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  required
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="input-cyber w-full pl-10 pr-4 py-3 rounded-lg"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-cyber py-3 font-medium relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-300">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-dark-400 hover:text-dark-300 transition-colors duration-200"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
