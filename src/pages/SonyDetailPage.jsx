import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'
import { useDarkSurfaceOnIntersect } from '../hooks/useDarkSurfaceOnIntersect.js'
import DiagramArrowMarker from '../components/DiagramArrowMarker.jsx'
import TechChipGrid from '../components/TechChipGrid.jsx'

export default function SonyDetailPage() {
  const techRef = useDarkSurfaceOnIntersect()
  useRevealOnScroll()

  return (
    <main
      className="page page--secondary project-detail-page project-detail-page--tone-e"
      aria-label="Sony"
    >
      <div className="project-detail-back-wrap sec-inner">
        <Link className="project-detail-back" to="/about">
          ← About
        </Link>
      </div>

      <header className="project-detail-hero reveal project-detail-hero--plain">
        <div className="sec-inner project-detail-hero-inner">
          <h1 className="project-detail-title">Sony</h1>
          <p className="experience-detail-subtitle">
            Computer Science Operations &amp; Maintenance Intern · May – Sep 2025
          </p>
          <p className="about-body project-detail-prose">
            Over four months, I worked on three internal systems: a Python pipeline for release and
            asset delivery, a configurable rules engine for routing weekly user feedback, and
            migration tooling for changes to a live production database with more than 100,000 rows.
          </p>
          <div className="detail-stat-strip">
            <div>
              <span className="detail-stat-num">100+</span>
              <span className="detail-stat-label">releases and assets automated weekly</span>
            </div>
            <div>
              <span className="detail-stat-num">500+</span>
              <span className="detail-stat-label">feedback comments routed weekly</span>
            </div>
            <div>
              <span className="detail-stat-num">100k+</span>
              <span className="detail-stat-label">production rows migrated</span>
            </div>
            <div>
              <span className="detail-stat-num">~60%</span>
              <span className="detail-stat-label">faster release preparation</span>
            </div>
          </div>
        </div>
      </header>

      <section className="project-detail-motivation reveal" aria-labelledby="sony-context-heading">
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2 id="sony-context-heading" className="about-headline project-detail-section-title">
              How things shipped
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              My work usually followed the same process: understand the operational requirement,
              design the change, test it against real workflows, and get approval from the team that
              would use it before rollout.
            </p>
            <p className="about-body project-detail-prose">
              That mattered because these systems were part of day-to-day operations. A change could
              affect production data, release preparation, or where real user feedback was sent, so
              passing a unit test was only one part of deciding whether something was ready to ship.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="sony-rules-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2 id="sony-rules-heading" className="about-headline project-detail-section-title">
              A configurable feedback-routing system
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The team received more than 500 pieces of user feedback each week that had to be
              distributed across different teams.
            </p>
            <p className="about-body project-detail-prose">
              The first version used a hardcoded keyword list. It worked for simple cases, but
              became difficult to maintain as more categories and wording variations were added.
            </p>
            <p className="about-body project-detail-prose">
              I replaced that structure with two components: a <code>rules.yaml</code> file
              containing the routing rules and a <code>router.py</code> module responsible for
              applying them. Each rule defines an ID, category, destination team, priority, and
              keyword or regex pattern.
            </p>
            <p className="about-body project-detail-prose">
              The router loads the configuration with <code>yaml.safe_load</code> and evaluates
              comments in priority order. Matches are routed to the corresponding team, while
              comments that cannot be classified reliably are sent to a manual review queue instead
              of being assigned automatically.
            </p>
            <p className="about-body project-detail-prose">
              Because routing behavior lives in configuration rather than application logic, adding
              or changing a category only requires updating the rules file.
            </p>
          </div>

          <figure className="detail-diagram">
            <div className="detail-diagram-scroll" tabIndex="0">
              <svg
                viewBox="0 0 1000 200"
                role="img"
                aria-label="A feedback comment is checked by router.py against rules.yaml in priority order. A confident match routes to the owning team; anything below that confidence goes into a manual review queue."
              >
                <defs>
                  <DiagramArrowMarker id="sy-arrow" />
                </defs>
                <rect
                  x="20"
                  y="70"
                  width="180"
                  height="60"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="110" y="105" textAnchor="middle" fontSize="12">
                  Feedback comment
                </text>
                <line
                  x1="200"
                  y1="100"
                  x2="235"
                  y2="100"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#sy-arrow)"
                ></line>
                <rect
                  x="237"
                  y="70"
                  width="150"
                  height="60"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="312" y="105" textAnchor="middle" fontSize="12" fontWeight="600">
                  router.py
                </text>
                <line
                  x1="387"
                  y1="100"
                  x2="422"
                  y2="100"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#sy-arrow)"
                ></line>
                <rect
                  x="424"
                  y="60"
                  width="270"
                  height="80"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="559" y="90" textAnchor="middle" fontSize="12" fontWeight="600">
                  rules.yaml
                </text>
                <text x="559" y="107" textAnchor="middle" fontSize="10.5" opacity="0.7">
                  checked in priority order
                </text>
                <text x="559" y="122" textAnchor="middle" fontSize="10.5" opacity="0.7">
                  rule_id · category · route_to
                </text>

                <line
                  x1="694"
                  y1="85"
                  x2="729"
                  y2="70"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#sy-arrow)"
                ></line>
                <rect
                  x="731"
                  y="40"
                  width="230"
                  height="40"
                  rx="4"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="846" y="65" textAnchor="middle" fontSize="11">
                  Match → route to team
                </text>

                <line
                  x1="694"
                  y1="115"
                  x2="729"
                  y2="130"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  markerEnd="url(#sy-arrow)"
                ></line>
                <rect
                  x="731"
                  y="115"
                  width="230"
                  height="40"
                  rx="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                ></rect>
                <text x="846" y="140" textAnchor="middle" fontSize="11">
                  No match → manual queue
                </text>
              </svg>
            </div>
            <figcaption>
              Every feedback comment is checked against rules.yaml in priority order. A confident
              match routes straight to the owning team; anything below that confidence drops into a
              manual queue instead of forcing a guess.
            </figcaption>
          </figure>

          <div className="detail-tool-grid">
            <div className="detail-tool-card">
              <span className="name">rule_id</span>
              <span className="desc">Unique identifier for the rule</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">category</span>
              <span className="desc">Feedback category assigned by the rule</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">route_to</span>
              <span className="desc">Team that receives the feedback</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">priority</span>
              <span className="desc">Determines which rule wins when multiple patterns match</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">pattern</span>
              <span className="desc">Keyword or regular-expression pattern used for matching</span>
            </div>
          </div>

          <h3 className="detail-subheading">Why I used rules instead of machine learning</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              There was no labeled dataset available for training a classifier, and the routing
              logic needed to be easy for the operations team to inspect and change.
            </p>
            <p className="about-body project-detail-prose">
              A rules file made both possible. When a comment was misclassified, the corresponding
              rule could be adjusted immediately without retraining or redeploying a model.
            </p>
            <p className="about-body project-detail-prose">
              The main limitation was semantic coverage: two comments could describe the same issue
              using completely different language and miss the same literal pattern. A later version
              could add embedding-based matching for those cases while recording human corrections
              as labeled examples for future evaluation or model training.
            </p>
          </div>

          <h3 className="detail-subheading">Operational reliability</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The routing system was designed to avoid forcing an answer when the rules were
              uncertain. Unmatched or ambiguous cases stayed in a manual review path, and the
              routing logic remained separate from the application code so it could be inspected and
              changed independently.
            </p>
            <p className="about-body project-detail-prose">
              The next reliability problem I looked at was not classification itself, but
              monitoring. If one category suddenly became much more common, that could indicate a
              product or operational issue worth surfacing. Any alerting around that would need to
              look for sustained changes over multiple periods rather than reacting to a single
              noisy spike.
            </p>
          </div>
        </div>
      </section>

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="sony-migration-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2 id="sony-migration-heading" className="about-headline project-detail-section-title">
              Migrating a live database safely
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              I also worked on operational tooling for service maintenance, batch jobs, scheduled
              tasks, and database changes. These workflows ran through a lightweight automation
              environment kept separate from the production web application.
            </p>
          </div>

          <h3 className="detail-subheading">Guardrails before an UPDATE</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Changes to the 100,000+ row production database were tested against a non-production
              replica before being run on live data.
            </p>
            <p className="about-body project-detail-prose">
              For each migration, I checked three things:
            </p>
            <ol className="detail-ordered-list">
              <li>A usable replica was available.</li>
              <li>The exact SQL statement completed successfully against that replica.</li>
              <li>
                Row counts and sampled values matched the expected result before and after the
                change.
              </li>
            </ol>
            <p className="about-body project-detail-prose">
              That validation mattered more than simply reviewing the SQL itself. A syntactically
              correct query could still modify the wrong rows or transform values incorrectly.
            </p>
            <p className="about-body project-detail-prose">
              Migrations were run serially rather than in parallel so each execution could be
              checked before proceeding. A backup was taken beforehand, and larger changes could be
              rerun in smaller batches if verification exposed a problem.
            </p>
            <p className="about-body project-detail-prose">
              Much of the migration work involved translating operational metadata into a new
              schema, including updating format flags and normalizing stored fields. A simplified
              example looked like:
            </p>
          </div>

          <code className="detail-code">{`UPDATE releases
SET   format_version = 'v2', metadata = normalize(metadata)
WHERE format_version = 'v1';`}</code>

          <p className="about-body project-detail-prose">
            The goal was to make the migration process repeatable: test the exact change on a
            replica, verify the resulting data, then apply the same operation to production.
          </p>
        </div>
      </section>

      <section
        ref={techRef}
        className="project-detail-tech reveal"
        aria-labelledby="sony-technical-heading"
      >
        <div className="sec-inner project-detail-tech-inner">
          <div className="section-title-row section-title-row--on-dark">
            <h2
              id="sony-technical-heading"
              className="about-headline project-detail-section-title project-detail-section-title--on-dark"
            >
              Technical
            </h2>
          </div>
          <TechChipGrid
            chips={[
              'Python',
              'regex',
              'YAML',
              'pandas',
              'cron / scheduled automation',
              'SQL',
              'database replicas',
              'migration validation',
              'data-quality auditing',
              'config-driven routing',
            ]}
          />
        </div>
      </section>
    </main>
  )
}
