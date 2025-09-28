"use client"
import React, { useEffect, useState } from 'react'
import { galleryAPI } from '@/lib/api'

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    galleryAPI.getImages()
      .then(data => setImages(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-4">Gallery</h1>
      <p className="text-dark-300 mb-4">Explore photos from our farm, animals, and events.</p>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.length === 0 ? (
            <div className="col-span-3 text-center text-dark-400">No images found.</div>
          ) : (
            images.map(img => (
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
    </div>
  )
}
