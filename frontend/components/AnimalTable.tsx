'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Animal } from '@/types'
import { animalsAPI } from '@/lib/api'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
} from '@/components/ui/alert-dialog'
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  ArrowUpDown,
  Loader2
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface AnimalTableProps {
  animals: Animal[]
  onDelete?: (id: number) => void
}

export function AnimalTable({ animals, onDelete }: AnimalTableProps) {
  const router = useRouter()
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Animal
    direction: 'asc' | 'desc'
  } | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    animal: Animal | null
    loading: boolean
  }>({
    open: false,
    animal: null,
    loading: false
  })

  const handleSort = (key: keyof Animal) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  const sortedAnimals = [...animals].sort((a, b) => {
    if (!sortConfig) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const handleDeleteClick = (animal: Animal) => {
    setDeleteDialog({
      open: true,
      animal,
      loading: false
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.animal) return

    try {
      setDeleteDialog(prev => ({ ...prev, loading: true }))
      await animalsAPI.deleteAnimal(deleteDialog.animal.id)
      onDelete?.(deleteDialog.animal.id)
      setDeleteDialog({ open: false, animal: null, loading: false })
    } catch (error) {
      console.error('Failed to delete animal:', error)
      setDeleteDialog(prev => ({ ...prev, loading: false }))
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

  const SortableHeader = ({ 
    column, 
    children, 
    className 
  }: { 
    column: keyof Animal
    children: React.ReactNode
    className?: string 
  }) => (
    <TableHead className={className}>
      <Button
        variant="ghost"
        onClick={() => handleSort(column)}
        className="h-auto p-0 text-gray-300 hover:text-white flex items-center gap-1"
      >
        {children}
        <ArrowUpDown className="w-3 h-3" />
      </Button>
    </TableHead>
  )

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <SortableHeader column="name">Name</SortableHeader>
                <SortableHeader column="animal_id">ID</SortableHeader>
                <SortableHeader column="sex">Sex</SortableHeader>
                <SortableHeader column="breed">Breed</SortableHeader>
                <SortableHeader column="age">Age</SortableHeader>
                <SortableHeader column="health_status">Health</SortableHeader>
                <TableHead className="text-gray-300">Weight</TableHead>
                <TableHead className="text-gray-300">Offspring</TableHead>
                <TableHead className="text-gray-300 w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAnimals.map((animal) => (
                <TableRow 
                  key={animal.id} 
                  className="border-gray-700 hover:bg-gray-800/30 cursor-pointer"
                  onClick={() => router.push(`/animals/${animal.id}`)}
                >
                  <TableCell className="font-medium text-white">
                    {animal.name}
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {animal.animal_id}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSexColor(animal.sex)}>
                      {animal.sex} {animal.sex === 'Male' ? '♂' : '♀'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {animal.breed}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {animal.age} years
                  </TableCell>
                  <TableCell>
                    <Badge className={getHealthStatusColor(animal.health_status)}>
                      {animal.health_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {animal.weight ? `${animal.weight} kg` : '-'}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {animal.offspring_count}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="bg-gray-800 border-gray-700" 
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/animals/${animal.id}`)
                          }}
                          className="text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/animals/${animal.id}/edit`)
                          }}
                          className="text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(animal)
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {animals.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No animals found
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Animal
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete {deleteDialog.animal?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              disabled={deleteDialog.loading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteDialog.loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteDialog.loading ? (
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
