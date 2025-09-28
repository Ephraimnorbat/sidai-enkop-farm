"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">User Management</h1>
        <Link href="/users/create" className="btn-cyber">Add User</Link>
      </div>
      {loading ? (
        <div>Loading users...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <table className="w-full border border-dark-700 rounded-lg overflow-hidden">
          <thead className="bg-dark-800">
            <tr>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Salary</th>
              <th className="p-3 text-left">Weekly Tasks</th>
              <th className="p-3 text-left">Active</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-dark-700">
                <td className="p-3">{user.username}</td>
                <td className="p-3">{user.role_display || user.role}</td>
                <td className="p-3">{user.salary || '-'}</td>
                <td className="p-3">{user.weekly_tasks || '-'}</td>
                <td className="p-3">{user.is_active_employee ? 'Yes' : 'No'}</td>
                <td className="p-3">
                  {/* Future: Edit/Delete actions */}
                  <Link href={`/users/${user.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
