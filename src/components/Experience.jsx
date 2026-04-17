import { motion } from 'framer-motion'

const experiences = [
  {
    date: '2022 – Present',
    role: 'Vice President, Climate & Sustainability Research',
    org: 'Barclays, New York',
    active: true,
    highlights: [
      'Ranked #1 personally and #1 as team in Sustainable Investing, Institutional Investor (Extel) Global FICC Survey 2025; up from #3 in 2024',
      'Built the physical climate risk research capability from scratch; most senior analyst on this theme in a group of 11',
      'Authors ~60 lead reports and contributes to ~100 reports annually across institutional client base',
      'Leads 3 flagship series: Climate-101, Seasonal Climate Outlook, and the market-leading Extreme Weather program',
      'Developed 3 proprietary data products: El Niño/sugar price signal framework, heat stress projections, and ERA-Interim weather analytics pipeline',
      'Client base includes BlackRock, Loomis Sayles, Amundi, UBS, the World Bank, and the UN',
    ],
  },
  {
    date: '2021 – 2022',
    role: 'Associate Research Scientist',
    org: 'NASA Goddard Institute for Space Studies & Columbia University, New York',
    active: false,
    highlights: [
      'Coordinated the 24-person NASA-GISS Sea Level Research Team',
      'Published 2 peer-reviewed papers on sea level dynamics and physical climate risk',
      'Supervised postdoctoral researchers',
    ],
  },
  {
    date: '2020 – 2021',
    role: 'Research Fellow in Climate Science',
    org: 'MIT, Cambridge, MA',
    active: false,
    highlights: [
      'Climate model development and validation',
      'Contributed to 3 successful external funding proposals',
    ],
  },
  {
    date: '2018 – 2020',
    role: 'Postdoctoral Research Fellow in Climate Science',
    org: 'Columbia University, New York',
    active: false,
    highlights: [
      'Global climate model development in Python and Fortran',
      'Supervised postdoctoral researchers',
    ],
  },
  {
    date: '2016 – 2018',
    role: 'Research Fellow in Energy Economics',
    org: 'University of Surrey, United Kingdom',
    active: false,
    highlights: [
      'Developed economy-level models of the renewable energy transition (IAM frameworks)',
      'Authored 2 widely-cited peer-reviewed articles on EROEI and critical slowing down in economies',
    ],
  },
  {
    date: '2011 – 2016',
    role: 'Ph.D. in Ocean Physics',
    org: 'National Oceanography Centre, Southampton & British Antarctic Survey, Cambridge',
    active: false,
    highlights: [
      'Lead-authored paper in Nature Geoscience on Antarctic sea-level rise (118 citations)',
      'Featured on BBC News for Antarctic sea level rise research',
    ],
  },
]

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Experience() {
  return (
    <section className="section" id="experience">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Career</div>
          <h2 className="section-title">
            From <span className="gradient-text">Antarctic Ice</span> to Wall Street
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 'var(--space-12)' }}>
            A decade of research across climate science, energy economics, and institutional finance,
            with stops at some of the world's leading research institutions.
          </p>
        </motion.div>

        <motion.div
          className="timeline"
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {experiences.map((exp) => (
            <motion.div className="timeline-item" key={exp.date} variants={itemVariants}>
              <div className={`timeline-dot ${exp.active ? 'active' : ''}`} />
              <div className="timeline-date">{exp.date}</div>
              <h3 className="timeline-role">{exp.role}</h3>
              <h4 className="timeline-org">{exp.org}</h4>
              <ul className="timeline-highlights">
                {exp.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
