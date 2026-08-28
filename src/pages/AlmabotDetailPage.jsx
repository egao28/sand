import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'
import { getProjectBySlug } from '../data/siteContent.js'

export default function AlmabotDetailPage() {
  const techRef = useRef(null)
  useRevealOnScroll()
  const project = getProjectBySlug('almabot')

  useEffect(() => {
    const el = techRef.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (!e) return
        const on = e.isIntersecting && e.intersectionRatio > 0.15
        document.body.classList.toggle('cursor-dark-surface', on)
      },
      { threshold: [0, 0.15, 0.35, 0.6, 1] }
    )

    io.observe(el)
    return () => {
      io.disconnect()
      document.body.classList.remove('cursor-dark-surface')
    }
  }, [])

  const demoUrl = project?.demoUrl?.trim()
  const demoLabel = project?.demoLabel?.trim() || 'Open project'

  return (
    <main
      className="page page--secondary project-detail-page project-detail-page--tone-b"
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
            AlmaBot turns a plain-English planning request into a schedule that actually satisfies
            prerequisites. An LLM only handles the entry point — parsing intent into structured
            constraints; the schedule itself comes out of a deterministic topological sort over a
            prerequisite dependency graph built from 800,000+ UIUC course records.
          </p>
          <div className="detail-stat-strip">
            <div>
              <span className="detail-stat-num">800k+</span>
              <span className="detail-stat-label">Course records → dependency graph</span>
            </div>
            <div>
              <span className="detail-stat-num">2</span>
              <span className="detail-stat-label">Layers: language + graph scheduling</span>
            </div>
            <div>
              <span className="detail-stat-num">4</span>
              <span className="detail-stat-label">Constraint types, resolved in order</span>
            </div>
            <div>
              <span className="detail-stat-num">Kahn&apos;s</span>
              <span className="detail-stat-label">Proves a plan valid — or that none exists</span>
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
              I built this at UIUC because I didn&apos;t have an academic advisor and had to figure
              out course planning on my own.
            </p>
            <p className="about-body project-detail-prose">
              Since I had access to the course dataset, I wanted to build something that takes a
              student&apos;s preferences and automatically generates a workable schedule — one
              that&apos;s actually guaranteed to respect prerequisites, not just plausible-looking.
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
              Two layers, two very different jobs
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              AlmaBot splits cleanly into a language layer and a scheduling layer, and they
              don&apos;t share responsibility for the same decision. The language layer, built with
              LangChain, turns a student&apos;s natural-language request into a structured
              constraint object, resolved in a fixed order: prerequisites already completed,
              preferred time slots, gen-ed requirements, then remaining completed coursework. Its
              whole job is translation — turning something ambiguous into something the scheduler
              can act on deterministically.
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
                  <marker
                    id="ab-arrow"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6.5"
                    markerHeight="6.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M0,0 L10,5 L0,10 z" fill="currentColor"></path>
                  </marker>
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

          <h3 className="detail-subheading">A schedule that&apos;s provable, not guessed</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The scheduling layer builds a prerequisite dependency graph from 800,000+ course
              records, then runs Kahn&apos;s topological-sort algorithm to actually produce an
              ordering: courses with no unmet prerequisites become eligible first and get selected,
              and the graph unwinds one layer at a time until the plan is filled. When several
              courses are eligible at once, ties break toward the one available soonest. The same
              property that makes this work is what makes an unsatisfiable request provable instead
              of silently wrong — a genuine prerequisite cycle is exactly what Kahn&apos;s algorithm
              surfaces directly: if the graph can&apos;t be fully ordered, there is no valid
              schedule, and AlmaBot can say so instead of returning something incomplete.
            </p>
          </div>

          <h3 className="detail-subheading">Turning language into constraints</h3>
          <div className="detail-tool-grid">
            <div className="detail-tool-card">
              <span className="name">1 · Prerequisites</span>
              <span className="desc">Courses already completed, resolved first</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">2 · Time slots</span>
              <span className="desc">The student&apos;s preferred windows</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">3 · Gen-ed</span>
              <span className="desc">Remaining general-education requirements</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">4 · Completed courses</span>
              <span className="desc">Everything else already satisfied</span>
            </div>
          </div>

          <div className="detail-callout">
            <strong>Where the LLM actually sits.</strong> Across these projects, the model ends up
            in a different place each time, doing a different amount of work. In AlmaBot, it&apos;s
            the entry point — it parses the request, but the schedule itself is produced by a
            deterministic graph algorithm it never touches. In Proxima, it&apos;s the exit point —
            recall is pure embeddings and cosine similarity, and the model only reranks and explains
            a shortlist search already produced. And in bloom-mcp, it&apos;s neither: the model just
            selects which validated tool to call — the computation itself is fully delegated to a
            science library.
          </div>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="almabot-demo-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2 id="almabot-demo-heading" className="about-headline project-detail-section-title">
              Try it here
            </h2>
          </div>
          <p className="project-detail-demo-lead">
            {demoUrl ? (
              <a
                href={demoUrl}
                className="project-detail-demo-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${demoLabel} (opens in a new tab)`}
              >
                {demoLabel}
              </a>
            ) : (
              <a
                href="#"
                className="project-detail-demo-link"
                onClick={(e) => e.preventDefault()}
                aria-label={`${demoLabel} (link coming soon)`}
              >
                {demoLabel} <span className="project-detail-demo-soon">(coming soon)</span>
              </a>
            )}
          </p>
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
          <div className="project-tech-grid" aria-label="Technical stack">
            {[
              'course scheduling',
              'constraint solving',
              'prerequisite graph',
              "Kahn's algorithm",
              'cycle detection',
              'dataset processing',
              'LLM integration',
              'LangChain',
              'Gradio',
              'planning system design',
            ].map((label) => (
              <span key={label} className="project-tech-chip">
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
