import { motion } from 'framer-motion'
import { FileDown, Cpu, Database, BarChart3 } from 'lucide-react'

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
              <strong>Extracting alpha from non-linear global datasets.</strong> #1-ranked institutional 
              research analyst applying a decade of NASA/MIT numerical modeling to build proprietary signal 
              frameworks and data products. The same methods that govern climate systems — stochastic processes, 
              regime detection, Monte Carlo simulation — drive systematic trading strategies.
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
                <div className="hero-stat-label">Sustainable<br/>Investing (2025)</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">5+</div>
                <div className="hero-stat-label">Proprietary Signal<br/>Frameworks</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">350+</div>
                <div className="hero-stat-label">Academic<br/>Citations</div>
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
                <FileDown size={18} /> Download CV
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
