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
      <div className="hero-glow-1" />
      <div className="hero-glow-2" />

      <div className="container hero-content">
        <div className="hero-text">
          <motion.div
            className="hero-badge"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <span className="hero-badge-dot" />
            #1 Ranked — Institutional Investor Survey 2025
          </motion.div>

          <motion.h1
            className="hero-name"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            Dr. Craig<br />
            <span className="gradient-text">D. Rye</span>
          </motion.h1>

          <motion.p
            className="hero-title"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            Climate scientist and quantitative researcher bridging{' '}
            <strong>physical climate risk</strong>, <strong>energy transition economics</strong>,
            and <strong>institutional finance</strong>. From modeling Antarctic ice sheets at
            NASA to pricing wildfire risk on Wall Street.
          </motion.p>

          <motion.div
            className="hero-stats"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <div className="hero-stat">
              <div className="hero-stat-value">459+</div>
              <div className="hero-stat-label">Citations</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">5</div>
              <div className="hero-stat-label">Lead Publications</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">60+</div>
              <div className="hero-stat-label">Reports / Year</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">5,000+</div>
              <div className="hero-stat-label">Clients Reached</div>
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
            className="hero-photo-wrapper"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          >
            {/* Decorative rings behind the photo */}
            <div className="hero-photo-ring hero-photo-ring-1" />
            <div className="hero-photo-ring hero-photo-ring-2" />
            <div className="hero-photo-ring hero-photo-ring-3" />

            {/* Photo container */}
            <div className="hero-photo-container">
              <img
                src="/images/headshot.jpg"
                alt="Dr. Craig D. Rye"
                className="hero-photo"
              />
              <div className="hero-photo-gradient-border" />
            </div>

            {/* Floating institution badges around photo */}
            <motion.div
              className="hero-float-badge"
              style={{ top: '5%', right: '-15%' }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="hero-float-badge-icon">🚀</span>
              <span className="hero-float-badge-label">NASA</span>
            </motion.div>

            <motion.div
              className="hero-float-badge"
              style={{ bottom: '15%', right: '-20%' }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <span className="hero-float-badge-icon">📊</span>
              <span className="hero-float-badge-label">Barclays</span>
            </motion.div>

            <motion.div
              className="hero-float-badge"
              style={{ bottom: '5%', left: '-15%' }}
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <span className="hero-float-badge-icon">🎓</span>
              <span className="hero-float-badge-label">MIT</span>
            </motion.div>

            <motion.div
              className="hero-float-badge"
              style={{ top: '10%', left: '-18%' }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
            >
              <span className="hero-float-badge-icon">🌍</span>
              <span className="hero-float-badge-label">Columbia</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
