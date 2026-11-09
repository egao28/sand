import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'
import AboutSection from '../sections/AboutSection.jsx'
import { siteContent } from '../data/siteContent.js'

export default function AboutPage() {
  useRevealOnScroll()

  return (
    <main className="page page--secondary">
      <AboutSection content={siteContent.about} resume={siteContent.resume} />
    </main>
  )
}
