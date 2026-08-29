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
            Proxima matches students with research opportunities based on the meaning of their
            interests rather than exact keyword overlap. Professor research profiles are embedded
            and cached offline. When a student searches, their interests are embedded in the same
            space, ranked against the professor profiles by cosine similarity, and then reranked by
            an LLM that returns the strongest matches with an explanation for each one.
          </p>
          <div className="detail-stat-strip">
            <div>
              <span className="detail-stat-num">1,500</span>
              <span className="detail-stat-label">professor profiles indexed</span>
            </div>
            <div>
              <span className="detail-stat-num">10</span>
              <span className="detail-stat-label">candidates sent to rerank</span>
            </div>
            <div>
              <span className="detail-stat-num">97%</span>
              <span className="detail-stat-label">correct match in top-3</span>
            </div>
            <div>
              <span className="detail-stat-num">89%</span>
              <span className="detail-stat-label">correct match ranked #1</span>
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
              I built Proxima because I had trouble finding research opportunities myself.
            </p>
            <p className="about-body project-detail-prose">
              Google and keyword search worked when I already knew the terminology a professor used,
              but often missed professors whose work was relevant to me because we described similar
              ideas differently.
            </p>
            <p className="about-body project-detail-prose">
              I wanted the search to work on meaning instead. Embeddings make that possible by
              representing text as vectors, where semantically similar passages are placed near each
              other. Cosine similarity then gives a simple way to rank how closely a student&apos;s
              interests align with each professor&apos;s research profile.
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
              The expensive part is done ahead of time. Roughly 1,500 professor profiles are
              embedded once and stored as cached vectors.
            </p>
            <p className="about-body project-detail-prose">
              At search time, Proxima embeds the student&apos;s interests and compares that vector
              against every cached professor vector using cosine similarity. The results are sorted
              by similarity, and the top 10 candidates are passed to the reranking stage.
            </p>
            <p className="about-body project-detail-prose">
              Because professor embeddings do not have to be recomputed for every request, most of
              the search path only requires one new embedding plus vector comparisons over the
              existing index.
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

          <h3 className="detail-subheading">From similarity to a final ranking</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Cosine similarity is useful for finding professors whose work is semantically close to
              a student&apos;s interests, but similarity alone does not capture every part of a good
              research match.
            </p>
            <p className="about-body project-detail-prose">
              The top 10 candidates therefore go to GPT-4o for a second-stage rerank. The model
              reads the student&apos;s full profile alongside each candidate, returns the top three,
              and explains why each professor may be relevant.
            </p>
            <p className="about-body project-detail-prose">
              I originally sent the top 20 similarity results into this stage, then reduced the
              shortlist to 10. That kept enough candidates to preserve recall while giving the
              reranker a smaller set to compare in more detail.
            </p>
          </div>

          <h3 className="detail-subheading">Why embeddings</h3>
          <p className="about-body project-detail-prose">
            Several simpler approaches can improve keyword search, but they solve different
            problems.
          </p>
          <div className="detail-tool-grid">
            <div className="detail-tool-card">
              <span className="name">Stopword filtering</span>
              <span className="desc">Removes common words that add little matching signal</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Rule-based matching</span>
              <span className="desc">
                Handles known word variants and explicitly defined relationships
              </span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Statistical classifiers</span>
              <span className="desc">
                Learn patterns from the words that appear in training data
              </span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Embeddings</span>
              <span className="desc">
                Represent passages in a shared semantic space, allowing related ideas to match even
                when they use different vocabulary
              </span>
            </div>
          </div>
          <p className="about-body project-detail-prose">
            That last property is the reason embeddings are the main retrieval mechanism in Proxima.
          </p>

          <h3 className="detail-subheading">When a match misses</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              When the expected professor does not appear near the top, there are a few different
              parts of the pipeline to inspect.
            </p>
            <p className="about-body project-detail-prose">
              The retrieval stage may need a larger candidate pool if the correct professor is being
              dropped before reranking. The rerank prompt can be adjusted if the right professor
              reaches the shortlist but is evaluated poorly. The student&apos;s input can also be
              expanded when the original query does not provide enough information to distinguish
              between otherwise similar candidates.
            </p>
            <p className="about-body project-detail-prose">
              Keeping retrieval and reranking separate makes it possible to tell which part of the
              pipeline caused the miss instead of treating ranking quality as one black-box problem.
            </p>
          </div>

          <h3 className="detail-subheading">Falling back gracefully</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Proxima also includes a fallback path for external API failures. If the embedding or
              reranking service is unavailable, search falls back to keyword matching instead of
              failing completely.
            </p>
            <p className="about-body project-detail-prose">
              I evaluate ranking quality using both a human-annotated evaluation set and an
              automated scoring script. On that evaluation set, the correct professor appears in the
              top three 97% of the time and is ranked first 89% of the time.
            </p>
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
