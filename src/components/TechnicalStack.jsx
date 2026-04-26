import { motion } from 'framer-motion'

const techStack = [
  { category: 'Languages', items: ['Python (Expert)', 'Fortran 90/95', 'SQL', 'Zsh/Bash'] },
  { category: 'Data & Modeling', items: ['xarray / Dask', 'NumPy / SciPy', 'Pandas', 'Sci-kit Learn'] },
  { category: 'Numerical', items: ['Finite Difference Methods', 'MPI / OpenMP', 'Monte Carlo Simulation', 'Numerical Integration'] },
  { category: 'Domain Expertise', items: ['Stochastic Processes', 'Time-Series Analysis', 'Complexity Economics', 'Geospatial Analytics'] },
]

export default function TechnicalStack() {
  return (
    <section className="section bg-secondary" id="stack">
      <div className="container">
        <div className="section-label">Engineering Stack</div>
        <h2 className="section-title">Technical <span className="gradient-text">Proficiency</span></h2>
        
        <div className="tech-stack-grid">
          {techStack.map((group, idx) => (
            <motion.div 
              key={idx}
              className="tech-group-card"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <h3 className="tech-category">{group.category}</h3>
              <div className="tech-items">
                {group.items.map(item => (
                  <div key={item} className="tech-item">
                    <span className="dot" /> {item}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
