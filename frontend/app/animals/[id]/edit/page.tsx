'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { animalsAPI } from '@/lib/api'
import { Animal } from '@/types'
import { useAuth } from '@/components/AuthProvider'
import { AnimalForm } from '@/components/AnimalForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Loader2, AlertTriangle } from 'lucide-react'

export default function EditAnimalPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, loading: authLoading } = useAuth()
  
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const animalId = Number(params.id)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    if (isAuthenticated && animalId) {
      fetchAnimal()
    }
  }, [isAuthenticated, authLoading, animalId])

  const fetchAnimal = async () => {
    try {
      setLoading(true)
      const data = await animalsAPI.getAnimal(animalId)
      setAnimal(data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch animal details')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (updatedAnimalId: number) => {
    router.push(`/animals/${updatedAnimalId}`)
  }

  const handleCancel = () => {
    router.back()
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-cyber-blue" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyber-blue" />
          <span className="ml-2 text-gray-400">Loading animal details...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <Button
              onClick={fetchAnimal}
              variant="outline"
              size="sm"
              className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!animal) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">Animal not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Animal</h1>
          <p className="text-gray-400">
            Update {animal.name}'s information
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Edit className="w-5 h-5 text-cyber-blue" />
            Animal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimalForm
            animal={animal}
            isEdit={true}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
