import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js'
import NotFoundPage from './NotFoundPage.jsx'
import { useDarkSurfaceOnIntersect } from '../hooks/useDarkSurfaceOnIntersect.js'
import { getProjectBySlug } from '../data/siteContent.js'
import { splitTechnical } from '../utils/splitTechnical.js'
import DiagramArrowMarker from '../components/DiagramArrowMarker.jsx'
import TechChipGrid from '../components/TechChipGrid.jsx'

export default function ProximaDetailPage() {
  const techRef = useDarkSurfaceOnIntersect()
  useRevealOnScroll()
  const project = getProjectBySlug('proxima')
  const demoUrl = project?.demoUrl?.trim()
  const demoLabel = project?.demoLabel?.trim() || 'Open project'

  if (!project) {
    return <NotFoundPage />
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
            Connecting students with research through semantic matching
          </p>
          <p className="about-body project-detail-prose">
            An AI-powered research discovery platform that helps students find relevant professors,
            understand their research, and turn an academic interest into a first email.
          </p>
          <dl className="detail-meta-row">
            <div>
              <dt>Role</dt>
              <dd>Independent project</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>Next.js, TypeScript, Tailwind CSS, OpenAI API</dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>1,422 UChicago faculty research profiles</dd>
            </div>
          </dl>
        </div>
      </header>

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="proxima-overview-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2
              id="proxima-overview-heading"
              className="about-headline project-detail-section-title"
            >
              Overview
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Finding a research mentor usually means working through department directories,
              reading research descriptions written for other academics, and guessing which
              professors might be a good fit. Students often know what interests them without
              knowing the vocabulary a field uses to describe it, which is exactly what keyword
              search needs them to supply.
            </p>
            <p className="about-body project-detail-prose">
              I built Proxima so the search starts from a description instead. Students write what
              they are interested in and what they have worked on, and the system compares that text
              against faculty research profiles in a shared embedding space rather than looking for
              literal term overlap.
            </p>
            <p className="about-body project-detail-prose">
              A ranked list is only the first step, so the platform also connects discovery,
              comparison, and outreach into a single workflow.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-approach reveal" aria-labelledby="proxima-journey-heading">
        <div className="sec-inner project-detail-approach-inner">
          <div className="section-title-row">
            <h2
              id="proxima-journey-heading"
              className="about-headline project-detail-section-title"
            >
              From interests to research connections
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The product is four stages that hand work to each other, and each one assumes the
              student is still deciding rather than choosing.
            </p>
          </div>

          <div className="detail-timeline">
            <div className="detail-tl-row">
              <span className="detail-tl-tag">01</span>
              <span className="detail-tl-body">
                <strong>Describe your interests.</strong> Students can browse a taxonomy of 50
                departments across the STEM, social sciences, humanities, and professional
                divisions, or skip it and type what they are interested in and what they have
                already worked on. Both fields are combined into the query the matcher sees.
              </span>
            </div>
            <div className="detail-tl-row">
              <span className="detail-tl-tag">02</span>
              <span className="detail-tl-body">
                <strong>Discover relevant professors.</strong> The query is embedded and ranked
                against 1,422 faculty research profiles by cosine similarity. Three professors come
                back with a score, a department, and a research summary; asking for another round
                continues down the same ranking instead of returning the same three.
              </span>
            </div>
            <div className="detail-tl-row">
              <span className="detail-tl-tag">03</span>
              <span className="detail-tl-body">
                <strong>Explore and compare.</strong> Each result opens a profile with a generated
                explanation of where the interests overlap. Students save the professors worth
                keeping, then put any two side by side to see what each one emphasises differently.
              </span>
            </div>
            <div className="detail-tl-row">
              <span className="detail-tl-tag">04</span>
              <span className="detail-tl-body">
                <strong>Prepare for outreach.</strong> Choosing a professor drafts a short outreach
                email written from the student&apos;s own interests and that professor&apos;s
                research, kept deliberately short and plain so it reads as a starting point to edit
                rather than a letter to send unread.
              </span>
            </div>
          </div>
        </div>
      </section>

      {demoUrl && (
        <section className="project-detail-demo reveal" aria-labelledby="proxima-demo-heading">
          <div className="sec-inner project-detail-demo-inner">
            <div className="section-title-row">
              <h2 id="proxima-demo-heading" className="about-headline project-detail-section-title">
                Try it here
              </h2>
            </div>
            <p className="project-detail-demo-lead">
              <a
                href={demoUrl}
                className="project-detail-demo-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${demoLabel} (opens in a new tab)`}
              >
                {demoLabel}
              </a>
            </p>
          </div>
        </section>
      )}

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="proxima-matching-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2
              id="proxima-matching-heading"
              className="about-headline project-detail-section-title"
            >
              How the matching system works
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Proxima puts student interests and faculty research descriptions into the same
              embedding space using OpenAI&apos;s text-embedding-3-small. A professor&apos;s text is
              their department and research summary joined together; a student&apos;s is their
              interests and background.
            </p>
            <p className="about-body project-detail-prose">
              Embedding 1,422 profiles on every search would be slow and expensive, so the profile
              vectors are computed once and written to a cache file. A request then embeds one new
              string and compares it against the whole cache. The index itself is a scrape of public
              UChicago department pages, which makes it a snapshot of what those pages said rather
              than a maintained faculty directory.
            </p>
          </div>

          <h3 className="detail-subheading">What a score is, and what it is not</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The percentage shown next to each professor is the cosine similarity, clamped and
              rounded:
            </p>
          </div>
          <code className="detail-code">score = round(max(0, cosine_similarity) * 100)</code>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              It orders a list and gives a rough sense of distance. It is not a calibrated
              probability, it was not fitted to any judgment of what makes a good mentor, and it
              knows nothing about whether a professor is currently taking students.
            </p>
            <p className="about-body project-detail-prose">
              Ranking and explanation are kept separate for the same reason. Similarity alone
              decides which professors appear; the language model only describes the overlap for
              professors retrieval has already selected, and never reorders them. Those explanations
              are a reading of the profile text on the page, not an independently verified claim
              about anyone&apos;s current work.
            </p>
          </div>

          <figure className="detail-diagram">
            <div className="detail-diagram-scroll" tabIndex="0">
              <svg
                viewBox="0 0 1180 400"
                role="img"
                aria-label="Offline and once, 1,422 faculty profiles are embedded into a vector cache file. Online and per request, a student's interests and background are embedded, compared by cosine similarity against the cached vectors, sorted, and returned as the top three matches; gpt-4o-mini then writes an explanation for each one, and the results carry on into saving, comparison and an outreach draft. On the fallback paths, a local keyword-group embedder replaces OpenAI embeddings when no key is configured, and deterministic template text replaces the generated explanations and emails when a model call fails."
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
                  1,422 faculty profiles
                </text>
                <line
                  x1="250"
                  y1="96"
                  x2="378"
                  y2="96"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>
                <text x="314" y="86" textAnchor="middle" fontSize="10.5" opacity="0.7">
                  embed
                </text>
                <rect
                  x="380"
                  y="70"
                  width="220"
                  height="52"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="490" y="92" textAnchor="middle" fontSize="12" fontWeight="600">
                  Cached profile vectors
                </text>
                <text x="490" y="110" textAnchor="middle" fontSize="10.5" opacity="0.7">
                  written to disk, reused
                </text>

                <line
                  x1="490"
                  y1="122"
                  x2="490"
                  y2="192"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>

                <text
                  x="20"
                  y="196"
                  fontSize="11.5"
                  fontWeight="700"
                  fill="var(--accent)"
                  letterSpacing="0.4"
                >
                  ONLINE, PER REQUEST
                </text>
                <rect
                  x="20"
                  y="210"
                  width="160"
                  height="66"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="100" y="237" textAnchor="middle" fontSize="12">
                  Interests +
                </text>
                <text x="100" y="255" textAnchor="middle" fontSize="12">
                  background
                </text>
                <line
                  x1="180"
                  y1="243"
                  x2="215"
                  y2="243"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>
                <rect
                  x="217"
                  y="210"
                  width="118"
                  height="66"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="276" y="248" textAnchor="middle" fontSize="12" fontWeight="600">
                  Embed query
                </text>
                <line
                  x1="335"
                  y1="243"
                  x2="370"
                  y2="243"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>

                <rect
                  x="372"
                  y="196"
                  width="236"
                  height="94"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="490" y="232" textAnchor="middle" fontSize="12" fontWeight="600">
                  Cosine similarity vs.
                </text>
                <text x="490" y="250" textAnchor="middle" fontSize="12" fontWeight="600">
                  every cached vector
                </text>
                <text x="490" y="270" textAnchor="middle" fontSize="10.5" opacity="0.7">
                  sorted high → low
                </text>

                <line
                  x1="608"
                  y1="243"
                  x2="643"
                  y2="243"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>
                <rect
                  x="645"
                  y="210"
                  width="130"
                  height="66"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="710" y="248" textAnchor="middle" fontSize="12" fontWeight="600">
                  Top 3 matches
                </text>

                <line
                  x1="775"
                  y1="243"
                  x2="810"
                  y2="243"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>
                <rect
                  x="812"
                  y="196"
                  width="190"
                  height="94"
                  rx="5"
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="907" y="232" textAnchor="middle" fontSize="12" fontWeight="600">
                  gpt-4o-mini
                </text>
                <text x="907" y="251" textAnchor="middle" fontSize="10.5" opacity="0.7">
                  explains each match,
                </text>
                <text x="907" y="266" textAnchor="middle" fontSize="10.5" opacity="0.7">
                  does not reorder it
                </text>

                <line
                  x1="1002"
                  y1="243"
                  x2="1030"
                  y2="243"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  markerEnd="url(#px-arrow)"
                ></line>
                <rect
                  x="1032"
                  y="196"
                  width="128"
                  height="94"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></rect>
                <text x="1096" y="234" textAnchor="middle" fontSize="11.5">
                  Save, compare,
                </text>
                <text x="1096" y="252" textAnchor="middle" fontSize="11.5">
                  draft outreach
                </text>

                <text
                  x="20"
                  y="320"
                  fontSize="11.5"
                  fontWeight="700"
                  fill="var(--accent)"
                  letterSpacing="0.4"
                >
                  FALLBACK PATHS
                </text>
                <line
                  x1="276"
                  y1="276"
                  x2="276"
                  y2="330"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  markerEnd="url(#px-arrow)"
                ></line>
                <rect
                  x="151"
                  y="332"
                  width="250"
                  height="46"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                ></rect>
                <text x="276" y="360" textAnchor="middle" fontSize="11.5">
                  No key → local keyword embedder
                </text>
                <line
                  x1="907"
                  y1="290"
                  x2="907"
                  y2="330"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  markerEnd="url(#px-arrow)"
                ></line>
                <rect
                  x="782"
                  y="332"
                  width="250"
                  height="46"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                ></rect>
                <text x="907" y="360" textAnchor="middle" fontSize="11.5">
                  Call fails → deterministic text
                </text>
              </svg>
            </div>
            <figcaption>
              Profile vectors are built once and cached; a search embeds one new string, ranks it
              against the cache by cosine similarity, and returns three professors that a model then
              explains. Both external calls have a local substitute, so a missing key or a failed
              request degrades the output rather than breaking the page.
            </figcaption>
          </figure>

          <div className="detail-tool-grid">
            <div className="detail-tool-card">
              <span className="name">Semantic retrieval</span>
              <span className="desc">
                OpenAI embeddings and cosine similarity over cached profile vectors decide the
                ranking.
              </span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Keyword fallback</span>
              <span className="desc">
                A local embedder scores text against fixed keyword groups when no API key is
                configured or a call fails.
              </span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Generated explanations</span>
              <span className="desc">
                gpt-4o-mini writes two to four sentences on the overlap, grounded in the retrieved
                profile text.
              </span>
            </div>
            <div className="detail-tool-card">
              <span className="name">Structured results</span>
              <span className="desc">
                Every match carries the identifiers the rest of the product needs for profiles,
                saving, comparison, and rematching.
              </span>
            </div>
          </div>

          <h3 className="detail-subheading">Checking whether a ranking change helped</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              The keyword fallback was the part most likely to be quietly wrong. Several fields had
              no vocabulary in it at all, so linguistics, classics, and medieval religion professors
              scored zero against every group and could only rank by accident.
            </p>
            <p className="about-body project-detail-prose">
              To tell whether fixing that actually helped, I wrote 18 queries, labelled the relevant
              professors for each, and reran the ranking before and after. Splitting overloaded
              groups (physics from quantum and astronomy, general business from finance) and adding
              the missing ones moved the queries with a relevant professor in the top three from 12
              of 18 to 17 of 18, and mean precision at three from 0.37 to 0.56.
            </p>
            <p className="about-body project-detail-prose">
              The same run is a useful corrective: the top-ranked professor was the one I would have
              picked myself in only 5 of 18 queries. Eighteen queries and one annotator make a
              regression check, not a measurement of match quality, and the numbers describe the
              fallback path rather than the OpenAI one.
            </p>
          </div>
        </div>
      </section>

      <section
        className="project-detail-approach reveal"
        aria-labelledby="proxima-engineering-heading"
      >
        <div className="sec-inner project-detail-approach-inner">
          <div className="section-title-row">
            <h2
              id="proxima-engineering-heading"
              className="about-headline project-detail-section-title"
            >
              Building the experience
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Proxima is a Next.js application written in TypeScript, with Tailwind for styling and
              Framer Motion for transitions between steps. Matching, explanations, comparison
              summaries, and email drafting each run in their own server route.
            </p>
            <p className="about-body project-detail-prose">
              Those routes exist partly so the OpenAI key never leaves the server. The browser only
              ever receives the matches, explanations, and drafts the routes return, which also
              keeps prompt wording and model choice out of the client bundle.
            </p>
          </div>

          <h3 className="detail-subheading">Carrying state across the workflow</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Search, results, profile, saved list, comparison, and outreach are separate screens,
              but the student&apos;s query has to survive all of them. Interests and background are
              persisted in the browser alongside saved professor identifiers and the pair selected
              for comparison, so coming back from a saved list to the results does not mean typing
              the description again.
            </p>
            <p className="about-body project-detail-prose">
              Comparison is deliberately capped at two professors. Side by side, the differences in
              two research summaries are legible; past that, the view becomes a table nobody reads.
            </p>
          </div>

          <h3 className="detail-subheading">Designing for the API being unavailable</h3>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Every route that calls a model has a deterministic counterpart. When the call fails or
              no key is configured, the route returns text built from the same inputs and flags the
              response as a fallback instead of returning an error.
            </p>
            <p className="about-body project-detail-prose">
              The outreach screen takes that one step further: it renders the deterministic draft
              immediately and replaces it if the model&apos;s version arrives, so the student is
              never looking at a spinner where an email should be.
            </p>
            <p className="about-body project-detail-prose">
              Running two embedders created a subtler failure. The fallback produces 384-dimension
              vectors and the OpenAI model produces 1,536, and a cache written by one is silently
              useless to the other: every cosine similarity comes back as zero, so the ranking is
              arbitrary rather than visibly broken. The match route compares the query&apos;s
              dimension against the cache&apos;s on every request and regenerates the cache when
              they disagree.
            </p>
          </div>
        </div>
      </section>

      <section className="project-detail-demo reveal" aria-labelledby="proxima-design-heading">
        <div className="sec-inner project-detail-demo-inner">
          <div className="section-title-row">
            <h2 id="proxima-design-heading" className="about-headline project-detail-section-title">
              Design considerations
            </h2>
          </div>

          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Proxima is built to support a decision, not to make one. That shows up in what each
              screen hands back: a score orders the list, the explanation names which parts of the
              research overlap, the profile shows the summary the score was computed from, and the
              comparison view sets two candidates against each other without declaring a winner.
            </p>
            <p className="about-body project-detail-prose">
              The evaluation is part of the reason. Retrieval reliably puts someone relevant into a
              short list and is much weaker at identifying the single best person in it, so the
              interface is built around a shortlist to read through rather than one answer to trust.
            </p>
          </div>

          <div className="detail-callout">
            <strong>The central decision.</strong> Matching is the start of the workflow, not its
            result. Profiles, saved lists, comparison, and outreach drafts all exist because a
            ranked list on its own does not tell a student what to do next.
          </div>
        </div>
      </section>

      <section
        className="project-detail-motivation reveal"
        aria-labelledby="proxima-reflection-heading"
      >
        <div className="sec-inner project-detail-motivation-inner">
          <div className="section-title-row">
            <h2
              id="proxima-reflection-heading"
              className="about-headline project-detail-section-title"
            >
              Reflection
            </h2>
          </div>
          <div className="project-detail-body">
            <p className="about-body project-detail-prose">
              Proxima taught me to think past individual AI features and about the system they sit
              in. Embedding search, a model that writes explanations, and a drafted email are each
              straightforward alone; connecting them through shared state so a student can move
              between them without losing their place was the harder engineering problem.
            </p>
            <p className="about-body project-detail-prose">
              Designing the fallback behaviour changed how I think about depending on an external
              API. Treating an unavailable model as an ordinary path rather than an error case is
              what kept the product usable, and it is also why it can be demonstrated at all when
              the key runs out.
            </p>
            <p className="about-body project-detail-prose">
              It also left me with a question that applies well beyond this project: a relevant
              recommendation is only useful if the person receiving it can see why it was made and
              decide what to do with it.
            </p>
          </div>
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
