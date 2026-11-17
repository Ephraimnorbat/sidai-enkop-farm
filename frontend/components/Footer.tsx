'use client'

import Link from 'next/link'
import { ArrowUpRight, Leaf, MapPin, Mail, Phone } from 'lucide-react'
import { useAuth } from './AuthProvider'

const menu = [
  { label: 'Home', href: '/' },
  { label: 'About the ranch', href: '/#about' },
  { label: 'Our products & work', href: '/#products' },
  { label: 'Gallery', href: '/#gallery' },
  { label: 'Contact', href: '/contact' },
]

export function Footer() {
  const { isAuthenticated } = useAuth()

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-about">
          <Link href="/" className="footer-brand-lockup">
            <span className="footer-brand-mark"><Leaf size={18} /></span>
            <span>SIDAI <b>ENKOP</b><small>RANCH · ISINYA</small></span>
          </Link>
          <p>Rooted in the land, growing with care. Visit us in Isinya, Kitengela.</p>
        </div>

        <div className="footer-column">
          <h2>Explore</h2>
          <nav aria-label="Footer menu">
            {menu.map(item => <Link href={item.href} key={item.label}>{item.label}</Link>)}
            {isAuthenticated && <><Link href="/staff-tasks">Daily tasks</Link><Link href="/inventory">Farm inventory</Link></>}
          </nav>
        </div>

        <div className="footer-column footer-contact">
          <h2>Get in touch</h2>
          <a href="tel:+254712345678"><Phone size={15} /><span>0745-133-345</span><ArrowUpRight size={13} className="contact-arrow" /></a>
          <a href="mailto:info@sidaienkopranch.com"><Mail size={15} /><span>info@sidaienkopranch.com</span><ArrowUpRight size={13} className="contact-arrow" /></a>
          <a href="https://maps.google.com/?q=Isinya%2C+Kitengela" target="_blank" rel="noreferrer"><MapPin size={15} /><span>Isinya, Kitengela</span><ArrowUpRight size={13} className="contact-arrow" /></a>
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Sidai Enkop Ranch</span><span>Made with care in Isinya, Kenya</span><Link href="#top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</Link></div>
    </footer>
  )
}
