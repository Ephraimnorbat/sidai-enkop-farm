'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Newspaper, Pencil, Plus, Trash2 } from 'lucide-react'
import { newsAPI } from '@/lib/api'
import { useAuth } from '@/components/AuthProvider'

type NewsItem = { id: number; title: string; description: string; image?: string; published_at: string }
export default function NewsPage() {
  const { user } = useAuth()
  const canManage = ['admin', 'manager'].includes(user?.role || '')
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    try { setNews(await newsAPI.getNews()) }
    catch { setError('Could not load news and updates.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])
  const edit = async (item: NewsItem) => {
    const title = window.prompt('Update news title', item.title)
    if (title === null) return
    const description = window.prompt('Update description', item.description)
    if (description === null) return
    const form = new FormData(); form.append('title', title); form.append('description', description)
    try { await newsAPI.updateNews(item.id, form); await load() }
    catch (e: any) { setError(e.response?.data?.detail || 'Could not update news item.') }
  }
  const remove = async (item: NewsItem) => {
    if (!window.confirm(`Delete “${item.title}”?`)) return
    try { await newsAPI.deleteNews(item.id); await load() }
    catch (e: any) { setError(e.response?.data?.detail || 'Could not delete news item.') }
  }
  return <main className="news-page"><header className="news-header"><div><span className="news-kicker">Ranch journal</span><h1>News & updates</h1><p>Announcements and stories from Sidai Enkop Ranch.</p></div>{canManage && <Link href="/news/create" className="news-add"><Plus size={16} /> Create update</Link>}</header>{error && <div className="news-error">{error}</div>}{loading ? <p className="news-empty">Loading updates…</p> : news.length ? <div className="news-list">{news.map(item => <article className="news-card" key={item.id}>{item.image && <img src={item.image} alt="" /> }<div className="news-content"><small>{new Date(item.published_at).toLocaleDateString()}</small><h2>{item.title}</h2><p>{item.description}</p><a href="/about">About the ranch <ArrowUpRight size={14} /></a>{canManage && <div className="news-actions"><button onClick={() => edit(item)}><Pencil size={14} /> Edit</button><button onClick={() => remove(item)}><Trash2 size={14} /> Delete</button></div>}</div></article>)}</div> : <p className="news-empty"><Newspaper size={20} /> No updates have been published yet.</p>}
    <style jsx>{`.news-page{max-width:1000px;margin:0 auto;padding:56px 30px 100px;color:#1d2a21}.news-header{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:28px}.news-kicker{color:#568060;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.news-header h1{margin:9px 0 6px;font-size:40px;font-weight:500;letter-spacing:-.04em}.news-header p{margin:0;color:#7d887f;font-size:13px}.news-add{display:flex;align-items:center;gap:8px;padding:12px 15px;border-radius:4px;background:#2e7d50;color:#fff;text-decoration:none;font-size:12px}.news-list{display:grid;gap:14px}.news-card{display:grid;grid-template-columns:230px 1fr;overflow:hidden;border:1px solid #e6ece6;border-radius:6px;background:#fff}.news-card>img{width:100%;height:100%;min-height:210px;object-fit:cover}.news-content{padding:22px}.news-content>small{color:#7d887f;font-size:10px}.news-content h2{margin:8px 0;font-size:20px;font-weight:600}.news-content p{color:#69776d;font-size:13px;line-height:1.7}.news-content>a{display:inline-flex;align-items:center;gap:5px;color:#4d7953;text-decoration:none;font-size:11px}.news-actions{display:flex;gap:7px;margin-top:18px}.news-actions button{display:flex;align-items:center;gap:5px;padding:7px 9px;border:1px solid #e4eae4;border-radius:4px;background:#fff;color:#4c7452;font-size:10px;cursor:pointer}.news-actions button:last-child{color:#a45c53}.news-empty{min-height:140px;display:flex;align-items:center;justify-content:center;gap:8px;color:#859087;font-size:13px}.news-error{margin:14px 0;padding:12px;background:#fff0ee;color:#9b4840;font-size:12px}@media(max-width:650px){.news-page{padding:38px 18px 70px}.news-header{align-items:flex-start;flex-direction:column}.news-header h1{font-size:33px}.news-card{grid-template-columns:1fr}.news-card>img{height:200px}}`}</style>
  </main>
}
