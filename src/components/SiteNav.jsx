import { Link, useLocation } from 'react-router-dom'
import NavIcon from './icons/NavIcons.jsx'

/** True when `path` is the section `item` stands for. About owns the experience
 * write-ups and Projects owns the project write-ups, so a detail page keeps its
 * section lit rather than leaving the nav blank. External targets (GitHub, and
 * anything that is a file or a mail client) never match: they are not pages of
 * this site and must not pose as the one you are on. */
function isCurrent(item, path) {
  if (item.href) return false
  return item.match.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

/** The logo. The only way back to the opening, which is why it is not also a
 * nav item: #67 asks for five entries, not six. On `/` the click cannot change
 * the route, so it scrolls the opening back into view itself. */
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

function NavLink({ item, children, className, ...rest }) {
  if (item.href) {
    return (
      <a
        href={item.href}
        className={className}
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

/**
 * The fixed left rail: logo, then the five entries. Desktop only — under 900px
 * it is display:none, so it cannot be reached by pointer or by Tab, and the
 * compact top bar below is the one navigation on the page.
 *
 * Each entry is a 48x48 hit area around a 40x40 icon. The name only appears on
 * hover or focus, positioned out of flow, so the rail takes no more width than
 * the icons themselves.
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
              <li key={item.id} className={`site-rail-item site-rail-item--${item.id}`}>
                <NavLink
                  item={item}
                  className={`site-rail-link${current ? ' site-rail-link--current' : ''}`}
                  aria-current={current ? 'page' : undefined}
                >
                  <NavIcon id={item.id} />
                  {/* The link's accessible name. Faded out rather than removed,
                      so a screen reader still has something to announce when
                      the icon is all that is painted. */}
                  <span className="site-rail-label">{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

/**
 * The compact top bar for under 900px. In normal document flow and sticky at
 * the top, so on the homepage it sits with the About content and never appears
 * over the opening. Text links only — nothing here depends on hover.
 *
 * GitHub is deliberately absent: on this width it is a text link at the end of
 * About instead (#67).
 */
export function SiteTopBar({ items }) {
  const location = useLocation()
  const inBar = items.filter((item) => !item.href)

  return (
    <div className="site-topbar">
      <SiteLogo className="site-topbar-logo" size={40} />

      <nav className="site-topbar-nav" aria-label="Main">
        <ul className="site-topbar-list">
          {inBar.map((item) => {
            const current = isCurrent(item, location.pathname)

            return (
              <li key={item.id}>
                <NavLink
                  item={item}
                  className={`site-topbar-link${current ? ' site-topbar-link--current' : ''}`}
                  aria-current={current ? 'page' : undefined}
                >
                  {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
