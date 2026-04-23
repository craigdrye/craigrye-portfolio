import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const projects = [
  {
    tag: 'Climate Analytics',
    title: 'Global Temperature Tracker',
    description: "It's getting hot in hear? Tracking global temperature anomalies against climate models with near-term outlooks from the leading climate researchers.",
    media: { type: 'image', src: '/images/projects/global_temp.png' },
    link: '/dashboards/global-temperature-tracker',
  },
  {
    tag: 'Municipal Finance',
    title: 'Municipal Risk Tools',
    description: 'Mapping the trends in Muni bond returns and extreme weather risks',
    media: { type: 'image', src: '/images/projects/muni_hub.png' },
    link: '/dashboards/muni-risk-hub',
  },
  {
    tag: 'Climate Risk',
    title: 'Climate Fear Index',
    description: 'This real-time tracker follows global media climate sentiment and physical climate indicators.',
    media: { type: 'image', src: '/images/projects/climate_fear.png' },
    link: '/dashboards/climate-fear-index',
  },
  {
    tag: 'Data Analytics',
    title: 'Data Mining',
    description: 'Sifting through a range of social datasets for market connections.',
    media: { type: 'image', src: '/images/projects/data_mining.png' },
    link: '/dashboards/data-mining',
  },
  {
    tag: 'Complexity Economics',
    title: 'Non-Linear Market Dynamics',
    description: 'Research on the non-linear physics behind economic tipping points, published in Nature Scientific Reports.',
    media: { type: 'image', src: '/images/projects/complexity.png' },
    link: '/dashboards/complexity-economics',
  },
  {
    tag: 'Climate Insights',
    title: 'Antarctic Climate Dynamics',
    description: "Visualizing three decades of satellite data to reveal the drivers of Antarctic climate dynamics, as published in Nature Geoscience.",
    media: { type: 'video', src: '/projects/antarctic-climate-change/antarctic_ssh_93_24_v4.mp4', poster: '/projects/antarctic-climate-change/assets/preview.jpg' },
    link: '/dashboards/antarctic-climate-change',
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
          <div className="section-label">Applied Research</div>
          <h2 className="section-title">
            Research <span className="gradient-text">Dashboards & Tools</span>
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 'var(--space-12)' }}>
            Homegrown interactive dashboards, connecting climate science, quantitative methods, and financial data.
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
                  <div className="project-card-preview">
                    {project.media.type === 'video' ? (
                      <video 
                        autoPlay loop muted playsInline 
                        poster={project.media.poster}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      >
                        <source src={project.media.src} type="video/mp4" />
                      </video>
                    ) : (
                      <img 
                        src={project.media.src} 
                        alt={project.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    <div className="project-card-overlay">
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
