import resumePdf from '../../resume.pdf'

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
      caption: '@ Salk',
    },
    body: [
      "I'm a Computer Science and Statistics student at the University of Chicago, expected graduation 2028. I'm especially interested in the parts of ML that make a system usable beyond the model itself: data pipelines, validation, testing, tooling, and the infrastructure that keeps things working after the first demo.",
      'Most recently, I worked on bloom-mcp at the Salk Institute, an MCP platform that lets AI agents run scientific analyses from plain-English requests. I built and worked across a set of 22 analysis tools with validated input and output contracts, reproducible execution, and provenance tracking for things like random seeds, library versions, and output hashes.',
      "What I like about this kind of work is that the infrastructure is mostly invisible when it's doing its job. A researcher shouldn't have to think about whether an analysis used the right input format, whether a result can be reproduced, or whether something silently broke upstream. I like building systems that take care of those details.",
    ],
  },
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
    items: [
      {
        slug: 'proxima',
        artClass: 'art-a',
        tags: ['NLP', 'OpenAI', 'React'],
        title: 'Proxima',
        href: '/projects/proxima',
        detailTone: 'a',
        demoLabel: 'Open Proxima',
        demoUrl: 'https://proxima.vercel.app',
        motivation: [
          'I built this because I struggled with finding research opportunities myself.',
          'Using Google or keyword search did not work well. Even when I had similar interests as professors, we were not using the same words.',
          'So I wanted to build something that helps people find research more efficiently and make better use of the information already online.',
        ],
        technical:
          'semantic search · embeddings · cosine similarity · GPT-4o reranking · keyword fallback · ranking systems · API design · full-stack development',
      },
      {
        slug: 'almabot',
        artClass: 'art-b',
        tags: ['LangChain', 'RAG', 'Python'],
        title: 'AlmaBot',
        href: '/projects/almabot',
        detailTone: 'b',
        demoLabel: 'Open project',
        motivation: [
          'I built this at UIUC because I did not have an academic advisor and had to figure out course planning on my own.',
          'Since I had access to the course dataset, I wanted to build something that takes user preferences and automatically generates a workable schedule.',
        ],
        technical:
          "course scheduling · constraint solving · prerequisite graphs · Kahn's algorithm · topological sort · cycle detection · dataset processing · LLM integration · LangChain · Gradio",
      },
      {
        slug: 'carelink',
        artClass: 'art-d',
        tags: ['React', 'GSAP', 'Maps'],
        title: 'CareLink',
        href: '/projects/carelink',
        detailTone: 'c',
        demoLabel: 'Open project',
        demoVideo: {
          src: '/carelink-demo.mp4',
          poster: '/carelink-demo-poster.jpg',
          width: 1280,
          height: 940,
          lead: 'Filtering the index of 541 organizations down to the pediatric groups that offer financial assistance, with the map narrowing alongside the list, then following one result out to its own site and directions.',
          ariaLabel: 'Screen recording of a CareLink search',
        },
        motivation: [
          'I first became aware of this problem when I came across multiple online posts from people seeking help during cancer treatment. But it was surprisingly difficult to find structured, organized information about where to actually access help.',
          'This made me realize that while support systems do exist, they are often fragmented and not easily discoverable, especially for individuals who are already under emotional and physical stress.',
          'CareLink is designed to address this gap by providing a centralized platform where users can easily find relevant support resources in one place. By integrating a map-based interface, the platform also helps users understand what organizations and services are available around them geographically, making support visible.',
        ],
        technical:
          'React · GSAP · Google Maps API · multi-criteria filtering · dynamic search · GSAP ScrollTrigger animations · React Router',
      },
      {
        slug: 'campus-vegetation',
        artClass: 'art-c',
        tags: ['PCA', 'GIS', 'K-Means'],
        title: 'Campus Vegetation Renovation Project',
        href: '/projects/campus-vegetation',
        detailTone: 'd',
        demoLabel: 'Open project',
        backgroundImage: '/background/campus-vegetation.jpg',
        motivation: [
          'I noticed that some plant species on campus were placed next to others that compete for the same resources, and one of them was withering.',
          'Since the campus has a large space, I wanted to see if redistributing them would make a difference. That led to collecting data and analyzing how plant characteristics interact.',
        ],
        approach: [
          'I clustered the plants by what they need — water, light, nutrients, rooting depth — rather than by what they look like, since two plants can resemble each other closely and still draw on completely different resources.',
          'Health was deliberately kept out of the feature matrix. It is the outcome I wanted to explain, so letting it shape the clusters would have made the finding circular.',
          'That let me treat competition as two conditions holding at once: the plants share a demand profile, and they sit close enough that their canopies or root zones actually meet. Proximity on its own is not a problem, and similar needs on their own are not a problem.',
          'The test is then a comparison rather than an illustration — whether the plants in those crowded pairs are measurably worse off than the rest, reported with group sizes and a significance test so that an effect resting on two plants is not mistaken for a pattern.',
        ],
        technical:
          'PCA · z-score normalization · K-means · clustering · feature correlation · ecological data analysis · data matrix construction · scree plot · dimensionality reduction · GIS visualization',
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
    items: [
      {
        key: 'Email',
        label: 'Email',
        value: 'evelyneyi@outlook.com',
        href: 'mailto:evelyneyi@outlook.com',
      },
      {
        key: 'LinkedIn',
        label: 'LinkedIn',
        value: 'linkedin.com/in/xinyi-evelyn-gao',
        href: 'https://www.linkedin.com/in/xinyi-evelyn-gao/',
      },
      { key: 'Location', label: 'Location', value: 'Chicago, IL / Beijing, CN', href: null },
    ],
    footerLeft: '© 2026 Evelyn Gao',
    footerRight: '',
  },
}

export function getProjectBySlug(slug) {
  return siteContent.projects.items.find((p) => p.slug === slug) ?? null
}

export function getExperienceBySlug(slug) {
  return siteContent.experience.items.find((e) => e.slug === slug) ?? null
}
