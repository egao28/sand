import { useState } from 'react'
import { Link } from 'react-router-dom'
import DemoVideo from '../components/DemoVideo.jsx'
import photo2Avif from '../assets/projects/photo-2.avif'
import photo2Webp from '../assets/projects/photo-2.webp'
import photo2Png from '../assets/projects/photo-2.png'
import photo4Avif from '../assets/projects/photo-4.avif'
import photo4Webp from '../assets/projects/photo-4.webp'
import photo4Png from '../assets/projects/photo-4.png'

// Decorative polaroids, addressed by name from `card.art` rather than shuffled
// at render time: a card's photo must not change between visits, and the
// entries with no material of their own (CHAI, Vehicle-Emission Forecasting,
// Campus Vegetation Analysis) deliberately have no `art` key at all. None of
// these images depicts the work it sits beside — they are atmosphere, so every
// one is alt="" and no card depends on one to be readable.
const ART = {
  'photo-2': { avif: photo2Avif, webp: photo2Webp, png: photo2Png },
  'photo-4': { avif: photo4Avif, webp: photo4Webp, png: photo4Png },
}

// Entrance stagger, capped so the last card is never held back long enough to
// delay reading. `.worklist-card--animated` fills backwards, which means the
// delay is time at opacity 0 — see the keyframes note in about-projects.css.
const STAGGER_STEP = 0.06 // seconds between adjacent cards
const STAGGER_MAX = 0.36

function WorklistAction({ action }) {
  if (action.to) {
    return (
      <Link to={action.to} className="worklist-action">
        {action.label}
      </Link>
    )
  }

  return (
    <a
      href={action.href}
      className="worklist-action"
      {...(action.external
        ? {
            target: '_blank',
            rel: 'noopener noreferrer',
            'aria-label': `${action.label} (opens in a new tab)`,
          }
        : {})}
    >
      {action.label}
    </a>
  )
}

function WorklistCard({ project, index }) {
  const { card } = project
  // `items` entries are keyed by slug, `listingOnly` entries by id; both are
  // unique across the merged list, so either makes a stable DOM id.
  const key = project.slug ?? project.id
  const [demoOpen, setDemoOpen] = useState(false)

  const title = card.title ?? project.title
  const art = card.art ? ART[card.art] : null
  const featured = card.tier === 'featured'
  const titleId = `worklist-${key}-title`
  const panelId = `worklist-${key}-demo`

  const className = [
    'worklist-card',
    featured ? 'worklist-card--featured' : null,
    art ? 'worklist-card--with-art' : null,
    'worklist-card--animated',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article
      className={className}
      aria-labelledby={titleId}
      style={{ '--worklist-delay': `${Math.min(index * STAGGER_STEP, STAGGER_MAX)}s` }}
    >
      <div className="worklist-card-body">
        <div className="worklist-card-text">
          <h3 id={titleId} className="worklist-card-title">
            {title}
          </h3>
          <p className="worklist-card-role">{card.role}</p>
          <p className="worklist-card-summary">{card.summary}</p>

          {(card.actions.length > 0 || card.demo) && (
            <div className="worklist-actions">
              {card.actions.map((action) => (
                <WorklistAction key={action.label} action={action} />
              ))}

              {card.demo && (
                <button
                  type="button"
                  className="worklist-action worklist-demo-toggle"
                  aria-expanded={demoOpen}
                  aria-controls={panelId}
                  onClick={() => setDemoOpen((open) => !open)}
                >
                  {demoOpen ? 'Hide demo' : card.demo.label}
                </button>
              )}
            </div>
          )}
        </div>

        {art && (
          <figure className="worklist-art">
            <picture>
              <source srcSet={art.avif} type="image/avif" />
              <source srcSet={art.webp} type="image/webp" />
              <img src={art.png} alt="" className="worklist-art-img" decoding="async" />
            </picture>
          </figure>
        )}
      </div>

      {/* Kept in the DOM and toggled with `hidden` rather than mounted on
          expand, for two reasons: aria-controls always has a target to point
          at, and a panel that mounted later could never be reached by
          useRevealOnScroll, which snapshots `.reveal` once. Note the absence
          of that class here — it is deliberate. `preload="none"` on the player
          means nothing is fetched until someone presses play. */}
      {card.demo && (
        <div className="worklist-demo-panel" id={panelId} hidden={!demoOpen}>
          <DemoVideo
            src={card.demo.src}
            poster={card.demo.poster}
            width={card.demo.width}
            height={card.demo.height}
            ariaLabel={card.demo.ariaLabel}
          />
        </div>
      )}
    </article>
  )
}

/** The /projects listing: every project's title, role and full summary visible
 * on the page itself, in two groups. Replaces the absolutely-positioned
 * polaroid cascade, which carried a photo and a title and sent everything else
 * to a detail page. Heading order is h1 (page) → h2 (group) → h3 (project).
 * Only /projects renders this; the homepage never has. */
export default function ProjectsSection({ content, cards }) {
  const tiers = content.tiers
    .map((tier) => ({ ...tier, cards: cards.filter((p) => p.card.tier === tier.id) }))
    .filter((tier) => tier.cards.length > 0)

  return (
    <section id="projects" aria-labelledby="worklist-title">
      <div className="sec-inner worklist-inner">
        <h1 id="worklist-title" className="worklist-title">
          {content.title}
        </h1>

        <div className="worklist">
          {tiers.map((tier) => (
            <section
              key={tier.id}
              className={`worklist-tier worklist-tier--${tier.id}`}
              aria-labelledby={`worklist-tier-${tier.id}`}
            >
              <h2 id={`worklist-tier-${tier.id}`} className="worklist-tier-label">
                {tier.label}
              </h2>
              <div className="worklist-grid">
                {tier.cards.map((project) => (
                  <WorklistCard
                    key={project.slug ?? project.id}
                    project={project}
                    // Indexed across the whole page, not per tier, so the
                    // stagger reads top-to-bottom instead of restarting.
                    index={cards.indexOf(project)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}
