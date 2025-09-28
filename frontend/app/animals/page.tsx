'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { animalsAPI } from '@/lib/api'
import { Animal, PaginatedResponse } from '@/types'
import { 
  PlusIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

export default function AnimalsPage() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // Filters
  const [search, setSearch] = useState('')
  const [sexFilter, setSexFilter] = useState('')
  const [breedFilter, setBreedFilter] = useState('')
  const [healthFilter, setHealthFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchAnimals = async (page = 1) => {
    setIsLoading(true)
    setError('')

    try {
      const params: any = { page }
      
      if (search) params.search = search
      if (sexFilter) params.sex = sexFilter
      if (breedFilter) params.breed = breedFilter
      if (healthFilter) params.health_status = healthFilter

      const response: PaginatedResponse<Animal> = await animalsAPI.getAnimals(params)
      
      setAnimals(response.results)
      setTotalCount(response.count)
      setTotalPages(Math.ceil(response.count / 20))
      setCurrentPage(page)
    } catch (err: any) {
      setError('Failed to fetch animals')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnimals(1)
  }, [search, sexFilter, breedFilter, healthFilter])

  const handlePageChange = (page: number) => {
    fetchAnimals(page)
  }

  const clearFilters = () => {
    setSearch('')
    setSexFilter('')
    setBreedFilter('')
    setHealthFilter('')
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Animal Management
            </h1>
            <p className="text-dark-300 mt-1">
              {totalCount} animals registered
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-dark-600 text-dark-300 hover:text-white hover:border-dark-400 transition-colors duration-300 rounded-lg"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>
            
            {user?.permissions?.can_create_animals && (
              <Link href="/animals/create" className="btn-cyber flex items-center gap-2">
                <PlusIcon className="h-5 w-5" />
                Add Animal
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="h-5 w-5 text-dark-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search animals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-cyber w-full pl-10 pr-4 py-3 rounded-lg"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-dark-800/30 border border-dark-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Sex</label>
                  <select
                    value={sexFilter}
                    onChange={(e) => setSexFilter(e.target.value)}
                    className="input-cyber w-full py-3 rounded-lg"
                  >
                    <option value="">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Breed</label>
                  <select
                    value={breedFilter}
                    onChange={(e) => setBreedFilter(e.target.value)}
                    className="input-cyber w-full py-3 rounded-lg"
                  >
                    <option value="">All Breeds</option>
                    <option value="Jersey">Jersey</option>
                    <option value="Holstein">Holstein</option>
                    <option value="Guernsey">Guernsey</option>
                    <option value="Ayrshire">Ayrshire</option>
                    <option value="Brown_Swiss">Brown Swiss</option>
                    <option value="Zebu">Zebu</option>
                    <option value="Crossbreed">Crossbreed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Health Status</label>
                  <select
                    value={healthFilter}
                    onChange={(e) => setHealthFilter(e.target.value)}
                    className="input-cyber w-full py-3 rounded-lg"
                  >
                    <option value="">All</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Sick">Sick</option>
                    <option value="Under Treatment">Under Treatment</option>
                    <option value="Quarantine">Quarantine</option>
                    <option value="Recovery">Recovery</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-dark-400 hover:text-dark-300 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-dark-300">Loading animals...</p>
          </div>
        ) : animals.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 text-dark-400 mx-auto mb-4" />
            <p className="text-dark-300 mb-4">No animals found</p>
            <Link href="/animals/create" className="btn-cyber">
              Add Your First Animal
            </Link>
          </div>
        ) : (
          <>
            {/* Animals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {animals.map((animal) => (
                <Link
                  key={animal.id}
                  href={`/animals/${animal.id}`}
                  className="block"
                >
                  <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6 card-hover glow-border">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-cyan-400">
                          {animal.name}
                        </h3>
                        <p className="text-dark-300 text-sm">
                          ID: {animal.animal_id}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs border ${
                        animal.health_status === 'Healthy' ? 'status-healthy' :
                        animal.health_status === 'Sick' ? 'status-sick' :
                        animal.health_status === 'Under Treatment' ? 'status-treatment' :
                        'status-quarantine'
                      }`}>
                        {animal.health_status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-dark-400">Sex:</span>
                        <span className="text-dark-200">{animal.sex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">Breed:</span>
                        <span className="text-dark-200">{animal.breed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">Age:</span>
                        <span className="text-dark-200">{animal.age} years</span>
                      </div>
                      {animal.weight && (
                        <div className="flex justify-between">
                          <span className="text-dark-400">Weight:</span>
                          <span className="text-dark-200">{animal.weight} kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-dark-600 text-dark-300 hover:text-white hover:border-dark-400 transition-colors duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                <span className="text-dark-300 px-4">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-dark-600 text-dark-300 hover:text-white hover:border-dark-400 transition-colors duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}
