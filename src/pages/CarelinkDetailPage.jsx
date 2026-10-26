import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'
import { useDarkSurfaceOnIntersect } from '../hooks/useDarkSurfaceOnIntersect.js'
import { getProjectBySlug } from '../data/siteContent.js'
import { splitTechnical } from '../utils/splitTechnical.js'
import TechChipGrid from '../components/TechChipGrid.jsx'
import DemoVideo from '../components/DemoVideo.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function CarelinkDetailPage() {
  const techRef = useDarkSurfaceOnIntersect()
  useRevealOnScroll()
  const project = getProjectBySlug('carelink')
  const demoVideo = project?.demoVideo ?? null
  const demoUrl = project?.demoUrl?.trim()
  const demoLabel = project?.demoLabel?.trim() || 'Open project'

  if (!project) {
    return <NotFoundPage />
  }

  return (
    <main
      className={`page page--secondary project-detail-page project-detail-page--tone-${project.detailTone}`}
      aria-label="CareLink"
    >
      <div className="project-detail-back-wrap sec-inner">
        <Link className="project-detail-back" to="/projects">
          ← Projects
        </Link>
      </div>

      <header className="project-detail-hero reveal project-detail-hero--plain">
        <div className="sec-inner project-detail-hero-inner">
          <h1 className="project-detail-title">CareLink</h1>
          <p className="experience-detail-subtitle">
            Making cancer support resources easier to find
          </p>
          <p className="about-body project-detail-prose">
            An interactive directory of cancer support organizations, explored through keyword
            search, multi-criteria filters, and a map that narrows alongside the results.
          </p>
          <dl className="detail-meta-row">
            <div>
              <dt>Role</dt>
              <dd>Team lead and frontend developer</dd>
            </div>
            <div>
              <dt>Timeline</dt>
              <dd>February 2025</dd>
            </div>
            <div>
              <dt>Context</dt>
              <dd>Code Ada Women&apos;s Hackathon, team of four</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>React, TypeScript, Leaflet, React Router</dd>
            </div>
          </dl>
        </div>
      </header>

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="carelink-overview-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2
              id="carelink-overview-heading"
              className="about-headline project-detail-section-title"
            >
              Overview
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Finding support after a cancer diagnosis usually means working through separate
              websites, comparing unfamiliar organizations, and piecing together which ones offer
              the kind of help that is actually needed. The information exists; it is scattered
              across the organizations that hold it.
            </p>
            <p className="about-body project-detail-prose">
              CareLink was built over a hackathon weekend by a team of four to put that information
              in one place. It holds 541 cancer support organizations across all 50 states in a
              single index, each tagged with the cancer types it covers and the services it
              provides, and shows them on a map next to the list.
            </p>
            <p className="about-body project-detail-prose">
              I led the team and built the frontend: the search and filter behaviour, the map layer,
              the detail view, and the state that keeps the three in agreement as the result set
              changes.
            </p>
          </div>
        </div>
      </section>

      <section
        className="project-detail-approach reveal"
        aria-labelledby="carelink-journey-heading"
      >
        <div className="sec-inner project-detail-approach-inner">
          <div className="section-title-row">
            <h2
              id="carelink-journey-heading"
              className="about-headline project-detail-section-title"
            >
              Three ways into the directory
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              A list of 541 organizations is only useful if it can be cut down. Rather than
              paginating a static directory, we built the app around a single result set that the
              search box, the filters, the map, and the detail card all read from.
            </p>
          </div>

          <div className="detail-timeline">
            <div className="detail-tl-row">
              <span className="detail-tl-tag">01</span>
              <span className="detail-tl-body">
                <strong>Search and filter.</strong> A free-text query matches an organization&apos;s
                name, description, city, and state along with its tags. Three dropdowns narrow it
                further: twenty cancer types, nine service categories running from financial
                assistance to lodging and travel, and the state an organization works from. A
                running count shows how many of the 541 are left, and a single reset clears all of
                it.
              </span>
            </div>
            <div className="detail-tl-row">
              <span className="detail-tl-tag">02</span>
              <span className="detail-tl-body">
                <strong>See where they are.</strong> The map carries only the organizations
                currently in the list, so narrowing the list narrows the map. Selecting an
                organization from either side highlights the row and flies the map to its pin, which
                makes the list and the map two views of one result set rather than two separate
                features.
              </span>
            </div>
            <div className="detail-tl-row">
              <span className="detail-tl-tag">03</span>
              <span className="detail-tl-body">
                <strong>Follow a result out.</strong> Opening an organization shows its services, a
                short description, and where it is based, with links to its official site and to
                driving directions. CareLink&apos;s job ends at the point where someone leaves for
                the organization itself.
              </span>
            </div>
          </div>
        </div>
      </section>

      {demoVideo && (
        <section className="project-detail-demo reveal" aria-labelledby="carelink-demo-heading">
          <div className="sec-inner project-detail-demo-inner">
            <div className="section-title-row">
              <h2
                id="carelink-demo-heading"
                className="about-headline project-detail-section-title"
              >
                The directory in use
              </h2>
            </div>
            {demoVideo.lead && <p className="about-body project-detail-prose">{demoVideo.lead}</p>}
            <DemoVideo
              src={demoVideo.src}
              poster={demoVideo.poster}
              width={demoVideo.width}
              height={demoVideo.height}
              ariaLabel={demoVideo.ariaLabel}
            />
          </div>
        </section>
      )}

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="carelink-frontend-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2
              id="carelink-frontend-heading"
              className="about-headline project-detail-section-title"
            >
              Building the interface
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              CareLink is a React and TypeScript app with one screen: a full-bleed map with a
              floating panel over it. There is no backend. The directory is a JSON file loaded once
              at startup and held in memory, and everything on screen is derived from it.
            </p>
          </div>

          <h3 className="detail-subheading">Filtering in one derived pass</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The query and the three filters are not three pieces of state with their own update
              logic. One function takes the current values and returns the organizations that match,
              applying cancer type, then service, then state, then the text search across the fields
              worth searching. The component re-derives that array whenever an input changes, and
              the list, the count, and the map markers all render from it.
            </p>
            <p className="about-body project-detail-prose">
              Deriving the result set instead of maintaining it is what keeps the views from
              disagreeing. There is no code path that can narrow the list and forget the map.
            </p>
          </div>

          <h3 className="detail-subheading">The URL as the application state</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The query, the three filters, and the organization currently open live in the
              URL&apos;s search parameters rather than in component state. The inputs read their
              values back out of the URL, so a filtered view is a link: the breast cancer
              organizations offering lodging and travel help in Texas can be sent to someone else
              and open the same way.
            </p>
            <p className="about-body project-detail-prose">
              Those updates replace the current history entry instead of pushing a new one. Pushing
              would be the obvious default and the wrong one, since leaving the page would then mean
              pressing back once per keystroke typed into the search box.
            </p>
          </div>

          <h3 className="detail-subheading">Making a coarse map readable</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The map is Leaflet over CARTO&apos;s label-free basemap, chosen so that place names
              printed on the tiles do not compete with the organization names drawn on top of them.
              Each result renders as a circle marker with its name on hover, and the selected one is
              drawn larger and in the accent colour.
            </p>
            <p className="about-body project-detail-prose">
              The directory is geocoded at city level, and an organization without a usable city
              falls back to the centroid of its state. That leaves 199 of the 541 sharing an exact
              coordinate with at least one other, where they stack into a single dot that cannot be
              clicked apart. Before rendering, pins on a shared coordinate are spread around a small
              ring whose radius grows with the size of the cluster. It trades precision the data
              never had for a map that can be used.
            </p>
          </div>

          <div className="detail-tool-grid detail-block-gap">
            <div className="detail-tool-card">
              <span className="name">Filter pipeline</span>
              <span className="desc">
                One function maps the query plus cancer type, service, and state onto the matching
                organizations. The list, the count, and the markers all render from its output.
              </span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Leaflet map layer</span>
              <span className="desc">
                Markers are rebuilt from the filtered results on every change, with hover tooltips,
                a flight to the selected pin, and a ring spread for shared coordinates.
              </span>
            </div>
            <div className="detail-tool-card">
              <span className="name">URL-encoded view</span>
              <span className="desc">
                Search parameters hold the query, the filters, and the open organization, so every
                state the app can be in has a link that restores it.
              </span>
            </div>
          </div>

          <h3 className="detail-subheading">Where the directory comes from</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The 541 entries are assembled offline rather than maintained by hand. A build script
              merges 55 organizations written up individually, the national ones with real
              descriptions and checked links, with 486 cancer-focused nonprofits pulled from the
              ProPublica Nonprofit Explorer API, geocoded against a US cities dataset and tagged by
              matching their names against the cancer-type and service vocabularies. A second pass
              resolves official websites and confirms a domain for about a third of them, sending
              the rest to a search link.
            </p>
            <p className="about-body project-detail-prose">
              The mix is worth stating plainly, because it is what the interface is built on top of.
              The curated entries carry descriptions someone wrote; the gleaned ones carry
              categories inferred from a name. It buys national coverage that four people could not
              write by hand over a weekend, and it is the reason the app presents a tag as a way to
              narrow a list rather than as a verified fact about an organization.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-approach reveal" aria-labelledby="carelink-team-heading">
        <div className="sec-inner project-detail-approach-inner">
          <div className="section-title-row">
            <h2 id="carelink-team-heading" className="about-headline project-detail-section-title">
              Working as a team of four
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              CareLink was built in a weekend, which made the seams between people&apos;s work the
              thing most likely to go wrong. The first thing we settled was the shape of an
              organization record, its identifier, categories, coordinates, and link, so the
              directory and the interface could be built at the same time instead of one waiting on
              the other.
            </p>
            <p className="about-body project-detail-prose">
              As team lead I kept the work divided so that nobody was blocked waiting on someone
              else, and took the frontend myself: search, filtering, the map layer, the detail card,
              and the responsive layout that turns the side panel into a sheet above the map on a
              phone.
            </p>
            <p className="about-body project-detail-prose">
              The difficulty was never any one of search, a map, or a detail view on its own. It was
              making the three behave as one view of one result set before the deadline.
            </p>
          </div>
        </div>
      </section>

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="carelink-reflection-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2
              id="carelink-reflection-heading"
              className="about-headline project-detail-section-title"
            >
              Reflection
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              CareLink was the first project where I could not separate the implementation from the
              interface. A directory is worth only as much as the paths through it, and most of the
              work went into the short route from 541 entries to the few that matter to one person.
            </p>
            <p className="about-body project-detail-prose">
              It also changed how I think about what an interface claims on behalf of its data.
              City-level coordinates and tags inferred from an organization&apos;s name are useful
              for narrowing a list, but drawing them as exact pins and verified labels would claim
              more than the directory knows.
            </p>
            <p className="about-body project-detail-prose">
              More than anything, it is where I started treating usability as part of the
              engineering rather than something applied once the features work.
            </p>
          </div>
        </div>
      </section>

      {demoUrl && (
        <section className="project-detail-demo reveal" aria-labelledby="carelink-try-heading">
          <div className="sec-inner project-detail-demo-inner">
            <div className="section-title-row">
              <h2 id="carelink-try-heading" className="about-headline project-detail-section-title">
                Try it here
              </h2>
            </div>
            <p className="project-detail-demo-lead">
              <a
                href={demoUrl}
                className="project-detail-demo-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${demoLabel} (opens in a new tab)`}
              >
                {demoLabel}
              </a>
            </p>
          </div>
        </section>
      )}

      <section
        ref={techRef}
        className="project-detail-tech reveal"
        aria-labelledby="carelink-technical-heading"
      >
        <div className="sec-inner project-detail-tech-inner">
          <div className="section-title-row section-title-row--on-dark">
            <h2
              id="carelink-technical-heading"
              className="about-headline project-detail-section-title project-detail-section-title--on-dark"
            >
              Technical
            </h2>
          </div>
          <TechChipGrid chips={splitTechnical(project.technical)} />
        </div>
      </section>
    </main>
  )
}
