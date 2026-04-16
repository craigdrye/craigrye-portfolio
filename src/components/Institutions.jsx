import { motion } from 'framer-motion'
import { Building2, Atom, GraduationCap, Landmark, FlaskConical } from 'lucide-react'

const institutions = [
  { name: 'Barclays', color: '#00aeef', icon: <Building2 size={16} /> },
  { name: 'NASA GISS', color: '#fc3d21', icon: <Atom size={16} /> },
  { name: 'MIT', color: '#a31f34', icon: <GraduationCap size={16} /> },
  { name: 'Columbia University', color: '#b9d9eb', icon: <Landmark size={16} /> },
  { name: 'University of Surrey', color: '#e87722', icon: <FlaskConical size={16} /> },
  { name: 'British Antarctic Survey', color: '#36d6e7', icon: <Atom size={16} /> },
]

export default function Institutions() {
  return (
    <motion.section
      className="institutions-bar"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="container">
        <div className="institutions-list">
          {institutions.map((inst) => (
            <div className="institution-item" key={inst.name}>
              <div
                className="institution-icon"
                style={{ background: `${inst.color}22`, color: inst.color }}
              >
                {inst.icon}
              </div>
              {inst.name}
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
