"use client"
import React, { useState } from 'react'
import { galleryAPI } from '@/lib/api'
import { useAuth } from '@/components/AuthProvider'

export default function GalleryCreatePage() {
  const { user, isAuthenticated } = useAuth()
  const [image, setImage] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className="text-center py-12 text-dark-400">Only admins can upload gallery images.</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!image) {
      setError('Please select an image.')
      return
    }
    setLoading(true)
    const formData = new FormData()
    formData.append('image', image)
    formData.append('caption', caption)
    try {
      await galleryAPI.uploadImage(formData)
      setSuccess('Image uploaded successfully!')
      setImage(null)
      setCaption('')
    } catch (err: any) {
      setError('Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold text-cyan-400 mb-4">Upload Gallery Image</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files?.[0] || null)}
          className="block w-full border border-dark-700 rounded p-2"
        />
        <input
          type="text"
          placeholder="Caption (optional)"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          className="block w-full border border-dark-700 rounded p-2"
        />
        <button
          type="submit"
          className="btn-cyber w-full"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}
      </form>
    </div>
  )
}
