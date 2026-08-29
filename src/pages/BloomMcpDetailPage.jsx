import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'
import { useDarkSurfaceOnIntersect } from '../hooks/useDarkSurfaceOnIntersect.js'
import { getExperienceBySlug } from '../data/siteContent.js'
import DiagramArrowMarker from '../components/DiagramArrowMarker.jsx'

export default function BloomMcpDetailPage() {
  const techRef = useDarkSurfaceOnIntersect()
  useRevealOnScroll()
  const bloomExperience = getExperienceBySlug('bloom-mcp')

  return (
    <main
      className="page page--secondary project-detail-page project-detail-page--tone-a"
      aria-label="Salk Institute"
    >
      <div className="project-detail-back-wrap sec-inner">
        <Link className="project-detail-back" to="/about">
          ← About
        </Link>
      </div>

      <header className="project-detail-hero reveal project-detail-hero--plain">
        <div className="sec-inner project-detail-hero-inner">
          <h1 className="project-detail-title">Salk Institute</h1>
          <p className="experience-detail-subtitle">{bloomExperience.sub}</p>
          <p className="about-body project-detail-prose">
            Between June and August 2026, I designed and built <strong>bloom-mcp</strong>, the
            service that lets Claude and other AI agents run validated plant-phenotyping analyses
            against Bloom&apos;s research database from plain-English requests. It includes 22
            tools, a shared contract layer for validation and reproducibility, and a large test
            suite covering the service end to end.
          </p>
          <div className="detail-stat-strip">
            <div>
              <span className="detail-stat-num">22</span>
              <span className="detail-stat-label">MCP tools</span>
            </div>
            <div>
              <span className="detail-stat-num">79</span>
              <span className="detail-stat-label">PRs shipped</span>
            </div>
            <div>
              <span className="detail-stat-num">1,229</span>
              <span className="detail-stat-label">test functions</span>
            </div>
            <div>
              <span className="detail-stat-num">41.8k</span>
              <span className="detail-stat-label">lines of Python</span>
            </div>
          </div>
        </div>
      </header>

      <section className="project-detail-motivation reveal" aria-labelledby="bloom-context-heading">
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2 id="bloom-context-heading" className="about-headline project-detail-section-title">
              What a researcher actually gets
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              <strong>Bloom</strong> is a research platform for the Salk Institute&apos;s Harnessing
              Plants Initiative, where plant biologists explore phenotype, genotype,
              gene-expression, and root-scan data, including cylinder-grown root systems traced
              through the lab&apos;s SLEAP-based pipeline.
            </p>
            <p className="about-body project-detail-prose">
              My job was to make those analyses available through an AI agent rather than only
              through the existing research interfaces. A researcher can ask, in plain English, to
              clean an experiment, remove outliers, and generate a PCA. Bloom-mcp resolves the raw
              data, validates and cleans it, runs the analysis, renders the plot, and returns signed
              download links together with the provenance needed to reproduce the run.
            </p>
            <p className="about-body project-detail-prose">
              My work covered the service end to end: the tool surface, the reproducibility layer
              underneath it, the storage and identity infrastructure around it, and the tests used
              to verify each piece.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="bloom-architecture-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2
              id="bloom-architecture-heading"
              className="about-headline project-detail-section-title"
            >
              Everything an AI surface needs
            </h2>
          </div>

          <h3 className="detail-subheading">A thin, hardened surface</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Every analysis tool delegates its numerical work to{' '}
              <a href="https://github.com/talmolab/sleap-roots-analyze">sleap-roots-analyze</a>, a
              separate scientific-computing package maintained by the Pereira Lab. Bloom-mcp is
              intentionally a thin layer over that package rather than a second implementation of
              the same analysis code. Its responsibility is the surrounding infrastructure: input
              and output validation, reproducibility, access control, persistence, and error
              handling.
            </p>
            <p className="about-body project-detail-prose">
              That separation was not there at the beginning. Early versions of bloom-mcp carried
              their own copies of the PCA, clustering, and outlier-detection logic. Once the
              upstream package matured, I moved every call site onto the shared library and removed
              the duplicated implementations. Today, bloom-mcp&apos;s shipped code contains no
              direct <code>scikit-learn</code>, <code>scipy</code>, or <code>seaborn</code> imports,
              and a dedicated test enforces that boundary.
            </p>
            <p className="about-body project-detail-prose">
              A tool call starts from a pluggable ExperimentReader, passes through a shared contract
              wrapper that validates parameters and resolves the random seed, delegates the analysis
              to sleap-roots-analyze, validates and hashes the output, and writes the result through
              a pluggable ResultStore. Exceptions that have not been explicitly declared by a tool
              are caught and sanitized before they can reach the agent.
            </p>
          </div>

          <figure className="detail-diagram">
            <div className="detail-diagram-scroll" tabIndex="0">
              <svg
                viewBox="0 0 1360 400"
                role="img"
                aria-label="A tool call flows from a pluggable ExperimentReader backend, through a contract wrapper that validates parameters, resolves a seed, delegates execution to sleap-roots-analyze, and validates and hashes the output, into a pluggable ResultStore backend; any undeclared exception is intercepted before it reaches the agent."
              >
                <defs>
                  <DiagramArrowMarker id="bloom-arrow" />
                </defs>

                {/* contract wrapper boundary */}
                <rect
                  x="228"
                  y="126"
                  width="944"
                  height="132"
                  rx="6"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                ></rect>
                <text
                  x="700"
                  y="146"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="var(--accent)"
                  letterSpacing="0.4"
                >
                  @as_mcp_tool — contract wrapper
                </text>

                {/* reader backends */}
                <rect
                  x="20"
                  y="38"
                  width="170"
                  height="42"
                  rx="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="105" y="63" textAnchor="middle" fontSize="11.5">
                  Supabase Postgres
                </text>
                <rect
                  x="20"
                  y="318"
                  width="170"
                  height="42"
                  rx="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="105" y="343" textAnchor="middle" fontSize="11.5">
                  Local filesystem
                </text>

                <line
                  x1="105"
                  y1="80"
                  x2="105"
                  y2="167"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bloom-arrow)"
                ></line>
                <line
                  x1="105"
                  y1="318"
                  x2="105"
                  y2="233"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bloom-arrow)"
                ></line>

                {/* main row */}
                <rect
                  x="20"
                  y="168"
                  width="170"
                  height="64"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="105" y="194" textAnchor="middle" fontSize="12" fontWeight="600">
                  ExperimentReader
                </text>
                <text
                  x="105"
                  y="210"
                  textAnchor="middle"
                  fontSize="10.5"
                  fill="currentColor"
                  opacity="0.7"
                >
                  (read port)
                </text>

                <line
                  x1="190"
                  y1="200"
                  x2="248"
                  y2="200"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bloom-arrow)"
                ></line>

                <rect
                  x="250"
                  y="168"
                  width="150"
                  height="64"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="325" y="204" textAnchor="middle" fontSize="12" fontWeight="600">
                  Validate params
                </text>

                <line
                  x1="400"
                  y1="200"
                  x2="438"
                  y2="200"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bloom-arrow)"
                ></line>

                <rect
                  x="440"
                  y="168"
                  width="190"
                  height="64"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="535" y="194" textAnchor="middle" fontSize="12" fontWeight="600">
                  Resolve seed →
                </text>
                <text x="535" y="210" textAnchor="middle" fontSize="12" fontWeight="600">
                  stamp provenance
                </text>

                <line
                  x1="630"
                  y1="200"
                  x2="668"
                  y2="200"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bloom-arrow)"
                ></line>

                <rect
                  x="670"
                  y="168"
                  width="210"
                  height="64"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="775" y="194" textAnchor="middle" fontSize="12" fontWeight="600">
                  sleap-roots-analyze
                </text>
                <text x="775" y="210" textAnchor="middle" fontSize="10.5" opacity="0.7">
                  (execute, delegated)
                </text>

                <line
                  x1="880"
                  y1="200"
                  x2="918"
                  y2="200"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bloom-arrow)"
                ></line>

                <rect
                  x="920"
                  y="168"
                  width="220"
                  height="64"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="1030" y="194" textAnchor="middle" fontSize="12" fontWeight="600">
                  Validate output →
                </text>
                <text x="1030" y="210" textAnchor="middle" fontSize="12" fontWeight="600">
                  hash + manifest v5
                </text>

                <line
                  x1="1140"
                  y1="200"
                  x2="1168"
                  y2="200"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bloom-arrow)"
                ></line>

                <rect
                  x="1170"
                  y="168"
                  width="170"
                  height="64"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="1255" y="194" textAnchor="middle" fontSize="12" fontWeight="600">
                  ResultStore
                </text>
                <text x="1255" y="210" textAnchor="middle" fontSize="10.5" opacity="0.7">
                  (write port)
                </text>

                {/* store backends */}
                <line
                  x1="1255"
                  y1="168"
                  x2="1255"
                  y2="83"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bloom-arrow)"
                ></line>
                <line
                  x1="1255"
                  y1="232"
                  x2="1255"
                  y2="315"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#bloom-arrow)"
                ></line>
                <rect
                  x="1170"
                  y="38"
                  width="170"
                  height="42"
                  rx="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="1255" y="63" textAnchor="middle" fontSize="11.5">
                  Supabase Storage
                </text>
                <rect
                  x="1170"
                  y="318"
                  width="170"
                  height="42"
                  rx="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="1255" y="343" textAnchor="middle" fontSize="11.5">
                  Local filesystem
                </text>

                {/* error path */}
                <line
                  x1="775"
                  y1="232"
                  x2="775"
                  y2="278"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  markerEnd="url(#bloom-arrow)"
                ></line>
                <rect
                  x="640"
                  y="280"
                  width="270"
                  height="46"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                ></rect>
                <text x="775" y="299" textAnchor="middle" fontSize="11.5">
                  BloomMCPError → agent
                </text>
                <text x="775" y="314" textAnchor="middle" fontSize="10" opacity="0.7">
                  redacted + correlation id
                </text>
              </svg>
            </div>
            <figcaption>
              Every tool call passes through the same contract before it touches{' '}
              <code>sleap-roots-analyze</code> or storage: validated in, seeded and stamped,
              executed against delegated science code, validated and hashed out — with read and
              write backends swappable behind fixed ports, and any undeclared exception intercepted
              before it reaches the agent.
            </figcaption>
          </figure>

          <h3 className="detail-subheading">The tool catalog</h3>
          <p className="about-body project-detail-prose">
            22 tools across three sections, with one Python file per tool and one FastMCP sub-server
            per contributor.
          </p>

          <div className="detail-tool-group">
            <h4>Core discovery — 5</h4>
            <div className="detail-tool-grid">
              <div className="detail-tool-card">
                <span className="name">list_available_experiments</span>
                <span className="desc">
                  Experiments with row/trait counts and auto-detected genotype/sample-ID columns
                </span>
              </div>
              <div className="detail-tool-card">
                <span className="name">load_experiment_data</span>
                <span className="desc">
                  Summary of one experiment: sample/genotype/trait counts and missing-data preview
                </span>
              </div>
              <div className="detail-tool-card">
                <span className="name">list_existing_analyses</span>
                <span className="desc">Every prior persisted analysis run for an experiment</span>
              </div>
              <div className="detail-tool-card">
                <span className="name">get_download_links</span>
                <span className="desc">
                  Re-signs fresh download URLs and returns SHA-256 and file size for an
                  already-committed run
                </span>
              </div>
              <div className="detail-tool-card">
                <span className="name">list_experiment_sources</span>
                <span className="desc">
                  Distinct raw database sources backing an experiment, allowing a run to be pinned
                  to one source version
                </span>
              </div>
            </div>
          </div>

          <div className="detail-tool-group">
            <h4>Sleap-roots analysis — 13</h4>
            <div className="detail-tool-grid">
              <div className="detail-tool-card">
                <span className="name">qc_inspect</span>
                <span className="desc">
                  Read-only missingness report before committing to a clean
                </span>
              </div>
              <div className="detail-tool-card">
                <span className="name">qc_clean</span>
                <span className="desc">
                  The sole producer of the cleaned dataset used by downstream analyses
                </span>
              </div>
              <div className="detail-tool-card">
                <span className="name">remove_outliers</span>
                <span className="desc">
                  Mahalanobis- or Isolation-Forest-based outlier trimming
                </span>
              </div>
              <div className="detail-tool-card">
                <span className="name">pca_analysis</span>
                <span className="desc">Principal component analysis, with optional plots</span>
              </div>
              <div className="detail-tool-card">
                <span className="name">clustering</span>
                <span className="desc">
                  k-means, GMM, or hierarchical clustering, either automatically or explicitly
                  selected
                </span>
              </div>
              <div className="detail-tool-card">
                <span className="name">umap_analysis</span>
                <span className="desc">UMAP dimensionality reduction</span>
              </div>
              <div className="detail-tool-card">
                <span className="name">descriptive_stats</span>
                <span className="desc">
                  Per-trait mean, standard deviation, quantiles, skewness, and kurtosis
                </span>
              </div>
              <div className="detail-tool-card">
                <span className="name">cross_experiment_correlations</span>
                <span className="desc">
                  Genotype-mean trait correlations across two experiments
                </span>
              </div>
              <div className="detail-tool-card">
                <span className="name">plot_trait_histograms</span>
                <span className="desc">Trait-distribution histograms</span>
              </div>
              <div className="detail-tool-card">
                <span className="name">plot_trait_boxplots</span>
                <span className="desc">Boxplots grouped by genotype</span>
              </div>
              <div className="detail-tool-card">
                <span className="name">plot_correlation_matrix</span>
                <span className="desc">Pairwise Pearson correlation heatmap</span>
              </div>
              <div className="detail-tool-card">
                <span className="name">plot_heritability_bar</span>
                <span className="desc">Heritability (H²) bar chart</span>
              </div>
              <div className="detail-tool-card">
                <span className="name">plot_variance_decomposition</span>
                <span className="desc">Genetic vs. environmental variance breakdown</span>
              </div>
            </div>
          </div>

          <div className="detail-tool-group">
            <h4>Phenotyping segmentation — 4</h4>
            <div className="detail-tool-grid">
              <div className="detail-tool-card">
                <span className="name">summarize_trait · compute_min/median/mode</span>
                <span className="desc">
                  Trait summary statistics built by a labmate on top of the same infrastructure
                </span>
              </div>
            </div>
          </div>

          <h3 className="detail-subheading">Reproducibility</h3>
          <p className="about-body project-detail-prose">
            Every run records its own <strong>provenance</strong>: the resolved random seed, the
            installed versions of the scientific dependencies, and a SHA-256 hash of the exact
            output bytes that were staged for persistence.
          </p>
          <p className="about-body project-detail-prose">
            Seeds are validated before execution: booleans, floats, and values outside the supported
            range are rejected, and a seed is generated with <code>secrets.randbelow</code> when the
            caller does not provide one. Output hashes are computed from the actual bytes rather
            than a storage provider&apos;s ETag.
          </p>
          <p className="about-body project-detail-prose">
            This metadata is stored in a versioned, append-only manifest schema that I extended from
            v3 through v5 as new guarantees were added. Older manifests remain valid against the
            current schema.
          </p>

          <h3 className="detail-subheading">Persistence &amp; security</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Reading experiment data and writing analysis results are handled through separate,
              swappable interfaces. Production uses Supabase; local or private-data deployments can
              use the filesystem backend; tests use lightweight fakes.
            </p>
            <p className="about-body project-detail-prose">
              One experiment can contain as many as 880 raw trait columns. The original access
              pattern could require{' '}
              <strong>649–880 sequential per-trait database round trips</strong> to assemble a
              dataset. I replaced that path with a Postgres RPC that returns all of the required
              trait data in one call, then used the same bulk-aggregation approach on a second
              endpoint that was timing out under production load.
            </p>
            <p className="about-body project-detail-prose">
              For identity and access control, bloom-mcp verifies OAuth caller identity and records
              per-tool usage against the authenticated user. Result downloads use signed URLs, with
              structural key-scoping checks to prevent one run from accessing another run&apos;s
              files.
            </p>
            <p className="about-body project-detail-prose">
              Error responses are also scrubbed before being returned so internal paths, stack
              traces, and storage identifiers are not exposed to the agent.
            </p>
          </div>
        </div>
      </section>

      <section
        ref={techRef}
        className="project-detail-tech reveal"
        aria-labelledby="bloom-timeline-heading"
      >
        <div className="sec-inner project-detail-tech-inner">
          <div className="section-title-row section-title-row--on-dark">
            <h2
              id="bloom-timeline-heading"
              className="about-headline project-detail-section-title project-detail-section-title--on-dark"
            >
              Built tier by tier
            </h2>
          </div>
          <p className="about-body project-detail-prose">
            The project was developed in tiers, with each tier adding a working and tested
            capability. Some tiers overlapped as later work began before earlier work was fully
            closed out. These are the project&apos;s original tier names rather than categories
            added afterward.
          </p>

          <div className="detail-timeline">
            <div className="detail-tl-row">
              <span className="detail-tl-tag">Tier 0</span>
              <span className="detail-tl-body">
                <strong>Package baseline.</strong> Restructured bloom-mcp into an installable
                package with a CI gate that builds and imports it cleanly.
              </span>
            </div>
            <div className="detail-tl-row">
              <span className="detail-tl-tag">Tier 1</span>
              <span className="detail-tl-body">
                <strong>Contract layer.</strong> Added <code>@as_mcp_tool</code>, provenance
                stamping, and manifest schema v3.
              </span>
            </div>
            <div className="detail-tl-row">
              <span className="detail-tl-tag">Tier 2</span>
              <span className="detail-tl-body">
                <strong>Persistence ports.</strong> Introduced the ExperimentReader and ResultStore
                abstractions, together with a live-Supabase smoke test.
              </span>
            </div>
            <div className="detail-tl-row">
              <span className="detail-tl-tag">Tier 3</span>
              <span className="detail-tl-body">
                <strong>QC &amp; outliers.</strong> Added <code>qc_clean</code>, read-only{' '}
                <code>qc_inspect</code>, and Mahalanobis/Isolation-Forest{' '}
                <code>remove_outliers</code>.
              </span>
            </div>
            <div className="detail-tl-row">
              <span className="detail-tl-tag">Tier 4</span>
              <span className="detail-tl-body">
                <strong>Dimensionality reduction.</strong> Added <code>pca_analysis</code>, followed
                by <code>umap_analysis</code>.
              </span>
            </div>
            <div className="detail-tl-row">
              <span className="detail-tl-tag">Tier 5</span>
              <span className="detail-tl-body">
                <strong>Clustering.</strong> Added a polymorphic clustering tool supporting k-means,
                GMM, and hierarchical clustering.
              </span>
            </div>
            <div className="detail-tl-row">
              <span className="detail-tl-tag">Hardening</span>
              <span className="detail-tl-body">
                <strong>Cross-experiment stats &amp; scale.</strong> Added{' '}
                <code>descriptive_stats</code>, <code>cross_experiment_correlations</code>, the
                bulk-read RPC, OAuth verification, and signed-URL downloads.
              </span>
            </div>
            <div className="detail-tl-row">
              <span className="detail-tl-tag">Current</span>
              <span className="detail-tl-body">
                <strong>Polish &amp; release.</strong> Added plot-style overrides, a PyPI release
                pipeline, pixel-diff snapshot tests, and plot-parameter safety guards.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="project-detail-motivation reveal" aria-labelledby="bloom-testing-heading">
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2 id="bloom-testing-heading" className="about-headline project-detail-section-title">
              Proving it&apos;s right, not just running
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              I developed the tools test-first and shipped them through peer-reviewed pull requests:{' '}
              <strong>1,229 test functions across 87 files</strong> (~27,900 lines) against ~13,900
              lines of implementation, or roughly a 2:1 test-to-code ratio.
            </p>
            <p className="about-body project-detail-prose">
              Fifteen golden JSON fixtures provide independent reference outputs for the analysis
              layer. They come from the upstream package&apos;s published wheat-phenotyping results
              rather than being regenerated from bloom-mcp itself, so the tests compare against an
              external reference instead of reproducing the same implementation on both sides.
            </p>
            <p className="about-body project-detail-prose">
              The newest addition is pixel-level snapshot testing for the five plotting tools. The
              previous tests verified that a PNG was produced, but they could not detect visual
              regressions such as an incorrect color mapping.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="bloom-process-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2 id="bloom-process-heading" className="about-headline project-detail-section-title">
              How it shipped
            </h2>
          </div>
          <p className="about-body project-detail-prose">
            For non-trivial changes, I wrote a design proposal before implementation and used it to
            get feedback on the approach before the code landed. Pull requests then went through
            structured, often multi-round review.
          </p>
          <p className="about-body project-detail-prose">
            Those reviews caught issues that affected behavior, not just style: a join bug in a
            bulk-RPC migration, a durability race in the result store, and a case where outlier
            removal could silently produce inconsistent state. Each was fixed before the change was
            merged.
          </p>
          <p className="about-body project-detail-prose">
            The process throughout the project was consistent: design the interface first, test the
            expected behavior, implement it, and review the result before merging. For research
            software, a wrong analysis is much more costly than a slow one.
          </p>
        </div>
      </section>
    </main>
  )
}
