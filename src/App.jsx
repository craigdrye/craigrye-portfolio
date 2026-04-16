import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import About from './components/About'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Experience from './components/Experience'
import Publications from './components/Publications'
import Skills from './components/Skills'
import Projects from './components/Projects'
import News from './components/News'
import Contact from './components/Contact'
import Footer from './components/Footer'

import { ThemeProvider } from './ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="app-container">
        <Nav />
        <main>
          <Hero />
          <About />
          <Experience />
          <Publications />
          <Skills />
          <Projects />
          <News />
          <Contact />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App
