import { useMemo } from 'react'
import ProjectsSection from '../sections/ProjectsSection.jsx'
import { getProjectCards, siteContent } from '../data/siteContent.js'

// No useRevealOnScroll here any more: nothing on this page carries `.reveal`.
// The cards fade in with their own CSS animation instead, because the hook
// queries `.reveal` exactly once at mount and anything appearing later — the
// demo panels — would be stranded at opacity 0.
export default function ProjectsPage() {
  const cards = useMemo(() => getProjectCards(), [])

  return (
    <main className="page page--secondary">
      <ProjectsSection content={siteContent.projects} cards={cards} />
    </main>
  )
}
