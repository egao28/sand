import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'
import DemoVideo from '../components/DemoVideo.jsx'

/** Short technical note for AlmaBot (#60). The /projects summary is what a
 * visitor needs; this page is the optional detail behind it, so it carries only
 * the two evaluations and the demo — not the architecture, the tech stack, or a
 * development narrative. The method limitations below live here and nowhere
 * else on the site: do not copy them into a listing summary. */
export default function AlmabotDetailPage() {
  useRevealOnScroll()
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <main
      className="page page--secondary project-detail-page project-detail-page--tone-b"
      aria-label="AlmaBot"
    >
      <div className="project-detail-back-wrap sec-inner">
        <Link className="project-detail-back" to="/projects">
          ← All projects
        </Link>
      </div>

      <header className="project-detail-hero reveal project-detail-hero--plain">
        <div className="sec-inner project-detail-hero-inner">
          <h1 className="project-detail-title">AlmaBot</h1>
          <p className="experience-detail-subtitle">
            Retrieval and uncertainty in academic advising
          </p>
          <p className="tech-note-identity">Independent project</p>
          <p className="about-body project-detail-prose">
            I built AlmaBot and its evaluation benchmark to study what makes an AI assistant
            reliable. The system combines course retrieval and academic-planning tools across 4,502
            courses and 187 subjects. I used it to test how retrieval choices affect answer evidence
            and whether confidence helps distinguish correct from incorrect answers.
          </p>
        </div>
      </header>

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="almabot-retrieval-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2
              id="almabot-retrieval-heading"
              className="about-headline project-detail-section-title"
            >
              Retrieval
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              I constructed a benchmark of 127 manually verified questions with a fixed
              calibration/test split. On a 41-question retrieval subset, BM25 exceeded the tuned
              hybrid retriever by 0.120 MRR@5 (95% paired-bootstrap CI: 0.023–0.225). Recall@5 was
              comparable. I selected BM25 based on these results.
            </p>
          </div>
        </div>
      </section>

      <section
        className="project-detail-approach reveal"
        aria-labelledby="almabot-uncertainty-heading"
      >
        <div className="sec-inner project-detail-approach-inner">
          <div className="section-title-row">
            <h2
              id="almabot-uncertainty-heading"
              className="about-headline project-detail-section-title"
            >
              Uncertainty
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              On 42 held-out answers, verbalized confidence achieved an AUROC of 0.847 for
              predicting correctness, outperforming self-consistency by 0.195. However, confidence
              scores were concentrated at the maximum, including for some incorrect answers. These
              results support discrimination on this sample; they do not establish calibrated
              confidence or a valid risk-controlled abstention rule.
            </p>
          </div>
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
            A walkthrough of course planning with AlmaBot.
          </p>
          <button
            type="button"
            className="tech-note-demo-toggle"
            aria-expanded={demoOpen}
            aria-controls="almabot-demo-panel"
            onClick={() => setDemoOpen((open) => !open)}
          >
            {demoOpen ? 'Hide demo' : 'Watch demo'}
          </button>
          <div id="almabot-demo-panel" hidden={!demoOpen}>
            <DemoVideo
              src="/almabot-demo.mp4"
              poster="/almabot-demo-poster.jpg"
              width={1280}
              height={940}
              ariaLabel="Screen recording of an AlmaBot advising session"
            />
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
