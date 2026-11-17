'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowDownRight, ArrowRight, Leaf, MapPin, Milk, Sprout, Users, Warehouse } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { farmAPI, galleryAPI } from '@/lib/api'

type GalleryImage = { id: number; image: string; caption?: string }

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [inventoryCount, setInventoryCount] = useState<number | null>(null)
  const [taskCount, setTaskCount] = useState<number | null>(null)

  useEffect(() => {
    galleryAPI.getImages().then((images) => setGallery(images.slice(0, 4))).catch(() => {})
    if (isAuthenticated) {
      farmAPI.getInventory().then((items) => setInventoryCount(items.length)).catch(() => {})
      farmAPI.getTasks().then((tasks) => setTaskCount(tasks.length)).catch(() => {})
    }
  }, [isAuthenticated])

  const isManager = ['admin', 'manager'].includes(user?.role || '')
  const featureCards = [
    { icon: Sprout, title: 'Thoughtful farming', body: 'A practical, land-aware approach to the daily work of caring for a farm.' },
    { icon: Milk, title: 'Livestock & produce', body: 'Explore the animals, products and work that make Sidai Enkop unique.' },
    { icon: Users, title: 'People at the heart', body: 'Our team brings consistency, care and local knowledge to every season.' },
  ]

  return (
    <div className="home-page">
      <section className="hero-banner" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> Isinya · Kitengela, Kenya</span>
          <h1 id="hero-title">Rooted in the land.<br /><em>Growing with care.</em></h1>
          <p>Welcome to Sidai Enkop Ranch, where a respect for the land guides the way we farm, care for our animals and grow together.</p>
          <div className="hero-actions">
            <Link href="#about" className="button button-primary">Discover our ranch <ArrowRight size={17} /></Link>
            <Link href="/contact" className="button button-quiet">Plan a visit <ArrowDownRight size={17} /></Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-sun" />
          <div className="hero-field field-back" />
          <div className="hero-field field-mid" />
          <div className="hero-field field-front" />
          <div className="hero-art-label"><Leaf size={16} /> A little closer to nature</div>
          <div className="hero-number">01 <span>—</span> 03</div>
        </div>
        <a href="#about" className="scroll-cue" aria-label="Scroll to about us"><span /> Scroll to explore</a>
      </section>

      <section className="intro-section content-section" id="about">
        <div className="section-kicker">About the ranch</div>
        <div className="intro-grid">
          <h2>Good farming starts<br />with <em>good care.</em></h2>
          <div className="intro-copy"><p>At Sidai Enkop, our work is grounded in a simple belief: the health of our animals, our land and our community belong together.</p><Link href="/about" className="text-link">More about our story <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className="values-section content-section" id="products">
        <div className="section-heading"><div><div className="section-kicker">Our products & work</div><h2>Made for the long run.</h2></div><span className="section-note">Care in every part of the work.</span></div>
        <div className="value-grid">{featureCards.map(({ icon: Icon, title, body }, index) => <article className="value-card" key={title}><span className="value-index">0{index + 1}</span><div className="value-icon"><Icon size={22} strokeWidth={1.6} /></div><h3>{title}</h3><p>{body}</p><span className="value-line" /></article>)}</div>
      </section>

      <section className="visit-band">
        <div><div className="section-kicker">Come say hello</div><h2>Experience the ranch<br />for yourself.</h2><p>Get in touch to learn more or arrange a visit to Sidai Enkop.</p><Link href="/contact" className="button button-light">Get in touch <ArrowRight size={17} /></Link></div>
        <div className="visit-mark" aria-hidden="true"><MapPin size={26} /><span>01° 37′ S<br />36° 52′ E</span></div>
      </section>

      <section className="gallery-section content-section" id="gallery">
        <div className="section-heading"><div><div className="section-kicker">Gallery · scenes from the ranch</div><h2>A closer look.</h2></div><Link href="/gallery" className="text-link">Explore the gallery <ArrowRight size={16} /></Link></div>
        {gallery.length ? <div className="home-gallery">{gallery.map((image, i) => <Link href="/gallery" className={`gallery-tile gallery-tile-${i + 1}`} key={image.id}><img src={image.image} alt={image.caption || 'Life at Sidai Enkop Ranch'} /><span>{image.caption || 'Life at the ranch'}</span></Link>)}</div> : <div className="gallery-empty"><Leaf size={26} /><span>Stories from the ranch will be here soon.</span></div>}
      </section>

      {isAuthenticated && <section className="staff-shortcuts content-section"><div className="section-heading"><div><div className="section-kicker">Farm operations</div><h2>Good work, well organized.</h2></div></div><div className="shortcut-grid"><Link href="/staff-tasks" className="shortcut-card"><Users size={21} /><span><strong>Daily tasks</strong><small>{taskCount === null ? 'Open your task log' : `${taskCount} task${taskCount === 1 ? '' : 's'} in your log`}</small></span><ArrowRight size={17} /></Link><Link href="/inventory" className="shortcut-card"><Warehouse size={21} /><span><strong>Farm inventory</strong><small>{inventoryCount === null ? 'View supplies & stock' : `${inventoryCount} items tracked`}</small></span><ArrowRight size={17} /></Link>{isManager && <Link href="/staff-tasks?view=performance" className="shortcut-card"><Sprout size={21} /><span><strong>Team performance</strong><small>Review task completion by staff</small></span><ArrowRight size={17} /></Link>}</div></section>}

    </div>
  )
}
