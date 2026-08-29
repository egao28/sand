import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getProjectBySlug } from '../data/siteContent.js'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'
import { useDarkSurfaceOnIntersect } from '../hooks/useDarkSurfaceOnIntersect.js'
import { splitTechnical } from '../utils/splitTechnical.js'
import TechChipGrid from '../components/TechChipGrid.jsx'

/** White → warm beige image wash only (no dark overlays). */
const HERO_IMAGE_WASH = {
  a: 'linear-gradient(180deg, rgba(255,253,248,0.34) 0%, rgba(248,240,228,0.76) 100%)',
  b: 'linear-gradient(180deg, rgba(255,252,246,0.3) 0%, rgba(245,236,222,0.8) 100%)',
  c: 'linear-gradient(180deg, rgba(255,254,250,0.32) 0%, rgba(242,232,218,0.78) 100%)',
  d: 'linear-gradient(180deg, rgba(255,253,248,0.32) 0%, rgba(246,238,225,0.77) 100%)',
}

export default function ProjectDetailPage() {
  const { slug } = useParams()
  const project = useMemo(() => (slug ? getProjectBySlug(slug) : null), [slug])
  const techRef = useDarkSurfaceOnIntersect()
  useRevealOnScroll()

  if (!project) {
    return <Navigate to="/projects" replace />
  }

  const keywords = splitTechnical(project.technical)
  const demoLabel = project.demoLabel?.trim() || 'Open project'
  const demoUrl = project.demoUrl?.trim()
  const rawTone = project.detailTone ?? 'a'
  const tone = ['a', 'b', 'c', 'd'].includes(rawTone) ? rawTone : 'a'

  const hasHeroImage = Boolean(project.backgroundImage?.trim())
  const wash = HERO_IMAGE_WASH[tone] ?? HERO_IMAGE_WASH.a
  const heroBg = hasHeroImage && `${wash}, url(${project.backgroundImage.trim()})`

  return (
    <main
      className={`page page--secondary project-detail-page project-detail-page--tone-${tone}`}
      aria-label={project.title}
    >
      <div className="project-detail-back-wrap sec-inner">
        <Link className="project-detail-back" to="/projects">
          ← Projects
        </Link>
      </div>

      <header
        className={`project-detail-hero reveal ${hasHeroImage ? 'project-detail-hero--image' : 'project-detail-hero--plain'}`}
        style={
          heroBg
            ? {
                backgroundImage: heroBg,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className="sec-inner project-detail-hero-inner">
          <h1 className="project-detail-title">{project.title}</h1>
        </div>
      </header>

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="project-motivation-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2
              id="project-motivation-heading"
              className="about-headline project-detail-section-title"
            >
              Motivation
            </h2>
          </div>
          <div className="project-detail-body">
            {project.motivation.map((p, i) => (
              <p key={i} className="about-body project-detail-prose">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="project-demo-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2 id="project-demo-heading" className="about-headline project-detail-section-title">
              Try it here
            </h2>
          </div>
          <p className="project-detail-demo-lead">
            {demoUrl ? (
              <a
                href={demoUrl}
                className="project-detail-demo-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${demoLabel} (opens in a new tab)`}
              >
                {demoLabel}
              </a>
            ) : (
              <a
                href="#"
                className="project-detail-demo-link"
                onClick={(e) => e.preventDefault()}
                aria-label={`${demoLabel} (link coming soon)`}
              >
                {demoLabel} <span className="project-detail-demo-soon">(coming soon)</span>
              </a>
            )}
          </p>
        </div>
      </section>

      <section
        ref={techRef}
        className="project-detail-tech reveal"
        aria-labelledby="project-technical-heading"
      >
        <div className="sec-inner project-detail-tech-inner">
          <div className="section-title-row section-title-row--on-dark">
            <h2
              id="project-technical-heading"
              className="about-headline project-detail-section-title project-detail-section-title--on-dark"
            >
              Technical
            </h2>
          </div>
          <TechChipGrid chips={keywords} />
        </div>
      </section>
    </main>
  )
}
