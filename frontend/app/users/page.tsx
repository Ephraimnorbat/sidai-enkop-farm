'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Plus, Save, Trash2, Users, X } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { useAuth } from '@/components/AuthProvider'

type FarmUser = {
  id: number; username: string; email: string; first_name: string; last_name: string
  role: string; role_display: string; salary: string | null; weekly_tasks: string
  is_active: boolean; is_active_employee: boolean; is_superuser: boolean
}
const roles = [
  ['manager', 'Manager'], ['staff', 'Staff'], ['worker', 'Worker'],
  ['farm_worker', 'Farm worker'], ['farm_accountant', 'Farm accountant'], ['guest', 'Guest'], ['admin', 'Administrator'],
]

export default function UsersPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const canManage = ['admin', 'manager'].includes(user?.role || '')
  const [users, setUsers] = useState<FarmUser[]>([])
  const [editing, setEditing] = useState<FarmUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadUsers = async () => {
    setLoading(true); setError('')
    try { const response = await authAPI.getUsers(); setUsers(response.users || []) }
    catch (e: any) { setError(e.response?.data?.detail || 'Could not load accounts.') }
    finally { setLoading(false) }
  }
  useEffect(() => { if (isAuthenticated && canManage) loadUsers() }, [isAuthenticated, canManage])

  const saveUser = async (event: FormEvent) => {
    event.preventDefault()
    if (!editing) return
    setSaving(true); setError(''); setNotice('')
    try {
      await authAPI.updateUser(editing.id, {
        first_name: editing.first_name, last_name: editing.last_name, email: editing.email,
        role: editing.role, is_active: editing.is_active, is_active_employee: editing.is_active_employee,
        salary: editing.salary || null, weekly_tasks: editing.weekly_tasks,
      })
      setEditing(null); setNotice('Account updated.'); await loadUsers()
    } catch (e: any) { setError(e.response?.data?.detail || e.response?.data?.role?.[0] || 'Could not update this account.') }
    finally { setSaving(false) }
  }

  const deleteUser = async (account: FarmUser) => {
    if (!window.confirm(`Delete the account for ${account.username}? This cannot be undone.`)) return
    setError(''); setNotice('')
    try { await authAPI.deleteUser(account.id); setNotice('Account deleted.'); await loadUsers() }
    catch (e: any) { setError(e.response?.data?.detail || 'Could not delete this account.') }
  }

  if (!isAuthenticated || !canManage) return <div className="account-page"><p>Administrator or manager access is required.</p></div>

  return <main className="account-page">
    <Link href="/dashboard" className="back-link"><ArrowLeft size={15} /> Dashboard</Link>
    <header className="account-header"><div><span className="account-kicker">People & access</span><h1>Accounts and users</h1><p>Create staff accounts, update roles and manage access.</p></div><Link className="account-primary" href="/users/create"><Plus size={16} /> Add user</Link></header>
    {error && <div className="account-notice account-error">{error}</div>}{notice && <div className="account-notice account-success">{notice}</div>}
    <section className="account-card">
      {loading ? <p className="account-empty">Loading accounts…</p> : users.length ? <div className="account-table-wrap"><table className="account-table"><thead><tr><th>Account</th><th>Role</th><th>Staff status</th><th>Salary</th><th>Weekly tasks</th><th>Actions</th></tr></thead><tbody>{users.map(account => <tr key={account.id}><td><strong>{[account.first_name, account.last_name].filter(Boolean).join(' ') || account.username}</strong><small>{account.email || account.username}</small></td><td>{account.role_display || account.role}</td><td><span className={`account-status ${account.is_active && account.is_active_employee ? 'active' : 'inactive'}`}>{account.is_active && account.is_active_employee ? 'Active' : 'Inactive'}</span></td><td>{account.salary || '—'}</td><td>{account.weekly_tasks || '—'}</td><td><div className="account-actions"><button onClick={() => setEditing({ ...account })} aria-label={`Edit ${account.username}`}><Pencil size={15} /></button><button onClick={() => deleteUser(account)} aria-label={`Delete ${account.username}`} disabled={account.id === user?.id || ((account.is_superuser || account.role === 'admin') && !user?.is_superuser)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <p className="account-empty"><Users size={20} /> No accounts found.</p>}
    </section>

    {editing && <div className="edit-backdrop" role="presentation" onClick={() => setEditing(null)}><section className="edit-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-user-title" onClick={e => e.stopPropagation()}><div className="edit-heading"><div><span className="account-kicker">Account settings</span><h2 id="edit-user-title">Edit {editing.username}</h2></div><button className="close-edit" onClick={() => setEditing(null)} aria-label="Close"><X size={19} /></button></div><form className="edit-form" onSubmit={saveUser}><div className="edit-columns"><label>First name<input value={editing.first_name} onChange={e => setEditing({ ...editing, first_name: e.target.value })} /></label><label>Last name<input value={editing.last_name} onChange={e => setEditing({ ...editing, last_name: e.target.value })} /></label></div><label>Email<input type="email" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} /></label><label>Role<select value={editing.role} disabled={editing.is_superuser && !user?.is_superuser} onChange={e => setEditing({ ...editing, role: e.target.value })}>{roles.filter(([value]) => value !== 'admin' || user?.is_superuser).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="edit-columns"><label>Salary<input type="number" min="0" step="0.01" value={editing.salary || ''} onChange={e => setEditing({ ...editing, salary: e.target.value })} /></label><label>Weekly tasks<input value={editing.weekly_tasks} onChange={e => setEditing({ ...editing, weekly_tasks: e.target.value })} /></label></div><label className="check-label"><input type="checkbox" checked={editing.is_active_employee} onChange={e => setEditing({ ...editing, is_active_employee: e.target.checked })} /> Active farm employee</label><label className="check-label"><input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} /> Account can sign in</label><div className="edit-buttons"><button type="button" className="account-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="account-primary" disabled={saving}><Save size={15} /> {saving ? 'Saving…' : 'Save account'}</button></div></form></section></div>}
    <style jsx>{`
      .account-page{max-width:1160px;margin:0 auto;padding:54px 30px 100px;color:#1d2a21}.back-link{display:inline-flex;align-items:center;gap:7px;color:#568060;text-decoration:none;font-size:12px}.account-header{display:flex;align-items:end;justify-content:space-between;gap:20px;margin:24px 0}.account-kicker{color:#568060;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.account-header h1{margin:9px 0 6px;font-size:38px;font-weight:500;letter-spacing:-.04em}.account-header p{margin:0;color:#7d887f;font-size:13px}.account-primary,.account-secondary{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 15px;border:0;border-radius:4px;background:#2e7d50;color:white;text-decoration:none;font-size:12px;font-weight:600;cursor:pointer}.account-primary:disabled{opacity:.6}.account-secondary{background:#edf2ed;color:#3e6046}.account-card{border:1px solid #e6ece6;background:white}.account-table-wrap{overflow:auto}.account-table{width:100%;border-collapse:collapse;text-align:left}.account-table th{padding:14px 16px;background:#f7faf7;color:#748078;font-size:10px;font-weight:600}.account-table td{padding:15px 16px;border-top:1px solid #edf1ed;color:#3b493e;font-size:12px;white-space:nowrap}.account-table td strong,.account-table td small{display:block}.account-table td strong{color:#243128}.account-table td small{margin-top:4px;color:#89938b;font-size:10px}.account-status{padding:5px 8px;border-radius:14px;font-size:10px}.account-status.active{background:#eaf4ea;color:#3c7849}.account-status.inactive{background:#f4efeb;color:#8a7169}.account-actions{display:flex;gap:6px}.account-actions button,.close-edit{display:grid;place-items:center;width:30px;height:30px;border:1px solid #e3eae3;border-radius:4px;background:#fff;color:#497450;cursor:pointer}.account-actions button:last-child{color:#a05b53}.account-actions button:disabled{opacity:.3;cursor:not-allowed}.account-notice{margin:16px 0;padding:12px 14px;border-radius:4px;font-size:12px}.account-error{background:#fff0ee;color:#9b4840}.account-success{background:#edf6ed;color:#386f44}.account-empty{min-height:130px;display:flex;align-items:center;justify-content:center;gap:9px;color:#879188;font-size:12px}.edit-backdrop{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:#12201670}.edit-dialog{width:min(540px,100%);max-height:90vh;overflow:auto;padding:25px;border:1px solid #e1e9e1;border-radius:8px;background:#fff;box-shadow:0 25px 80px #14271c30}.edit-heading{display:flex;align-items:flex-start;justify-content:space-between}.edit-heading h2{margin:6px 0 0;font-size:22px;font-weight:500}.close-edit{color:#67756a}.edit-form{display:grid;gap:14px;margin-top:20px}.edit-form label{display:grid;gap:6px;color:#49564c;font-size:11px;font-weight:600}.edit-form input:not([type=checkbox]),.edit-form select{width:100%;padding:10px 11px;border:1px solid #dfe6df;border-radius:4px;background:white;color:#243128;font:inherit;font-weight:400}.edit-columns{display:grid;grid-template-columns:1fr 1fr;gap:12px}.edit-form .check-label{display:flex;align-items:center;gap:8px}.edit-form input[type=checkbox]{accent-color:#2e7d50}.edit-buttons{display:flex;justify-content:flex-end;gap:8px;margin-top:5px}@media(max-width:700px){.account-page{padding:38px 18px 70px}.account-header{align-items:flex-start;flex-direction:column}.account-header h1{font-size:32px}.account-table{min-width:760px}.edit-columns{grid-template-columns:1fr}}
    `}</style>
  </main>
}
