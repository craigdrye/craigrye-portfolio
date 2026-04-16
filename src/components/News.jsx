import { motion } from 'framer-motion'
import { ExternalLink, Mic, Award } from 'lucide-react'

const newsItems = [
  {
    year: '2026',
    title: 'Catalyst 2026: The Future of Climate Finance',
    description: 'Speaking at Columbia University — a conference on the future of climate finance and sustainability investing.',
    color: 'var(--color-accent-teal)',
    icon: <Mic size={18} />,
    type: 'Speaking',
    link: null,
  },
  {
    year: '2025',
    title: '#1 Ranked — Institutional Investor Global FICC Survey',
    description: 'Ranked #1 personally and #1 as team in Sustainable Investing in the 2025 Institutional Investor (Extel) Global FICC Survey.',
    color: 'var(--color-accent-amber)',
    icon: <Award size={18} />,
    type: 'Award',
    link: null,
  },
  {
    year: '2024',
    title: '#3 Ranked — Institutional Investor Global FICC Survey',
    description: 'Ranked #3 personally and #3 as team in Sustainable Investing — the foundation for a #1 finish the following year.',
    color: 'var(--color-accent-amber)',
    icon: <Award size={18} />,
    type: 'Award',
    link: null,
  },
  {
    year: '2020',
    title: 'MIT News — Southern Ocean cooling research',
    description: 'Research on Antarctic glacial melt as a driver of recent Southern Ocean climate trends featured by MIT News.',
    color: 'var(--color-accent-rose)',
    icon: <ExternalLink size={18} />,
    type: 'Press',
    link: 'https://news.mit.edu/2020/melting-glaciers-cool-southern-ocean-0517',
  },
  {
    year: '2014',
    title: 'BBC News — Antarctic sea level rise',
    description: 'Lead-authored Nature Geoscience paper on rapid sea-level rise along Antarctic margins cited by BBC News.',
    color: 'var(--color-accent-blue)',
    icon: <ExternalLink size={18} />,
    type: 'Press',
    link: 'https://www.bbc.com/news/science-environment-29012501',
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

export default function News() {
  return (
    <section className="section" id="news">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Recognition</div>
          <h2 className="section-title">
            In the <span className="gradient-text">News & Rankings</span>
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 'var(--space-12)' }}>
            Featured in BBC News, MIT News, and ranked #1 by institutional investors worldwide.
          </p>
        </motion.div>

        <motion.div
          className="news-grid"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {newsItems.map((item) => {
            const CardWrapper = item.link ? 'a' : 'div'
            const linkProps = item.link
              ? { href: item.link, target: '_blank', rel: 'noopener noreferrer', style: { textDecoration: 'none', color: 'inherit' } }
              : {}

            return (
              <motion.div key={item.title} variants={cardVariants}>
                <CardWrapper {...linkProps}>
                  <div className="news-card glass-card">
                    <div className="news-year" style={{ WebkitTextStrokeColor: item.color }}>{item.year}</div>
                    <div className="news-content">
                      <div className="news-type-badge" style={{ color: item.color, background: `color-mix(in srgb, ${item.color} 12%, transparent)` }}>
                        {item.icon}
                        <span>{item.type}</span>
                      </div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                      {item.link && (
                        <span className="news-read-more" style={{ color: item.color }}>
                          Read article →
                        </span>
                      )}
                    </div>
                  </div>
                </CardWrapper>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
