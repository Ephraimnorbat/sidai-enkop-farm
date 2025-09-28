import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ANIMAL_TYPE_CHOICES } from '@/types'

const ROLE_CHOICES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
  { value: 'worker', label: 'Worker' },
  { value: 'farm_worker', label: 'Farm Worker' },
  { value: 'farm_accountant', label: 'Farm Accountant' },
  { value: 'guest', label: 'Guest' },
]

export default function CreateUserPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'worker',
    salary: '',
    weekly_tasks: '',
    phone_number: '',
    employee_id: '',
    hire_date: '',
    is_active_employee: true,
    notes: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    let fieldValue: string | boolean = value
    if (type === 'checkbox') {
      fieldValue = (e.target as HTMLInputElement).checked
    }
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            password_confirm: formData.password_confirm,
            first_name: formData.first_name,
            last_name: formData.last_name,
          },
          profile: {
            role: formData.role,
            salary: formData.salary,
            weekly_tasks: formData.weekly_tasks,
            phone_number: formData.phone_number,
            employee_id: formData.employee_id,
            hire_date: formData.hire_date,
            is_active_employee: formData.is_active_employee,
            notes: formData.notes,
          }
        })
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/users')
      } else {
        setError(data.message || 'Failed to create user')
      }
    } catch (err) {
      setError('Failed to create user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-dark-800/50 border border-dark-700 rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-cyan-400">Create New User</h1>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="username" value={formData.username} onChange={handleChange} required placeholder="Username" className="input-cyber w-full" />
        <input name="email" value={formData.email} onChange={handleChange} required placeholder="Email" className="input-cyber w-full" />
        <input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Password" className="input-cyber w-full" />
        <input name="password_confirm" type="password" value={formData.password_confirm} onChange={handleChange} required placeholder="Confirm Password" className="input-cyber w-full" />
        <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" className="input-cyber w-full" />
        <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" className="input-cyber w-full" />
        <select name="role" value={formData.role} onChange={handleChange} required className="input-cyber w-full">
          {ROLE_CHOICES.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
        <input name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="Salary" className="input-cyber w-full" />
        <input name="weekly_tasks" value={formData.weekly_tasks} onChange={handleChange} placeholder="Weekly Tasks (comma separated)" className="input-cyber w-full" />
        <input name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" className="input-cyber w-full" />
        <input name="employee_id" value={formData.employee_id} onChange={handleChange} placeholder="Employee ID" className="input-cyber w-full" />
        <input name="hire_date" type="date" value={formData.hire_date} onChange={handleChange} className="input-cyber w-full" />
        <label className="flex items-center gap-2">
          <input name="is_active_employee" type="checkbox" checked={formData.is_active_employee} onChange={handleChange} />
          Active Employee
        </label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes" className="input-cyber w-full" />
        <button type="submit" disabled={isLoading} className="btn-cyber w-full py-3 font-bold">
          {isLoading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  )
}
