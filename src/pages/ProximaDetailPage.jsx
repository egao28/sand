import { Link, Navigate } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'
import { useDarkSurfaceOnIntersect } from '../hooks/useDarkSurfaceOnIntersect.js'
import { getProjectBySlug } from '../data/siteContent.js'
import { splitTechnical } from '../utils/splitTechnical.js'
import DiagramArrowMarker from '../components/DiagramArrowMarker.jsx'
import TechChipGrid from '../components/TechChipGrid.jsx'

export default function ProximaDetailPage() {
  const techRef = useDarkSurfaceOnIntersect()
  useRevealOnScroll()
  const project = getProjectBySlug('proxima')

  if (!project) {
    return <Navigate to="/projects" replace />
  }

  return (
    <main
      className={`page page--secondary project-detail-page project-detail-page--tone-${project.detailTone}`}
      aria-label="Proxima"
    >
      <div className="project-detail-back-wrap sec-inner">
        <Link className="project-detail-back" to="/projects">
          ← Projects
        </Link>
      </div>

      <header className="project-detail-hero reveal project-detail-hero--plain">
        <div className="sec-inner project-detail-hero-inner">
          <h1 className="project-detail-title">Proxima</h1>
          <p className="experience-detail-subtitle">
            Semantic research-matching search · embeddings + LLM rerank
          </p>
          <p className="about-body project-detail-prose">
            Proxima matches students to research opportunities by meaning, not by shared vocabulary.
            Every professor&apos;s research profile is embedded once, offline; a student&apos;s
            stated interests are embedded the same way at request time, ranked against all of them
            by cosine similarity, and the shortlist is reranked by an LLM that also explains why
            each match makes sense.
          </p>
          <div className="detail-stat-strip">
            <div>
              <span className="detail-stat-num">1,500</span>
              <span className="detail-stat-label">Professor profiles indexed</span>
            </div>
            <div>
              <span className="detail-stat-num">10</span>
              <span className="detail-stat-label">Candidates sent to rerank</span>
            </div>
            <div>
              <span className="detail-stat-num">97%</span>
              <span className="detail-stat-label">Correct match in top-3</span>
            </div>
            <div>
              <span className="detail-stat-num">89%</span>
              <span className="detail-stat-label">Correct match ranked #1</span>
            </div>
          </div>
        </div>
      </header>

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="proxima-motivation-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2
              id="proxima-motivation-heading"
              className="about-headline project-detail-section-title"
            >
              Why keyword search wasn&apos;t enough
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              I built this because I struggled with finding research opportunities myself.
            </p>
            <p className="about-body project-detail-prose">
              Using Google or keyword search did not work well. Even when I had similar interests as
              a professor, we were not using the same words to describe them.
            </p>
            <p className="about-body project-detail-prose">
              So I wanted to build something that helps people find research more efficiently, and
              make better use of the information that&apos;s already online — an embedding turns a
              passage of text into a vector of numbers such that texts with similar meaning point in
              a similar direction, and cosine similarity quantifies exactly that: 1 means identical
              meaning, 0 means unrelated.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="proxima-howitworks-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2
              id="proxima-howitworks-heading"
              className="about-headline project-detail-section-title"
            >
              How a match happens
            </h2>
          </div>

          <h3 className="detail-subheading">Offline once, online every time</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The expensive part happens exactly once: every one of roughly 1,500 professor profiles
              gets embedded and cached offline. A search itself is cheap — a student&apos;s
              interests are embedded on request and compared against every cached vector by cosine
              similarity, sorted highest to lowest, and the top candidates move forward.
            </p>
          </div>

          <figure className="detail-diagram">
            <div className="detail-diagram-scroll" tabIndex="0">
              <svg
                viewBox="0 0 1180 380"
                role="img"
                aria-label="1500 professor profiles are embedded offline into cached vectors. A student query is embedded online, compared by cosine similarity against the cached vectors, narrowed to a top-10, then reranked by GPT-4o into a top-3 with an explanation. If the external API is unreliable, the path falls back to keyword matching."
              >
                <defs>
                  <DiagramArrowMarker id="px-arrow" />
                </defs>

                <text
                  x="20"
                  y="55"
                  fontSize="11.5"
                  fontWeight="700"
                  fill="var(--accent)"
                  letterSpacing="0.4"
                >
                  OFFLINE, ONCE
                </text>
                <rect
                  x="20"
                  y="70"
                  width="230"
                  height="52"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="135" y="101" textAnchor="middle" fontSize="12">
                  1,500 professor profiles
                </text>
                <line
                  x1="250"
                  y1="96"
                  x2="330"
                  y2="96"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>
                <text x="290" y="86" textAnchor="middle" fontSize="10.5" opacity="0.7">
                  embed
                </text>
                <rect
                  x="332"
                  y="70"
                  width="200"
                  height="52"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="432" y="101" textAnchor="middle" fontSize="12" fontWeight="600">
                  Cached vectors
                </text>

                <line
                  x1="432"
                  y1="122"
                  x2="432"
                  y2="164"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>

                <text
                  x="20"
                  y="200"
                  fontSize="11.5"
                  fontWeight="700"
                  fill="var(--accent)"
                  letterSpacing="0.4"
                >
                  ONLINE, PER REQUEST
                </text>
                <rect
                  x="20"
                  y="215"
                  width="150"
                  height="60"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="95" y="250" textAnchor="middle" fontSize="12">
                  Student query
                </text>
                <line
                  x1="170"
                  y1="245"
                  x2="205"
                  y2="245"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>
                <rect
                  x="207"
                  y="215"
                  width="130"
                  height="60"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="272" y="250" textAnchor="middle" fontSize="12" fontWeight="600">
                  Embed
                </text>
                <line
                  x1="337"
                  y1="245"
                  x2="372"
                  y2="245"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>

                <rect
                  x="374"
                  y="200"
                  width="240"
                  height="90"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="494" y="238" textAnchor="middle" fontSize="12" fontWeight="600">
                  Cosine similarity vs.
                </text>
                <text x="494" y="256" textAnchor="middle" fontSize="12" fontWeight="600">
                  1,500 cached vectors
                </text>
                <text x="494" y="275" textAnchor="middle" fontSize="10.5" opacity="0.7">
                  sorted high → low
                </text>

                <line
                  x1="614"
                  y1="245"
                  x2="649"
                  y2="245"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>
                <rect
                  x="651"
                  y="215"
                  width="110"
                  height="60"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="706" y="250" textAnchor="middle" fontSize="12" fontWeight="600">
                  Top-10
                </text>

                <line
                  x1="761"
                  y1="245"
                  x2="796"
                  y2="245"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>
                <rect
                  x="798"
                  y="200"
                  width="170"
                  height="90"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="883" y="238" textAnchor="middle" fontSize="12" fontWeight="600">
                  GPT-4o rerank
                </text>
                <text x="883" y="256" textAnchor="middle" fontSize="10.5" opacity="0.7">
                  reads full student
                </text>
                <text x="883" y="271" textAnchor="middle" fontSize="10.5" opacity="0.7">
                  profile vs. each finalist
                </text>

                <line
                  x1="968"
                  y1="245"
                  x2="1003"
                  y2="245"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>
                <rect
                  x="1005"
                  y="215"
                  width="155"
                  height="60"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="1082" y="242" textAnchor="middle" fontSize="12" fontWeight="600">
                  Top-3 +
                </text>
                <text x="1082" y="259" textAnchor="middle" fontSize="12" fontWeight="600">
                  explanation
                </text>

                <line
                  x1="95"
                  y1="275"
                  x2="95"
                  y2="320"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  markerEnd="url(#px-arrow)"
                ></line>
                <rect
                  x="20"
                  y="322"
                  width="290"
                  height="44"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                ></rect>
                <text x="165" y="349" textAnchor="middle" fontSize="11.5">
                  External API unreliable → keyword match
                </text>
              </svg>
            </div>
            <figcaption>
              A student query is embedded and ranked by cosine similarity against 1,500 pre-computed
              professor-profile vectors; the top-10 candidates go to an LLM reranker, which reads
              the student&apos;s full profile against each one and returns a top-3 with a rationale.
              If the embedding/rerank API is unreachable, the path degrades to keyword matching
              instead of failing.
            </figcaption>
          </figure>

          <h3 className="detail-subheading">Recall wide, rerank narrow</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Cosine similarity alone gets the shortlist to roughly the right neighborhood, but it
              doesn&apos;t know what actually makes a match good for a specific student — it only
              knows what&apos;s close in vector space. So the pipeline recalls broadly by
              similarity, then hands a narrower shortlist to GPT-4o, which reads the student&apos;s
              actual profile against each finalist and returns a top-3 with an explanation of why.
              That shortlist width was tuned down from an original top-20 to a top-10 — wide enough
              to protect recall, narrow enough that the reranker&apos;s judgment on each candidate
              stays sharp.
            </p>
          </div>

          <h3 className="detail-subheading">Telling meaning from noise</h3>
          <p className="about-body project-detail-prose">
            None of the cruder approaches actually reach for the same thing an embedding does:
          </p>
          <div className="detail-tool-grid">
            <div className="detail-tool-card">
              <span className="name">Stopword filtering</span>
              <span className="desc">Strips words that carry no signal on their own</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Rule-based matching</span>
              <span className="desc">Catches literal word variants, nothing else</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Statistical classifiers</span>
              <span className="desc">Model surface word patterns, not what they mean</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Embeddings</span>
              <span className="desc">The only one that represents meaning itself</span>
            </div>
          </div>

          <h3 className="detail-subheading">When the match misses</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              When the right professor doesn&apos;t surface, there&apos;s no single fix — it&apos;s
              usually one of three levers: widen the candidate pool (raise k), tune the rerank
              prompt so its judgments are staged and quantified rather than one holistic guess, or
              expose more of the student&apos;s own query framing so the reranker has more to work
              with.
            </p>
          </div>

          <h3 className="detail-subheading">Falling back gracefully</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Proxima also has a degradation path: when the external embedding or rerank API is
              unreliable, it falls back to keyword matching rather than failing outright. Quality is
              measured two ways — a human-annotated evaluation set and an automated scoring script —
              landing at 97% of the time the correct professor appears somewhere in the top-3, and
              89% of the time it&apos;s ranked first.
            </p>
          </div>

          <div className="detail-callout">
            <strong>Where the LLM sits.</strong> In Proxima, the model sits at the exit: recall is
            entirely embeddings and cosine similarity, and the LLM only reranks and explains a
            shortlist that similarity search already produced. It&apos;s close to the mirror image
            of AlmaBot, where the LLM sits at the entry instead.
          </div>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="proxima-demo-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2 id="proxima-demo-heading" className="about-headline project-detail-section-title">
              Try it here
            </h2>
          </div>
          <p className="project-detail-demo-lead">
            <a
              href={project.demoUrl}
              className="project-detail-demo-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.demoLabel} (opens in a new tab)`}
            >
              {project.demoLabel}
            </a>
          </p>
        </div>
      </section>

      <section
        ref={techRef}
        className="project-detail-tech reveal"
        aria-labelledby="proxima-technical-heading"
      >
        <div className="sec-inner project-detail-tech-inner">
          <div className="section-title-row section-title-row--on-dark">
            <h2
              id="proxima-technical-heading"
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
