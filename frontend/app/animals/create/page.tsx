'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { animalsAPI } from '@/lib/api'
import { AnimalCreate, ParentsData, BREED_CHOICES, SEX_CHOICES, HEALTH_STATUS_OPTIONS } from '@/types'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function CreateAnimalPage() {
  const [formData, setFormData] = useState<AnimalCreate>({
    type: 'cow',
    name: '',
    sex: 'Male',
    breed: 'Jersey',
    year_of_birth: new Date().getFullYear(),
    father: undefined,
    mother: undefined,
    weight: undefined,
    health_status: 'Healthy',
    notes: '',
  })
  // Dynamic breed options based on type
  const BREED_OPTIONS: Record<string, string[]> = {
    dog: ['German Shepherd', 'Labrador', 'Beagle', 'Bulldog', 'Other'],
    cow: ['Jersey', 'Holstein', 'Guernsey', 'Ayrshire', 'Brown_Swiss', 'Zebu', 'Crossbreed'],
    goat: ['Boer', 'Kalahari Red', 'Saanen', 'Alpine', 'Other'],
    sheep: ['Dorper', 'Merino', 'Hampshire', 'Suffolk', 'Other'],
    pig: ['Large White', 'Landrace', 'Duroc', 'Pietrain', 'Other'],
  }
  const [parents, setParents] = useState<ParentsData>({ fathers: [], mothers: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  useEffect(() => {
    fetchParents()
  }, [])

  const fetchParents = async () => {
    try {
      const data = await animalsAPI.getParents()
      setParents(data)
    } catch (err) {
      console.error('Failed to fetch parents:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await animalsAPI.createAnimal(formData)
      router.push('/animals')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create animal')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    // If type changes, reset breed to default for that type
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        type: value as AnimalCreate['type'],
        breed: BREED_OPTIONS[value][0],
      }))
      return
    }
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight' || name === 'year_of_birth' || name === 'father' || name === 'mother'
        ? value === '' ? undefined : Number(value)
        : value
    }))
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/animals"
            className="p-2 border border-dark-600 text-dark-300 hover:text-white hover:border-dark-400 transition-colors duration-300 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Register New Animal
            </h1>
            <p className="text-dark-300 mt-1">
              Add a new animal to your ranch management system
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6 glow-border">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400 border-b border-dark-700 pb-2">
                Basic Information
              </h3>
              {/* Animal Type Selection */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-dark-200 mb-2">
                  Animal Type <span className="text-red-400">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="input-cyber w-full py-3 rounded-lg"
                >
                  {['dog', 'cow', 'goat', 'sheep', 'pig'].map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-dark-200 mb-2">
                  Animal Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-cyber w-full py-3 rounded-lg"
                  placeholder="Enter animal name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sex" className="block text-sm font-medium text-dark-200 mb-2">
                    Sex <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="sex"
                    name="sex"
                    required
                    value={formData.sex}
                    onChange={handleChange}
                    className="input-cyber w-full py-3 rounded-lg"
                  >
                    {SEX_CHOICES.map(sex => (
                      <option key={sex} value={sex}>{sex}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="breed" className="block text-sm font-medium text-dark-200 mb-2">
                    Breed <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="breed"
                    name="breed"
                    required
                    value={formData.breed}
                    onChange={handleChange}
                    className="input-cyber w-full py-3 rounded-lg"
                  >
                    {BREED_OPTIONS[formData.type].map(breed => (
                      <option key={breed} value={breed}>
                        {breed.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="year_of_birth" className="block text-sm font-medium text-dark-200 mb-2">
                  Year of Birth <span className="text-red-400">*</span>
                </label>
                <input
                  id="year_of_birth"
                  name="year_of_birth"
                  type="number"
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.year_of_birth}
                  onChange={handleChange}
                  className="input-cyber w-full py-3 rounded-lg"
                />
              </div>
            </div>

            {/* Parentage */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400 border-b border-dark-700 pb-2">
                Parentage (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="father" className="block text-sm font-medium text-dark-200 mb-2">
                    Father
                  </label>
                  <select
                    id="father"
                    name="father"
                    value={formData.father || ''}
                    onChange={handleChange}
                    className="input-cyber w-full py-3 rounded-lg"
                  >
                    <option value="">Select father (optional)</option>
                    {parents.fathers.map(father => (
                      <option key={father.id} value={father.id}>
                        {father.animal_id} - {father.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="mother" className="block text-sm font-medium text-dark-200 mb-2">
                    Mother
                  </label>
                  <select
                    id="mother"
                    name="mother"
                    value={formData.mother || ''}
                    onChange={handleChange}
                    className="input-cyber w-full py-3 rounded-lg"
                  >
                    <option value="">Select mother (optional)</option>
                    {parents.mothers.map(mother => (
                      <option key={mother.id} value={mother.id}>
                        {mother.animal_id} - {mother.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Physical & Health */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400 border-b border-dark-700 pb-2">
                Physical & Health Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-dark-200 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.weight || ''}
                    onChange={handleChange}
                    className="input-cyber w-full py-3 rounded-lg"
                    placeholder="Enter weight in kg"
                  />
                </div>

                <div>
                  <label htmlFor="health_status" className="block text-sm font-medium text-dark-200 mb-2">
                    Health Status
                  </label>
                  <select
                    id="health_status"
                    name="health_status"
                    value={formData.health_status || 'Healthy'}
                    onChange={handleChange}
                    className="input-cyber w-full py-3 rounded-lg"
                  >
                    {HEALTH_STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-dark-200 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="input-cyber w-full py-3 rounded-lg resize-none"
                  placeholder="Additional notes about the animal..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-dark-700">
              <Link
                href="/animals"
                className="flex-1 px-6 py-3 border border-dark-600 text-dark-300 hover:text-white hover:border-dark-400 transition-colors duration-300 rounded-lg text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 btn-cyber py-3 font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Animal'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
