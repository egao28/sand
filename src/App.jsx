import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom'
import CustomCursor from './components/CustomCursor.jsx'
import { SiteRail, SiteTopBar } from './components/SiteNav.jsx'
import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import ExperienceDetailPage from './pages/ExperienceDetailPage.jsx'
import BloomMcpDetailPage from './pages/BloomMcpDetailPage.jsx'
import ProximaDetailPage from './pages/ProximaDetailPage.jsx'
import AlmabotDetailPage from './pages/AlmabotDetailPage.jsx'
import CarelinkDetailPage from './pages/CarelinkDetailPage.jsx'
import SonyDetailPage from './pages/SonyDetailPage.jsx'
import TsinghuaDetailPage from './pages/TsinghuaDetailPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { siteContent } from './data/siteContent.js'
import { useOpeningProgress } from './hooks/useOpeningProgress.js'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.js'

/**
 * Jump to the top when a link takes you to a new page — but not on a back or
 * forward, where the browser is already restoring where you were. Forcing the
 * scroll there is what would make `/` replay its opening every time you came
 * back to it (#66).
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') return
    // `instant`: `html { scroll-behavior: smooth }` would otherwise animate a
    // page change, so the new page would start part-way down and glide up.
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, navigationType])

  return null
}

/** `/resume` was a page with a download on it until #70 put the download on the
 * nav entry itself. The URL has been linked and shared, so it still has to
 * resolve — it hands over the same PDF rather than 404ing.
 *
 * `location.replace`, not a router <Navigate>: the target is a file the
 * bundler hashes, not a route, so react-router has nothing to navigate to. It
 * also leaves no entry in the history, so Back goes where the visitor came
 * from instead of bouncing them through this redirect again.
 */
function ResumeRedirect() {
  const href = siteContent.nav.items.find((item) => item.id === 'resume')?.href

  useEffect(() => {
    if (href) window.location.replace(href)
  }, [href])

  return (
    <main className="page page--secondary resume-redirect">
      <p className="resume-redirect-note">
        Opening the resume PDF.{' '}
        <a href={href} download="Evelyn_Gao_Resume.pdf">
          Download it directly
        </a>{' '}
        if nothing happens.
      </p>
    </main>
  )
}

/** `/#contact` was the contact section's address until #66 moved it to its own
 * page. Old links still arrive here, so send them on rather than dropping them
 * at the top of the opening with a fragment that matches nothing. */
function LegacyContactHash() {
  const { pathname, hash } = useLocation()
  if (pathname === '/' && hash === '#contact') return <Navigate to="/contact" replace />
  return null
}

/** The compact top bar is in normal document flow, so it has to be rendered
 * where it belongs on the page. On `/` that is below the opening, with the
 * About content, which is HomePage's job; everywhere else it is the first thing
 * on the page. */
function TopBarOutsideHome() {
  const { pathname } = useLocation()
  if (pathname === '/') return null
  return <SiteTopBar items={siteContent.nav.items} />
}

function Shell() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const reducedMotion = usePrefersReducedMotion()
  // Lives here, not in HomePage: the rail is outside the page and has to know
  // when the opening has handed over to it.
  //
  // With reduced motion there is no transition to drive and nothing to hand
  // over: the opening and the content are simply stacked in normal flow, so
  // everything is live from the first frame.
  const scrolledPast = useOpeningProgress(isHome && !reducedMotion)
  const handedOver = reducedMotion || scrolledPast

  return (
    <>
      <CustomCursor />
      <SiteRail items={siteContent.nav.items} dormant={isHome && !handedOver} />

      {/* `--home` only removes the reserve the nav needs above and beside the
          content: the opening is full-bleed, everything else is not. */}
      <div className={isHome ? 'page-root page-root--home' : 'page-root'}>
        <ScrollToTop />
        <LegacyContactHash />
        <TopBarOutsideHome />
        <Routes>
          <Route path="/" element={<HomePage handedOver={handedOver} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/proxima" element={<ProximaDetailPage />} />
          <Route path="/projects/almabot" element={<AlmabotDetailPage />} />
          <Route path="/projects/carelink" element={<CarelinkDetailPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/experience/bloom-mcp" element={<BloomMcpDetailPage />} />
          <Route path="/experience/sony" element={<SonyDetailPage />} />
          <Route path="/experience/tsinghua" element={<TsinghuaDetailPage />} />
          <Route path="/experience/:slug" element={<ExperienceDetailPage />} />
          <Route path="/resume" element={<ResumeRedirect />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
