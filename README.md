# dawn

My personal website — [whitesandooz.vercel.app](https://whitesandooz.vercel.app). A React
single-page app; no backend.

## What's on it

| Route                         | Contents                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `/`                           | Hero (name, tagline, portrait), links into the three pages, contact section  |
| `/about`                      | Name and polaroid, two-paragraph bio, Selected Experience list, links        |
| `/projects`                   | Project cards linking into the write-ups below                               |
| `/projects/proxima`           | Research discovery by semantic matching — embeddings, generated explanations |
| `/projects/almabot`           | Academic advising agent — retrieval + uncertainty evaluation, demo video     |
| `/projects/carelink`          | Cancer-support directory — filtering, Leaflet map, demo video                |
| `/projects/campus-vegetation` | Campus planting analysis — PCA, K-means, GIS                                 |
| `/experience/bloom-mcp`       | Salk Institute — MCP platform for scientific analyses, 2026                  |
| `/experience/sony`            | Sony — CS operations & maintenance intern, 2025                              |
| `/experience/tsinghua`        | Tsinghua — vehicle emission spatiotemporal modeling, 2024–25                 |
| `/resume`                     | `resume.pdf` download with its last-updated date                             |

Contact links (email, LinkedIn, GitHub) sit in the footer of the homepage. Anything off-route
lands on a 404 page.

## Editing it

All copy — bio, project write-ups, timeline entries, contact rows — lives in
`src/data/siteContent.js`. Pages are in `src/pages/`, homepage sections in `src/sections/`,
styles in `assets/styles.css`.

Two things in that data file are easy to get wrong:

- `projects.items` backs `/projects/:slug`. Adding an entry there adds a route; renaming or
  dropping `slug`, `href`, `title`, `motivation`, `approach`, `technical`, `detailTone`,
  `demoUrl`, `demoVideo` or `demoLabel` breaks a detail page without failing the build.
  Work with no page of its own goes in `projects.listingOnly`, which `getProjectBySlug`
  never searches. `getProjectCards()` returns both, in `card.order`.
- `experience.items` backs `/experience/:slug`, and its `sub` is read by the Salk page,
  so entries there outlive whatever renders them on `/about`.

Add a URL to `public/sitemap.xml` whenever you add a route — it is hand-maintained.

## Running it

```bash
npm install
npm run dev      # localhost:5173
```
