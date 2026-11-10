# dawn

My personal website — [whitesandooz.vercel.app](https://whitesandooz.vercel.app). A React
single-page app; no backend.

## What's on it

| Route                         | Contents                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `/`                           | The wind-letter opening, then the About page it scrolls into                 |
| `/about`                      | Name and polaroid, two-paragraph bio, Selected Experience list               |
| `/projects`                   | Project cards linking into the write-ups below                               |
| `/projects/proxima`           | Research discovery by semantic matching — embeddings, generated explanations |
| `/projects/almabot`           | Academic advising agent — retrieval + uncertainty evaluation, demo video     |
| `/projects/carelink`          | Cancer-support directory — filtering, Leaflet map, demo video                |
| `/projects/campus-vegetation` | Campus planting analysis — PCA, K-means, GIS                                 |
| `/experience/bloom-mcp`       | Salk Institute — MCP platform for scientific analyses, 2026                  |
| `/experience/sony`            | Sony — CS operations & maintenance intern, 2025                              |
| `/experience/tsinghua`        | Tsinghua — vehicle emission spatiotemporal modeling, 2024–25                 |
| `/resume`                     | `resume.pdf` download with its last-updated date                             |
| `/contact`                    | Contact details and the message form                                         |

Navigation is the five icons in the left rail — About, Projects, Resume, Contact, GitHub —
with the logo above them returning to the opening. Under 900px the rail is replaced by a
compact top bar and GitHub moves to the end of About. Anything off-route lands on a 404 page.

## Editing it

All copy — bio, project write-ups, timeline entries, contact rows — lives in
`src/data/siteContent.js`. Pages are in `src/pages/`, homepage sections in `src/sections/`,
styles in `assets/styles.css`, with newer scoped sheets under `src/styles/`: the rail
(`site-nav.css`), its icon motion (`nav-icons.css`), the Alegreya scale (`typography.css`)
and the rewritten /about and /projects (`about-projects.css`).

Fonts: Alegreya is the content font for every editorial heading, Space Grotesk the body,
Space Mono the dates and kickers. The homepage's wind letters are the one exception — they
keep Cormorant Garamond through `--serif-hero`.

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

npm run build && npm run verify   # route and interaction checks, see scripts/verify-site.mjs
```

`npm run verify` drives the Chrome already on the machine; it skips with a notice if there
isn't one. CI runs lint, format and build only.
