'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { animalsAPI } from '@/lib/api'
import { Animal, AnimalCreate, Parent, ParentsData, BREED_CHOICES, SEX_CHOICES, HEALTH_STATUS_OPTIONS } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Save, X } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const animalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  sex: z.enum(['Male', 'Female'], { required_error: 'Sex is required' }),
  breed: z.enum(BREED_CHOICES as [string, ...string[]], { required_error: 'Breed is required' }),
  year_of_birth: z.number()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),
  father: z.number().optional(),
  mother: z.number().optional(),
  weight: z.number().min(0, 'Weight must be positive').optional(),
  health_status: z.string().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
})

type AnimalFormData = z.infer<typeof animalSchema>

interface AnimalFormProps {
  animal?: Animal
  isEdit?: boolean
  onSuccess: (animalId: number) => void
  onCancel: () => void
}

export function AnimalForm({ animal, isEdit = false, onSuccess, onCancel }: AnimalFormProps) {
  const [loading, setLoading] = useState(false)
  const [parentsData, setParentsData] = useState<ParentsData>({ fathers: [], mothers: [] })
  const [loadingParents, setLoadingParents] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      name: animal?.name || '',
      sex: animal?.sex || undefined,
      breed: animal?.breed as any || undefined,
      year_of_birth: animal?.year_of_birth || new Date().getFullYear(),
      father: animal?.father || undefined,
      mother: animal?.mother || undefined,
      weight: animal?.weight || undefined,
      health_status: animal?.health_status || 'Healthy',
      notes: animal?.notes || '',
    },
  })

  useEffect(() => {
    fetchParents()
  }, [])

  const fetchParents = async () => {
    try {
      setLoadingParents(true)
      const data: ParentsData = await animalsAPI.getParents()
      setParentsData(data)
    } catch (err) {
      console.error('Failed to fetch parents:', err)
    } finally {
      setLoadingParents(false)
    }
  }

  const onSubmit = async (data: AnimalFormData) => {
    try {
      setLoading(true)
      setError(null)

      // Remove undefined values and prepare data
      const submitData: AnimalCreate = {
        name: data.name,
        sex: data.sex,
        breed: data.breed,
        year_of_birth: data.year_of_birth,
        ...(data.father && { father: data.father }),
        ...(data.mother && { mother: data.mother }),
        ...(data.weight && { weight: data.weight }),
        ...(data.health_status && { health_status: data.health_status }),
        ...(data.notes && { notes: data.notes }),
      }

      let result: Animal
      if (isEdit && animal) {
        result = await animalsAPI.updateAnimal(animal.id, submitData)
      } else {
        result = await animalsAPI.createAnimal(submitData)
      }

      onSuccess(result.id)
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} animal`)
    } finally {
      setLoading(false)
    }
  }

  // Filter out current animal from parent options when editing
  const availableFathers = isEdit && animal 
    ? parentsData.fathers.filter(f => f.id !== animal.id)
    : parentsData.fathers
    
  const availableMothers = isEdit && animal
    ? parentsData.mothers.filter(m => m.id !== animal.id) 
    : parentsData.mothers

  return (
    <div className="space-y-6">
      {error && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter animal name"
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Sex *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700">
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
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Breed *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select breed" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700">
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
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Year of Birth *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1900}
                        max={new Date().getFullYear()}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Physical & Health Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Physical & Health Information</h3>
              
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        step={0.1}
                        placeholder="Enter weight"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="health_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Health Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select health status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700">
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
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes about the animal"
                        rows={3}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Parent Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="father"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Father</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                      defaultValue={field.value?.toString()}
                      disabled={loadingParents}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder={loadingParents ? "Loading..." : "Select father"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="" className="text-white hover:bg-gray-700">
                          None
                        </SelectItem>
                        {availableFathers.map((father) => (
                          <SelectItem 
                            key={father.id} 
                            value={father.id.toString()}
                            className="text-white hover:bg-gray-700"
                          >
                            {father.name} ({father.animal_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mother"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Mother</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                      defaultValue={field.value?.toString()}
                      disabled={loadingParents}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder={loadingParents ? "Loading..." : "Select mother"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="" className="text-white hover:bg-gray-700">
                          None
                        </SelectItem>
                        {availableMothers.map((mother) => (
                          <SelectItem 
                            key={mother.id} 
                            value={mother.id.toString()}
                            className="text-white hover:bg-gray-700"
                          >
                            {mother.name} ({mother.animal_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-700">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-cyber-blue to-neon-green hover:from-cyber-blue/80 hover:to-neon-green/80"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? 'Update Animal' : 'Create Animal'}
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="border-gray-700 text-gray-400 hover:bg-gray-800"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
