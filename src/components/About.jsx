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
              I work in climate and sustainability research at Barclays. My main focus is on
              physical risk — how extreme weather, sea level rise, and long-term climate shifts
              affect markets — though our work spans energy transition and ESG integration more broadly.
            </p>
            <p>
              The work covers seasonal climate outlooks, wildfire and hurricane outlooks, and a lot
              of collaboration with sector analysts across the bank to think through how climate
              affects everything from utilities to insurance to municipal bonds. I also run a seminar
              series bringing external climate experts to talk with our community. Outside of that
              I'm often happiest when tinkering on a new technical project.
            </p>
            <p>
              My background is in climate science and energy economics — I spent around a decade at
              NASA, MIT, Columbia, and the University of Surrey before moving into finance. That
              scientific grounding shapes how I approach the work, and the challenge of translating
              the latest science into something decision-useful for investors is what keeps it interesting.
            </p>
            <p className="about-origin">
              Based in New York, originally from Nottingham (UK). Always happy to connect.
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
