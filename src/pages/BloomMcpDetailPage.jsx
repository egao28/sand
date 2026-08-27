import { Link } from 'react-router-dom'
import './BloomMcpDetailPage.css'

export default function BloomMcpDetailPage() {
  return (
    <div className="bloom-detail-page">
      <div className="bloom-detail-back-wrap">
        <Link to="/about" className="bloom-detail-back">
          ← About
        </Link>
      </div>

      <header className="masthead">
        <div className="masthead-inner">
          <span className="eyebrow">
            Research Software Engineering · Salk Institute, Harnessing Plants Initiative
          </span>
          <h1>Bloom MCP</h1>
          <p className="subtitle">
            A reproducible AI-analysis surface for root-phenotyping research
          </p>
          <p className="dek">
            Between June and August 2026 I designed and built <strong>bloom-mcp</strong> — the
            service that lets Claude and other AI agents run real, validated plant-phenotyping
            analyses against Bloom&apos;s research database, from a plain-English request.
            Twenty-two tools, a contract layer that makes every run reproducible, and a test suite
            big enough to trust it.
          </p>
          <div className="stat-strip">
            <div className="stat">
              <span className="num">22</span>
              <span className="label">MCP tools</span>
            </div>
            <div className="stat">
              <span className="num">79</span>
              <span className="label">PRs shipped</span>
            </div>
            <div className="stat">
              <span className="num">1,229</span>
              <span className="label">test functions</span>
            </div>
            <div className="stat">
              <span className="num">42.9k</span>
              <span className="label">lines of Python</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="project">
          <span className="eyebrow">Context</span>
          <h2>What a researcher actually gets</h2>
          <div className="measure">
            <p>
              <strong>Bloom</strong> is a research platform for the Salk Institute&apos;s Harnessing
              Plants Initiative, where plant biologists explore phenotype, genotype,
              gene-expression, and root-scan data — including cylinder-grown root systems traced
              through the lab&apos;s SLEAP-based pipeline. My job was to make that data usable by an
              AI agent, not just a human clicking through dashboards: a researcher can ask, in plain
              English, to clean an experiment, remove outliers, and show the PCA, and bloom-mcp
              resolves the raw data, validates and cleans it, runs the analysis, renders the plot,
              and hands back signed download links with full provenance — no custom glue code per
              request.
            </p>
            <p>
              I own this service end to end: the tool surface, the reproducibility guarantees
              underneath it, the storage and identity layers around it, and the test suite that
              keeps all of it honest.
            </p>
          </div>
        </section>

        <section id="architecture">
          <span className="eyebrow">Architecture</span>
          <h2>Everything an AI surface needs — and nothing the science already owns</h2>

          <h3>A thin, hardened surface</h3>
          <div className="measure">
            <p>
              Every analysis tool delegates its actual math to{' '}
              <a href="https://github.com/talmolab/sleap-roots-analyze">sleap-roots-analyze</a>, a
              separate scientific-computing package maintained by the Pereira Lab. Bloom-mcp is
              deliberately a thin surface over it, not a second home for analysis code — what it
              owns instead is everything the science package doesn&apos;t: input/output validation,
              reproducibility, access control, storage, and the test suite that holds it together.
            </p>
            <p>
              That wasn&apos;t always true. Early on, bloom-mcp vendored its own copies of the PCA,
              clustering, and outlier-detection logic; once the upstream package matured, I led the
              effort to delete all of it and repoint every call site to the real library. Today
              there are zero direct <code>scikit-learn</code>/<code>scipy</code>/
              <code>seaborn</code> imports in bloom-mcp&apos;s shipped code — an invariant pinned by
              its own dedicated test.
            </p>
          </div>

          <figure className="diagram">
            <div className="diagram-scroll">
              <svg
                viewBox="0 0 1360 400"
                role="img"
                aria-label="A tool call flows from a pluggable ExperimentReader backend, through a contract wrapper that validates parameters, resolves a seed, delegates execution to sleap-roots-analyze, and validates and hashes the output, into a pluggable ResultStore backend; any undeclared exception is intercepted before it reaches the agent."
              >
                <defs>
                  <marker
                    id="bloom-arrow"
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
                  fontWeight="600"
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
                  fill="var(--bg)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="105" y="194" textAnchor="middle" fontSize="12" fontWeight="500">
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
                  fill="var(--bg)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="325" y="204" textAnchor="middle" fontSize="12" fontWeight="500">
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
                  fill="var(--bg)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="535" y="194" textAnchor="middle" fontSize="12" fontWeight="500">
                  Resolve seed →
                </text>
                <text x="535" y="210" textAnchor="middle" fontSize="12" fontWeight="500">
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
                  fill="var(--bg)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="775" y="194" textAnchor="middle" fontSize="12" fontWeight="500">
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
                  fill="var(--bg)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="1030" y="194" textAnchor="middle" fontSize="12" fontWeight="500">
                  Validate output →
                </text>
                <text x="1030" y="210" textAnchor="middle" fontSize="12" fontWeight="500">
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
                  fill="var(--bg)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="1255" y="194" textAnchor="middle" fontSize="12" fontWeight="500">
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

          <h3>The tool catalog</h3>
          <div className="measure">
            <p>
              22 tools across three sections — one Python file per tool, one FastMCP sub-server per
              contributor.
            </p>
          </div>

          <div className="catalog-group">
            <h4>Core discovery — 5</h4>
            <div className="tool-grid">
              <div className="tool-card">
                <span className="name">list_available_experiments</span>
                <span className="desc">
                  Experiments with row/trait counts and auto-detected genotype/sample-ID columns
                </span>
              </div>
              <div className="tool-card">
                <span className="name">load_experiment_data</span>
                <span className="desc">
                  Summary of one experiment: sample/genotype/trait counts, missing-data preview
                </span>
              </div>
              <div className="tool-card">
                <span className="name">list_existing_analyses</span>
                <span className="desc">Every prior persisted analysis run for an experiment</span>
              </div>
              <div className="tool-card">
                <span className="name">get_download_links</span>
                <span className="desc">
                  Re-signs fresh download URLs, SHA-256, and size for an already-committed run
                </span>
              </div>
              <div className="tool-card">
                <span className="name">list_experiment_sources</span>
                <span className="desc">
                  Distinct raw DB sources backing an experiment, to pin a run to one version
                </span>
              </div>
            </div>
          </div>

          <div className="catalog-group">
            <h4>Sleap-roots analysis — 13</h4>
            <div className="tool-grid">
              <div className="tool-card">
                <span className="name">qc_inspect</span>
                <span className="desc">
                  Read-only missingness report before committing to a clean
                </span>
              </div>
              <div className="tool-card">
                <span className="name">qc_clean</span>
                <span className="desc">
                  The sole producer of the analysis-ready cleaned dataset
                </span>
              </div>
              <div className="tool-card">
                <span className="name">remove_outliers</span>
                <span className="desc">
                  Mahalanobis- or Isolation-Forest-based outlier trimming
                </span>
              </div>
              <div className="tool-card">
                <span className="name">pca_analysis</span>
                <span className="desc">Principal component analysis, with optional plots</span>
              </div>
              <div className="tool-card">
                <span className="name">clustering</span>
                <span className="desc">k-means, GMM, or hierarchical — auto- or user-selected</span>
              </div>
              <div className="tool-card">
                <span className="name">umap_analysis</span>
                <span className="desc">UMAP dimensionality reduction</span>
              </div>
              <div className="tool-card">
                <span className="name">descriptive_stats</span>
                <span className="desc">Per-trait mean, std, quantiles, skewness, kurtosis</span>
              </div>
              <div className="tool-card">
                <span className="name">cross_experiment_correlations</span>
                <span className="desc">
                  Genotype-mean trait correlations across two experiments
                </span>
              </div>
              <div className="tool-card">
                <span className="name">plot_trait_histograms</span>
                <span className="desc">Trait-distribution histograms</span>
              </div>
              <div className="tool-card">
                <span className="name">plot_trait_boxplots</span>
                <span className="desc">Boxplots grouped by genotype</span>
              </div>
              <div className="tool-card">
                <span className="name">plot_correlation_matrix</span>
                <span className="desc">Pairwise Pearson correlation heatmap</span>
              </div>
              <div className="tool-card">
                <span className="name">plot_heritability_bar</span>
                <span className="desc">Heritability (H²) bar chart</span>
              </div>
              <div className="tool-card">
                <span className="name">plot_variance_decomposition</span>
                <span className="desc">Genetic vs. environmental variance breakdown</span>
              </div>
            </div>
          </div>

          <div className="catalog-group">
            <h4>Phenotyping segmentation — 4</h4>
            <div className="tool-grid">
              <div className="tool-card">
                <span className="name">summarize_trait · compute_min/median/mode</span>
                <span className="desc">
                  Trait summary statistics, built by a labmate on the same infrastructure
                </span>
              </div>
            </div>
          </div>

          <h3>Reproducibility, by construction</h3>
          <div className="measure">
            <p>
              Every run stamps its own <strong>provenance</strong>: a resolved random seed (rejected
              if it&apos;s a bool, a float, or out of range; drawn from{' '}
              <code>secrets.randbelow</code> when none is given), the installed version of every
              scientific dependency, and a SHA-256 hash computed over the{' '}
              <em>exact staged output bytes</em> — never a storage provider&apos;s ETag, which can
              lie. All of it lands in a versioned, append-only manifest schema I&apos;ve grown from
              v3 to v5 as new guarantees were needed, so a two-month-old manifest still validates
              against today&apos;s schema.
            </p>
          </div>

          <h3>Persistence &amp; security</h3>
          <div className="measure">
            <p>
              Reading raw data and writing results are two separate, swappable ports — Supabase in
              production, a local filesystem backend for offline or private-data deployments, and
              fakes for tests. I replaced what would have been{' '}
              <strong>649–880 sequential per-trait database round trips</strong> — one real
              experiment carries up to 880 raw trait columns — with a single Postgres RPC that
              returns every trait in one call, then applied the same bulk-aggregate pattern to a
              second endpoint that was hanging in production under load.
            </p>
            <p>
              On the identity side: OAuth caller-identity verification and per-tool usage
              attribution so every call traces to a real user, signed-URL downloads with structural
              key-scoping guards against cross-run access, and systematic error redaction so no tool
              ever leaks a host path, stack trace, or internal identifier back to an agent.
            </p>
          </div>
        </section>

        <section id="timeline">
          <span className="eyebrow">Timeline</span>
          <h2>Built tier by tier</h2>
          <div className="measure">
            <p>
              The project shipped as a sequence of vertical slices, each one a working, tested
              capability rather than a scaffold for the next — the tiers below are the
              project&apos;s own naming, not a retrospective one.
            </p>
          </div>
          <div className="timeline">
            <div className="tl-row">
              <span className="tl-tag">Tier 0</span>
              <span className="tl-date">Jun 15–16</span>
              <span className="tl-body">
                <strong>Package baseline.</strong> Restructured into an installable package with a
                CI gate that builds and imports it clean.
              </span>
            </div>
            <div className="tl-row">
              <span className="tl-tag">Tier 1</span>
              <span className="tl-date">Jun 18</span>
              <span className="tl-body">
                <strong>Contract layer.</strong> <code>@as_mcp_tool</code>, provenance stamping,
                manifest schema v3.
              </span>
            </div>
            <div className="tl-row">
              <span className="tl-tag">Tier 2</span>
              <span className="tl-date">Jun 22–24</span>
              <span className="tl-body">
                <strong>Persistence ports.</strong> ExperimentReader/ResultStore abstractions, plus
                a live-Supabase smoke test.
              </span>
            </div>
            <div className="tl-row">
              <span className="tl-tag">Tier 3</span>
              <span className="tl-date">Jun 25 – Jul 8</span>
              <span className="tl-body">
                <strong>QC &amp; outliers.</strong> <code>qc_clean</code>, read-only{' '}
                <code>qc_inspect</code>, and Mahalanobis/Isolation-Forest{' '}
                <code>remove_outliers</code>.
              </span>
            </div>
            <div className="tl-row">
              <span className="tl-tag">Tier 4</span>
              <span className="tl-date">Jul 1–24</span>
              <span className="tl-body">
                <strong>Dimensionality reduction.</strong> <code>pca_analysis</code>, then{' '}
                <code>umap_analysis</code>.
              </span>
            </div>
            <div className="tl-row">
              <span className="tl-tag">Tier 5</span>
              <span className="tl-date">Jul 10–14</span>
              <span className="tl-body">
                <strong>Clustering.</strong> Polymorphic k-means / GMM / hierarchical clustering
                tool.
              </span>
            </div>
            <div className="tl-row">
              <span className="tl-tag">Hardening</span>
              <span className="tl-date">Jul 27 – Aug 12</span>
              <span className="tl-body">
                <strong>Cross-experiment stats &amp; scale.</strong> <code>descriptive_stats</code>,{' '}
                <code>cross_experiment_correlations</code>, the bulk-read RPC, OAuth verification,
                and signed-URL downloads.
              </span>
            </div>
            <div className="tl-row">
              <span className="tl-tag">Current</span>
              <span className="tl-date">Aug 13–27</span>
              <span className="tl-body">
                <strong>Polish &amp; release.</strong> Plot style overrides, a PyPI release
                pipeline, pixel-diff snapshot tests, and plot-parameter safety guards.
              </span>
            </div>
          </div>
        </section>

        <section id="testing">
          <span className="eyebrow">Testing</span>
          <h2>Proving it&apos;s right, not just running</h2>
          <div className="measure">
            <p>
              I delivered every tool test-first, through peer-reviewed pull requests:{' '}
              <strong>1,229 test functions across 87 files</strong> (~27,900 lines) against ~13,900
              lines of implementation — roughly a 2:1 test-to-code ratio. Fifteen golden JSON
              fixtures, sourced independently from the upstream package&apos;s own published
              wheat-phenotyping results rather than re-derived from the code under test, work as a
              genuine cross-tier oracle instead of a tautology.
            </p>
            <p>
              The newest addition is pixel-level snapshot testing for the five plotting tools — the
              old tests only checked that a PNG existed, so a silent color-mapping regression could
              ship undetected.
            </p>
          </div>

          <blockquote className="pull">
            &quot;I didn&apos;t guess the tolerance — I measured it. I dimmed a baseline plot by 2%,
            5%, and 10% brightness and scored each against the real image-diff metric, then set the
            threshold above the noise a different operating system&apos;s font rendering produces,
            and below what a real regression looks like. Then I wrote a test that reproduces that
            10% regression live, so the threshold has to prove itself on every run — not just the
            day I picked it.&quot;
            <footer>on calibrating the pixel-snapshot tolerance</footer>
          </blockquote>
        </section>

        <section id="process">
          <span className="eyebrow">Process</span>
          <h2>How it shipped</h2>
          <div className="measure">
            <p>
              Every non-trivial change started as a written design proposal, reviewed before a line
              of code landed, and every pull request then went through structured, often
              multi-round, adversarial review before merging — the kind that catches real defects,
              not style nits: a join bug in a bulk-RPC migration, a race condition in result-store
              durability, a silent-inconsistency case in outlier removal. All caught and fixed
              before reaching production, not after.
            </p>
          </div>
          <div className="callout">
            <strong>Discipline over velocity.</strong> Design docs before code, tests before
            implementation, and review before merge — for a service where &quot;the analysis was
            wrong&quot; is a much worse failure than &quot;the analysis was slow.&quot;
          </div>
        </section>
      </main>

      <footer className="colophon">
        Prepared as project documentation.
        <br />
        Research Software Engineering Intern — Salk Institute, Harnessing Plants Initiative, Jun–Aug
        2026.
        <br />
        PIs: Talmo Pereira &amp; Wolfgang Busch. La Jolla, CA.
      </footer>
    </div>
  )
}
