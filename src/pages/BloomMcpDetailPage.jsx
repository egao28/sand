import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'

/** Short technical note for bloom-mcp (#60). The /projects summary is what a
 * visitor needs; this page is the optional detail behind it, so it carries only
 * the contribution and the validation work — not the tool catalog, the test and
 * line counts, or the stage-by-stage narrative. The number of tools is
 * deliberately absent rather than updated: the figure is disputed upstream, so
 * the note omits it rather than picking one. The identity lines below are rendered
 * directly because `siteContent`'s stored `sub` does not carry "Salk
 * Institute"; that field is left as it is. */
export default function BloomMcpDetailPage() {
  useRevealOnScroll()

  return (
    <main
      className="page page--secondary project-detail-page tech-note-page"
      aria-label="bloom-mcp"
    >
      <div className="project-detail-back-wrap sec-inner">
        <Link className="project-detail-back" to="/projects">
          ← All projects
        </Link>
      </div>

      <header className="project-detail-hero reveal project-detail-hero--plain">
        <div className="sec-inner project-detail-hero-inner">
          <h1 className="project-detail-title">bloom-mcp</h1>
          <p className="experience-detail-subtitle">
            Tools for reproducible, AI-assisted scientific analysis
          </p>
          <p className="tech-note-identity">
            Research Software Engineering Intern · Salk Institute
            <br />
            Harnessing Plants Initiative · Jun–Aug 2026
          </p>
          <p className="about-body project-detail-prose">
            I developed scientific analysis tools and validation infrastructure for bloom-mcp at the
            Salk Institute. The platform lets AI agents execute analyses through the Model Context
            Protocol, connecting natural-language requests to reproducible research workflows.
          </p>
        </div>
      </header>

      <section className="project-detail-motivation reveal" aria-labelledby="bloom-tools-heading">
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2 id="bloom-tools-heading" className="about-headline project-detail-section-title">
              Analysis tools
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              My contributions included data quality checks, outlier detection, dimensionality
              reduction, clustering, and statistical analysis. I worked on the interfaces around
              these operations so that inputs could be validated and results returned in a
              consistent, structured format.
            </p>
          </div>
        </div>
      </section>

      <section
        className="project-detail-approach reveal"
        aria-labelledby="bloom-reproducibility-heading"
      >
        <div className="sec-inner project-detail-approach-inner">
          <div className="section-title-row">
            <h2
              id="bloom-reproducibility-heading"
              className="about-headline project-detail-section-title"
            >
              Reproducibility and validation
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              I developed infrastructure to record execution details such as random seeds, library
              versions, and output hashes, making analysis runs easier to trace and reproduce.
              Automated tests checked numerical outputs against reference fixtures and visual
              outputs for regressions. Changes went through design discussions and peer-reviewed
              pull requests.
            </p>
            <p className="about-body project-detail-prose">
              The goal was to let researchers work with natural-language requests while retaining a
              clear record of the analyses performed and the results produced.
            </p>
          </div>
          <p className="tech-note-foot">
            <Link className="project-detail-demo-link" to="/projects">
              Back to all projects
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
