'use client'

import { FormEvent, useEffect, useState } from 'react'
import { AlertTriangle, PackagePlus, Search, Trash2, Warehouse } from 'lucide-react'
import { farmAPI } from '@/lib/api'
import { useAuth } from '@/components/AuthProvider'

type Item = { id: number; name: string; category: string; quantity: string; unit: string; reorder_level: string; notes: string; is_low_stock: boolean; updated_at: string }
const emptyForm = { name: '', category: '', quantity: '', unit: 'units', reorder_level: '', notes: '' }

export default function InventoryPage() {
  const { user, isAuthenticated } = useAuth()
  const canEdit = ['admin', 'manager'].includes(user?.role || '')
  const [items, setItems] = useState<Item[]>([])
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    setLoading(true)
    try { setItems(await farmAPI.getInventory({ search: search || undefined, low_stock: lowOnly || undefined })) }
    catch (e: any) { setError(e.response?.data?.detail || 'Could not load farm inventory.') }
    finally { setLoading(false) }
  }
  useEffect(() => { if (isAuthenticated) load() }, [isAuthenticated, search, lowOnly])

  const createItem = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setNotice('')
    try { await farmAPI.createInventoryItem({ ...form, quantity: Number(form.quantity), reorder_level: Number(form.reorder_level || 0) }); setForm(emptyForm); setNotice('Inventory item added.'); await load() }
    catch (e: any) { setError(e.response?.data?.name?.[0] || e.response?.data?.detail || 'Could not save this item. Check that the name is unique.') }
  }
  const adjustQuantity = async (item: Item) => {
    const quantity = window.prompt(`Update ${item.name} quantity (${item.unit})`, item.quantity)
    if (quantity === null || quantity.trim() === '' || !Number.isFinite(Number(quantity))) return
    try { await farmAPI.updateInventoryItem(item.id, { quantity: Number(quantity) }); await load() }
    catch (e: any) { setError(e.response?.data?.detail || 'Could not update this item.') }
  }
  const deleteItem = async (item: Item) => {
    if (!window.confirm(`Remove ${item.name} from inventory?`)) return
    try { await farmAPI.deleteInventoryItem(item.id); await load() }
    catch (e: any) { setError(e.response?.data?.detail || 'Could not remove this item.') }
  }

  if (!isAuthenticated) return <div className="management-page"><h1>Farm inventory</h1><p>Please sign in to view the inventory.</p></div>
  const lowCount = items.filter(item => item.is_low_stock).length
  return <div className="management-page inventory-page">
    <div className="management-header"><div><div className="section-kicker">Farm operations</div><h1>Farm inventory</h1><p>Keep a clear view of supplies, stock levels and what needs attention.</p></div><div className="stock-pill"><Warehouse size={16} /> {items.length} items tracked</div></div>
    {error && <div className="notice error-notice">{error}</div>}{notice && <div className="notice success-notice">{notice}</div>}
    <div className="inventory-stats"><div><Warehouse size={20} /><span><small>Items shown</small><strong>{items.length}</strong></span></div><div className={lowCount ? 'low-stat' : ''}><AlertTriangle size={20} /><span><small>At reorder level</small><strong>{lowCount}</strong></span></div></div>
    <div className={`inventory-layout ${canEdit ? '' : 'read-only-layout'}`}>
      {canEdit && <section className="management-card"><div className="card-heading"><div><h2>Add an item</h2><p>Record farm supplies and reorder thresholds.</p></div><PackagePlus size={19} /></div><form className="management-form" onSubmit={createItem}><label>Item name<input required maxLength={160} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dairy meal" /></label><div className="form-split"><label>Category<input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Feed, veterinary…" /></label><label>Unit<input required value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="kg, bags, litres" /></label></div><div className="form-split"><label>Quantity<input type="number" min="0" step="0.01" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></label><label>Reorder level<input type="number" min="0" step="0.01" value={form.reorder_level} onChange={e => setForm({ ...form, reorder_level: e.target.value })} /></label></div><label>Notes <span className="optional-label">Optional</span><textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label><button className="solid-button" type="submit">Add to inventory <PackagePlus size={15} /></button></form></section>}
      <section className="management-card inventory-table-card"><div className="inventory-toolbar"><div className="card-heading"><div><h2>Stock on hand</h2><p>Current quantities and reorder status.</p></div></div><label className="search-box"><Search size={15} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory" /></label></div><label className="low-filter"><input type="checkbox" checked={lowOnly} onChange={e => setLowOnly(e.target.checked)} /> Show items at reorder level only</label>{loading ? <div className="empty-state">Loading inventory…</div> : items.length ? <div className="inventory-list">{items.map(item => <article className="inventory-row" key={item.id}><div className="item-symbol"><Warehouse size={17} /></div><div className="item-name"><strong>{item.name}</strong><small>{item.category || 'General'}{item.notes ? ` · ${item.notes}` : ''}</small></div><div className="item-quantity"><strong>{Number(item.quantity).toLocaleString()}</strong><small>{item.unit}</small></div><div className={`stock-status ${item.is_low_stock ? 'low' : 'in-stock'}`}>{item.is_low_stock ? 'Reorder' : 'In stock'}</div>{canEdit && <div className="item-actions"><button onClick={() => adjustQuantity(item)} title="Update quantity" className="adjust-button">Adjust</button><button onClick={() => deleteItem(item)} title="Remove item" className="delete-button"><Trash2 size={15} /></button></div>}</article>)}</div> : <div className="empty-state"><Warehouse size={22} />No inventory items match your search.</div>}</section>
    </div>
    <style jsx>{`
      .management-page{max-width:1160px;margin:0 auto;padding:58px 32px 100px;color:#18241c}.management-header{display:flex;justify-content:space-between;align-items:end;margin-bottom:28px}.management-header h1{font-size:42px;letter-spacing:-.04em;font-weight:500;margin:12px 0 7px}.management-header p,.card-heading p{font-size:13px;color:#758078;margin:0}.stock-pill{display:flex;align-items:center;gap:8px;color:#386c45;background:#edf5ed;border-radius:30px;padding:10px 14px;font-size:11px}.inventory-stats{display:flex;gap:12px;margin-bottom:18px}.inventory-stats>div{flex:1;display:flex;align-items:center;gap:13px;padding:17px 20px;border:1px solid #e7ece7;background:#f9fbf8;color:#4d8158}.inventory-stats .low-stat{color:#ae7d2a;background:#fcf8ee}.inventory-stats span,.inventory-stats small,.inventory-stats strong{display:block}.inventory-stats small{font-size:10px;color:#7a857c}.inventory-stats strong{margin-top:3px;color:#26342a;font-size:18px}.inventory-layout{display:grid;grid-template-columns:.78fr 1.22fr;gap:18px;align-items:start}.read-only-layout{grid-template-columns:1fr}.management-card{border:1px solid #e7ece7;background:white;padding:25px}.card-heading{display:flex;align-items:start;justify-content:space-between;color:#2e7d50}.card-heading h2{font-size:18px;font-weight:600;color:#223128;margin:0 0 7px}.card-heading p{font-size:11px}.management-form{display:flex;flex-direction:column;gap:15px;margin-top:22px}.management-form label{display:flex;flex-direction:column;gap:7px;color:#344239;font-size:11px;font-weight:600}.management-form input,.management-form textarea{width:100%;padding:10px 11px;border:1px solid #dfe6df;border-radius:3px;color:#26342a;font:inherit;font-weight:400;outline:none}.management-form input:focus,.management-form textarea:focus{border-color:#6d9f77;box-shadow:0 0 0 3px #2e7d5012}.management-form textarea{resize:vertical}.form-split{display:grid;grid-template-columns:1fr 1fr;gap:10px}.optional-label{color:#929b94;font-weight:400}.solid-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:41px;padding:0 15px;background:#2e7d50;border:0;border-radius:3px;color:white;font-size:11px;font-weight:600;cursor:pointer}.solid-button:hover{background:#205f3b}.inventory-toolbar{display:flex;justify-content:space-between;align-items:start;gap:15px}.search-box{display:flex;align-items:center;gap:7px;width:190px;padding:8px 10px;border:1px solid #e0e7e0;border-radius:3px;color:#829087}.search-box input{width:100%;border:0;outline:none;color:#344239;font-size:10px}.low-filter{display:flex;align-items:center;gap:8px;margin-top:21px;color:#748078;font-size:10px}.low-filter input{accent-color:#2e7d50}.inventory-list{margin-top:13px}.inventory-row{display:grid;grid-template-columns:34px minmax(90px,1fr) auto auto auto;align-items:center;gap:11px;padding:13px 0;border-top:1px solid #edf1ed}.item-symbol{width:31px;height:31px;display:grid;place-items:center;background:#edf4ed;color:#50825a;border-radius:50%}.item-name strong,.item-name small,.item-quantity strong,.item-quantity small{display:block}.item-name{min-width:0}.item-name strong{font-size:11px;color:#29362d}.item-name small{max-width:175px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:4px;color:#929b94;font-size:9px}.item-quantity{text-align:right}.item-quantity strong{font-size:12px;color:#29362d}.item-quantity small{margin-top:3px;color:#8c968e;font-size:9px}.stock-status{padding:5px 8px;border-radius:12px;font-size:9px;white-space:nowrap}.stock-status.low{background:#fbf2df;color:#9a7425}.stock-status.in-stock{background:#eaf4ea;color:#48764e}.item-actions{display:flex;gap:5px}.adjust-button,.delete-button{height:27px;border:1px solid #e1e8e1;border-radius:3px;background:white;color:#55735b;font-size:9px;cursor:pointer}.adjust-button{padding:0 8px}.delete-button{width:28px;display:grid;place-items:center;color:#a4645d}.empty-state{min-height:120px;display:flex;align-items:center;justify-content:center;gap:10px;color:#8a948c;font-size:12px}.notice{padding:12px 14px;margin-bottom:14px;border-radius:3px;font-size:12px}.error-notice{background:#fff0ee;color:#a3443d}.success-notice{background:#edf6ed;color:#386f44}@media(max-width:820px){.management-page{padding:42px 22px 70px}.inventory-layout{grid-template-columns:1fr}.management-header h1{font-size:35px}}@media(max-width:560px){.management-header{align-items:flex-start;flex-direction:column;gap:17px}.inventory-stats>div{padding:13px 10px;gap:8px}.inventory-stats small{font-size:8px}.inventory-toolbar{flex-direction:column}.search-box{width:100%}.management-card{padding:18px}.inventory-row{grid-template-columns:29px minmax(70px,1fr) auto auto;gap:7px}.item-actions{grid-column:2/-1;justify-self:end}.item-name small{max-width:120px}}
    `}</style>
  </div>
}
