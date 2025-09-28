'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { 
  HomeIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setIsMobileMenuOpen(false)
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Animals', href: '/animals', icon: UserGroupIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  ]

  const publicLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'News', href: '/news' },
  ]

  return (
    <nav className="bg-dark-900/80 backdrop-blur-lg border-b border-dark-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-dark-900 font-bold text-sm">SE</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Sidai Enkop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {publicLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-dark-300 hover:text-cyan-400 transition-colors duration-200"
              >
                <span>{item.name}</span>
              </Link>
            ))}
            {isAuthenticated && navigation.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-dark-300 hover:text-cyan-400 transition-colors duration-200"
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            {/* Admin-only links */}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link href="/gallery/create" className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-600 transition-colors duration-200">
                  <span>Upload Image</span>
                </Link>
                <Link href="/news/create" className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-600 transition-colors duration-200">
                  <span>Create News</span>
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-dark-400" />
                  <div className="flex flex-col">
                    <span className="text-dark-300">
                      {user?.first_name || user?.username}
                    </span>
                    {user?.role_display && (
                      <span className="text-xs text-cyan-400">
                        {user.role_display}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-dark-300 hover:text-red-400 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-dark-300 hover:text-cyan-400 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-cyber"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-dark-300 hover:text-cyan-400 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-dark-700 py-4">
            {/* Public links for all users */}
            {publicLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-dark-300 hover:text-cyan-400 hover:bg-dark-800/50 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {/* Authenticated navigation */}
            {isAuthenticated && (
              <>
                <div className="flex items-center space-x-3 px-4 py-2 text-dark-300">
                  <UserIcon className="h-5 w-5" />
                  <span>{user?.first_name || user?.username}</span>
                </div>
                {navigation.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-2 text-dark-300 hover:text-cyan-400 hover:bg-dark-800/50 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
                {/* Admin-only links */}
                {user?.role === 'admin' && (
                  <>
                    <Link href="/gallery/create" className="block px-4 py-2 text-cyan-400 hover:bg-dark-800/50 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
                      Upload Image
                    </Link>
                    <Link href="/news/create" className="block px-4 py-2 text-cyan-400 hover:bg-dark-800/50 transition-all duration-200" onClick={() => setIsMobileMenuOpen(false)}>
                      Create News
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-2 w-full text-left text-dark-300 hover:text-red-400 hover:bg-dark-800/50 transition-all duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            )}
            {/* Login/Register for unauthenticated users */}
            {!isAuthenticated && (
              <>
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 text-dark-300 hover:text-cyan-400 hover:bg-dark-800/50 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-4 py-2 text-cyan-400 hover:bg-dark-800/50 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
