import React, { useEffect } from 'react'
import QuantHero from '../components/QuantHero'
import TechnicalStack from '../components/TechnicalStack'
import Projects from '../components/Projects'
import Publications from '../components/Publications'
import Experience from '../components/Experience'
import Contact from '../components/Contact'

export default function Quant() {
  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0)
    // Update theme to analytical if not already (optional but adds flavor)
    document.body.classList.add('style-analytical')
    return () => document.body.classList.remove('style-analytical')
  }, [])

  return (
    <main className="quant-page">
      <QuantHero />
      <TechnicalStack />
      <Projects title="Technical Dashboards" filter="technical" />
      <Experience />
      <Publications />
      <Contact title="Quant Inquiry" />
    </main>
  )
}
