import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Play, Activity } from 'lucide-react'

export default function Highlights() {
  return (
    <section className="section" id="highlights" style={{ paddingTop: 'var(--space-4)', paddingBottom: 0 }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title" style={{ marginBottom: 'var(--space-8)' }}>
            Interactive <span className="gradient-text">pages</span>
          </h2>
        </motion.div>

        <div className="highlights-grid">
          {/* Climate Fear Index Highlight */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/dashboards/climate-fear-index" className="highlight-card">
              <div className="highlight-visual">
                <img 
                  src="/projects/climate-fear-index/assets/climate_fear_index_thumb.png" 
                  alt="Climate Fear Index Data Visualization"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="highlight-overlay"></div>
              </div>
              <div className="highlight-content">
                <span className="highlight-tag">
                  <Activity size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Market Analytics
                </span>
                <h3 className="highlight-title">Climate Fear Index</h3>
                <p className="highlight-desc">
                  Quantitative monitoring of climate risk sentiment within global capital markets and diversified media sources.
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Antarctica SLR Highlight */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/dashboards/antarctic-climate-change" className="highlight-card">
              <div className="highlight-visual">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  poster="/projects/antarctic-climate-change/assets/preview.jpg"
                >
                  <source src="/projects/antarctic-climate-change/antarctic_ssh_93_24_v4.mp4" type="video/mp4" />
                </video>
                <div className="highlight-overlay"></div>
              </div>
              <div className="highlight-content">
                <span className="highlight-tag">
                  <Play size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  CLIMATE INSIGHTS
                </span>
                <h3 className="highlight-title">Antarctic Sea Level Rise</h3>
                <p className="highlight-desc">
                  Spatiotemporal analysis of Antarctic sea level variations utilizing three decades of satellite altimetry data.
                </p>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
