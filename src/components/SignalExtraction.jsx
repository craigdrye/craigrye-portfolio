import { motion } from 'framer-motion'
import { Activity, Network, CloudLightning } from 'lucide-react'

const signals = [
  {
    icon: <Activity size={24} />,
    title: 'El Niño Teleconnections to Agricultural Commodities',
    signal: 'Forward-looking soft commodity price returns',
    data: 'Sea Surface Temperature (SST) anomalies, ICE Sugar No. 11 Futures',
    method: 'Time-series cross-correlation, lag identification, regime-switching models',
    application: 'Systematic macro trading, commodity futures',
  },
  {
    icon: <Network size={24} />,
    title: 'Economic Regime Shifts & Critical Slowing Down',
    signal: 'Early warning indicators of secular stagnation and economic downturns',
    data: 'Global macroeconomic time-series (GDP, inflation, interest rates)',
    method: 'Variance/Autocorrelation analysis, stochastic differential equations',
    application: 'Macro asset allocation, portfolio risk management',
  },
  {
    icon: <CloudLightning size={24} />,
    title: 'Extreme Weather Pipeline & Physical Risk',
    signal: 'High-resolution heat stress and extreme weather probability distributions',
    data: 'ERA5 / ERA-Interim Reanalysis, CMIP6 Climate Models',
    method: 'Geospatial big data processing (xarray/Dask), extreme value theory',
    application: 'Municipal bond risk, real assets hedging, infrastructure assessment',
  }
]

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function SignalExtraction() {
  return (
    <section className="section" id="signals">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
        </motion.div>

        <div className="signals-grid">
          {signals.map((item, idx) => (
            <motion.div 
              key={idx}
              className="signal-card glass-card"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="signal-header">
                <div className="signal-icon">{item.icon}</div>
                <h3 className="signal-title">{item.title}</h3>
              </div>
              <div className="signal-details">
                <div className="signal-row">
                  <span className="signal-label">Signal:</span>
                  <span className="signal-value highlight">{item.signal}</span>
                </div>
                <div className="signal-row">
                  <span className="signal-label">Data Source:</span>
                  <span className="signal-value">{item.data}</span>
                </div>
                <div className="signal-row">
                  <span className="signal-label">Method:</span>
                  <span className="signal-value">{item.method}</span>
                </div>
                <div className="signal-row">
                  <span className="signal-label">Market App:</span>
                  <span className="signal-value">{item.application}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
