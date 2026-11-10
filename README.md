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

# route and interaction checks, see scripts/verify-site.mjs. The site key is
# Cloudflare's documented always-passes test key: the form needs one at build
# time, and this is the one that is safe to write down.
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA npm run build && npm run verify
npm run test:contact              # api/contact.js against stubbed services
npm run check:secrets             # credentials cannot reach the bundle or the repo
```

`npm run verify` drives the Chrome already on the machine; it skips with a notice if there
isn't one. Turnstile is stubbed inside the page rather than loaded, so the run reaches
Cloudflare not at all; build without a site key and it says so and skips the form's
submission checks instead of failing them. CI runs lint, format, `test:contact`, build and
`check:secrets`.

`npm run test:contact` stubs Cloudflare, Resend and the rate-limit store and sends nothing,
which is the only way it runs — the recipient is a real inbox, and a suite that load-tested
a deployed endpoint would be the thing that flooded it.

`npm run check:secrets` is the half a unit test cannot see: that no client file names a
server-only variable, that no `VITE_` name looks like a secret, that nothing key-shaped is
committed, and — when the real values are in the environment, as they are on a deploy —
that none of them appears in `dist/`. Run it after `npm run build`, because what reaches
the browser is what Vite inlined, not what the sources say.

## Themes

Light is the default and the first visit; the choice is remembered in
`localStorage` and applied by an inline script in `index.html` before the first paint,
so there is no flash of the wrong theme. `prefers-color-scheme` is deliberately not
consulted — the brief asks for a light first visit and a remembered manual choice, and
reading the system setting as well would make the inline script and the app disagree.

The palette is one set of tokens in `assets/styles.css`: `:root` for light,
`html[data-theme="dark"]` for the warm smoke-brown dark. The `--ink-rgb`, `--paper-rgb`
and `--accent-rgb` triples exist so the `rgba(ink, alpha)` borders and rules scattered
through that file flip with the theme instead of staying ink-on-paper on a dark page —
they have to be kept in step with the hex tokens beside them.

Two things that are deliberately _not_ themed: `.project-detail-tech` is a near-black
band in both themes, and `logo.png` is a raster asset that is never filtered.

## The contact form

`/contact` posts to `api/contact.js`, a serverless function on the host. The browser never
sees a credential and never names the recipient: both ends of the envelope are read from
the environment inside `lib/contact/mail.js`, where there is no parameter a request could
reach. `From` is a sender on a domain verified in Resend, and `Reply-To` is the visitor's
address once it has been validated server-side — mail is never sent _as_ them.

A submission has to get past all of this, in this order, before anything is delivered:

| Step                 | What it refuses                                                     |
| -------------------- | ------------------------------------------------------------------- |
| method, origin, type | anything that is not a same-origin JSON `POST`                      |
| size                 | over 16KB, checked against `Content-Length` and again while reading |
| honeypot             | a filled trap field — answered `ok`, delivered to nobody            |
| validation           | empty, over-long, malformed, or carrying control characters         |
| configuration        | every submission, until all five variables below are set            |
| rate limit           | over 5 per address per 10 minutes, or 60 an hour across everyone    |
| Turnstile            | a missing, forged, replayed or expired challenge token              |
| duplicate claim      | a message already claimed by an atomic `SET NX`                     |

The rate limit and the duplicate guard live in Redis, reached over Upstash's REST API,
because a serverless function has no memory between instances: the in-process `Map` this
file used to use was a limit of five per ten minutes _per instance_, which on a platform
that starts instances freely is not a limit. They are also the reason the endpoint fails
closed — if the store or Cloudflare cannot be reached, the answer is 503 and no mail. A
protection with a bypass that opens when it is unavailable is not a protection.

The challenge itself is invisible. `src/hooks/useTurnstile.js` renders the widget with
`execution: "execute"` and `appearance: "interaction-only"`, and executes it at submit
time rather than page load — a Turnstile token is single-use and expires after 300
seconds, so a token minted when the page loaded is routinely stale by the time anyone
finishes writing. On an ordinary visit nothing is drawn and the form looks exactly as it
did before any of this existed.

Set these on the host (Vercel → Settings → Environment Variables) and in a local `.env`;
`.env.example` is the annotated copy.

| Variable                                              | What it is                                           |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `RESEND_API_KEY`                                      | Resend API key. Secret.                              |
| `CONTACT_TO_EMAIL`                                    | The mailbox the form delivers to.                    |
| `CONTACT_FROM_EMAIL`                                  | Sender, on a domain verified in Resend.              |
| `TURNSTILE_SECRET_KEY`                                | Secret half of the Turnstile pair. Secret.           |
| `VITE_TURNSTILE_SITE_KEY`                             | Public half. Needed at **build** time, not run time. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | The shared store. `KV_REST_API_*` works too.         |

Optional: `CONTACT_ALLOWED_ORIGINS`, `TURNSTILE_CHECK_REMOTE_IP`, `CONTACT_RATE_PER_IP`,
`CONTACT_RATE_WINDOW_MIN`, `CONTACT_RATE_GLOBAL`.

Miss any of the required ones and the endpoint answers every submission with a 503, names
the missing variables in the server log, and the form says it is unavailable. It never
reports success that Resend did not confirm, and it never falls back to a `mailto:` link —
a form that claims to have sent something it did not is worse than one that is plainly
unavailable. `VITE_TURNSTILE_SITE_KEY` is the odd one out: it is inlined at build time, so
changing it needs a redeploy, not just a restart.

What none of this is: proof against a determined attacker. A distributed botnet with
solved challenges can still fill the mailbox, and no public form can prevent that
outright. What it does is make the mailbox cost something to reach, keep every credential
on the server, and refuse rather than guess whenever a protection cannot be checked.

`vercel.json` rewrites everything to the SPA shell _except_ `/api/*` — without that
exclusion the function is never reached and the form posts into the HTML page.
