import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'
import { useDarkSurfaceOnIntersect } from '../hooks/useDarkSurfaceOnIntersect.js'
import { getProjectBySlug } from '../data/siteContent.js'
import { splitTechnical } from '../utils/splitTechnical.js'
import DiagramArrowMarker from '../components/DiagramArrowMarker.jsx'
import TechChipGrid from '../components/TechChipGrid.jsx'
import DemoVideo from '../components/DemoVideo.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function AlmabotDetailPage() {
  const techRef = useDarkSurfaceOnIntersect()
  useRevealOnScroll()
  const project = getProjectBySlug('almabot')

  if (!project) {
    return <NotFoundPage />
  }

  return (
    <main
      className={`page page--secondary project-detail-page project-detail-page--tone-${project.detailTone}`}
      aria-label="AlmaBot"
    >
      <div className="project-detail-back-wrap sec-inner">
        <Link className="project-detail-back" to="/projects">
          ← Projects
        </Link>
      </div>

      <header className="project-detail-hero reveal project-detail-hero--plain">
        <div className="sec-inner project-detail-hero-inner">
          <h1 className="project-detail-title">AlmaBot</h1>
          <p className="experience-detail-subtitle">
            Course-planning agent · LangChain + graph scheduling · UIUC
          </p>
          <p className="about-body project-detail-prose">
            AlmaBot turns a plain-English course-planning request into a schedule that respects
            prerequisite dependencies. An LLM handles the language layer by translating a
            student&apos;s request into structured constraints; the schedule itself is produced
            deterministically from a prerequisite graph built from 800,000+ UIUC course records.
          </p>
          <div className="detail-stat-strip">
            <div>
              <span className="detail-stat-num">800k+</span>
              <span className="detail-stat-label">course records processed</span>
            </div>
            <div>
              <span className="detail-stat-num">2</span>
              <span className="detail-stat-label">layers: language + graph scheduling</span>
            </div>
            <div>
              <span className="detail-stat-num">4</span>
              <span className="detail-stat-label">constraint types</span>
            </div>
            <div>
              <span className="detail-stat-num">Kahn&apos;s</span>
              <span className="detail-stat-label">
                algorithm for topological ordering and cycle detection
              </span>
            </div>
          </div>
        </div>
      </header>

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="almabot-motivation-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2
              id="almabot-motivation-heading"
              className="about-headline project-detail-section-title"
            >
              Why I built this
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              I built AlmaBot at UIUC because I had to do much of my own course planning and found
              it difficult to reason through prerequisites, degree requirements, and scheduling
              preferences at the same time.
            </p>
            <p className="about-body project-detail-prose">
              Since I had access to the course dataset, I wanted to build something that could take
              those preferences in natural language and turn them into a schedule whose prerequisite
              ordering could actually be checked, rather than asking an LLM to generate a plan that
              only looked plausible.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="almabot-howitworks-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2
              id="almabot-howitworks-heading"
              className="about-headline project-detail-section-title"
            >
              Two layers, two different jobs
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              AlmaBot separates language understanding from scheduling.
            </p>
            <p className="about-body project-detail-prose">
              The language layer, built with LangChain, parses a student&apos;s request into
              structured constraints: courses and prerequisites already satisfied, preferred time
              slots, remaining general-education requirements, and other completed coursework.
            </p>
            <p className="about-body project-detail-prose">
              Those constraints are then passed to a separate scheduling layer. Course prerequisites
              are represented as a dependency graph, and the scheduler uses Kahn&apos;s
              topological-sort algorithm to determine a valid prerequisite ordering. The LLM does
              not decide which prerequisite relationships are valid or generate the final ordering
              itself.
            </p>
          </div>

          <figure className="detail-diagram">
            <div className="detail-diagram-scroll" tabIndex="0">
              <svg
                viewBox="0 0 1180 300"
                role="img"
                aria-label="A natural language request is parsed by LangChain into structured constraints. Separately, 800,000+ course records form a prerequisite dependency graph, ordered by Kahn's topological sort into a valid schedule, or a detected cycle meaning no valid schedule exists."
              >
                <defs>
                  <DiagramArrowMarker id="ab-arrow" />
                </defs>

                <text
                  x="20"
                  y="30"
                  fontSize="11.5"
                  fontWeight="700"
                  fill="var(--accent)"
                  letterSpacing="0.4"
                >
                  LAYER 1 — LANGUAGE
                </text>
                <rect
                  x="20"
                  y="42"
                  width="190"
                  height="56"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="115" y="66" textAnchor="middle" fontSize="12">
                  Natural-language
                </text>
                <text x="115" y="82" textAnchor="middle" fontSize="12">
                  request
                </text>
                <line
                  x1="210"
                  y1="70"
                  x2="245"
                  y2="70"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ab-arrow)"
                ></line>
                <rect
                  x="247"
                  y="42"
                  width="150"
                  height="56"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="322" y="74" textAnchor="middle" fontSize="12" fontWeight="600">
                  LangChain parse
                </text>
                <line
                  x1="397"
                  y1="70"
                  x2="432"
                  y2="70"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ab-arrow)"
                ></line>
                <rect
                  x="434"
                  y="30"
                  width="330"
                  height="80"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="599" y="55" textAnchor="middle" fontSize="11.5" fontWeight="600">
                  Constraints, resolved in order:
                </text>
                <text x="599" y="74" textAnchor="middle" fontSize="11">
                  prereqs → time slots → gen-ed → completed
                </text>

                <rect
                  x="20"
                  y="150"
                  width="1120"
                  height="130"
                  rx="6"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                ></rect>
                <text
                  x="580"
                  y="172"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="var(--accent)"
                  letterSpacing="0.4"
                >
                  LAYER 2 — DETERMINISTIC SCHEDULING
                </text>

                <rect
                  x="40"
                  y="190"
                  width="220"
                  height="56"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="150" y="222" textAnchor="middle" fontSize="12">
                  800,000+ course records
                </text>
                <line
                  x1="260"
                  y1="218"
                  x2="295"
                  y2="218"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ab-arrow)"
                ></line>
                <rect
                  x="297"
                  y="190"
                  width="220"
                  height="56"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="407" y="222" textAnchor="middle" fontSize="12" fontWeight="600">
                  Prerequisite graph
                </text>
                <line
                  x1="517"
                  y1="218"
                  x2="552"
                  y2="218"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ab-arrow)"
                ></line>
                <rect
                  x="554"
                  y="190"
                  width="230"
                  height="56"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="669" y="212" textAnchor="middle" fontSize="12" fontWeight="600">
                  Kahn&apos;s topological sort
                </text>
                <text x="669" y="228" textAnchor="middle" fontSize="10" opacity="0.7">
                  in-degree-0 courses first
                </text>

                <line
                  x1="784"
                  y1="210"
                  x2="819"
                  y2="210"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ab-arrow)"
                ></line>
                <rect
                  x="821"
                  y="188"
                  width="150"
                  height="30"
                  rx="4"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="896" y="207" textAnchor="middle" fontSize="11">
                  Valid schedule
                </text>

                <line
                  x1="784"
                  y1="228"
                  x2="819"
                  y2="228"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  markerEnd="url(#ab-arrow)"
                ></line>
                <rect
                  x="821"
                  y="222"
                  width="290"
                  height="30"
                  rx="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                ></rect>
                <text x="966" y="241" textAnchor="middle" fontSize="11">
                  Cycle detected → no valid schedule
                </text>
              </svg>
            </div>
            <figcaption>
              The language layer only translates a request into structured constraints. The actual
              schedule comes out of a separate, deterministic layer: a prerequisite graph built from
              800,000+ course records, ordered by Kahn&apos;s topological-sort algorithm — which
              also proves when no valid schedule exists, rather than guessing.
            </figcaption>
          </figure>

          <h3 className="detail-subheading">Building a valid course order</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The scheduling layer constructs a directed prerequisite graph from the UIUC course
              data. A course becomes eligible once all of its prerequisite dependencies have been
              satisfied.
            </p>
            <p className="about-body project-detail-prose">
              Kahn&apos;s algorithm starts with courses that have no unmet prerequisites, removes
              them from the graph as they are scheduled, and continues until the required courses
              have been ordered. When multiple courses are eligible at the same point, the scheduler
              can apply additional preferences, such as choosing the course available sooner.
            </p>
            <p className="about-body project-detail-prose">
              The algorithm also provides a direct check for prerequisite cycles. If all nodes
              cannot be removed during the topological sort, the graph contains a cycle and no valid
              prerequisite ordering exists for that dependency structure.
            </p>
            <p className="about-body project-detail-prose">
              This keeps prerequisite correctness in deterministic code rather than relying on the
              model to reason through a long chain of course dependencies.
            </p>
          </div>

          <h3 className="detail-subheading">Turning language into constraints</h3>
          <p className="about-body project-detail-prose">
            The language layer converts a student&apos;s request into four types of information used
            by the scheduler:
          </p>
          <div className="detail-tool-grid">
            <div className="detail-tool-card">
              <span className="name">1 · Prerequisites</span>
              <span className="desc">Courses and prerequisite requirements already satisfied</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">2 · Time slots</span>
              <span className="desc">Preferred scheduling windows</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">3 · Gen-ed requirements</span>
              <span className="desc">
                General-education requirements that still need to be completed
              </span>
            </div>
            <div className="detail-tool-card">
              <span className="name">4 · Completed coursework</span>
              <span className="desc">Other courses that should not be scheduled again</span>
            </div>
          </div>
          <p className="about-body project-detail-prose">
            The parser resolves these into a structured representation before the scheduling
            algorithm runs, so the graph layer works with explicit constraints rather than the
            original natural-language request.
          </p>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="almabot-demo-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2 id="almabot-demo-heading" className="about-headline project-detail-section-title">
              Demo
            </h2>
          </div>
          <p className="about-body project-detail-prose">
            A full run through the planner: picking a major and year, listing coursework already
            taken, and getting back a semester-by-semester path with the remaining Gen Eds.
          </p>
          <DemoVideo
            src="/almabot-demo.mp4"
            poster="/almabot-demo-poster.jpg"
            width={1280}
            height={940}
            ariaLabel="Screen recording of an AlmaBot planner run"
          />
        </div>
      </section>

      <section
        ref={techRef}
        className="project-detail-tech reveal"
        aria-labelledby="almabot-technical-heading"
      >
        <div className="sec-inner project-detail-tech-inner">
          <div className="section-title-row section-title-row--on-dark">
            <h2
              id="almabot-technical-heading"
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
