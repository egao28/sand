import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'
import ProjectsSection from '../sections/ProjectsSection.jsx'
import { siteContent } from '../data/siteContent.js'

export default function ProjectsPage() {
  useRevealOnScroll()

  return (
    <main className="page page--secondary">
      <ProjectsSection content={siteContent.projects} />
    </main>
  )
}
