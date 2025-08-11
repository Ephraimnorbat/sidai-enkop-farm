'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { animalsAPI } from '@/lib/api'
import { Animal } from '@/types'
import { QRCodeViewer } from '@/components/QRCodeViewer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Calendar, 
  Heart, 
  Scale, 
  Users, 
  Baby,
  Loader2,
  AlertTriangle 
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/components/AuthProvider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function AnimalDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, loading: authLoading } = useAuth()
  
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await animalsAPI.deleteAnimal(animalId)
      router.push('/animals')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete animal')
    } finally {
      setDeleting(false)
    }
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-cyber-blue" />
        <span className="ml-2 text-gray-400">Loading animal details...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
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
      <div className="space-y-6">
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

  const getHealthStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'sick':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'under treatment':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'quarantine':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'recovery':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getSexColor = (sex: string) => {
    return sex === 'Male' 
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      : 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold text-white">{animal.name}</h1>
            <p className="text-gray-400">ID: {animal.animal_id}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => router.push(`/animals/${animal.id}/edit`)}
            variant="outline"
            className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleting}>
                {deleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Delete Animal
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  Are you sure you want to delete {animal.name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-cyber-blue" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Name</label>
                  <p className="text-white font-medium">{animal.name}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Animal ID</label>
                  <p className="text-white font-medium">{animal.animal_id}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Sex</label>
                  <Badge className={cn("mt-1", getSexColor(animal.sex))}>
                    {animal.sex} {animal.sex === 'Male' ? '♂' : '♀'}
                  </Badge>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Breed</label>
                  <p className="text-white font-medium">{animal.breed}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Age</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-white font-medium">{animal.age} years</p>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Year of Birth</label>
                  <p className="text-white font-medium">{animal.year_of_birth}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health & Physical Info */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyber-blue" />
                Health & Physical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Health Status</label>
                  <Badge className={cn("mt-1", getHealthStatusColor(animal.health_status))}>
                    {animal.health_status}
                  </Badge>
                </div>
                {animal.weight && (
                  <div>
                    <label className="text-gray-400 text-sm">Weight</label>
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-gray-400" />
                      <p className="text-white font-medium">{animal.weight} kg</p>
                    </div>
                  </div>
                )}
              </div>
              
              {animal.notes && (
                <div>
                  <label className="text-gray-400 text-sm">Notes</label>
                  <p className="text-white mt-1 bg-gray-800/50 p-3 rounded-lg">
                    {animal.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Family Information */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyber-blue" />
                Family Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Father</label>
                  {animal.father_name ? (
                    <p className="text-white font-medium">{animal.father_name}</p>
                  ) : (
                    <p className="text-gray-500 italic">Not specified</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Mother</label>
                  {animal.mother_name ? (
                    <p className="text-white font-medium">{animal.mother_name}</p>
                  ) : (
                    <p className="text-gray-500 italic">Not specified</p>
                  )}
                </div>
              </div>
              
              <Separator className="bg-gray-700" />
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Baby className="w-4 h-4 text-gray-400" />
                  <label className="text-gray-400 text-sm">Offspring</label>
                </div>
                <Badge variant="secondary" className="bg-cyber-blue/20 text-cyber-blue">
                  {animal.offspring_count} offspring
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code and Quick Actions */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center">QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <QRCodeViewer
                animalId={animal.id}
                animalName={animal.name}
                qrCodeUrl={animal.qr_code_url}
              />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Created</span>
                <span className="text-white">
                  {new Date(animal.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Updated</span>
                <span className="text-white">
                  {new Date(animal.updated_at).toLocaleDateString()}
                </span>
              </div>
              <Separator className="bg-gray-700" />
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
                <Badge className={getHealthStatusColor(animal.health_status)}>
                  {animal.health_status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
