import { motion } from 'framer-motion'
import { Mail, Link2, GraduationCap } from 'lucide-react'

export default function Contact() {
  return (
    <section className="section contact-section" id="contact">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-label" style={{ justifyContent: 'center' }}>Contact</div>
          <h2 className="contact-cta">
            Let's <span className="gradient-text">connect</span>
          </h2>
          <p className="contact-sub">
            Open to research collaborations, advisory opportunities, and discussions around
            climate risk, energy transition, and quantitative finance.
          </p>

          <div className="contact-links">
            <a className="contact-link" href="mailto:craig.d.rye@gmail.com">
              <Mail size={18} /> craig.d.rye@gmail.com
            </a>
            <a className="contact-link" href="https://linkedin.com/in/cdrye" target="_blank" rel="noopener noreferrer">
              <Link2 size={18} /> LinkedIn
            </a>
            <a className="contact-link" href="https://scholar.google.com/citations?user=Z8_VQ4wAAAAJ" target="_blank" rel="noopener noreferrer">
              <GraduationCap size={18} /> Google Scholar
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
