import { motion } from 'framer-motion'
import {
  Thermometer, TrendingUp, Database,
  Brain, Globe, BarChart3
} from 'lucide-react'

const skills = [
  {
    icon: <Thermometer size={24} />,
    title: 'Physical Climate Risk',
    description: 'Extreme weather, heat stress, wildfire, hurricane, and sea level risk analysis across credit and equity markets.',
    tags: ['TCFD', 'SASB', 'NGFS', 'Scenario Analysis'],
    color: 'var(--color-accent-rose)',
  },
  {
    icon: <TrendingUp size={24} />,
    title: 'Energy Transition',
    description: 'Integrated assessment modeling (IAM), EROEI dynamics, emissions pathway analysis, and direct air capture (DAC) economics.',
    tags: ['IAM', 'EROEI', 'DAC', 'Net Zero'],
    color: 'var(--color-accent-teal)',
  },
  {
    icon: <Database size={24} />,
    title: 'Data Products & Pipelines',
    description: 'Proprietary data frameworks integrating climate model outputs, reanalysis datasets, and financial data at institutional scale.',
    tags: ['ERA-Interim', 'xarray', 'geopandas', 'KPIs'],
    color: 'var(--color-accent-blue)',
  },
  {
    icon: <Brain size={24} />,
    title: 'Machine Learning & Quant',
    description: 'Tree-based climate alpha strategies, LLM-driven ensemble frameworks, and critical slowing down indicators for macro regimes.',
    tags: ['Gradient Boosting', 'Random Forests', 'LLM', 'Ensemble'],
    color: 'var(--color-accent-purple)',
  },
  {
    icon: <Globe size={24} />,
    title: 'Scientific Computing',
    description: 'Global climate model development (NASA GCMs), high-performance computing, and high-dimensional numerical simulation.',
    tags: ['Python', 'Fortran', 'Matlab', 'HPC'],
    color: 'var(--color-accent-cyan)',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Institutional Research',
    description: '60+ sole-authored reports per year. Bi-weekly client presentations, US & European roadshows for 200+ institutional accounts.',
    tags: ['Fixed Income', 'Equity', 'ESG', 'Cross-Asset'],
    color: 'var(--color-accent-amber)',
  },
]

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Skills() {
  return (
    <section className="section" id="expertise">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Expertise</div>
          <h2 className="section-title">
            Where <span className="gradient-text">science meets markets</span>
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 'var(--space-12)' }}>
            A unique blend of quantitative climate science, energy transition economics, and institutional sell-side research.
          </p>
        </motion.div>

        <motion.div
          className="skills-grid"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {skills.map((skill) => (
            <motion.div className="skill-card glass-card" key={skill.title} variants={cardVariants}>
              <div
                className="skill-icon"
                style={{ background: `${skill.color}18`, color: skill.color }}
              >
                {skill.icon}
              </div>
              <div className="skill-card-title">{skill.title}</div>
              <div className="skill-card-desc">{skill.description}</div>
              <div className="skill-tags">
                {skill.tags.map((tag) => (
                  <span className="skill-tag" key={tag}>{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
