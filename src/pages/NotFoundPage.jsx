import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/resume', label: 'Resume' },
]

export default function NotFoundPage() {
  // A static host has no route table, so every unknown path is rewritten to
  // index.html and answered 200 — this page cannot send a real 404 status.
  // Injecting noindex is what keeps a mistyped URL out of the index anyway:
  // crawlers render the page, find the tag, and drop it. Removed on unmount so
  // it does not follow the visitor to a real page.
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Page not found · Evelyn Gao'

    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)

    return () => {
      document.title = previousTitle
      meta.remove()
    }
  }, [])

  return (
    <main className="page page--secondary not-found-page" aria-labelledby="not-found-heading">
      <div className="not-found-content">
        <p className="not-found-code">404</p>
        <h1 id="not-found-heading" className="not-found-headline">
          This page isn&apos;t here.
        </h1>
        <p className="not-found-body">
          The link may be out of date, or I may have moved something since it was written.
        </p>
        {/* A div, not a <nav>: the stylesheet styles the bare `nav` element
            rather than #main-nav, so a second <nav> anywhere on the page
            inherits position:fixed and lands on top of the real header. The
            page already has its navigation landmark up there. */}
        <div className="not-found-links">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="not-found-link">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
