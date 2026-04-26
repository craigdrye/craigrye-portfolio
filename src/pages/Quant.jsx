import React, { useEffect } from 'react'
import { useTheme } from '../ThemeContext'
import QuantHero from '../components/QuantHero'
import TechnicalStack from '../components/TechnicalStack'
import Projects from '../components/Projects'
import Publications from '../components/Publications'
import Experience from '../components/Experience'
import Contact from '../components/Contact'
import SignalExtraction from '../components/SignalExtraction'

export default function Quant() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0)
    // Store original theme to restore on unmount
    const originalTheme = theme
    // Force dark mode for quant audience (Bloomberg-terminal aesthetic)
    setTheme('dark')
    // Update theme to analytical
    document.body.classList.add('style-analytical')
    return () => {
      document.body.classList.remove('style-analytical')
      setTheme(originalTheme)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="quant-page">
      <QuantHero />
      <TechnicalStack />
      <SignalExtraction />
      <Projects title="Research Dashboards" filter="technical" />
      <Experience />
      <Publications />
      <Contact />
    </main>
  )
}
