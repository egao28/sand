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
            Over four months I built and hardened three internal systems: a Python pipeline
            automating release and asset delivery, a configurable rules engine routing weekly user
            feedback to the right team, and safety-gated tooling for migrating a live,
            100,000-plus-row production database.
          </p>
          <div className="detail-stat-strip">
            <div>
              <span className="detail-stat-num">100+</span>
              <span className="detail-stat-label">Releases &amp; assets automated weekly</span>
            </div>
            <div>
              <span className="detail-stat-num">300+</span>
              <span className="detail-stat-label">Feedback comments auto-routed weekly</span>
            </div>
            <div>
              <span className="detail-stat-num">100k+</span>
              <span className="detail-stat-label">Rows migrated under guardrails</span>
            </div>
            <div>
              <span className="detail-stat-num">~60%</span>
              <span className="detail-stat-label">Faster release preparation</span>
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
              Every change followed the same shape: requirement analysis, design, launch, then
              rollout — and launch always needed sign-off from the operations team it would actually
              affect, not just a passing test suite. That discipline mattered more once these
              systems were touching production data and routing real user complaints, not just
              moving files around.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="sony-rules-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2 id="sony-rules-heading" className="about-headline project-detail-section-title">
              A rules engine that ships without a redeploy
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The team was receiving 300+ pieces of user feedback a week that needed distributing
              across different teams, and the goal was full automation with no manual triage. The
              first version was pure keyword matching, and it didn&apos;t hold up: plenty of
              feedback said the same thing in different words, so the keyword list only grew — and
              the more it grew, the more bloated and unmaintainable it got.
            </p>
            <p className="about-body project-detail-prose">
              The second version replaced the hardcoded keyword list with two pieces: a{' '}
              <code>rules.yaml</code> holding the rule definitions, and a <code>router.py</code>{' '}
              that applies them. Every rule carries a rule ID, a category, a routing team, a
              priority for resolving overlaps, and a match pattern — loaded with{' '}
              <code>yaml.safe_load</code> into a plain list of dicts, so adding a new category is a
              config edit, not a code change or a redeploy.
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
              <span className="desc">The feedback bucket it maps to</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">route_to</span>
              <span className="desc">Which team receives it</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">priority</span>
              <span className="desc">Resolves overlapping-pattern conflicts</span>
            </div>
            <div className="detail-tool-card">
              <span className="name">pattern</span>
              <span className="desc">The keyword/regex it matches against</span>
            </div>
          </div>

          <h3 className="detail-subheading">Why not machine learning</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Two reasons, both practical rather than principled: there was no labeled data to train
              on yet, and a rules file can be corrected the moment someone spots a miscategorization
              — no retraining cycle in between. If I rebuilt this today, I&apos;d add a semantic
              layer on top: embeddings and cosine similarity to catch phrasing a literal rule misses
              entirely — the same technique behind Proxima&apos;s search — plus quietly logging
              human corrections as a labeled set for a real classifier down the line.
            </p>
          </div>

          <h3 className="detail-subheading">Thinking like SRE, on a small scale</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Checked against a short list of what actually makes something SRE-relevant:
              automation, yes; a fallback path, no — a gap I noticed but didn&apos;t close; config
              kept separate from code, yes; and it should keep improving against precision and
              recall, not against a gut feeling that a rule &quot;looks right.&quot; The natural
              next step was proactive rather than reactive — alerting when one feedback category
              spikes against its recent baseline, not just classifying it after the fact — but that
              only works with a persistence threshold: a sustained run over several periods, not a
              single noisy day, or every minor blip pages someone for nothing.
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
              Migrating a live database without breaking it
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Day-to-day operational tasks — service maintenance, batch jobs, scheduled tasks and
              alerts — ran through a lightweight automation platform kept separate from the
              production web app, so none of that load or risk touched the frontend users actually
              saw.
            </p>
          </div>

          <h3 className="detail-subheading">Guardrails before any UPDATE</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Every change to the 100,000+ row production database went through the same three
              checks before it was allowed near real data: confirm a replica is actually available,
              run the exact statement against a non-live replica first, and compare row counts and a
              sample of values before and after — not just trust that the statement looked right.
            </p>
            <p className="about-body project-detail-prose">
              Migrations ran serially, on purpose: it gives a clean audit trail, and it guarantees
              every server executes the identical script under one unified set of permissions rather
              than ad hoc credentials per machine. If something did break, recovery was always the
              same shape — a backup taken beforehand, then roll back, re-run in smaller batches, and
              re-verify each batch before moving to the next.
            </p>
            <p className="about-body project-detail-prose">
              Most of the actual migration work was translating operational metadata into a new
              schema — flipping row-level format flags and standardizing fields, roughly in the
              shape of:
            </p>
          </div>

          <code className="detail-code">{`UPDATE releases
SET   format_version = 'v2', metadata = normalize(metadata)
WHERE format_version = 'v1';`}</code>

          <blockquote className="detail-pull-quote">
            &quot;I didn&apos;t trust a migration because the query looked right — I trusted it
            because the replica had already run it, the row counts matched, and a sample of the
            actual values matched too.&quot;
            <footer>on the database migration checklist</footer>
          </blockquote>
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
              'regex & YAML rule engine',
              'pandas',
              'cron / scheduled automation',
              'SQL',
              'replica-gated migrations',
              'data-quality auditing',
              'config-driven routing',
            ]}
          />
        </div>
      </section>
    </main>
  )
}
