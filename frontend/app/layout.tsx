import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Navbar } from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sidai Enkop Ranch - Farm Management System',
  description: 'Modern farm management system for Sidai Enkop Ranch in Isinya, Kitengela',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-950">
            <div className="cyber-bg min-h-screen">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
