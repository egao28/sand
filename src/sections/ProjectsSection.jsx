import { Link } from 'react-router-dom'
import projectsBackgroundUrl from '../../background.jpg'

/** Matches siteContent.projects.items order: TL → Proxima, TR → AlmaBot, BL → CareLink, BR → Campus */
const CORNER_CLASSES = [
  'project-corner-link--tl',
  'project-corner-link--tr',
  'project-corner-link--bl',
  'project-corner-link--br',
]

export default function ProjectsSection({ content }) {
  return (
    <section id="projects" className="projects-landing">
      <div className="projects-background-breakout">
        <div className="projects-image-wrapper">
          <img src={projectsBackgroundUrl} alt="" className="projects-bg-image" decoding="async" />
          <div className="projects-overlay" aria-label="Project links">
            {content.items.map((item, i) => (
              <Link
                key={item.slug}
                className={`project-corner-link reveal ${CORNER_CLASSES[i] ?? ''}`}
                to={item.href}
              >
                <span className="project-label">
                  <span className="project-label-text">{item.title}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
