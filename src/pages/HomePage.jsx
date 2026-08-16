import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThinkInWindHero from '../sections/ThinkInWindHero.jsx'
import ContactSection from '../sections/ContactSection.jsx'
import { siteContent } from '../data/siteContent.js'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'

export default function HomePage() {
  const location = useLocation()
  useRevealOnScroll()

  useEffect(() => {
    if (location.hash === '#contact') {
      const target = document.getElementById('home-contact')
      if (target) {
        window.setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 40)
      }
    }
  }, [location.hash])

  return (
    <main className="home-page" aria-label="Home">
      <ThinkInWindHero />

      <section className="home-entry reveal" aria-label="Explore pages">
        <div className="home-entry-list">
          <Link className="home-entry-item" to="/about">
            <span className="home-entry-label">About</span>
          </Link>
          <Link className="home-entry-item" to="/projects">
            <span className="home-entry-label">Projects</span>
          </Link>
          <Link className="home-entry-item" to="/resume">
            <span className="home-entry-label">Resume</span>
          </Link>
        </div>
      </section>

      <div id="home-contact">
        <ContactSection content={siteContent.contact} variant="home" />
      </div>
    </main>
  )
}
