import { Mail, Link2, GraduationCap, FileDown } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p className="footer-text">
            © {new Date().getFullYear()} Craig D. Rye · Quantitative Climate Risk & Institutional Research
          </p>
          <div className="footer-links">
            <a href="mailto:craig.d.rye@gmail.com" className="footer-link"><Mail size={14} /> Email</a>
            <a href="https://linkedin.com/in/cdrye" target="_blank" rel="noopener noreferrer" className="footer-link"><Link2 size={14} /> LinkedIn</a>
            <a href="https://scholar.google.com/citations?user=Z8_VQ4wAAAAJ" target="_blank" rel="noopener noreferrer" className="footer-link"><GraduationCap size={14} /> Scholar</a>
            <a href="/Craig_Rye_CV.pdf" download className="footer-link"><FileDown size={14} /> CV</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
