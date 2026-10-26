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
            Evaluating retrieval and uncertainty in LLM-based academic advising
          </p>
          <p className="about-body project-detail-prose">
            An academic advising agent that evolved into an empirical study of how retrieval quality
            and model uncertainty affect the reliability of AI-generated answers.
          </p>
          <dl className="detail-meta-row">
            <div>
              <dt>Role</dt>
              <dd>Independent project</dd>
            </div>
            <div>
              <dt>Timeline</dt>
              <dd>May 2025 – present</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>Python, LangGraph, Chroma, BM25, MCP, scikit-learn</dd>
            </div>
          </dl>
        </div>
      </header>

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="almabot-overview-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2
              id="almabot-overview-heading"
              className="about-headline project-detail-section-title"
            >
              Overview
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Academic advising requires more than finding relevant courses. Students also need
              accurate information about prerequisites, degree requirements, and course
              availability. An AI advisor that produces a plausible but incorrect answer can be more
              misleading than one that admits uncertainty.
            </p>
            <p className="about-body project-detail-prose">
              I originally built AlmaBot to make university course information easier to navigate.
              The system integrates 4,502 courses across 187 subjects, combining natural-language
              queries with course retrieval and structured academic-planning tools.
            </p>
            <p className="about-body project-detail-prose">
              As I developed the system, my focus shifted from expanding its capabilities to
              evaluating its reliability. AlmaBot became a testbed for two questions: how much does
              retrieval quality affect the evidence available to an LLM, and can the model recognize
              when it should not answer?
            </p>
          </div>
        </div>
      </section>

      <section
        className="project-detail-approach reveal"
        aria-labelledby="almabot-architecture-heading"
      >
        <div className="sec-inner project-detail-approach-inner">
          <div className="section-title-row">
            <h2
              id="almabot-architecture-heading"
              className="about-headline project-detail-section-title"
            >
              System architecture
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              AlmaBot uses a modular architecture that separates user intent, information retrieval,
              and structured tool execution.
            </p>
          </div>

          <figure className="detail-diagram">
            <div className="detail-diagram-scroll" tabIndex="0">
              <svg
                viewBox="0 0 1180 326"
                role="img"
                aria-label="At runtime, a natural-language query goes to a LangGraph intent router covering five intents, which dispatches to course retrieval over 4,502 courses in 187 subjects using dense retrieval, BM25 and reciprocal rank fusion, and to MCP academic tools for prerequisites and degree requirements; both feed the answer. Separately, an evaluation pipeline runs a 127-question benchmark, split 64 calibration and 63 test, into a retrieval comparison measured by Recall at 5 and MRR at 5 with paired bootstrap resampling, and an uncertainty-versus-correctness analysis of verbalized confidence and self-consistency measured by AUROC."
              >
                <defs>
                  <DiagramArrowMarker id="ab-arrow" />
                </defs>

                <text
                  x="20"
                  y="28"
                  fontSize="11.5"
                  fontWeight="700"
                  fill="var(--accent)"
                  letterSpacing="0.4"
                >
                  RUNTIME PATH
                </text>

                <rect
                  x="20"
                  y="40"
                  width="170"
                  height="56"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="105" y="66" textAnchor="middle" fontSize="12">
                  Natural-language
                </text>
                <text x="105" y="82" textAnchor="middle" fontSize="12">
                  query
                </text>

                <line
                  x1="190"
                  y1="68"
                  x2="225"
                  y2="68"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ab-arrow)"
                ></line>

                <rect
                  x="227"
                  y="40"
                  width="200"
                  height="56"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="327" y="64" textAnchor="middle" fontSize="11.5" fontWeight="600">
                  LangGraph intent router
                </text>
                <text x="327" y="82" textAnchor="middle" fontSize="10.5" opacity="0.72">
                  5 intents
                </text>

                <line x1="427" y1="68" x2="447" y2="68" stroke="currentColor" strokeWidth="1.2" />
                <line x1="447" y1="40" x2="447" y2="124" stroke="currentColor" strokeWidth="1.2" />
                <line
                  x1="447"
                  y1="40"
                  x2="467"
                  y2="40"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ab-arrow)"
                ></line>
                <line
                  x1="447"
                  y1="124"
                  x2="467"
                  y2="124"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ab-arrow)"
                ></line>

                <rect
                  x="467"
                  y="12"
                  width="300"
                  height="56"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="617" y="34" textAnchor="middle" fontSize="11.5" fontWeight="600">
                  Course retrieval
                </text>
                <text x="617" y="52" textAnchor="middle" fontSize="10.5" opacity="0.72">
                  dense · BM25 · reciprocal rank fusion
                </text>

                <text x="617" y="87" textAnchor="middle" fontSize="10.5" opacity="0.72">
                  over 4,502 courses · 187 subjects
                </text>

                <rect
                  x="467"
                  y="96"
                  width="300"
                  height="56"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="617" y="118" textAnchor="middle" fontSize="11.5" fontWeight="600">
                  MCP academic tools
                </text>
                <text x="617" y="136" textAnchor="middle" fontSize="10.5" opacity="0.72">
                  prerequisites · degree requirements
                </text>

                <line x1="767" y1="40" x2="787" y2="40" stroke="currentColor" strokeWidth="1.2" />
                <line x1="767" y1="124" x2="787" y2="124" stroke="currentColor" strokeWidth="1.2" />
                <line x1="787" y1="40" x2="787" y2="124" stroke="currentColor" strokeWidth="1.2" />
                <line
                  x1="787"
                  y1="82"
                  x2="818"
                  y2="82"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ab-arrow)"
                ></line>

                <rect
                  x="820"
                  y="54"
                  width="280"
                  height="56"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="960" y="78" textAnchor="middle" fontSize="12" fontWeight="600">
                  Answer
                </text>
                <text x="960" y="96" textAnchor="middle" fontSize="10" opacity="0.72">
                  from retrieved courses + tool results
                </text>

                <rect
                  x="20"
                  y="174"
                  width="1140"
                  height="140"
                  rx="6"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                ></rect>
                <text
                  x="590"
                  y="196"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="var(--accent)"
                  letterSpacing="0.4"
                >
                  EVALUATION PIPELINE
                </text>

                <rect
                  x="40"
                  y="220"
                  width="250"
                  height="72"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="165" y="250" textAnchor="middle" fontSize="11.5" fontWeight="600">
                  127-question benchmark
                </text>
                <text x="165" y="270" textAnchor="middle" fontSize="10.5" opacity="0.72">
                  64 calibration / 63 test
                </text>

                <line x1="290" y1="256" x2="310" y2="256" stroke="currentColor" strokeWidth="1.2" />
                <line x1="310" y1="230" x2="310" y2="282" stroke="currentColor" strokeWidth="1.2" />
                <line
                  x1="310"
                  y1="230"
                  x2="332"
                  y2="230"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ab-arrow)"
                ></line>
                <line
                  x1="310"
                  y1="282"
                  x2="332"
                  y2="282"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ab-arrow)"
                ></line>

                <rect
                  x="334"
                  y="210"
                  width="330"
                  height="40"
                  rx="4"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="499" y="226" textAnchor="middle" fontSize="11" fontWeight="600">
                  Retrieval comparison
                </text>
                <text x="499" y="241" textAnchor="middle" fontSize="10" opacity="0.72">
                  Recall@5 · MRR@5 · paired bootstrap
                </text>

                <rect
                  x="334"
                  y="262"
                  width="330"
                  height="40"
                  rx="4"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="499" y="278" textAnchor="middle" fontSize="11" fontWeight="600">
                  Uncertainty vs. correctness
                </text>
                <text x="499" y="293" textAnchor="middle" fontSize="10" opacity="0.72">
                  verbalized confidence · self-consistency · AUROC
                </text>

                <line
                  x1="664"
                  y1="230"
                  x2="694"
                  y2="230"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ab-arrow)"
                ></line>
                <line
                  x1="664"
                  y1="282"
                  x2="694"
                  y2="282"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#ab-arrow)"
                ></line>

                <rect
                  x="696"
                  y="210"
                  width="444"
                  height="40"
                  rx="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                ></rect>
                <text x="918" y="235" textAnchor="middle" fontSize="11">
                  Selected BM25; dropped cross-encoder reranking
                </text>

                <rect
                  x="696"
                  y="262"
                  width="444"
                  height="40"
                  rx="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                ></rect>
                <text x="918" y="287" textAnchor="middle" fontSize="11">
                  Discrimination without a valid abstention guarantee
                </text>
              </svg>
            </div>
            <figcaption>
              The runtime path and the evaluation pipeline run over the same system. The benchmark
              is what turned design choices — which retriever, when to abstain — into measurements
              rather than assumptions.
            </figcaption>
          </figure>

          <div className="detail-tool-grid">
            <div className="detail-tool-card">
              <span className="name">Intent routing</span>
              <span className="desc">
                LangGraph-based routing classifies user queries into five intents and directs them
                to the appropriate workflow.
              </span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Course retrieval</span>
              <span className="desc">
                Dense retrieval, BM25, and reciprocal rank fusion (RRF) provide alternative
                approaches to retrieving relevant course information.
              </span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Academic tools</span>
              <span className="desc">
                MCP-based tools support structured queries involving prerequisite relationships and
                degree requirements.
              </span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Evaluation pipeline</span>
              <span className="desc">
                A reproducible benchmark framework compares retrieval methods and measures
                uncertainty signals against answer correctness.
              </span>
            </div>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose detail-block-gap">
              The architecture supports both interactive academic advising and controlled
              comparisons of different retrieval and evaluation methods.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="almabot-demo-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2 id="almabot-demo-heading" className="about-headline project-detail-section-title">
              The system in use
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
            ariaLabel="Screen recording of an AlmaBot advising session"
          />
        </div>
      </section>

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="almabot-retrieval-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <p className="detail-eyebrow">Research question 01</p>
          <div className="section-title-row">
            <h2
              id="almabot-retrieval-heading"
              className="about-headline project-detail-section-title"
            >
              Does more sophisticated retrieval actually perform better?
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Hybrid retrieval is often used to combine semantic and keyword-based search. I
              initially explored dense retrieval, BM25, reciprocal rank fusion, and cross-encoder
              reranking to improve course search.
            </p>
            <p className="about-body project-detail-prose">
              Rather than assuming the more complex pipeline was better, I constructed a benchmark
              of 127 manually verified questions with a fixed 64/63 calibration-test split.
            </p>
            <p className="about-body project-detail-prose">
              On a 41-question retrieval evaluation subset, I compared a tuned hybrid retriever
              against BM25 using Recall@5 and MRR@5, with 10,000 paired bootstrap resamples to
              estimate uncertainty.
            </p>
          </div>

          <div className="detail-metric-scroll" tabIndex="0">
            <table className="detail-metric-table">
              <caption>Tuned hybrid minus BM25, on the 41-question retrieval subset</caption>
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  <th scope="col">Hybrid − BM25</th>
                  <th scope="col">95% CI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Recall@5</th>
                  <td className="num">−0.004</td>
                  <td className="num">[−0.085, 0.073]</td>
                </tr>
                <tr>
                  <th scope="row">MRR@5</th>
                  <td className="num">−0.120</td>
                  <td className="num">[−0.225, −0.023]</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="detail-metric-note">
            Paired comparison on the same 41 questions; intervals from 10,000 paired bootstrap
            resamples. A negative difference favours BM25.
          </p>

          <div className="detail-callout">
            <strong>Decision.</strong> Selected BM25 over the tuned hybrid configuration, and
            dropped cross-encoder reranking from the selected approach.
          </div>

          <div className="project-detail-body detail-block-gap">
            <p className="about-body project-detail-prose">
              The hybrid pipeline did not demonstrate a retrieval advantage on this benchmark. While
              top-five recall was comparable, BM25 produced better result rankings as measured by
              MRR@5.
            </p>
            <p className="about-body project-detail-prose">
              This result changed the system design and reinforced the importance of evaluating
              additional complexity rather than assuming it improves performance.
            </p>
          </div>
        </div>
      </section>

      <section
        className="project-detail-approach reveal"
        aria-labelledby="almabot-uncertainty-heading"
      >
        <div className="sec-inner project-detail-approach-inner">
          <p className="detail-eyebrow">Research question 02</p>
          <div className="section-title-row">
            <h2
              id="almabot-uncertainty-heading"
              className="about-headline project-detail-section-title"
            >
              Can an LLM recognize when it should abstain?
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Retrieving relevant information does not guarantee a correct answer. I investigated
              whether uncertainty signals could help AlmaBot distinguish answers it could reliably
              provide from those it should withhold.
            </p>
            <p className="about-body project-detail-prose">
              I evaluated verbalized confidence and self-consistency as predictors of answer
              correctness, using AUROC to measure their discrimination ability.
            </p>
          </div>

          <div className="detail-metric-scroll" tabIndex="0">
            <table className="detail-metric-table">
              <caption>Uncertainty signals measured against answer correctness</caption>
              <thead>
                <tr>
                  <th scope="col">Measure</th>
                  <th scope="col">Result</th>
                  <th scope="col">Sample</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Verbalized confidence, AUROC</th>
                  <td className="num">0.847</td>
                  <td>42 held-out answers</td>
                </tr>
                <tr>
                  <th scope="row">Gain over self-consistency</th>
                  <td className="num">+0.195 AUROC</td>
                  <td>same evaluated sample</td>
                </tr>
                <tr>
                  <th scope="row">Answers at maximum confidence</th>
                  <td className="num">28 of 46</td>
                  <td>calibration answers, 5 of them incorrect</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="detail-metric-note">
            AUROC measures how well a signal separates correct from incorrect answers on this
            sample. It is not a measure of calibration, and it does not establish a risk-controlled
            abstention rule.
          </p>

          <div className="project-detail-body detail-block-gap">
            <p className="about-body project-detail-prose">
              Verbalized confidence distinguished correct from incorrect answers better than
              self-consistency in this evaluation. However, its scores were heavily concentrated at
              the maximum.
            </p>
            <p className="about-body project-detail-prose">
              This exposed a limitation: a confidence measure can discriminate between correct and
              incorrect answers without supporting reliable abstention at a specified error target.
            </p>
            <p className="about-body project-detail-prose">
              I also examined the validity of the abstention procedure itself. An earlier
              threshold-selection approach did not satisfy the assumptions needed for its claimed
              conformal guarantee. After reviewing the procedure, I withdrew that guarantee rather
              than treating the observed error rate as statistically controlled.
            </p>
          </div>

          <div className="detail-callout">
            <strong>The evaluated approach did not establish a valid 10% error guarantee.</strong>{' '}
            The observed error rate describes this sample; it is not a controlled risk level.
          </div>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="almabot-learned-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2
              id="almabot-learned-heading"
              className="about-headline project-detail-section-title"
            >
              What I learned
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              AlmaBot began as an engineering project, but its most useful results came from testing
              assumptions about how an AI system should behave.
            </p>
            <p className="about-body project-detail-prose">
              The retrieval experiments showed that a more complex method did not necessarily
              improve performance. The uncertainty experiments revealed a different problem:
              distinguishing correct answers from incorrect ones is not the same as knowing when an
              agent can safely respond.
            </p>
            <p className="about-body project-detail-prose">
              Together, these findings shaped how I approach AI evaluation. I became more interested
              in designing comparisons that could challenge my assumptions, examining failure cases,
              and distinguishing an encouraging metric from a supported reliability claim.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-motivation reveal" aria-labelledby="almabot-next-heading">
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2 id="almabot-next-heading" className="about-headline project-detail-section-title">
              Next steps
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              I plan to extend this work by examining how changes in retrieved evidence affect model
              confidence, evaluating abstention procedures with valid risk-control methods, and
              testing whether the observed limitations persist across larger and more varied
              question sets.
            </p>
          </div>
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
