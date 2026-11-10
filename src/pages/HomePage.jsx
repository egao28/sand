import HomeOpening from '../sections/HomeOpening.jsx'
import AboutSection from '../sections/AboutSection.jsx'
import { SiteTopBar } from '../components/SiteNav.jsx'
import { siteContent } from '../data/siteContent.js'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'

/**
 * `/` — the opening, then the real About.
 *
 * The About here is the same `AboutSection` that `/about` renders, with the
 * same data: there is no second copy of either. The difference between the two
 * routes is only whether the opening is played, which is why scrolling into
 * About on this page does not rewrite the URL — that would make the browser's
 * back button undo a scroll.
 */
export default function HomePage({ handedOver }) {
  // AboutSection's blocks carry `.reveal`, which starts at opacity 0 until this
  // hook sees them. The opening's own fade is on `.home-about` above them, so
  // the two do not fight: by the time the content is worth looking at both have
  // resolved.
  useRevealOnScroll()

  return (
    <main className="home-page">
      <HomeOpening dormant={handedOver} />

      {/* The About block is pulled up over the opening and starts at opacity 0,
          so for the first part of the transition it is a full-viewport
          invisible sheet sitting on top of the letters. `inert` until the
          handover keeps it from swallowing a click on the scroll hint or a
          hover on a letter, and keeps its links out of the tab order while
          they cannot be seen. */}
      <div
        className={`home-about${handedOver ? ' home-about--live' : ''}`}
        inert={!handedOver || undefined}
      >
        <SiteTopBar items={siteContent.nav.items} />
        <AboutSection content={siteContent.about} />
      </div>
    </main>
  )
}
