"use client"
import React, { useEffect, useState } from 'react'
import { newsAPI } from '@/lib/api'

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    newsAPI.getNews()
      .then(data => setNews(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-4">News & Updates</h1>
      <p className="text-dark-300 mb-4">Stay updated with the latest news and announcements from Sidai Enkop Ranch.</p>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="list-disc pl-6 text-dark-400">
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
    </div>
  )
}
