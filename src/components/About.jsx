import { motion } from 'framer-motion'

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">About</div>
          <h2 className="section-title">
            The <span className="gradient-text">short version</span>
          </h2>
        </motion.div>

        <motion.div
          className="about-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="about-text">
            <p>
              I lead the climate analytics work within Barclays’ Climate and Sustainability Research team, translating frontier climate science, including extreme weather, structural trends, water stress, and seasonal variability, into investment-relevant research for institutional clients.
            </p>
            <p>
              Our work spans seasonal climate outlooks, commodity outlooks, and extreme weather risk, assessing climate impacts across a range of sectors and asset classes, mainly utilities, energy, agriculture, insurance, and municipals. I also run a seminar series that brings leading external climate experts into dialogue with our research community.
            </p>
            <p>
              Before moving into finance, I spent a decade at NASA, MIT, Columbia, and the British Antarctic Survey developing global climate models. That scientific training is the quantitative foundation for my work on the sell-side.
            </p>
            <p className="about-origin">
              Based in New York, originally from Nottingham, UK.
            </p>
          </div>

          <div className="about-sidebar">
            <div className="about-sidebar-card glass-card">
              <h3 className="about-sidebar-title">Education</h3>
              <div className="about-edu-item">
                <div className="about-edu-degree">Ph.D., Ocean Physics</div>
                <div className="about-edu-school">National Oceanography Centre, Southampton &amp; British Antarctic Survey, Cambridge</div>
                <div className="about-edu-year">2011 – 2016</div>
              </div>
              <div className="about-edu-item">
                <div className="about-edu-degree">B.S., Environmental Sciences — 1st Class (4.0 GPA)</div>
                <div className="about-edu-school">University of East Anglia</div>
                <div className="about-edu-year">2007 – 2010</div>
              </div>
            </div>

            <div className="about-sidebar-card glass-card">
              <h3 className="about-sidebar-title">Licenses</h3>
              <div className="about-licenses">
                {['Series 7', 'Series 86/87', 'Series 63', 'SIE'].map((lic) => (
                  <span className="about-license-tag" key={lic}>{lic}</span>
                ))}
              </div>
              <div className="about-edu-year" style={{ marginTop: 'var(--space-2)' }}>
                FINRA · Advanced Financial Modeling 1 &amp; 2 — Barclays (2022–2023)
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
