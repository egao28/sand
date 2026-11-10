import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DemoVideo from '../components/DemoVideo.jsx'

/* The decorative polaroids that used to sit beside the featured summaries are
 * not rendered any more (#71): the listing is an editorial column of text, and
 * a photograph that depicts none of the work it sits beside was the one
 * ornamental thing left on the page.
 *
 * The image files stay where they are and `card.art` stays in the data — they
 * are still the gallery's source material, and About's own photo is a
 * different file entirely and is untouched. What went is the import and the
 * <picture> that drew them here. */

// Entrance stagger, capped so the last entry is never held back long enough to
// delay reading. `.worklist-entry--animated` fills backwards, which means the
// delay is time at opacity 0 — see the keyframes note in about-projects.css.
const STAGGER_STEP = 0.06 // seconds between adjacent entries
const STAGGER_MAX = 0.36

/** One text action under a summary. A plain link, not a button: there is no
 * frame and no fill, and the only thing that marks it is the warm gold and the
 * underline it takes on hover and focus.
 *
 * The arrow is for external destinations only. "Technical note" goes to a page
 * of this site and must not suggest it opens a window. */
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
      {action.external && (
        <span className="worklist-action-arrow" aria-hidden="true">
          ↗
        </span>
      )}
    </a>
  )
}

function WorklistEntry({ project, index, targetId }) {
  const { card } = project
  // `items` entries are keyed by slug, `listingOnly` entries by id; both are
  // unique across the merged list, so either makes a stable DOM id.
  const key = project.slug ?? project.id
  const [demoOpen, setDemoOpen] = useState(false)
  // The entry a fragment link asked for. It must not play the entrance: the
  // keyframes start it 18px low, and settling up out from under a reader who
  // has just been scrolled to it takes its top off the screen.
  const isTarget = targetId === `project-${key}`

  const title = card.title ?? project.title
  const titleId = `worklist-${key}-title`
  const panelId = `worklist-${key}-demo`

  return (
    <article
      // A stable anchor for each entry. About's CHAI heading links to this
      // one, because the work has a card here and no page of its own; adding
      // the id changes nothing about how the listing is laid out or read.
      id={`project-${key}`}
      className={`worklist-entry${isTarget ? '' : ' worklist-entry--animated'}`}
      aria-labelledby={titleId}
      style={{ '--worklist-delay': `${Math.min(index * STAGGER_STEP, STAGGER_MAX)}s` }}
    >
      <h3 id={titleId} className="worklist-entry-title">
        {title}
      </h3>
      <p className="worklist-entry-role">{card.role}</p>
      <p className="worklist-entry-summary">{card.summary}</p>

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
 * on the page itself, in two groups, as one column of text.
 *
 * #71 takes the cards away — no fill, border, shadow, corner radius or hover
 * lift — and leaves a hairline rule between entries. What it does not take
 * away is any of the writing: all seven projects keep their category, their
 * order, their whole summary and their working links. Nothing is shortened or
 * put behind a hover to make the page look tidier. Featured and Other are told
 * apart by their headings and by space.
 *
 * Heading order is h1 (page) → h2 (group) → h3 (project). Only /projects
 * renders this; the homepage never has. */
export default function ProjectsSection({ content, cards }) {
  const { hash } = useLocation()
  const targetId = hash ? decodeURIComponent(hash.slice(1)) : null
  const tiers = content.tiers
    .map((tier) => ({ ...tier, cards: cards.filter((p) => p.card.tier === tier.id) }))
    .filter((tier) => tier.cards.length > 0)

  return (
    <section id="projects" aria-labelledby="worklist-title">
      <div className="sec-inner page-shell worklist-inner">
        <h1 id="worklist-title" className="worklist-title page-shell-title">
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
              <div className="worklist-entries">
                {tier.cards.map((project) => (
                  <WorklistEntry
                    key={project.slug ?? project.id}
                    project={project}
                    // Indexed across the whole page, not per tier, so the
                    // stagger reads top-to-bottom instead of restarting.
                    index={cards.indexOf(project)}
                    targetId={targetId}
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
