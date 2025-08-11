'use client'

import { useState, useEffect } from 'react'
import { BREED_CHOICES, SEX_CHOICES, HEALTH_STATUS_OPTIONS } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  X, 
  RotateCcw,
  Calendar,
  Heart,
  Scale
} from 'lucide-react'

interface FilterParams {
  search?: string
  sex?: string
  breed?: string
  health_status?: string
  min_age?: number
  max_age?: number
  ordering?: string
}

interface FilterBarProps {
  onFilterChange: (filters: FilterParams) => void
  initialFilters?: FilterParams
}

const ORDERING_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: '-name', label: 'Name (Z-A)' },
  { value: 'age', label: 'Age (Youngest)' },
  { value: '-age', label: 'Age (Oldest)' },
  { value: 'created_at', label: 'Date Added (Oldest)' },
  { value: '-created_at', label: 'Date Added (Newest)' },
  { value: 'animal_id', label: 'ID (A-Z)' },
  { value: '-animal_id', label: 'ID (Z-A)' },
]

export function FilterBar({ onFilterChange, initialFilters = {} }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterParams>(initialFilters)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Debounce filter changes
    const timeoutId = setTimeout(() => {
      onFilterChange(filters)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters, onFilterChange])

  const updateFilter = (key: keyof FilterParams, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const clearSpecificFilter = (key: keyof FilterParams) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== undefined && value !== '').length
  }

  const activeFiltersCount = getActiveFilterCount()

  return (
    <div className="space-y-4">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search animals by name or ID..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          {filters.search && (
            <Button
              onClick={() => clearSpecificFilter('search')}
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Filter Toggle */}
        <div className="flex gap-2">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            className="border-gray-700 text-gray-400 hover:bg-gray-800"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-cyber-blue/20 text-cyber-blue">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="icon"
              className="border-gray-700 text-gray-400 hover:bg-gray-800"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.sex && (
            <Badge 
              variant="secondary" 
              className="bg-blue-500/20 text-blue-400 border-blue-500/30"
            >
              Sex: {filters.sex}
              <Button
                onClick={() => clearSpecificFilter('sex')}
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-blue-400 hover:text-blue-300"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          
          {filters.breed && (
            <Badge 
              variant="secondary" 
              className="bg-purple-500/20 text-purple-400 border-purple-500/30"
            >
              Breed: {filters.breed.replace('_', ' ')}
              <Button
                onClick={() => clearSpecificFilter('breed')}
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-purple-400 hover:text-purple-300"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          
          {filters.health_status && (
            <Badge 
              variant="secondary" 
              className="bg-green-500/20 text-green-400 border-green-500/30"
            >
              Health: {filters.health_status}
              <Button
                onClick={() => clearSpecificFilter('health_status')}
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-green-400 hover:text-green-300"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          
          {(filters.min_age || filters.max_age) && (
            <Badge 
              variant="secondary" 
              className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            >
              Age: {filters.min_age || 0}-{filters.max_age || '∞'}
              <Button
                onClick={() => {
                  clearSpecificFilter('min_age')
                  clearSpecificFilter('max_age')
                }}
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-yellow-400 hover:text-yellow-300"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sex Filter */}
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Sex
                </Label>
                <Select 
                  value={filters.sex || ''} 
                  onValueChange={(value) => updateFilter('sex', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Any sex" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="" className="text-white hover:bg-gray-700">
                      Any sex
                    </SelectItem>
                    {SEX_CHOICES.map((sex) => (
                      <SelectItem 
                        key={sex} 
                        value={sex}
                        className="text-white hover:bg-gray-700"
                      >
                        {sex} {sex === 'Male' ? '♂' : '♀'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Breed Filter */}
              <div className="space-y-2">
                <Label className="text-gray-300">Breed</Label>
                <Select 
                  value={filters.breed || ''} 
                  onValueChange={(value) => updateFilter('breed', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Any breed" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="" className="text-white hover:bg-gray-700">
                      Any breed
                    </SelectItem>
                    {BREED_CHOICES.map((breed) => (
                      <SelectItem 
                        key={breed} 
                        value={breed}
                        className="text-white hover:bg-gray-700"
                      >
                        {breed.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Health Status Filter */}
              <div className="space-y-2">
                <Label className="text-gray-300">Health Status</Label>
                <Select 
                  value={filters.health_status || ''} 
                  onValueChange={(value) => updateFilter('health_status', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="" className="text-white hover:bg-gray-700">
                      Any status
                    </SelectItem>
                    {HEALTH_STATUS_OPTIONS.map((status) => (
                      <SelectItem 
                        key={status} 
                        value={status}
                        className="text-white hover:bg-gray-700"
                      >
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Age Range */}
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Min Age (years)
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={filters.min_age || ''}
                  onChange={(e) => updateFilter('min_age', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Max Age (years)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="∞"
                  value={filters.max_age || ''}
                  onChange={(e) => updateFilter('max_age', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Sort By
                </Label>
                <Select 
                  value={filters.ordering || ''} 
                  onValueChange={(value) => updateFilter('ordering', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Default order" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="" className="text-white hover:bg-gray-700">
                      Default order
                    </SelectItem>
                    {ORDERING_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="text-white hover:bg-gray-700"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
