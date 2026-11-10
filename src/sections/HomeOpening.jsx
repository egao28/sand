import { Link } from 'react-router-dom'
import ThinkInWindHero from './ThinkInWindHero.jsx'
import { OpeningThemeToggle, SiteLogo } from '../components/SiteNav.jsx'

/**
 * The opening screen: the existing `think in the wind` letters, the logo, and
 * the scroll hint. Nothing else — `/` is the opening and then the real About,
 * not a long landing page.
 *
 * `.opening-track` is a viewport plus the transition distance tall and
 * `.opening-scene` sticks to the top of it, so the scene stays on screen for
 * exactly as long as the transition lasts and then releases into normal
 * scrolling. No scroll hijacking is involved: sticky positioning and a custom
 * property are doing all of it.
 *
 * `inert` once the scene is dormant: the letters are gone by then, and a layer
 * you can no longer see must not swallow clicks on the About text underneath or
 * hold the scroll hint in the tab order.
 */
export default function HomeOpening({ dormant }) {
  return (
    <div className="opening-track">
      <div className="opening-scene" inert={dormant || undefined}>
        {/* Both shown under 768px only. On desktop the rail already holds
            this logo in this exact spot and carries the theme button through
            the whole transition, so a second pair would sit on top of it.
            Together they are the whole of the opening's chrome: the logo, and
            the one setting. */}
        <SiteLogo className="opening-logo" size={44} />
        <OpeningThemeToggle />

        <ThinkInWindHero />

        <Link className="opening-hint" to="/about">
          Scroll to explore
        </Link>
      </div>
    </div>
  )
}
