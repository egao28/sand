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
  nav: {
    items: [
      { label: 'about', to: '/about' },
      { label: 'projects', to: '/projects' },
      { label: 'resume', to: '/resume' },
      { label: 'contact', to: '/#contact', isHomeAnchor: true, anchorId: 'home-contact' },
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
    identity: 'Evelyn Gao — Computer Science & Statistics, University of Chicago',
    headline: 'I build infrastructure for AI and machine learning systems.',
    photo: {
      alt: 'Polaroid photo of Evelyn Gao pointing at a whiteboard',
      caption: 'Aug 14, 2026',
    },
    body: [
      "I'm a Computer Science and Statistics student at the University of Chicago, expected graduation 2028. I'm especially interested in the parts of ML that make a system usable beyond the model itself: data pipelines, validation, testing, tooling, and the infrastructure that keeps things working after the first demo.",
      'Most recently, I worked on bloom-mcp at the Salk Institute, an MCP platform that lets AI agents run scientific analyses from plain-English requests. I built and worked across a set of 22 analysis tools with validated input and output contracts, reproducible execution, and provenance tracking for things like random seeds, library versions, and output hashes.',
      "What I like about this kind of work is that the infrastructure is mostly invisible when it's doing its job. A researcher shouldn't have to think about whether an analysis used the right input format, whether a result can be reproduced, or whether something silently broke upstream. I like building systems that take care of those details.",
    ],

    // --- Fields below are for the rewritten /about (#56). They sit alongside
    //     `label` / `identity` / `headline` / `photo` / `body` rather than
    //     replacing them: those five are still rendered by AboutSection today,
    //     and removing them is the /about rewrite's job, not this one's. ---

    // The single claim the rewritten page is evidence for.
    positioning:
      'I build AI research systems, and design the evaluations that decide whether their results can be trusted.',

    // Body paragraphs for the rewritten page. Deliberately omits the Salk tool
    // count (see #56): the one in `body[1]` above is disputed outside this
    // repo, so the rewrite states no number at all rather than picking one.
    narrative: [
      "I'm a Computer Science and Statistics student at the University of Chicago, expected to graduate in 2028. My work sits where a research system meets the evidence that it does what it claims: build the pipeline, then design the measurement that says whether its output holds up.",
      'At the Salk Institute I built bloom-mcp, an MCP service that lets AI agents run validated plant-phenotyping analyses from plain-English requests, with input and output contracts, reproducible execution, and provenance tracking for random seeds, library versions, and output hashes.',
      'At CHAI I work on how language models recognize, use, and explain evidence, building evaluation pipelines for the reasoning failures a final-answer score never surfaces. The work contributes to a broader effort to improve reasoning reliability through causal reasoning.',
      'The longer-term goal is to make AI a reliable partner in scientific research: not only able to run an analysis, but able to show why its answer should be believed.',
    ],

    // One line, research interests only — #56 explicitly rules out a scatter of
    // unrelated ones. Every item here is backed by work already on this site.
    interests:
      'Evaluation design for model reasoning, retrieval reliability and uncertainty estimation, and reproducible scientific computing.',

    // Compact experience entries for the rewritten page, which drops
    // ExperienceTimeline. This intentionally restates `experience.items`
    // instead of deriving from it: that array survives only to back
    // /experience/:slug and BloomMcpDetailPage's `sub`, so the two are expected
    // to diverge. Edit both when a role changes.
    roles: [
      {
        id: 'chai-tan-lab',
        org: 'University of Chicago',
        role: 'Undergraduate Researcher · CHAI (Tan Lab)',
        time: 'Sep 2026 – Present',
        note: 'Evaluation pipelines for how models recognize, use, and explain evidence, and for the reasoning failures a final-answer score never surfaces.',
        href: null,
      },
      {
        id: 'bloom-mcp',
        org: 'Salk Institute',
        role: 'Research Software Engineering Intern · Harnessing Plants Initiative',
        time: 'Jun – Aug 2026',
        note: 'bloom-mcp: validated plant-phenotyping analyses run by AI agents from plain-English requests, with reproducible execution and provenance tracking.',
        href: '/experience/bloom-mcp',
      },
      {
        id: 'sony',
        org: 'Sony',
        role: 'Computer Science Operations & Maintenance Intern',
        time: 'May – Sep 2025',
        note: 'Three internal systems: a release and asset delivery pipeline, a configurable rules engine for routing weekly feedback, and migration tooling for a live production database.',
        href: '/experience/sony',
      },
      {
        id: 'tsinghua',
        org: 'Tsinghua University',
        role: 'Research Assistant · Vehicle Emission Research Group',
        time: 'Jul 2024 – Jan 2025',
        note: '24-hour emission forecasting and spatial hot-spot analysis built on 30 days of monitoring-site time series.',
        href: '/experience/tsinghua',
      },
    ],

    // Link set for the rewritten page. The three external URLs are copied from
    // `contact.items` on purpose: `contact` is frozen for #56 and must not be
    // refactored into shared constants, so this is the one place they are
    // duplicated. Change a URL in both spots or they will disagree.
    links: [
      { label: 'Projects', to: '/projects' },
      { label: 'Resume', to: '/resume' },
      { label: 'GitHub', href: 'https://github.com/egao28' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/xinyi-evelyn-gao/' },
      { label: 'Email', href: 'mailto:evelyneyi@outlook.com' },
    ],
  },
  // Read only by SkillsMarquee, which only /about renders. Kept, not
  // deleted, because /about still renders it on main: this is groundwork
  // for #56, not the rewrite itself, and deleting the data here would
  // blank a live page for however long the rewrite PRs take. The /about
  // rewrite deletes this together with SkillsMarquee.jsx and its CSS.
  skills: {
    label: 'skills',
    title: 'Tools I work with',
    primary: [
      { icon: '◆', text: 'Python' },
      { icon: '▦', text: 'SQL' },
      { icon: '⌁', text: 'R' },
      { icon: '◈', text: 'Java' },
      { icon: '⬡', text: 'C' },
      { icon: '✶', text: 'TypeScript' },
      { icon: '⟟', text: 'JavaScript' },
      { icon: '◌', text: 'HTML/CSS' },
      { icon: '✳', text: 'MCP' },
      { icon: '⧈', text: 'FastMCP' },
      { icon: '⬠', text: 'LangChain' },
      { icon: '✷', text: 'OpenAI Embeddings' },
    ],
    secondary: [
      { icon: '⬡', text: 'scikit-learn' },
      { icon: '⬢', text: 'Pandas' },
      { icon: '◍', text: 'NumPy' },
      { icon: '⟐', text: 'SciPy' },
      { icon: '✳', text: 'GeoPandas' },
      { icon: '⟑', text: 'Matplotlib' },
      { icon: '⟡', text: 'Git' },
      { icon: '⟢', text: 'GitHub Actions' },
      { icon: '⬥', text: 'pytest' },
      { icon: '⌬', text: 'Docker' },
      { icon: '◈', text: 'Pydantic' },
      { icon: '⟟', text: 'Supabase' },
      { icon: '✦', text: 'React' },
      { icon: '⟠', text: 'Next.js' },
    ],
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
  // Read only by EducationTimeline, which only /about renders. Kept for the
  // same reason as `skills` above, and deleted by the same rewrite PR.
  education: {
    label: 'education',
    items: [
      {
        id: 'uchicago',
        side: 'right',
        time: '2025 – 2028',
        title: 'University of Chicago',
        eduLines: ['B.S., Computer Science · B.A., Statistics', 'GPA 3.76 / 4.0'],
        detailLabel: 'Coursework',
        coursework: [
          'Machine Learning',
          'Linear Algebra',
          'Introduction to Data Science',
          'Introduction to Computer Science in Python',
          'Introduction to Computer Science in C',
        ],
      },
      {
        id: 'uiuc',
        side: 'left',
        time: '2024 – 2025',
        title: 'University of Illinois Urbana-Champaign',
        sub: '',
        detailLabel: 'Coursework',
        coursework: [
          'Data Structures and Algorithms',
          'Discrete Mathematics',
          'Biostatistics',
          'Data Science Discovery in Python',
          'Introduction to Computer Science in Java',
          'Introduction to Computer Science in C++',
          'Calculus',
        ],
      },
      {
        id: 'highschool',
        side: 'right',
        time: '2021 – 2024',
        title: 'Beijing National Day School',
        eduLines: ['International Baccalaureate Diploma', 'GPA 4.17 / 4.3'],
        detailLabel: 'Coursework',
        coursework: [
          'Biology HL',
          'Mathematics Applications and Interpretation HL',
          'English B HL',
          'Economics SL',
          'Chinese A SL',
          'Film SL',
        ],
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
  resume: {
    label: 'resume',
    title: 'Resume',
    sub: 'Download my current resume.',
    href: resumePdf,
    fileName: 'Xinyi Gao Resume.pdf',
    buttonLabel: 'Download PDF',
    lastUpdated: import.meta.env.VITE_RESUME_LAST_UPDATED,
  },
  contact: {
    panelHeadline: 'Contact',
    formHeadline: "Let's get in touch!",
    formTopics: ['Say hello', 'Job or internship', 'Collaboration', 'Something else'],
    // A row with an href shows text derived from it, so the link and the label
    // for the link cannot disagree. `value` is only for rows that have no href
    // to derive from. To hide a row, delete it or comment it out.
    items: [
      { key: 'Email', label: 'Email', href: 'mailto:evelyneyi@outlook.com' },
      { key: 'LinkedIn', label: 'LinkedIn', href: 'https://www.linkedin.com/in/xinyi-evelyn-gao/' },
      { key: 'GitHub', label: 'GitHub', href: 'https://github.com/egao28' },
      { key: 'Location', label: 'Location', value: 'Chicago, IL / Beijing, CN', href: null },
    ],
    // Read at page load, not baked in: the site can sit undeployed for months,
    // and a footer that still says last year on January 1st is the kind of
    // wrong nobody reports. Uses the visitor's clock, which is the usual and
    // correct trade for a copyright line.
    footerLeft: `© ${new Date().getFullYear()} Evelyn Gao`,
    footerRight: '',
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
