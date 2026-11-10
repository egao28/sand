import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'

/**
 * Sony, as a short continuous note.
 *
 * This page used to be a full write-up: a four-figure stat strip, three
 * sections with their own tinted bands, a routing diagram, a five-card table of
 * YAML fields, a code block and a closing grid of technology chips. It is a
 * summary and two topics now — the release pipeline and the feedback triage —
 * on one flat background, in the same `.tech-note-page` column that
 * /projects/almabot and /experience/bloom-mcp already read in.
 *
 * What went with the trim is the database-migration section. It was the page's
 * third topic and a substantial one; it is not dropped because it was weak but
 * because this note covers the two the brief names. The text is in the PR for
 * review, and nothing has been written here that was not already on the page,
 * in the repo or on the resume.
 *
 * `← About` returns to this role's own entry in the Selected Experience list
 * rather than the top of /about, so you land back where you left.
 */
export default function SonyDetailPage() {
  useRevealOnScroll()

  return (
    <main className="page page--secondary project-detail-page tech-note-page" aria-label="Sony">
      <div className="project-detail-back-wrap sec-inner">
        <Link className="project-detail-back" to="/about#experience-sony">
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
            Over four months I worked on internal tooling for the team that prepares and ships
            weekly music releases, and on the system that routed the feedback those releases came
            back with.
          </p>
        </div>
      </header>

      <section className="project-detail-motivation reveal" aria-labelledby="sony-pipeline-heading">
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2 id="sony-pipeline-heading" className="about-headline project-detail-section-title">
              Automating the release pipeline
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              I built Python pipelines for the release and asset workflow, covering retrieval,
              metadata cleaning and delivery, and handling more than 100 releases a week. They took
              over steps that had been done by hand, and cut the time it took to prepare a release
              by around 60%. Because the work was part of day-to-day operations, each change was
              tested against real workflows and approved by the team that would use it before it
              went out.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-approach reveal" aria-labelledby="sony-routing-heading">
        <div className="sec-inner project-detail-approach-inner">
          <div className="section-title-row">
            <h2 id="sony-routing-heading" className="about-headline project-detail-section-title">
              Routing feedback by rule
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The team also received more than 300 pieces of user feedback a week that had to reach
              the right people. The first version matched against a hardcoded keyword list, which
              held up until the number of categories and the variations in wording grew. I separated
              the rules from the code: a YAML file holds each rule&apos;s category, destination
              team, priority and keyword or regex pattern, and a small router module applies them in
              priority order. Anything no rule matches reliably goes to a manual review queue rather
              than being assigned a team on a guess. Adding or changing a category means editing the
              rules file, not the application.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
