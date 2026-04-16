import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

const projects = [
  {
    tag: 'Climate Risk',
    title: 'Climate Fear Index',
    description: 'Interactive dashboard tracking climate risk sentiment across global markets and media coverage, with live data integration.',
    gradient: 'linear-gradient(135deg, #f56565 0%, #e74c3c 50%, #c0392b 100%)',
  },
  {
    tag: 'Complexity Economics',
    title: 'Complexity Economics Explorer',
    description: 'Interactive concept explorer featuring attractor, tipping point, and feedback labs for modeling non-linear economic systems in real-time.',
    gradient: 'linear-gradient(135deg, #9b7bff 0%, #6c5ce7 50%, #5f3dc4 100%)',
  },
  {
    tag: 'Political Analysis',
    title: 'Political Indexes Dashboard',
    description: 'Tracking and benchmarking political risk indexes across multiple economies with historical trend analysis.',
    gradient: 'linear-gradient(135deg, #638cff 0%, #3498db 50%, #2980b9 100%)',
  },
  {
    tag: 'Energy Transition',
    title: 'EW Costs vs Inflation',
    description: 'Analyzing extreme weather cost trajectories versus inflation dynamics — quantifying the growing financial burden of climate change.',
    gradient: 'linear-gradient(135deg, #f5a623 0%, #e67e22 50%, #d35400 100%)',
  },
  {
    tag: 'Media & Science',
    title: 'Science & Conspiracy Tracker',
    description: 'Monitoring cross-source media coverage of scientific topics versus conspiracy narratives with share-based normalization.',
    gradient: 'linear-gradient(135deg, #36d6e7 0%, #22d3a7 50%, #1abc9c 100%)',
  },
  {
    tag: 'Climate Projections',
    title: 'Global Temps to Projections',
    description: 'Visualizing observed global temperature records against IPCC projection scenarios — bridging historical data with future pathways.',
    gradient: 'linear-gradient(135deg, #e74c3c 0%, #9b59b6 50%, #3498db 100%)',
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
                <div className="project-card-title">{project.title}</div>
                <div className="project-card-desc">{project.description}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
