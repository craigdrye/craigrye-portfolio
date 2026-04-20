import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useTheme } from '../ThemeContext'
import ThemeToggle from './ThemeToggle'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Nav() {
  const { theme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle hash scrolling after navigation
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      window.scrollTo(0, 0)
    }
  }, [location])

  const handleNavClick = (hash) => {
    setMobileOpen(false)
    if (location.pathname !== '/') {
      navigate(`/${hash}`)
    } else {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      // Update URL hash without jumping
      window.history.pushState(null, '', `/${hash}`)
    }
  }

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`} id="nav">
      <div className="nav-inner">
        <Link className="nav-logo" to="/" onClick={() => window.scrollTo(0, 0)}>
          <span className="nav-logo-dot" />
          Craig Rye
        </Link>
        
        <ul className="nav-links" style={mobileOpen ? {
          display: 'flex', flexDirection: 'column', position: 'fixed',
          inset: 0, top: 'var(--nav-height)', background: 'var(--color-bg-primary)',
          padding: 'var(--space-8)', gap: 'var(--space-6)', zIndex: 999
        } : undefined}>
          
          <li className="nav-link" onClick={() => handleNavClick('#about')}>About</li>
          
          <li 
            className="nav-link dropdown-container" 
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Research Dashboards <ChevronDown size={14} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
            {dropdownOpen && (
              <div className="nav-dropdown">
                <div className="nav-dropdown-section">
                  <h4 className="nav-dropdown-title">Projects</h4>
                  <Link to="/dashboards/global-temperature-tracker" className="nav-dropdown-link" onClick={() => setMobileOpen(false)}>Global Temperature Tracker</Link>
                  <Link to="/dashboards/muni-risk-hub" className="nav-dropdown-link" onClick={() => setMobileOpen(false)}>Municipal Risk Tools</Link>
                  <Link to="/dashboards/climate-fear-index" className="nav-dropdown-link" onClick={() => setMobileOpen(false)}>Climate Fear Index</Link>
                  <Link to="/dashboards/data-mining" className="nav-dropdown-link" onClick={() => setMobileOpen(false)}>Data Mining</Link>
                  <Link to="/dashboards/muni-risk-hub" className="nav-dropdown-link" onClick={() => setMobileOpen(false)}>National Municipal Risk Hub</Link>
                </div>
                <div className="nav-dropdown-section">
                  <h4 className="nav-dropdown-title">Publications</h4>
                  <Link to="/dashboards/complexity-economics" className="nav-dropdown-link" onClick={() => setMobileOpen(false)}>Non-Linear Market Dynamics</Link>
                  <Link to="/dashboards/antarctic-climate-change" className="nav-dropdown-link" onClick={() => setMobileOpen(false)}>Antarctic Climate Dynamics</Link>
                </div>
              </div>
            )}
          </li>

          <li className="nav-link" onClick={() => handleNavClick('#experience')}>Experience</li>
          <li className="nav-link" onClick={() => handleNavClick('#publications')}>Publications</li>
          <li className="nav-link" onClick={() => handleNavClick('#projects')}>Projects</li>
          
          <li>
            <a className="nav-cta" href="#contact" onClick={(e) => { e.preventDefault(); handleNavClick('#contact') }}>
              Get in Touch
            </a>
          </li>
        </ul>

        <div className="nav-controls">
          <ThemeToggle />
          <button className="nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  )
}
