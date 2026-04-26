import { motion } from 'framer-motion'
import { FileDown, Terminal, Cpu, Database, BarChart3 } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function QuantHero() {
  return (
    <section className="quant-hero">
      <div className="hero-bg-grid" />
      <div className="quant-hero-glow" />
      
      <div className="container">
        <div className="quant-hero-content">
          <div className="quant-hero-text">
            <motion.div 
              className="quant-badge"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
            >
              <Terminal size={14} /> <span>Quantitative Research & Signal Extraction</span>
            </motion.div>

            <motion.h1
              className="quant-title"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
            >
              Craig<br />
              <span className="gradient-text">D. Rye</span>
            </motion.h1>

            <motion.p
              className="quant-lead"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              <strong>Bridging physical science & capital markets.</strong> #1-ranked institutional research analyst 
              utilizing a decade of NASA/MIT scientific modeling background to extract alpha from complex, 
              non-linear global datasets. Specializing in climate risk, energy volatility, and macro-econometric modeling.
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
                <div className="hero-stat-label">II Sustainable<br/>Investing (2025)</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">10Y</div>
                <div className="hero-stat-label">Numerical Model<br/>Development</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">PB+</div>
                <div className="hero-stat-label">Geospatial Data<br/>Analytics</div>
              </div>
            </motion.div>

            <motion.div
              className="quant-actions"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={4}
            >
              <a href="/Craig_Rye_CV.pdf" download className="btn-primary">
                <FileDown size={18} /> Download Quant CV
              </a>
              <a href="#modeling" className="btn-secondary">
                View Modeling Stack
              </a>
            </motion.div>
          </div>

          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className="hero-photo-outer">
              <div className="hero-photo-frame">
                <img
                  src="/images/headshot.jpg"
                  alt="Dr. Craig D. Rye - Quantitative Researcher"
                  className="hero-photo"
                />
              </div>
              
              <div className="hero-institutions-grid">
                <div className="hero-inst-tag">Barclays</div>
                <div className="hero-inst-tag">NASA</div>
                <div className="hero-inst-tag">MIT</div>
                <div className="hero-inst-tag">Columbia</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
