import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import DashboardPage from './pages/DashboardPage'

import { ThemeProvider } from './ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboards/:dashboardId" element={<DashboardPage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}


export default App
