import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const projects = [
  {
    tag: 'Climate Risk',
    title: 'Climate Fear Index',
    description: 'Interactive dashboard tracking climate risk sentiment across global markets and media coverage, with live data integration.',
    gradient: 'linear-gradient(135deg, #f56565 0%, #e74c3c 50%, #c0392b 100%)',
    link: '/dashboards/climate-fear-index',
  },
  {
    tag: 'Complexity Economics',
    title: 'Complexity Economics Explorer',
    description: 'Interactive concept explorer featuring attractor, tipping point, and feedback labs for modeling non-linear economic systems in real-time.',
    gradient: 'linear-gradient(135deg, #9b7bff 0%, #6c5ce7 50%, #5f3dc4 100%)',
    link: '/dashboards/complexity-economics',
  },
  {
    tag: 'Climate Insights',
    title: 'Antarctic Climate Change',
    description: 'Spatiotemporal analysis of Antarctic sea level variations utilizing three decades of satellite altimetry data.',
    gradient: 'linear-gradient(135deg, #36d6e7 0%, #22d3a7 50%, #1abc9c 100%)',
    link: '/dashboards/antarctic-climate-change',
  },
  {
    tag: 'Data Analytics',
    title: 'Data Mining Portfolio',
    description: 'Quantitative methodologies applied to climate and economic datasets, showcasing advanced analytical pipelines.',
    gradient: 'linear-gradient(135deg, #638cff 0%, #3498db 50%, #2980b9 100%)',
    link: '/dashboards/data-mining',
  },
]

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Projects() {
  return (
    <section className="section" id="projects">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Interactive Work</div>
          <h2 className="section-title">
            Research <span className="gradient-text">Dashboards & Tools</span>
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 'var(--space-12)' }}>
            Interactive data visualizations and analytical dashboards built to communicate complex research to diverse audiences.
          </p>
        </motion.div>

        <motion.div
          className="projects-grid"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {projects.map((project) => (
            <motion.div className="project-card glass-card" key={project.title} variants={cardVariants}>
              <Link to={project.link} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div
                  className="project-card-preview"
                  style={{ background: project.gradient }}
                >
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 21px)',
                  }} />
                  <div style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <ExternalLink size={20} color="white" />
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'rgba(255,255,255,0.7)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}>
                      Interactive Dashboard
                    </span>
                  </div>
                </div>
                <div className="project-card-body">
                  <div className="project-card-tag">{project.tag}</div>
                  <h3 className="project-card-title">{project.title}</h3>
                  <div className="project-card-desc">{project.description}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
