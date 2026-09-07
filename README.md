# dawn

My personal website — [whitesandooz.vercel.app](https://whitesandooz.vercel.app). A React
single-page app; no backend.

## What's on it

| Route                         | Contents                                                                    |
| ----------------------------- | --------------------------------------------------------------------------- |
| `/`                           | Hero (name, tagline, portrait), links into the three pages, contact section |
| `/about`                      | Bio and polaroid, experience + education timelines, skills marquee          |
| `/projects`                   | The four project cards                                                      |
| `/projects/proxima`           | Research matching by semantic search — embeddings, GPT-4o reranking         |
| `/projects/almabot`           | UIUC course planner — prerequisite graphs, LangChain, demo video            |
| `/projects/carelink`          | Cancer-support directory — React, GSAP, Google Maps, demo video             |
| `/projects/campus-vegetation` | Campus planting analysis — PCA, K-means, GIS                                |
| `/experience/bloom-mcp`       | Salk Institute — MCP platform for scientific analyses, 2026                 |
| `/experience/sony`            | Sony — CS operations & maintenance intern, 2025                             |
| `/experience/tsinghua`        | Tsinghua — vehicle emission spatiotemporal modeling, 2024–25                |
| `/resume`                     | `resume.pdf` download with its last-updated date                            |

Contact links (email, LinkedIn, GitHub) sit in the footer of the homepage. Anything off-route
lands on a 404 page.

## Editing it

All copy — bio, project write-ups, timeline entries, contact rows — lives in
`src/data/siteContent.js`. Pages are in `src/pages/`, homepage sections in `src/sections/`,
styles in `assets/styles.css`.

## Running it

```bash
npm install
npm run dev      # localhost:5173
```
