'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ImagePlus, Pencil, Trash2 } from 'lucide-react'
import { galleryAPI } from '@/lib/api'
import { useAuth } from '@/components/AuthProvider'

type GalleryImage = { id: number; image: string; caption: string }
export default function GalleryPage() {
  const { user } = useAuth()
  const canManage = ['admin', 'manager'].includes(user?.role || '')
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    try { setImages(await galleryAPI.getImages()) }
    catch { setError('Could not load gallery images.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])
  const updateCaption = async (image: GalleryImage) => {
    const caption = window.prompt('Update image caption', image.caption || '')
    if (caption === null) return
    const form = new FormData(); form.append('caption', caption)
    try { await galleryAPI.updateImage(image.id, form); await load() }
    catch (e: any) { setError(e.response?.data?.detail || 'Could not update image caption.') }
  }
  const deleteImage = async (image: GalleryImage) => {
    if (!window.confirm('Delete this gallery image?')) return
    try { await galleryAPI.deleteImage(image.id); await load() }
    catch (e: any) { setError(e.response?.data?.detail || 'Could not delete image.') }
  }
  return <main className="gallery-page"><header className="gallery-header"><div><span className="gallery-kicker">Life at Sidai Enkop</span><h1>Farm gallery</h1><p>Moments from the ranch, our animals and our team.</p></div>{canManage && <Link href="/gallery/create" className="gallery-add"><ImagePlus size={16} /> Upload image</Link>}</header>{error && <div className="gallery-error">{error}</div>}{loading ? <p className="gallery-empty">Loading gallery…</p> : images.length ? <div className="gallery-grid">{images.map(image => <article className="gallery-item" key={image.id}><img src={image.image} alt={image.caption || 'Sidai Enkop farm'} /><div className="gallery-caption"><span>{image.caption || 'Sidai Enkop Ranch'}</span>{canManage && <div><button onClick={() => updateCaption(image)} aria-label="Edit caption"><Pencil size={14} /></button><button onClick={() => deleteImage(image)} aria-label="Delete image"><Trash2 size={14} /></button></div>}</div></article>)}</div> : <p className="gallery-empty">No gallery images have been added yet.</p>}
    <style jsx>{`.gallery-page{max-width:1160px;margin:0 auto;padding:56px 30px 100px;color:#1d2a21}.gallery-header{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:28px}.gallery-kicker{color:#568060;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.gallery-header h1{margin:9px 0 6px;font-size:40px;font-weight:500;letter-spacing:-.04em}.gallery-header p{margin:0;color:#7d887f;font-size:13px}.gallery-add{display:flex;align-items:center;gap:8px;padding:12px 15px;border-radius:4px;background:#2e7d50;color:#fff;text-decoration:none;font-size:12px}.gallery-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.gallery-item{overflow:hidden;border:1px solid #e6ece6;border-radius:6px;background:white}.gallery-item img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}.gallery-caption{display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:48px;padding:10px 12px;color:#344239;font-size:12px}.gallery-caption>div{display:flex;gap:5px}.gallery-caption button{width:28px;height:28px;display:grid;place-items:center;border:1px solid #e4eae4;border-radius:4px;background:#fff;color:#4d7953;cursor:pointer}.gallery-caption button:last-child{color:#a45c53}.gallery-empty{min-height:140px;display:grid;place-items:center;color:#859087;font-size:13px}.gallery-error{margin:14px 0;padding:12px;background:#fff0ee;color:#9b4840;font-size:12px}@media(max-width:760px){.gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:540px){.gallery-page{padding:38px 18px 70px}.gallery-header{align-items:flex-start;flex-direction:column}.gallery-header h1{font-size:33px}.gallery-grid{grid-template-columns:1fr}}`}</style>
  </main>
}
