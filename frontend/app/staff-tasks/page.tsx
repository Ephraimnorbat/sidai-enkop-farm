'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ArrowDownToLine, Check, ClipboardList, Plus, RefreshCw } from 'lucide-react'
import { farmAPI } from '@/lib/api'
import { useAuth } from '@/components/AuthProvider'

type Task = { id: number; staff: number; staff_name: string; title: string; description: string; task_date: string; status: 'pending' | 'completed' }
type Performance = { staff_id: number; staff_name: string; total_tasks: number; completed_tasks: number; completion_rate: number }
type TaskAssignee = { id: number; name: string; username: string; role: string }
const today = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function StaffTasksPage() {
  const { user, isAuthenticated } = useAuth()
  const isManager = ['admin', 'manager'].includes(user?.role || '')
  const [tasks, setTasks] = useState<Task[]>([])
  const [performance, setPerformance] = useState<Performance[]>([])
  const [assignees, setAssignees] = useState<TaskAssignee[]>([])
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [taskDate, setTaskDate] = useState(today())
  const [assignee, setAssignee] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [taskData, report, staffOptions] = await Promise.all([
        farmAPI.getTasks(),
        isManager ? farmAPI.getPerformance({ period }) : Promise.resolve(null),
        isManager ? farmAPI.getTaskAssignees() : Promise.resolve([]),
      ])
      setTasks(taskData)
      if (report) setPerformance(report.staff)
      if (isManager) {
        setAssignees(staffOptions)
        setAssignee(current => current || (staffOptions.length ? String(staffOptions[0].id) : ''))
      }
    } catch (e: any) { setError(e.response?.data?.detail || 'Could not load farm tasks.') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (isAuthenticated) load() }, [isAuthenticated, isManager, period])
  useEffect(() => { if (window.location.search.includes('view=performance')) document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth' }) }, [])

  const addTask = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('')
    try {
      await farmAPI.createTask({ title, description, task_date: taskDate, ...(isManager ? { staff: Number(assignee) } : {}) })
      setTitle(''); setDescription(''); setNotice('Task assigned successfully.'); await load()
    }
    catch (e: any) { setError(e.response?.data?.detail || 'Could not save this task. Please check the date and try again.') }
    finally { setSaving(false) }
  }

  const toggleTask = async (task: Task) => {
    try { await farmAPI.updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' }); await load() }
    catch (e: any) { setError(e.response?.data?.detail || 'Could not update this task.') }
  }

  const exportTasks = async () => {
    setExporting(true); setError(''); setNotice('')
    try {
      const blob = await farmAPI.exportTasks({ period })
      if (blob.type.includes('json') || blob.type.includes('text')) {
        const payload = await blob.text()
        let message = payload
        try { const parsed = JSON.parse(payload); message = parsed.detail || Object.values(parsed).flat().join(' ') || payload } catch {}
        throw new Error(message || 'The server did not return an Excel file.')
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sidai-staff-tasks-${period}.xlsx`
      document.body.appendChild(a); a.click(); a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice('Excel export downloaded.')
    } catch (e: any) {
      const data = e.response?.data
      let message = e.message
      if (data instanceof Blob) {
        try { const payload = await data.text(); const parsed = JSON.parse(payload); message = parsed.detail || payload } catch {}
      } else if (data?.detail) message = data.detail
      setError(message || 'Excel export failed. Please try again.')
    } finally { setExporting(false) }
  }

  if (!isAuthenticated) return <div className="management-page"><h1>Staff task log</h1><p>Please sign in to record or review daily tasks.</p></div>
  const visibleTasks = isManager ? tasks : tasks.filter(task => task.staff === user?.id)
  const completed = visibleTasks.filter(task => task.status === 'completed').length
  const completion = visibleTasks.length ? Math.round(completed * 100 / visibleTasks.length) : 0

  return <div className="management-page">
    <div className="management-header"><div><div className="section-kicker">Farm operations</div><h1>Daily task log</h1><p>Record the day’s work and keep the whole team in sync.</p></div><button onClick={load} className="outline-button"><RefreshCw size={15} /> Refresh</button></div>
    {error && <div className="notice error-notice">{error}</div>}{notice && <div className="notice success-notice">{notice}</div>}
    <div className="task-summary"><div className="summary-icon"><ClipboardList size={21} /></div><div><span>Your tasks</span><strong>{visibleTasks.length}</strong></div><div className="summary-divider" /><div><span>Completed</span><strong>{completed}</strong></div><div className="summary-divider" /><div><span>Completion</span><strong>{completion}%</strong></div></div>
    <div className="task-layout"><section className="management-card"><div className="card-heading"><div><h2>Assign a daily task</h2><p>Choose a team member and due date.</p></div><Plus size={19} /></div><form onSubmit={addTask} className="management-form"><label>Task name<input required maxLength={160} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Morning livestock check" /></label>{isManager && <label>Assign to<select required value={assignee} onChange={e => setAssignee(e.target.value)} disabled={!assignees.length}><option value="">{assignees.length ? 'Select a staff member' : 'No active farm staff available'}</option>{assignees.map(person => <option key={person.id} value={person.id}>{person.name} · {person.role}</option>)}</select></label>}<label>Date<input required type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)} /></label><label>Description <span className="optional-label">Optional</span><textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Add a note about the work" /></label><button type="submit" className="solid-button" disabled={saving || (isManager && !assignee)}>{saving ? 'Saving…' : 'Assign task'} <Plus size={16} /></button></form></section>
      <section className="management-card task-list-card"><div className="card-heading"><div><h2>{isManager ? 'Team task log' : 'Your recent tasks'}</h2><p>{isManager ? 'Tasks logged by your farm team.' : 'Your recorded daily work.'}</p></div><span className="task-count">{visibleTasks.length}</span></div>{loading ? <div className="empty-state">Loading task log…</div> : visibleTasks.length ? <div className="task-list">{visibleTasks.map(task => <article key={task.id} className={`task-row ${task.status === 'completed' ? 'task-done' : ''}`}><button className="task-check" aria-label={task.status === 'completed' ? 'Mark as pending' : 'Mark as complete'} onClick={() => toggleTask(task)}>{task.status === 'completed' && <Check size={15} />}</button><div className="task-main"><strong>{task.title}</strong><p>{task.description || 'Daily farm routine'}</p><small>{new Date(`${task.task_date}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}{isManager && ` · ${task.staff_name}`}</small></div><span className={`task-status ${task.status}`}>{task.status}</span></article>)}</div> : <div className="empty-state"><ClipboardList size={23} /><span>No daily tasks have been logged yet.</span></div>}</section></div>
    {isManager && <section id="performance" className="management-card performance-card"><div className="performance-heading"><div><div className="section-kicker">Team overview</div><h2>Staff performance</h2><p>Task completion across the selected period.</p></div><div className="performance-actions"><select value={period} onChange={e => setPeriod(e.target.value as 'week' | 'month')} aria-label="Reporting period"><option value="week">This week</option><option value="month">This month</option></select><button className="solid-button export-button" onClick={exportTasks} disabled={exporting}><ArrowDownToLine size={15} /> {exporting ? 'Preparing…' : 'Export Excel'}</button></div></div>{performance.length ? <div className="performance-chart">{performance.map((person, index) => <div className="performance-row" key={person.staff_id}><div className="performance-person"><span className="staff-avatar">{person.staff_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}</span><span><strong>{person.staff_name}</strong><small>{person.completed_tasks} of {person.total_tasks} tasks completed</small></span></div><div className="performance-track"><span style={{ width: `${person.completion_rate}%`, animationDelay: `${index * 90}ms` }} /></div><strong className="performance-rate">{person.completion_rate}%</strong></div>)}</div> : <div className="empty-state">No staff task activity in this reporting period.</div>}</section>}
    <style jsx>{`
      .management-page{max-width:1160px;margin:0 auto;padding:58px 32px 100px;color:#18241c}.management-header{display:flex;justify-content:space-between;align-items:end;margin-bottom:30px}.management-header h1{font-size:42px;letter-spacing:-.04em;font-weight:500;margin:12px 0 7px}.management-header p,.card-heading p,.performance-heading p{font-size:13px;color:#758078;margin:0}.outline-button,.performance-actions select{display:inline-flex;align-items:center;gap:8px;border:1px solid #dfe6df;background:white;border-radius:4px;padding:11px 14px;color:#3e5945;font-size:12px}.task-summary{display:flex;align-items:center;gap:22px;padding:20px 24px;border:1px solid #e7ece7;background:#f9fbf8;margin-bottom:20px}.summary-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:#e9f2e9;color:#2e7d50}.task-summary>div:not(.summary-icon):not(.summary-divider){display:flex;flex-direction:column;gap:4px}.task-summary span{font-size:11px;color:#7a857c}.task-summary strong{font-size:19px;color:#213128}.summary-divider{height:32px;width:1px;background:#e4e9e4}.task-layout{display:grid;grid-template-columns:.83fr 1.17fr;gap:18px;align-items:start}.management-card{border:1px solid #e7ece7;background:white;padding:25px}.card-heading{display:flex;align-items:start;justify-content:space-between;color:#2e7d50}.card-heading h2,.performance-heading h2{font-size:18px;font-weight:600;color:#223128;margin:0 0 7px}.card-heading p{font-size:11px}.management-form{display:flex;flex-direction:column;gap:16px;margin-top:24px}.management-form label{display:flex;flex-direction:column;gap:7px;color:#344239;font-size:11px;font-weight:600}.management-form input,.management-form textarea{width:100%;padding:11px 12px;border:1px solid #dfe6df;border-radius:3px;color:#26342a;font:inherit;font-weight:400;outline:none}.management-form input:focus,.management-form textarea:focus{border-color:#6d9f77;box-shadow:0 0 0 3px #2e7d5012}.management-form textarea{resize:vertical}.optional-label{display:inline;color:#929b94;font-weight:400}.solid-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:41px;padding:0 15px;background:#2e7d50;border:0;border-radius:3px;color:#fff;font-size:11px;font-weight:600;cursor:pointer;transition:background .2s,transform .2s}.solid-button:hover{background:#205f3b;transform:translateY(-1px)}.solid-button:disabled{opacity:.6;cursor:wait}.task-count{display:grid;place-items:center;width:29px;height:29px;border-radius:50%;background:#edf4ed;color:#2e7d50;font-size:11px}.task-list{margin-top:19px}.task-row{display:flex;align-items:flex-start;gap:12px;padding:15px 0;border-top:1px solid #eef1ee}.task-check{display:grid;place-items:center;flex:0 0 21px;height:21px;border:1px solid #cbd7cc;border-radius:50%;background:#fff;color:#fff;cursor:pointer}.task-done .task-check{background:#438257;border-color:#438257}.task-main{flex:1;min-width:0}.task-main strong{font-size:12px;color:#26342a}.task-main p{font-size:11px;color:#778178;margin:5px 0}.task-main small{font-size:10px;color:#98a099}.task-done .task-main strong{text-decoration:line-through;color:#839087}.task-status{padding:4px 7px;border-radius:9px;font-size:9px;text-transform:capitalize}.task-status.pending{background:#fbf4df;color:#947724}.task-status.completed{background:#e8f3e9;color:#3c7750}.empty-state{min-height:120px;display:flex;align-items:center;justify-content:center;gap:10px;color:#8a948c;font-size:12px}.performance-card{margin-top:20px}.performance-heading{display:flex;justify-content:space-between;align-items:center;gap:20px}.performance-heading .section-kicker{margin-bottom:9px}.performance-actions{display:flex;gap:9px}.performance-actions select{cursor:pointer}.export-button{white-space:nowrap}.performance-chart{margin-top:28px}.performance-row{display:grid;grid-template-columns:220px 1fr 48px;align-items:center;gap:20px;padding:12px 0;border-top:1px solid #eef1ee}.performance-person{display:flex;align-items:center;gap:11px}.staff-avatar{display:grid;place-items:center;flex:0 0 34px;height:34px;border-radius:50%;background:#eaf2e9;color:#43734b;font-size:10px;font-weight:700}.performance-person strong,.performance-person small{display:block}.performance-person strong{font-size:11px;color:#26342a}.performance-person small{margin-top:4px;font-size:9px;color:#8a948c}.performance-track{height:8px;border-radius:10px;background:#edf1ed;overflow:hidden}.performance-track span{display:block;height:100%;border-radius:10px;background:linear-gradient(90deg,#76a77c,#2e7d50);transition:width .7s ease}.performance-rate{text-align:right;font-size:12px;color:#2e7d50}.notice{padding:12px 14px;margin-bottom:14px;border-radius:3px;font-size:12px}.error-notice{background:#fff0ee;color:#a3443d}.success-notice{background:#edf6ed;color:#386f44}@media(max-width:800px){.management-page{padding:42px 22px 70px}.task-layout{grid-template-columns:1fr}.management-header h1{font-size:35px}}@media(max-width:560px){.management-header{align-items:flex-start;flex-direction:column;gap:18px}.task-summary{gap:12px;padding:16px 12px}.summary-icon{display:none}.task-summary span{font-size:9px}.task-summary strong{font-size:16px}.management-card{padding:19px}.performance-heading{align-items:flex-start;flex-direction:column}.performance-actions{width:100%}.performance-actions select{flex:1}.performance-row{grid-template-columns:minmax(115px,.7fr) 1fr 38px;gap:10px}.performance-person{gap:7px}.performance-person strong{font-size:10px}.performance-person small{font-size:8px}}
    `}</style>
  </div>
}
