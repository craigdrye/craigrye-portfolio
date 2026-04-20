import React from 'react'

import Hero from '../components/Hero'
import About from '../components/About'
import Experience from '../components/Experience'
import Publications from '../components/Publications'
import Projects from '../components/Projects'
import News from '../components/News'
import Contact from '../components/Contact'

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Publications />
      <News />
      <Contact />
    </main>
  );
}
