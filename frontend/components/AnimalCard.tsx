'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Animal } from '@/types'
import { animalsAPI } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  Heart, 
  Scale, 
  Baby,
  QrCode,
  Loader2,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/utils/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

interface AnimalCardProps {
  animal: Animal
  onDelete?: (id: number) => void
}

export function AnimalCard({ animal, onDelete }: AnimalCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await animalsAPI.deleteAnimal(animal.id)
      onDelete?.(animal.id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Failed to delete animal:', error)
    } finally {
      setDeleting(false)
    }
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
    <Card className="bg-gray-900/50 border-gray-700 hover:border-cyber-blue/50 transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-cyber-blue transition-colors">
              {animal.name}
            </h3>
            <p className="text-sm text-gray-400">ID: {animal.animal_id}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700" align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/animals/${animal.id}`)}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/animals/${animal.id}/edit`)}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Badge className={getSexColor(animal.sex)}>
            {animal.sex} {animal.sex === 'Male' ? '♂' : '♀'}
          </Badge>
          <Badge className={getHealthStatusColor(animal.health_status)}>
            {animal.health_status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Breed:</span>
          </div>
          <span className="text-white font-medium">{animal.breed}</span>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Age:</span>
          </div>
          <span className="text-white font-medium">{animal.age} years</span>
          
          {animal.weight && (
            <>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Weight:</span>
              </div>
              <span className="text-white font-medium">{animal.weight} kg</span>
            </>
          )}
          
          <div className="flex items-center gap-2">
            <Baby className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Offspring:</span>
          </div>
          <span className="text-white font-medium">{animal.offspring_count}</span>
        </div>

        {/* Parent Information */}
        {(animal.father_name || animal.mother_name) && (
          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-400 mb-2">Parents:</p>
            <div className="space-y-1 text-sm">
              {animal.father_name && (
                <p className="text-gray-300">
                  <span className="text-gray-500">Father:</span> {animal.father_name}
                </p>
              )}
              {animal.mother_name && (
                <p className="text-gray-300">
                  <span className="text-gray-500">Mother:</span> {animal.mother_name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => router.push(`/animals/${animal.id}`)}
            size="sm"
            className="flex-1 bg-cyber-blue/20 text-cyber-blue hover:bg-cyber-blue/30 border-cyber-blue/30"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          
          {animal.qr_code_url && (
            <Button
              onClick={() => router.push(`/animals/${animal.id}#qr-code`)}
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              <QrCode className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Animal</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete {animal.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
