import { motion } from 'framer-motion'
import { ArrowDown, Mail, Link2, FileDown } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg-grid" />
      
      <div className="container hero-content">
        <div className="hero-text">
          <motion.h1
            className="hero-name"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            Craig<br />
            <span className="hero-surname">D. Rye</span>
          </motion.h1>

          <motion.p
            className="hero-title"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            #1-ranked institutional research analyst (Institutional Investor) bridging{' '}
            <strong>quantitative climate risk</strong>, <strong>energy transition economics</strong>,
            and <strong>global macro</strong>. A decade of scientific training at NASA, MIT,
            and Columbia.
          </motion.p>

          <motion.div
            className="hero-stats"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <div className="hero-stat">
              <div className="hero-stat-value">#1</div>
              <div className="hero-stat-label">II FICC<br/>Ranking</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">459+</div>
              <div className="hero-stat-label">Citations</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">8+</div>
              <div className="hero-stat-label">Leading Pubs (Nature,<br/>GRL & Energy Policy)</div>
            </div>
          </motion.div>

          <motion.div
            className="hero-actions"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
          >
            <a className="btn-primary" href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}>
              <Mail size={16} /> Get in Touch
            </a>
            <a className="btn-secondary" href="https://linkedin.com/in/cdrye" target="_blank" rel="noopener noreferrer">
              <Link2 size={16} /> LinkedIn
            </a>
            <a className="btn-secondary" href="/Craig_Rye_CV.pdf" download>
              <FileDown size={16} /> Download CV
            </a>
          </motion.div>
        </div>

        <div className="hero-visual">
          <motion.div
            className="hero-photo-outer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          >
            <div className="hero-photo-frame">
              <img
                src="/images/headshot.jpg"
                alt="Dr. Craig D. Rye - Institutional Quantitative Researcher and Climate Scientist"
                className="hero-photo"
              />
            </div>
            
            <div className="hero-institutions-grid">
              <div className="hero-inst-tag">Barclays</div>
              <div className="hero-inst-tag">NASA</div>
              <div className="hero-inst-tag">MIT</div>
              <div className="hero-inst-tag">Columbia</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
