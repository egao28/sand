import resumePdf from '../../resume.pdf'

// Proxima's one public deployment. Declared once so the /projects card and the
// detail page's "Try it here" panel cannot drift onto different URLs.
const PROXIMA_URL = 'https://proxima.vercel.app'

// The two screen recordings in public/, with the dimensions their posters were
// encoded at. Declared once for the same reason: the /projects cards and the
// detail pages play the same files. AlmabotDetailPage renders the AlmaBot clip
// from its own literal because that page is bespoke; if either moves, both
// have to move.
const ALMABOT_DEMO = {
  src: '/almabot-demo.mp4',
  poster: '/almabot-demo-poster.jpg',
  width: 1280,
  height: 940,
  ariaLabel: 'Screen recording of an AlmaBot advising session',
}

const CARELINK_DEMO = {
  src: '/carelink-demo.mp4',
  poster: '/carelink-demo-poster.jpg',
  width: 1280,
  height: 940,
  ariaLabel: 'Screen recording of a CareLink search',
}

export const siteContent = {
  // The six entries in the nav, in the order the rail and the compact bar
  // both render them. The logo is not one of them: it is what returns to the
  // opening, so there is no Home entry. The theme button is not one either —
  // it is a button, not a destination, and SiteNav renders it after this list.
  //
  // Three kinds of entry, and the kind is what decides the rest:
  //
  //   `to`    an in-site page. Only these can be the current page, and only
  //           these carry `match` — the set of path prefixes that light the
  //           entry up. About owns the experience write-ups and Projects owns
  //           the project write-ups, so a detail page keeps its section lit.
  //   `href` + `download`
  //           a file served from this origin. Resume is the only one: it hands
  //           over the PDF rather than opening a page, so it is an action and
  //           never current.
  //   `href` + `external`
  //           somewhere else entirely. Opens in a new tab and is never
  //           current: GitHub and LinkedIn are not pages of this site and must
  //           not pose as the one you are on.
  //
  // `group` is the spacing, and now also the grouping: the three pages of the
  // site first, then the three entries that hand you something — a file, or
  // somewhere else. Resume moved out of the first group with that change; it
  // belongs with the other two actions, not between Projects and Contact.
  nav: {
    items: [
      {
        id: 'about',
        label: 'About',
        to: '/about',
        match: ['/about', '/experience'],
        group: 'pages',
      },
      { id: 'projects', label: 'Projects', to: '/projects', match: ['/projects'], group: 'pages' },
      { id: 'contact', label: 'Contact', to: '/contact', match: ['/contact'], group: 'pages' },
      {
        id: 'resume',
        label: 'Resume',
        // The real PDF in the repo, hashed through the bundler like any other
        // asset, so this is same-origin and `download` is honoured. There is
        // no Resume page: the entry is the download.
        href: resumePdf,
        download: 'Evelyn_Gao_Resume.pdf',
        group: 'tools',
      },
      {
        id: 'github',
        label: 'GitHub',
        href: 'https://github.com/egao28',
        external: true,
        group: 'tools',
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/xinyi-evelyn-gao/',
        external: true,
        group: 'tools',
      },
    ],
  },
  hero: {
    eyebrow: 'Computer Science & Statistics · University of Chicago',
    name: 'Evelyn',
    nameEm: 'Gao.',
    taglineOptions: [
      "Creating systems that make people's lives easier.",
      'Clear, usable, and easy to understand.',
      'Designing systems that feel calm.',
      'Turning messy data into decisions.',
    ],
    tagline: "Creating systems that make people's lives easier.",
    bio: "I'm a Computer Science and Statistics student at the University of Chicago. I care about systems that work—and how they feel when people use them.",
    photo: {
      src: '/DSC01796.jpg',
      alt: 'Portrait of Evelyn Gao',
      caption: 'Evelyn Gao · 2026',
    },
  },
  about: {
    label: 'about',
    name: 'Evelyn Gao',
    photo: {
      alt: 'Polaroid photo of Evelyn Gao pointing at a whiteboard',
      caption: 'Aug 14, 2026 · at Salk',
    },

    // Copy below is approved verbatim in #58. Wording, numbers and
    // qualifications are fixed: only typography and markup structure may
    // change. The old `headline` slogan, `identity` kicker and three-paragraph
    // `body` were deleted with the rewrite, as was the `positioning` line added
    // as groundwork in #57 — the page carries no slogan or hero headline, and
    // the first sentence below must not be enlarged into one.
    narrative: [
      "I build AI tools for research and develop evaluations to test whether their outputs can be trusted. I'm an undergraduate studying Computer Science and Statistics at the University of Chicago, working with the Chicago Human+AI Lab led by Chenhao Tan.",
      'At CHAI, I investigate how language models use evidence and how reference answers and feedback shape their reasoning. Previously, at the Salk Institute, I developed tools that enable AI agents to run reproducible scientific analyses. My goal is to make AI a reliable partner in scientific research, from carrying out an analysis to supporting its conclusions with evidence.',
    ],

    // Selected Experience. Roles and dates are #58's list, not
    // `experience.items` — that array survives only to back /experience/:slug
    // and the `sub` string BloomMcpDetailPage renders, so the two differ on
    // purpose. `role` and `time` are joined with a middot when rendered.
    //
    // `href` turns the institution heading into a plain text link. All four
    // carry one now, and they all look the same: the first two led nowhere
    // while the last two jumped to a long write-up, which read as though only
    // half the list had anything behind it. CHAI points at its card's anchor
    // on /projects, Salk at the bloom-mcp technical note, and Sony and
    // Tsinghua keep the addresses they have always had.
    roles: [
      {
        id: 'chai',
        org: 'University of Chicago · Chicago Human+AI Lab',
        // The CHAI card on /projects, which is the only place on the site that
        // carries this work. There is no /projects/chai page and this must not
        // become one: the card is listing-only, so the heading points at the
        // card's own anchor.
        href: '/projects#project-chai',
        role: 'Undergraduate Researcher',
        time: 'Sep 2026–Present',
        note: 'I study how reference answers and feedback influence language-model reasoning. I develop failure-mode taxonomies and cross-condition evaluations to identify when models change problem constraints or rationalize conclusions rather than follow the evidence.',
      },
      {
        id: 'bloom-mcp',
        org: 'Salk Institute · Harnessing Plants Initiative',
        href: '/experience/bloom-mcp',
        role: 'Research Software Engineering Intern',
        time: 'Jun–Aug 2026',
        note: 'I built scientific analysis tools that let AI agents carry out research workflows through natural-language requests. I also developed validation and reproducibility infrastructure so researchers could check outputs and trace how each analysis was performed.',
      },
      {
        id: 'sony',
        org: 'Sony',
        href: '/experience/sony',
        role: 'Computer Science Operations & Maintenance Intern',
        time: 'May–Sep 2025',
        note: 'I built Python pipelines to automate the preparation and delivery of weekly music releases. I also developed a rule-based feedback-triage tool that routed comments to the appropriate teams and made classification rules easier to maintain.',
      },
      {
        id: 'tsinghua',
        org: 'Tsinghua University · Vehicle Emission Research Group',
        href: '/experience/tsinghua',
        role: 'Research Assistant',
        time: 'Jul 2024–Jan 2025',
        note: 'I developed a pipeline for forecasting vehicle emissions over a 24-hour horizon, comparing Random Forest and ARIMA models. I combined temporal features with spatial analysis to examine when emissions rise and where they concentrate.',
      },
    ],

    // #58's row of links — CV, Email, GitHub and `Explore my research and
    // projects →` — is gone with #68: the rail carries all four entry points,
    // and a page that already has a nav does not need a second one scattered
    // across the end of its body.
    //
    // Under 768px the rail is not rendered and the compact bar carries all
    // seven controls itself, GitHub and LinkedIn included, so there is no text
    // link at the end of the body either.
  },
  experience: {
    label: 'experience',
    items: [
      {
        // Ongoing role with no write-up of its own: no slug/href, so the card
        // stays unclickable and /experience/:slug can't resolve to it.
        id: 'chai-tan-lab',
        side: 'right',
        time: 'Sep 2026 – Present',
        title: 'University of Chicago',
        editorialTitle: true,
        sub: 'Undergraduate Researcher · CHAI (Tan Lab) · Sep 2026 – Present',
        subLine: 'Undergraduate Researcher · CHAI (Tan Lab)',
        description:
          'Investigating causal reasoning and post-hoc rationalization in large language models, developing evaluation pipelines to examine how models recognize, use, and explain evidence.',
      },
      {
        slug: 'bloom-mcp',
        href: '/experience/bloom-mcp',
        side: 'left',
        time: '2026',
        title: 'Salk Institute',
        editorialTitle: true,
        sub: 'Research Software Engineering Intern · Harnessing Plants Initiative · Jun – Aug 2026',
        subLine: 'Research Software Engineering Intern · Harnessing Plants Initiative',
      },
      {
        slug: 'sony',
        href: '/experience/sony',
        side: 'right',
        time: '2025',
        title: 'Sony',
        editorialTitle: true,
        sub: 'Computer Science Operations & Maintenance Intern · May – Sep 2025',
        subLine: 'Computer Science Operations & Maintenance Intern',
      },
      {
        slug: 'tsinghua',
        href: '/experience/tsinghua',
        side: 'left',
        time: '2024 – 2025',
        title: 'Tsinghua University',
        editorialTitle: true,
        sub: 'Research Assistant, Vehicle Emission Research Group · Spatiotemporal Modeling and Forecasting · Jul 2024 – Jan 2025',
        subLine:
          'Research Assistant, Vehicle Emission Research Group · Spatiotemporal Modeling and Forecasting',
      },
    ],
  },
  projects: {
    label: 'projects',

    // The /projects page heading, and the two groups under it. There is no
    // introductory paragraph on purpose (#59): the first thing below the
    // heading is the first project.
    title: 'Selected Research & Projects',
    tiers: [
      { id: 'featured', label: 'Featured' },
      { id: 'secondary', label: 'Other Projects' },
    ],

    // Projects that have their own /projects/:slug page. `getProjectBySlug`
    // searches this array and only this array, so anything added here becomes
    // a reachable route. `slug`, `href`, `title`, `motivation`, `approach`,
    // `technical`, `detailTone`, `demoUrl`, `demoVideo` and `demoLabel` are
    // read by ProjectDetailPage and the three bespoke detail pages: renaming
    // or dropping one of them breaks a live page without failing the build.
    // The `card` block on each item is new and read only by the /projects
    // listing (#56); it is kept nested so the two sets never get confused.
    items: [
      {
        slug: 'proxima',
        artClass: 'art-a',
        tags: ['Next.js', 'OpenAI', 'Semantic search'],
        title: 'Proxima',
        href: '/projects/proxima',
        detailTone: 'a',
        demoLabel: 'Open Proxima',
        demoUrl: PROXIMA_URL,
        // First line is the canonical short description of the project; keep
        // any other summary of Proxima (README, future cards) in step with it.
        motivation: [
          'An AI-powered research discovery platform combining semantic professor matching, interactive comparison, and personalized outreach.',
          'I built it because finding research opportunities myself meant guessing which keywords a professor would use to describe work I already knew I was interested in.',
          'Proxima embeds 1,422 UChicago faculty research profiles, ranks them against how a student describes their own interests, and connects that ranking to profiles, comparison, and a drafted outreach email.',
        ],
        technical:
          'Next.js · TypeScript · Tailwind CSS · OpenAI embeddings · cosine similarity · semantic retrieval · embedding cache · gpt-4o-mini · graceful degradation · API route design · client-side state · full-stack development',
        card: {
          order: 4,
          tier: 'secondary',
          role: 'Research discovery',
          summary:
            'I built a research-discovery platform that connects student interests with 1,422 UChicago faculty profiles through semantic search. By combining profile exploration, comparison, and outreach drafting, Proxima turns a research interest into a concrete shortlist that students can investigate.',
          // The listing's only outbound link. /projects/proxima stays reachable
          // and keeps working; the card simply no longer points at it, because
          // the summary above is the whole of what the listing promises.
          actions: [{ label: 'Visit project', href: PROXIMA_URL, external: true }],
        },
      },
      {
        slug: 'almabot',
        artClass: 'art-b',
        tags: ['LangGraph', 'Retrieval', 'Evaluation'],
        title: 'AlmaBot',
        href: '/projects/almabot',
        detailTone: 'b',
        demoLabel: 'Open project',
        // First line is the canonical short description of the project; keep
        // any other summary of AlmaBot (README, future cards) in step with it.
        motivation: [
          'An LLM-based academic advising agent used to study retrieval reliability, uncertainty estimation, and selective prediction.',
          'I originally built AlmaBot to make university course information easier to navigate, integrating 4,502 courses across 187 subjects behind natural-language queries, course retrieval, and structured academic-planning tools.',
          'As the system grew, the question I cared about shifted from what it could do to whether its answers could be trusted, so it became a testbed for measuring how retrieval quality and model uncertainty affect answer reliability.',
        ],
        technical:
          'Python · LangGraph · Chroma · BM25 · reciprocal rank fusion · MCP · scikit-learn · intent routing · retrieval evaluation · Recall@5 and MRR@5 · paired bootstrap confidence intervals · AUROC · selective prediction · benchmark design',
        card: {
          order: 3,
          tier: 'featured',
          role: 'Independent project · Evaluating AI assistants',
          summary:
            'I built an academic advising agent spanning 4,502 courses and a 127-question benchmark to evaluate its reliability. My experiments informed the choice of BM25 over a tuned hybrid retriever and examined how well model confidence predicts answer correctness. The project connects system design with empirical evaluation of the evidence and uncertainty behind AI-generated answers.',
          // Not rendered since #71 — see the note on ART in ProjectsSection.
          art: 'photo-4',
          actions: [{ label: 'Technical note', to: '/projects/almabot' }],
          demo: { label: 'Watch demo', ...ALMABOT_DEMO },
        },
      },
      {
        slug: 'carelink',
        artClass: 'art-d',
        tags: ['React', 'Leaflet', 'Search & filter'],
        title: 'CareLink',
        href: '/projects/carelink',
        detailTone: 'c',
        demoLabel: 'Open project',
        demoVideo: {
          ...CARELINK_DEMO,
          lead: 'Filtering the index of 541 organizations down to the pediatric groups that offer financial assistance, with the map narrowing alongside the list, then following one result out to its own site and directions.',
        },
        // First line is the canonical short description of the project; keep
        // any other summary of CareLink (README, future cards) in step with it.
        motivation: [
          'An interactive directory of cancer support organizations, explored through keyword search, multi-criteria filters, and a map that narrows alongside the results.',
          'Support after a cancer diagnosis exists, but finding it means working through separate websites and piecing together which organizations offer the kind of help that is actually needed.',
          'CareLink puts 541 organizations across all 50 states into one index, tagged by cancer type and service, with the map and the list showing the same filtered set.',
        ],
        technical:
          'React · TypeScript · Leaflet · CARTO basemap tiles · React Router · URL-encoded view state · multi-criteria filtering · derived result set · marker de-collision · city-level geocoding · ProPublica Nonprofit Explorer API · responsive layout',
        card: {
          order: 6,
          tier: 'secondary',
          role: 'Structured information access',
          summary:
            'I built a searchable directory of 541 cancer support organizations across all 50 U.S. states. Filters and a synchronized map turn scattered resource information into a structured, inspectable interface, with links back to the organizations so users can investigate the support available.',
          actions: [],
          demo: { label: 'Watch demo', ...CARELINK_DEMO },
        },
      },
      {
        slug: 'campus-vegetation',
        artClass: 'art-c',
        tags: ['PCA', 'GIS', 'K-Means'],
        title: 'Campus Vegetation Renovation Project',
        href: '/projects/campus-vegetation',
        detailTone: 'd',
        motivation: [
          'I noticed that some plant species on campus were placed next to others that compete for the same resources, and one of them was withering.',
          'Since the campus has a large space, I wanted to see if redistributing them would make a difference. That led to collecting data and analyzing how plant characteristics interact.',
        ],
        approach: [
          'I started with the plant traits we had measured: height, leaf area, root depth, and nitrogen, phosphorus, and potassium levels. Several of these moved together, so clustering directly on the raw measurements would have given correlated features too much influence.',
          'I standardized the features first, then used PCA to reduce that overlap. The first two principal components captured most of the useful variation in the dataset. Looking at the loadings also made the reduced space easier to interpret: one direction was driven more by overall plant size and root structure, while the other reflected differences in nutrient profile.',
          'I then ran K-Means on those principal components. Using the elbow method, I settled on four clusters that separated the plants into groups with different growth and resource-use patterns.',
          'Those groups became the basis for the planting recommendations. Plants with similar growth profiles were given more space from one another, while plants with more complementary traits, such as different rooting patterns, could be placed closer together.',
        ],
        technical:
          'PCA · z-score normalization · K-means · clustering · feature correlation · ecological data analysis · data matrix construction · scree plot · dimensionality reduction · GIS visualization',
        card: {
          order: 7,
          tier: 'secondary',
          // The listing calls this one "Campus Vegetation Analysis"; the detail
          // page keeps the longer original title. `card.title` overrides
          // `title` on the listing only, so the two can differ on purpose
          // without either being renamed out from under the other.
          title: 'Campus Vegetation Analysis',
          role: 'Ecological data analysis',
          summary:
            'I used principal component analysis and clustering to translate measured plant traits into campus planting recommendations. By examining variation in growth and nutrient profiles, I connected statistical patterns with an ecological question: how to arrange plants with different resource needs.',
          actions: [],
        },
      },
    ],

    // Work that belongs on the /projects listing but has no /projects/:slug
    // page. Kept in its own array rather than in `items` precisely because
    // `getProjectBySlug` searches `items`: nothing below can ever resolve a
    // /projects/* URL, whatever it is named. Entries carry `id`, never `slug`,
    // so the guarantee survives someone later changing that helper.
    //
    // `href` is a destination that already exists elsewhere on the site, or
    // null. It is never a /projects/* URL.
    listingOnly: [
      {
        id: 'chai',
        title: 'Language-Model Reasoning Under Influence',
        tags: ['LLM evaluation', 'Causal reasoning', 'Evidence use'],
        // No write-up anywhere on the site yet, so the card has no destination.
        href: null,
        card: {
          order: 1,
          tier: 'featured',
          role: 'Ongoing research · Chicago Human+AI Lab',
          summary:
            'I develop failure-mode taxonomies and cross-condition analyses to evaluate how language models use evidence. Across benchmarks, my work identifies unacknowledged reference dependence, changes to problem constraints, and post-hoc rationalization—failures that final-answer accuracy alone can miss. This work contributes to a broader effort to improve reasoning reliability through causal reasoning.',
          // No button, and no paper link: nothing public about this work exists
          // in this repo yet, and a placeholder would be worse than nothing.
          actions: [],
        },
      },
      {
        id: 'bloom-mcp',
        title: 'bloom-mcp',
        tags: ['MCP', 'Reproducibility', 'Scientific computing'],
        href: '/experience/bloom-mcp',
        card: {
          order: 2,
          tier: 'featured',
          role: 'Scientific analysis tools · Salk Institute',
          // No tool count, on purpose — see #56.
          summary:
            'I developed analysis tools and validation infrastructure that let AI agents execute scientific workflows through natural-language requests. My contributions span data quality checks, dimensionality reduction, clustering, and reproducibility tracking, connecting model-driven tool use with structured, testable analyses. The system records how results were produced so researchers can inspect and reproduce them.',
          // Not rendered since #71 — see the note on ART in ProjectsSection.
          art: 'photo-2',
          actions: [{ label: 'Technical note', to: '/experience/bloom-mcp' }],
        },
      },
      {
        id: 'vehicle-emission-forecasting',
        title: 'Vehicle-Emission Forecasting',
        tags: ['Time series', 'Random forest', 'Spatial statistics'],
        href: '/experience/tsinghua',
        card: {
          order: 5,
          tier: 'secondary',
          role: 'Research assistantship · Tsinghua University',
          summary:
            'I developed a 24-hour vehicle-emission forecasting pipeline, comparing Random Forest and ARIMA models with chronological evaluation. Combining temporal features with spatial analysis, I examined both when emissions rise and where they concentrate, grounding model development in a concrete environmental research problem.',
          // No button by default (#59). /experience/tsinghua is still reachable
          // and still linked from the About experience list.
          actions: [],
        },
      },
    ],
  },
  // No `resume` block any more: #70 replaced the Resume page with the download
  // on the nav entry itself, and the title, blurb and button label here were
  // that page's copy. The file name the download saves as lives on the nav
  // entry above, beside the href it belongs to.
  //
  // `vite.config.js` still resolves VITE_RESUME_LAST_UPDATED, and nothing reads
  // it now — the "Last updated" line was the page's. The machinery is left in
  // place rather than deleted in passing: its stale-date warning is the only
  // thing tracking when resume.pdf was last replaced, and that is a call to
  // make on its own, not inside an icon change.
  contact: {
    title: 'Contact',
    // The one address on the page, under the form. It is also the address the
    // form itself delivers to — but the form delivers there because the
    // server is configured to, not because this string travels in the request.
    // See api/contact.js.
    email: 'evelyneyi@outlook.com',
    // Read at page load, not baked in: the site can sit undeployed for months,
    // and a footer that still says last year on January 1st is the kind of
    // wrong nobody reports. Uses the visitor's clock, which is the usual and
    // correct trade for a copyright line.
    footerLeft: `© ${new Date().getFullYear()} Evelyn Gao`,
  },
}

// Backs /projects/:slug. It searches `projects.items` only: `projects.listingOnly`
// is deliberately out of reach here, which is what keeps CHAI and
// Vehicle-Emission Forecasting from resolving a project route. Widening this to
// both arrays would create /projects/* URLs for work that has no such page.
export function getProjectBySlug(slug) {
  return siteContent.projects.items.find((p) => p.slug === slug) ?? null
}

// Every card for the /projects listing, from both arrays, in display order.
// `card.order` is hand-assigned in the data; an entry without a `card` block is
// dropped rather than rendered half-built.
export function getProjectCards() {
  return [...siteContent.projects.items, ...siteContent.projects.listingOnly]
    .filter((p) => p.card)
    .sort((a, b) => a.card.order - b.card.order)
}

export function getExperienceBySlug(slug) {
  return siteContent.experience.items.find((e) => e.slug === slug) ?? null
}
