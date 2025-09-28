'use client'

import { useAuth } from '@/components/AuthProvider'
import { ChartBarIcon, UserGroupIcon, HeartIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { galleryAPI, newsAPI } from '@/lib/api'

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const [gallery, setGallery] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [loadingGallery, setLoadingGallery] = useState(true)
  const [loadingNews, setLoadingNews] = useState(true)

  useEffect(() => {
    galleryAPI.getImages()
      .then(data => setGallery(data.slice(0, 4)))
      .finally(() => setLoadingGallery(false))
    newsAPI.getNews()
      .then(data => setNews(data.slice(0, 3)))
      .finally(() => setLoadingNews(false))
  }, [])

  return (
  <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-cyan-400/20 to-blue-500/10 rounded-xl p-8 text-center shadow-lg">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
          Sidai Enkop Ranch
        </h1>
        <p className="text-xl text-dark-300 mb-2">Isinya, Kitengela</p>
        <p className="text-lg text-dark-400 mb-6">Sustainable farming, animal welfare, and community development.</p>
        <div className="flex justify-center gap-4 mb-4">
          <Link href="/about" className="btn-cyber">Learn More</Link>
          <Link href="/contact" className="btn-cyber">Contact Us</Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
          <span className="text-3xl font-bold text-cyan-400">120+</span>
          <p className="text-dark-300 mt-2">Animals</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
          <span className="text-3xl font-bold text-cyan-400">15</span>
          <p className="text-dark-300 mt-2">Staff</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
          <span className="text-3xl font-bold text-cyan-400">5</span>
          <p className="text-dark-300 mt-2">Awards</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
          <span className="text-3xl font-bold text-cyan-400">10+</span>
          <p className="text-dark-300 mt-2">Years in Operation</p>
        </div>
      </div>
      {/* Management Links (only for staff/admins) */}
      {isAuthenticated && user?.role && ['admin','manager','staff','farm_worker'].includes(user.role) && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <Link href="/users" className="block">
            <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6 card-hover glow-border">
              <UserGroupIcon className="h-12 w-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">User Management</h3>
              <p className="text-dark-300">
                Add, manage, and assign tasks/salary to users
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
      )}

      {/* Featured Gallery */}
      <div className="bg-dark-800/30 border border-dark-700 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Featured Gallery</h2>
        {loadingGallery ? (
          <div>Loading gallery...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.length === 0 ? (
              <div className="col-span-4 text-center text-dark-400">No images found.</div>
            ) : (
              gallery.map(img => (
                <img
                  key={img.id}
                  src={img.image}
                  alt={img.caption || 'Farm image'}
                  className="rounded-lg border border-dark-700"
                />
              ))
            )}
          </div>
        )}
        <div className="mt-4 text-right">
          <Link href="/gallery" className="text-cyan-400 hover:underline">View Full Gallery</Link>
        </div>
      </div>

      {/* News Preview */}
      <div className="bg-dark-800/30 border border-dark-700 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Latest News & Updates</h2>
        {loadingNews ? (
          <div>Loading news...</div>
        ) : (
          <ul className="list-disc pl-6 text-dark-400 mb-4">
            {news.length === 0 ? (
              <li>No news found.</li>
            ) : (
              news.map(item => (
                <li key={item.id} className="mb-4">
                  <div className="font-semibold text-cyan-400 text-lg">{item.title}</div>
                  <div className="text-dark-300 mb-2">{item.description}</div>
                  {item.image && (
                    <img src={item.image} alt={item.title} className="rounded-lg border border-dark-700 mb-2 max-w-xs" />
                  )}
                  <div className="text-xs text-dark-400">{new Date(item.published_at).toLocaleDateString()}</div>
                </li>
              ))
            )}
          </ul>
        )}
        <div className="text-right">
          <Link href="/news" className="text-cyan-400 hover:underline">Read More</Link>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-dark-800/30 border border-dark-700 rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-cyan-400">Contact & Location</h2>
          <ul className="text-dark-400 space-y-1">
            <li><strong>Phone:</strong> 0712-345-678</li>
            <li><strong>Email:</strong> info@sidaienkopranch.com</li>
            <li><strong>Location:</strong> Isinya, Kitengela</li>
          </ul>
        </div>
        <div>
          <iframe src="https://maps.google.com/maps?q=Isinya%20Kitengela&t=&z=13&ie=UTF8&iwloc=&output=embed" width="300" height="150" className="rounded-lg border border-dark-700" loading="lazy"></iframe>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-8">
        <Link href="/contact" className="btn-cyber text-lg px-8 py-4 font-bold">Book a Visit or Get in Touch</Link>
      </div>

      {/* Testimonials */}
      <div className="bg-dark-800/30 border border-dark-700 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <blockquote className="border-l-4 border-cyan-400 pl-4 text-dark-300 italic">
            "A wonderful place to learn about sustainable farming!" <br />
            <span className="text-cyan-400">- Jane, Visitor</span>
          </blockquote>
          <blockquote className="border-l-4 border-cyan-400 pl-4 text-dark-300 italic">
            "The staff are knowledgeable and friendly. Highly recommended." <br />
            <span className="text-cyan-400">- David, Partner</span>
          </blockquote>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="flex justify-center gap-6 py-6">
        <a href="https://facebook.com" target="_blank" rel="noopener" className="text-cyan-400 hover:text-blue-500 text-2xl">FB</a>
        <a href="https://twitter.com" target="_blank" rel="noopener" className="text-cyan-400 hover:text-blue-500 text-2xl">TW</a>
        <a href="https://instagram.com" target="_blank" rel="noopener" className="text-cyan-400 hover:text-blue-500 text-2xl">IG</a>
      </div>
    </div>
  )
}
