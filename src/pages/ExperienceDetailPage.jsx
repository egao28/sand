import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getExperienceBySlug } from '../data/siteContent.js'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'

export default function ExperienceDetailPage() {
  const { slug } = useParams()
  const item = useMemo(() => (slug ? getExperienceBySlug(slug) : null), [slug])
  useRevealOnScroll()

  if (!item) {
    return <Navigate to="/about" replace />
  }

  return (
    <main
      className="page page--secondary project-detail-page project-detail-page--tone-a"
      aria-label={item.title}
    >
      <div className="project-detail-back-wrap sec-inner">
        <Link className="project-detail-back" to="/about">
          ← About
        </Link>
      </div>

      <header className="project-detail-hero reveal project-detail-hero--plain">
        <div className="sec-inner project-detail-hero-inner">
          <h1 className="project-detail-title">{item.title}</h1>
          <p className="experience-detail-subtitle">{item.sub}</p>
        </div>
      </header>

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="experience-highlights-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2
              id="experience-highlights-heading"
              className="about-headline project-detail-section-title"
            >
              Highlights
            </h2>
          </div>
          <ul className="experience-detail-list">
            {(item.details ?? []).map((d, i) => (
              <li key={i} className="about-body project-detail-prose">
                {d}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
