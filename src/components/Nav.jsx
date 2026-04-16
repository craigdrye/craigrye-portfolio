import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`} id="nav">
      <div className="nav-inner">
        <a className="nav-logo" href="#" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="nav-logo-dot" />
          Craig Rye
        </a>
        <ul className="nav-links" style={mobileOpen ? {
          display: 'flex', flexDirection: 'column', position: 'fixed',
          inset: 0, top: 'var(--nav-height)', background: 'var(--color-bg-primary)',
          padding: 'var(--space-8)', gap: 'var(--space-6)', zIndex: 999
        } : undefined}>
          <li className="nav-link" onClick={() => scrollTo('about')}>About</li>
          <li className="nav-link" onClick={() => scrollTo('experience')}>Experience</li>
          <li className="nav-link" onClick={() => scrollTo('publications')}>Publications</li>
          <li className="nav-link" onClick={() => scrollTo('expertise')}>Expertise</li>
          <li className="nav-link" onClick={() => scrollTo('projects')}>Projects</li>
          <li>
            <a className="nav-cta" href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact') }}>
              Get in Touch
            </a>
          </li>
        </ul>
        <button className="nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  )
}
