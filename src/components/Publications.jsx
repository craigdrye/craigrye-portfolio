import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

const publications = [
  {
    journal: 'Nature Geoscience',
    title: 'Rapid sea-level rise along the Antarctic margins in response to increased glacial discharge',
    authors: 'Rye et al.',
    year: 2014,
    citations: 118,
    color: '#e74c3c',
  },
  {
    journal: 'Geophys. Res. Letters',
    title: 'Antarctic glacial melt as a driver of recent Southern Ocean climate trends',
    authors: 'Rye et al.',
    year: 2020,
    citations: 79,
    color: '#3498db',
  },
  {
    journal: 'Energy Policy',
    title: 'A review of EROEI-dynamics energy-transition models',
    authors: 'Rye & Jackson',
    year: 2018,
    citations: 64,
    color: '#2ecc71',
  },
  {
    journal: 'Nature Sci. Reports',
    title: 'Using critical slowing down indicators to understand economic growth rate variability and secular stagnation',
    authors: 'Rye & Jackson',
    year: 2020,
    citations: 21,
    color: '#9b59b6',
  },
  {
    journal: 'Geophys. Res. Letters',
    title: 'Diapycnal diffusivities from a tracer release experiment in the deep sea, integrated over 13 years',
    authors: 'Rye et al.',
    year: 2012,
    citations: 12,
    color: '#3498db',
  },
]

const contributing = [
  { journal: 'Journal of Climate', year: 2023, citations: 52, authors: 'Li, Marshall, Rye et al.' },
  { journal: 'Geophys. Res. Letters', year: 2023, citations: 35, authors: 'Schmidt, Romanou, Rye et al.' },
  { journal: 'Geophys. Res. Letters', year: 2013, citations: 61, authors: 'Couldrey, Naveira Garabato, Rye et al.' },
  { journal: 'J. Phys. Oceanography', year: 2021, citations: 6, authors: 'Arnscheidt, Marshall, Rye et al.' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Publications() {
  const totalCitations = 459
  const hIndex = 8

  return (
    <section className="section" id="publications">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Research</div>
          <h2 className="section-title">
            Published in <span className="gradient-text">Nature, GRL & Energy Policy</span>
          </h2>
          <p className="section-subtitle">
            {totalCitations} total citations · h-index {hIndex} · 5 lead-authored publications across top-tier journals.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
            <a
              href="https://scholar.google.com/citations?user=Z8_VQ4wAAAAJ"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              <ExternalLink size={14} /> Google Scholar
            </a>
          </div>
        </motion.div>

        <motion.div
          className="publications-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {publications.map((pub) => (
            <motion.div className="pub-card glass-card" key={pub.title} variants={cardVariants}>
              <span className="pub-journal" style={{ color: pub.color, background: `${pub.color}18`, borderColor: `${pub.color}30` }}>
                {pub.journal}
              </span>
              <div className="pub-info">
                <div className="pub-title">{pub.title}</div>
                <div className="pub-authors">{pub.authors} ({pub.year})</div>
              </div>
              <div className="pub-citations">
                <span className="pub-citations-count">{pub.citations}</span>
                <span className="pub-citations-label">citations</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          style={{ marginTop: 'var(--space-10)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
            Contributing Author
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {contributing.map((c) => (
              <div
                key={c.authors + c.year}
                style={{
                  background: 'var(--color-bg-glass)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{c.journal}</span>
                {' '} — {c.authors} ({c.year})
                <span style={{ marginLeft: 'var(--space-2)', color: 'var(--color-accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                  {c.citations} cit.
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
