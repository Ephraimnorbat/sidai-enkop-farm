'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { ArrowRight, Leaf, LogOut, Menu, X } from 'lucide-react'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const links = [{ label: 'Our story', href: '/#about' }, { label: 'Our work', href: '/#products' }, { label: 'Gallery', href: '/#gallery' }, { label: 'Contact', href: '/contact' }]

  return <header className="site-nav"><div className="nav-inner">
    <Link href="/" className="brand-lockup" onClick={close}><span className="brand-mark"><Leaf size={18} /></span><span>SIDAI <b>ENKOP</b><small>RANCH · ISINYA</small></span></Link>
    <nav className={`nav-links ${open ? 'nav-open' : ''}`} aria-label="Main navigation">{links.map(link => <Link key={link.href} href={link.href} onClick={close}>{link.label}</Link>)}{isAuthenticated && <><Link href="/dashboard" onClick={close}>Dashboard</Link><Link href="/staff-tasks" onClick={close}>Daily tasks</Link><Link href="/inventory" onClick={close}>Inventory</Link></>}</nav>
    <div className="nav-actions">{isAuthenticated ? <><span className="nav-user">{user?.first_name || user?.username}</span><button className="nav-login" onClick={logout} aria-label="Log out"><LogOut size={16} /></button></> : <><Link href="/auth/login" className="nav-login">Staff login</Link><Link href="/contact" className="nav-visit">Visit the ranch <ArrowRight size={15} /></Link></>}<button className="nav-toggle" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button></div>
  </div></header>
}
