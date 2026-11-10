import { Link, useLocation } from 'react-router-dom'
import NavIcon, { ThemeIcon } from './icons/NavIcons.jsx'
import { useTheme } from '../hooks/useTheme.js'

/** True when `path` is the section `item` stands for. About owns the experience
 * write-ups and Projects owns the project write-ups, so a detail page keeps its
 * section lit rather than leaving the nav blank.
 *
 * Only an entry with `to` can be current. Resume hands over a file and GitHub
 * and LinkedIn leave the site: none of the three is a page of this site, so
 * none may pose as the one you are on, and none leaves a highlight behind
 * after it is used (#70). */
function isCurrent(item, path) {
  if (!item.to) return false
  return item.match.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

/** The logo. The only way back to the opening, which is why it is not also a
 * nav item. On `/` the click cannot change the route, so it scrolls the opening
 * back into view itself. Unchanged by #70: the logo is the original artwork and
 * is not one of the seven icons. */
export function SiteLogo({ className = '', size = 48 }) {
  const location = useLocation()

  const handleClick = () => {
    if (location.pathname !== '/') return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Link
      to="/"
      className={`site-logo ${className}`.trim()}
      aria-label="Evelyn Gao — back to the opening"
      onClick={handleClick}
    >
      <img
        className="site-logo-img"
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        decoding="async"
      />
    </Link>
  )
}

/** One nav target, rendered as whatever kind of thing it actually is: a router
 * link for a page, a download for the resume PDF, a new-tab anchor for an
 * external profile. */
function NavLink({ item, children, className, ...rest }) {
  if (item.href) {
    return (
      <a
        href={item.href}
        className={className}
        {...(item.download ? { download: item.download } : {})}
        {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    )
  }

  return (
    <Link to={item.to} className={className} {...rest}>
      {children}
    </Link>
  )
}

/** What a target's name has to say beyond the label, for anyone who cannot see
 * what kind of control it is. The visible label stays the plain word. */
function accessibleName(item) {
  if (item.download) return `${item.label} — download PDF`
  if (item.external) return `${item.label} (opens in a new tab)`
  return undefined
}

/**
 * The theme button. A real <button>: it changes the page, it does not go
 * anywhere, so it must not be a link and must not be reachable as one.
 *
 * The symbol is the theme you are in — moon on light, sun on dark — and
 * switching is a click or a key press. Hover only turns it a few degrees
 * (nav-icons.css); it never previews or applies the other theme on its own.
 */
function ThemeToggle({ className, labelClassName }) {
  const { theme, toggleTheme } = useTheme()
  const label = theme === 'dark' ? 'Light mode' : 'Dark mode'

  return (
    <button
      type="button"
      className={className}
      onClick={toggleTheme}
      aria-pressed={theme === 'dark'}
    >
      <ThemeIcon theme={theme} />
      <span className={labelClassName}>{label}</span>
    </button>
  )
}

/**
 * The fixed left rail: logo, then the six entries, then the theme button.
 * Desktop only — under 900px it is display:none, so it cannot be reached by
 * pointer or by Tab, and the compact top bar below is the one navigation on
 * the page.
 *
 * Each entry is a 48x48 hit area around a 40x40 icon. The name only appears on
 * hover or focus, positioned out of flow, so the rail takes no more width than
 * the icons themselves and a label can never push the page around.
 */
export function SiteRail({ items, dormant }) {
  const location = useLocation()

  return (
    <div className="site-rail">
      <SiteLogo className="site-rail-logo" />

      {/* While the opening still owns the screen the rail has not faded in yet,
          so it is inert: an invisible nav must not be the first thing Tab
          reaches. */}
      <nav className="site-rail-nav" aria-label="Main" inert={dormant || undefined}>
        <ul className="site-rail-list">
          {items.map((item) => {
            const current = isCurrent(item, location.pathname)

            return (
              <li
                key={item.id}
                className={`site-rail-item site-rail-item--${item.id} site-rail-item--group-${item.group}`}
              >
                <NavLink
                  item={item}
                  className={`site-rail-link${current ? ' site-rail-link--current' : ''}`}
                  aria-current={current ? 'page' : undefined}
                  aria-label={accessibleName(item)}
                >
                  <NavIcon id={item.id} />
                  {/* The link's accessible name when there is no aria-label
                      above. Faded out rather than removed, so a screen reader
                      still has something to announce when the icon is all that
                      is painted. */}
                  <span className="site-rail-label">{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Outside the <nav>: it is a setting, not a destination, so it does not
          belong in a list of places to go. */}
      <ThemeToggle className="site-rail-link site-rail-theme" labelClassName="site-rail-label" />
    </div>
  )
}

/**
 * The compact top bar for under 900px. In normal document flow and sticky at
 * the top, so on the homepage it sits with the About content and never appears
 * over the opening. Text links only — nothing here depends on hover, and a tap
 * does the thing rather than first revealing a label.
 *
 * Every entry the rail carries is here too, including GitHub, LinkedIn and the
 * theme button: the rail is not rendered at this width, so anything missing
 * from this bar would simply be unreachable (#70).
 */
export function SiteTopBar({ items }) {
  const location = useLocation()

  return (
    <div className="site-topbar">
      <SiteLogo className="site-topbar-logo" size={40} />

      <nav className="site-topbar-nav" aria-label="Main">
        <ul className="site-topbar-list">
          {items.map((item) => {
            const current = isCurrent(item, location.pathname)

            return (
              <li key={item.id}>
                <NavLink
                  item={item}
                  className={`site-topbar-link${current ? ' site-topbar-link--current' : ''}`}
                  aria-current={current ? 'page' : undefined}
                  aria-label={accessibleName(item)}
                >
                  {item.label}
                  {item.external && (
                    <span className="site-topbar-arrow" aria-hidden="true">
                      ↗
                    </span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <ThemeToggle className="site-topbar-theme" labelClassName="sr-only" />
    </div>
  )
}
