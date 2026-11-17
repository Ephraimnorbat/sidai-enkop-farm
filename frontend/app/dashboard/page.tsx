'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ClipboardCheck, ClipboardList, Image, Newspaper, PackageCheck, PawPrint, Plus, Sprout, Users, Warehouse } from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { animalsAPI, authAPI, farmAPI, galleryAPI, newsAPI } from '@/lib/api'

type DashboardStats = { animals?: number; tasks?: number; completedTasks?: number; inventory?: number; lowStock?: number; users?: number; gallery?: number; news?: number }

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)
  const isManager = user?.is_superuser || user?.role === 'admin' || user?.role === 'manager'

  useEffect(() => {
    let active = true
    Promise.allSettled([
      farmAPI.getTasks(), farmAPI.getInventory(), animalsAPI.getStatistics(),
      isManager ? authAPI.getUsers() : Promise.resolve(null),
      galleryAPI.getImages(), newsAPI.getNews(),
    ]).then(([taskResult, inventoryResult, animalResult, userResult, galleryResult, newsResult]) => {
      if (!active) return
      const tasks = taskResult.status === 'fulfilled' ? taskResult.value : []
      const inventory = inventoryResult.status === 'fulfilled' ? inventoryResult.value : []
      const animals = animalResult.status === 'fulfilled' ? animalResult.value.total_animals : undefined
      const users = userResult.status === 'fulfilled' && userResult.value ? userResult.value.users?.length : undefined
      const gallery = galleryResult.status === 'fulfilled' ? galleryResult.value.length : undefined
      const news = newsResult.status === 'fulfilled' ? newsResult.value.length : undefined
      setStats({
        tasks: tasks.length,
        completedTasks: tasks.filter((task: any) => task.status === 'completed').length,
        inventory: inventory.length,
        lowStock: inventory.filter((item: any) => item.is_low_stock).length,
        animals,
        users,
        gallery,
        news,
      })
      setLoading(false)
    })
    return () => { active = false }
  }, [isManager])

  const firstName = user?.first_name || user?.username || 'there'
  return <ProtectedRoute><div className="dashboard-page">
    <div className="dashboard-welcome"><div><span className="dashboard-kicker"><Sprout size={15} /> Sidai Enkop · Farm operations</span><h1>Welcome back, {firstName}.</h1><p>Here’s a quick view of what’s happening around the ranch.</p></div><Link href="/staff-tasks" className="dashboard-primary">Open daily tasks <ArrowRight size={16} /></Link></div>
    <div className="dashboard-stats">
      <article><span className="stat-icon"><PawPrint size={19} /></span><div><small>Animals registered</small><strong>{loading ? '—' : stats.animals ?? '—'}</strong><Link href="/animals">View animals <ArrowRight size={13} /></Link></div></article>
      <article><span className="stat-icon"><ClipboardList size={19} /></span><div><small>{isManager ? 'Team tasks' : 'Your tasks'}</small><strong>{loading ? '—' : stats.tasks ?? 0}</strong><Link href="/staff-tasks">Open task log <ArrowRight size={13} /></Link></div></article>
      <article><span className="stat-icon"><ClipboardCheck size={19} /></span><div><small>Tasks completed</small><strong>{loading ? '—' : stats.completedTasks ?? 0}</strong><Link href="/staff-tasks">Review tasks <ArrowRight size={13} /></Link></div></article>
      <article><span className="stat-icon"><Warehouse size={19} /></span><div><small>Inventory items</small><strong>{loading ? '—' : stats.inventory ?? 0}</strong><Link href="/inventory">View stock <ArrowRight size={13} /></Link></div></article>
    </div>
    <div className={`dashboard-lower ${isManager ? 'dashboard-manager-lower' : ''}`}>
      {isManager ? <section className="management-hub"><div className="hub-heading"><div><span className="dashboard-kicker">Management workspace</span><h2>Farm management</h2><p>Manage records and content from one place.</p></div></div><div className="hub-grid">
        <Link href="/animals" className="hub-card"><span className="hub-icon"><PawPrint size={19} /></span><span><b>Animals</b><small>{loading ? 'Browse and manage livestock' : `${stats.animals ?? 0} registered · add, edit or remove records`}</small></span><ArrowRight size={16} /></Link>
        <Link href="/users" className="hub-card"><span className="hub-icon"><Users size={19} /></span><span><b>Accounts & users</b><small>{loading ? 'Manage your farm team' : `${stats.users ?? 0} accounts · add staff and manage access`}</small></span><ArrowRight size={16} /></Link>
        <Link href="/staff-tasks" className="hub-card"><span className="hub-icon"><ClipboardList size={19} /></span><span><b>Daily tasks</b><small>Assign work, review due dates and export Excel</small></span><ArrowRight size={16} /></Link>
        <Link href="/inventory" className="hub-card"><span className="hub-icon"><Warehouse size={19} /></span><span><b>Farm inventory</b><small>{loading ? 'Track stock and supplies' : `${stats.lowStock ?? 0} items at reorder level`}</small></span><ArrowRight size={16} /></Link>
        <Link href="/gallery" className="hub-card"><span className="hub-icon"><Image size={19} /></span><span><b>Gallery</b><small>{loading ? 'Manage ranch photos' : `${stats.gallery ?? 0} images · upload, edit captions or delete`}</small></span><ArrowRight size={16} /></Link>
        <Link href="/news" className="hub-card"><span className="hub-icon"><Newspaper size={19} /></span><span><b>News & updates</b><small>{loading ? 'Manage ranch updates' : `${stats.news ?? 0} updates · create, edit or delete`}</small></span><ArrowRight size={16} /></Link>
        <Link href="/staff-tasks?view=performance" className="hub-card"><span className="hub-icon"><ClipboardCheck size={19} /></span><span><b>Staff performance</b><small>Review team completion and export weekly or monthly</small></span><ArrowRight size={16} /></Link>
      </div><div className="hub-quick"><span>Quick create</span><Link href="/animals/create"><Plus size={14} /> Animal</Link><Link href="/users/create"><Plus size={14} /> User</Link><Link href="/gallery/create"><Plus size={14} /> Gallery image</Link><Link href="/news/create"><Plus size={14} /> News update</Link></div></section> : <><section className="dashboard-panel"><div className="panel-heading"><span className="stat-icon"><Sprout size={19} /></span><div><h2>Your work, in one place</h2><p>Daily records help keep the ranch running smoothly.</p></div></div><div className="dashboard-actions"><Link href="/staff-tasks"><span><ClipboardList size={17} /><b>Daily task log</b><small>Review assigned work and due dates</small></span><ArrowRight size={16} /></Link><Link href="/inventory"><span><Warehouse size={17} /><b>Farm inventory</b><small>{loading ? 'Check supplies and stock' : `${stats.lowStock ?? 0} items at reorder level`}</small></span><ArrowRight size={16} /></Link></div></section><section className="dashboard-note"><div className="note-mark"><PackageCheck size={24} /></div><span className="dashboard-kicker">A good day’s work</span><h2>Care in every detail.</h2><p>Keep task records and farm supplies up to date for a clearer picture of daily operations.</p><Link href="/staff-tasks">Go to your tasks <ArrowRight size={15} /></Link></section></>}
    </div>
    <style jsx>{`
      .dashboard-page{max-width:1160px;margin:0 auto;padding:58px 32px 100px;color:#18241c}.dashboard-welcome{display:flex;align-items:end;justify-content:space-between;gap:24px;padding-bottom:31px;border-bottom:1px solid #e7ece7}.dashboard-kicker{display:flex;align-items:center;gap:8px;color:#478055;font-size:10px;text-transform:uppercase;letter-spacing:.15em;font-weight:700}.dashboard-welcome h1{margin:15px 0 8px;font-size:42px;font-weight:500;letter-spacing:-.045em;color:#1d2a21}.dashboard-welcome p{margin:0;color:#78837b;font-size:13px}.dashboard-primary{display:flex;align-items:center;gap:10px;padding:13px 17px;background:#2e7d50;color:white;text-decoration:none;border-radius:3px;font-size:11px;font-weight:600;transition:background .2s,transform .2s}.dashboard-primary:hover{background:#205f3b;transform:translateY(-2px)}.dashboard-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin:22px 0}.dashboard-stats article{display:flex;align-items:flex-start;gap:13px;padding:20px;border:1px solid #e7ece7;background:#fff}.stat-icon{width:38px;height:38px;flex:0 0 38px;border-radius:50%;display:grid;place-items:center;color:#4d8055;background:#edf4ed}.dashboard-stats small,.dashboard-stats strong,.dashboard-stats a{display:block}.dashboard-stats small{font-size:10px;color:#78837b}.dashboard-stats strong{margin:8px 0 10px;font-size:25px;font-weight:500;color:#233128}.dashboard-stats a{display:flex;align-items:center;gap:6px;color:#4d8055;text-decoration:none;font-size:10px}.dashboard-lower{display:grid;grid-template-columns:1.3fr .7fr;gap:16px;margin-top:16px}.dashboard-panel,.dashboard-note{border:1px solid #e7ece7;background:white;padding:25px}.panel-heading{display:flex;align-items:center;gap:12px}.panel-heading h2,.dashboard-note h2{margin:0 0 6px;font-size:17px;font-weight:600;color:#243128}.panel-heading p,.dashboard-note p{margin:0;color:#808a82;font-size:11px;line-height:1.7}.dashboard-actions{margin-top:18px}.dashboard-actions a{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-top:1px solid #eef1ee;color:#4d8055;text-decoration:none;transition:padding .2s}.dashboard-actions a:hover{padding-left:5px}.dashboard-actions a span{display:grid;grid-template-columns:22px 1fr;column-gap:9px;align-items:center}.dashboard-actions a span>svg{grid-row:span 2}.dashboard-actions b{color:#2a382d;font-size:11px}.dashboard-actions small{grid-column:2;color:#8a948c;font-size:9px;margin-top:4px}.dashboard-note{background:#f6f8f4}.note-mark{width:48px;height:48px;display:grid;place-items:center;border-radius:50%;background:#e3eee3;color:#4d8055;margin-bottom:24px}.dashboard-note h2{margin-top:12px;font-size:21px}.dashboard-note p{margin:9px 0 18px}.dashboard-note>a{display:inline-flex;align-items:center;gap:8px;color:#438052;text-decoration:none;font-size:10px;font-weight:700}@media(max-width:850px){.dashboard-page{padding:42px 22px 75px}.dashboard-stats{grid-template-columns:repeat(2,1fr)}.dashboard-lower{grid-template-columns:1fr}}@media(max-width:560px){.dashboard-welcome{align-items:flex-start;flex-direction:column}.dashboard-welcome h1{font-size:34px}.dashboard-primary{min-height:42px}.dashboard-stats{gap:9px}.dashboard-stats article{padding:14px 11px;gap:9px}.dashboard-stats .stat-icon{width:31px;height:31px;flex-basis:31px}.dashboard-stats small{font-size:9px}.dashboard-stats strong{font-size:21px}.dashboard-panel,.dashboard-note{padding:19px}}
    `}</style>
  </div></ProtectedRoute>
}
