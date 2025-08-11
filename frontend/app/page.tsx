'use client'

import { useAuth } from '@/components/AuthProvider'
import { ChartBarIcon, UserGroupIcon, HeartIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Home() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
              Sidai Enkop Ranch
            </h1>
            <p className="text-xl text-dark-300 mb-2">
              Isinya, Kitengela
            </p>
            <p className="text-lg text-dark-400">
              Advanced Farm Management System
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-dark-800/30 border border-dark-700 rounded-lg p-6 glow-border">
              <CpuChipIcon className="h-12 w-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Tracking</h3>
              <p className="text-dark-300">
                QR code-based animal identification and comprehensive health monitoring
              </p>
            </div>
            
            <div className="bg-dark-800/30 border border-dark-700 rounded-lg p-6 glow-border">
              <ChartBarIcon className="h-12 w-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analytics</h3>
              <p className="text-dark-300">
                Real-time insights and statistics for better farm management
              </p>
            </div>
          </div>
          
          <div className="space-x-4">
            <Link 
              href="/auth/login" 
              className="btn-cyber inline-block"
            >
              Access System
            </Link>
            <Link 
              href="/auth/register" 
              className="px-6 py-3 border border-dark-600 text-dark-300 hover:text-white hover:border-dark-400 transition-colors duration-300 inline-block"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Welcome back, {user?.first_name || user?.username}
        </h1>
        <p className="text-dark-300">
          Sidai Enkop Ranch Management Dashboard
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/animals" className="block">
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6 card-hover glow-border">
            <UserGroupIcon className="h-12 w-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Animal Management</h3>
            <p className="text-dark-300">
              Register, track, and manage your livestock
            </p>
          </div>
        </Link>

        <Link href="/animals/create" className="block">
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6 card-hover glow-border">
            <CpuChipIcon className="h-12 w-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Register Animal</h3>
            <p className="text-dark-300">
              Add new animals with automatic QR code generation
            </p>
          </div>
        </Link>

        <Link href="/analytics" className="block">
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6 card-hover glow-border">
            <ChartBarIcon className="h-12 w-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-dark-300">
              View statistics and insights about your farm
            </p>
          </div>
        </Link>
      </div>

      <div className="bg-dark-800/30 border border-dark-700 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
          Recent Activity
        </h2>
        <p className="text-dark-300">
          Your recent farm management activities will appear here.
        </p>
      </div>
    </div>
  )
}
