# Site experience rework — baseline

Written for the structure/visual rework on `integration/site-experience` (#65–#68).
This is the state of the site **after** the three open content PRs (#62, #63, #64)
were replayed onto the branch and **before** any layout work. #66, #67 and #68
are written against this record.

## 1. Routes

Every route is declared in [src/App.jsx](../src/App.jsx). `BrowserRouter`, no
lazy loading, no nested layouts; `ScrollToTop` resets scroll on every
`location.pathname` change.

| Path                    | Component                             | Notes                                                                                |
| ----------------------- | ------------------------------------- | ------------------------------------------------------------------------------------ |
| `/`                     | `HomePage`                            | `ThinkInWindHero` + a three-link entry list + `ContactSection` under `#home-contact` |
| `/about`                | `AboutPage`                           | `AboutSection` only, after #62                                                       |
| `/projects`             | `ProjectsPage`                        | `ProjectsSection`, seven cards in two tiers, after #63                               |
| `/projects/proxima`     | `ProximaDetailPage`                   | bespoke                                                                              |
| `/projects/almabot`     | `AlmabotDetailPage`                   | bespoke; short technical note after #64                                              |
| `/projects/carelink`    | `CarelinkDetailPage`                  | bespoke                                                                              |
| `/projects/:slug`       | `ProjectDetailPage`                   | generic; resolves `campus-vegetation` only                                           |
| `/experience/bloom-mcp` | `BloomMcpDetailPage`                  | bespoke; short technical note after #64                                              |
| `/experience/sony`      | `SonyDetailPage`                      | bespoke                                                                              |
| `/experience/tsinghua`  | `TsinghuaDetailPage`                  | bespoke                                                                              |
| `/experience/:slug`     | `ExperienceDetailPage`                | generic; `getExperienceBySlug` resolves nothing else today                           |
| `/resume`               | `ResumePage`                          | links the imported `resume.pdf`                                                      |
| `/contact`              | `<Navigate to="/#contact" replace />` | not a page — it redirects to the homepage anchor                                     |
| `*`                     | `NotFoundPage`                        |                                                                                      |

`getProjectBySlug` searches `projects.items` only, so the three `projects.listingOnly`
entries (CHAI, bloom-mcp, Vehicle-Emission Forecasting) can never resolve a
`/projects/*` URL. `public/sitemap.xml` lists the routes above and is not changed
by this rework.

**Entry points into the experience detail pages.** #58 dropped the `href`s the old
timeline carried, which left `/experience/sony` and `/experience/tsinghua` reachable
only by typing the URL. #65 restores them as plain text links on the institution
heading in Selected Experience (`roles[].href` → `.profile-role-org-link`).
`/experience/bloom-mcp` is linked from the `/projects` listing instead, and CHAI has
no page to link.

## 2. Fonts

Three families, all from one Google Fonts stylesheet in
[index.html](../index.html), exposed as tokens in `:root`
([assets/styles.css](../assets/styles.css)):

| Token     | Family                              | Role                                                       |
| --------- | ----------------------------------- | ---------------------------------------------------------- |
| `--serif` | Cormorant Garamond 300/400 + italic | **the content font** — every display and editorial heading |
| `--sans`  | Space Grotesk 300–700               | body text, UI, nav                                         |
| `--mono`  | Space Mono 400/700 + italic         | dates, kickers, labels, tags, section headings             |

`body` is `var(--sans)`. `--serif` is the family behind the About headline the
rework names ("…Infrastructure for AI and Machine Learning Systems", rendered as
`about.headline` → `.about-headline`), and it is the one #68 replaces with
Alegreya. Its seventeen uses:

- `assets/styles.css` — `.placeholder-photo`, `.hero-name`, `.hero-bottom-phrase`,
  `.page--secondary #projects`, `.about-headline`, `.project-detail-hero-inner`,
  `.project-detail-title`, `.detail-subheading`, `.detail-pull-quote`,
  `.project-title`, `.not-found-headline`, `.contact-panel--info`,
  `.contact-panel-headline`, `.contact-info-value`
- `src/styles/about-projects.css` — `.profile-name`, `.profile-role-org`,
  `.worklist-title`, `.worklist-card-title`
- `src/styles/global.css` — `.hang-text--serif` (**the wind letters — the one
  documented exception, which keeps Cormorant Garamond**), `.home-entry-item`
  (deleted by #66 along with the homepage entry list)

## 3. The homepage letter animation

[src/sections/ThinkInWindHero.jsx](../src/sections/ThinkInWindHero.jsx) plus the
`.hang-*` rules in [src/styles/global.css](../src/styles/global.css).

**Structure.** A `letters` array of 14 entries (`think in the wind`, spaces
dropped) holds, per letter, a `leftPct`, a `top`, a line length `h`, a
`serif`/`mono` class, a font `size` and a negative animation `delay`. Each
renders as

```
.hang-letter          position:absolute, left:leftPct%, translateX(-50%) — the fixed suspension point
  .hang-letter__swing transform-origin:top center, animation: hang-sway 6.8s infinite
    .hang-line        1px line scaled to 0.5, gradient, height --hangH
    .hang-text        the glyph, --serif or --mono per letter
```

The whole block is `aria-hidden`; the section carries `role="img"` and
`aria-label="think in the wind"`.

**Motion.** `@keyframes hang-sway` rotates and drifts `.hang-letter__swing` like a
pendulum. Amplitude is driven by two CSS variables added together:

- `--wind-boost` — set on the container from React. A scroll listener accumulates
  a `boost` from the scroll delta (more from upward scrolling than downward), and
  a `requestAnimationFrame` loop decays it by `0.88` per frame.
- `--hover-boost` — a registered `@property` number, `0` → `1` on
  `.hang-letter:hover`, so it transitions smoothly for the hovered letter only.
  `.hang-letter__swing::before` widens the hit area for narrow glyphs.

**Constraint for #66.** The transition must not animate
`.hang-letter__swing`'s `transform` — the sway keyframes own it. The gust belongs
on the outer `.hang-letter` (or a wrapper above it), so per-letter interaction and
the transition displacement compose instead of overwriting each other.

**Reduced motion / mobile.** Under `prefers-reduced-motion` the sway animation and
the hover boost are switched off. Under 760px the letters leave absolute
positioning and stack in flow with short lines.
