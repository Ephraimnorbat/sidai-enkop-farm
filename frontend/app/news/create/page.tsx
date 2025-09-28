"use client"
import React, { useState } from 'react'
import { newsAPI } from '@/lib/api'
import { useAuth } from '@/components/AuthProvider'

export default function NewsCreatePage() {
  const { user, isAuthenticated } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className="text-center py-12 text-dark-400">Only admins can create news items.</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!title || !description) {
      setError('Title and description are required.')
      return
    }
    setLoading(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    if (image) formData.append('image', image)
    try {
      await newsAPI.createNews(formData)
      setSuccess('News item created successfully!')
      setTitle('')
      setDescription('')
      setImage(null)
    } catch (err: any) {
      setError('Creation failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold text-cyan-400 mb-4">Create News Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="block w-full border border-dark-700 rounded p-2"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="block w-full border border-dark-700 rounded p-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files?.[0] || null)}
          className="block w-full border border-dark-700 rounded p-2"
        />
        <button
          type="submit"
          className="btn-cyber w-full"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create News'}
        </button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}
      </form>
    </div>
  )
}
