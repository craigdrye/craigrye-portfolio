import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import Quant from './pages/Quant'
import DashboardPage from './pages/DashboardPage'

import { ThemeProvider } from './ThemeContext';

function App() {
  const isQuantDomain = window.location.hostname.includes('craigdrye.com');

  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Nav />
          <Routes>
            <Route path="/" element={isQuantDomain ? <Quant /> : <Home />} />
            <Route path="/quant" element={<Quant />} />
            <Route path="/dashboards/:dashboardId" element={<DashboardPage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}


export default App
