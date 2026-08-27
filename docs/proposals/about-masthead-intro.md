# About intro/hero: Quiet Authority — Masthead layout

Tracking issue: [egao28/sand#30](https://github.com/egao28/sand/issues/30)

## Problem

The About intro (`AboutSection.jsx`) opens with a typewriter-animated "Hello,
I'm Evelyn Gao." line, then a two-column grid (polaroid photo in its own
column, headline+body in the other). The user found this generic/templated
and, after a round of design exploration (a published mockup canvas covering
four directions, then four opening-layout variants of the chosen "Quiet
Authority" direction), picked the **Masthead** layout: a small identity line,
a static thesis-statement headline (no animation), the photo folded inline
into the first paragraph instead of its own grid column, and new content
(a compact "Work" line, a sign-off, a link to her work) that the current
intro doesn't have at all.

## Scope

1. **Identity + headline** (`AboutSection.jsx`, `siteContent.about`):
   - Remove the `useTypewriter` divider (`content.divider.lead` /
     `.typed`, the `.type-divider`/`.type-lead`/`.type-name` markup and
     CSS, the `IntersectionObserver` wiring for it).
   - Add a small mono identity line above the headline: `Evelyn Gao —
Computer Science & Statistics, University of Chicago` (new
     `siteContent.about.identity` field, new `.about-identity` CSS rule).
   - Add a static `<h1>` headline: "I build infrastructure for machine
     learning systems." (new `siteContent.about.headline` field). Reuses
     the existing `.about-headline` class already used on the detail
     pages — no new headline CSS needed.
   - Drop `siteContent.about.intro` (the italic lede) — its content is
     superseded by the new headline; keeping both would repeat the same
     idea twice. The `.about-intro` CSS rule becomes unused and is removed
     with it.

2. **Photo** (`AboutSection.jsx`, `assets/styles.css`):
   - Replace the `.about-grid` two-column layout with the photo floated
     inline at the start of the first body paragraph (rotated -3deg, same
     `.about-polaroid`/`.about-polaroid-img` treatment as today, just no
     longer in its own grid column). New `.about-photo-inline` (float
     wrapper) and `.about-photo-caption` (small mono caption under the
     photo, new `siteContent.about.photo.caption` field: "mid-explanation,
     probably about provenance tracking") rules.
   - Remove `.about-grid`/`.about-photo-col` (now unused) and their mobile
     override (`#about .about-grid` in the `@media (max-width: 900px)`
     block); add a mobile rule un-floating `.about-photo-inline` instead
     (float photos don't degrade gracefully at narrow widths).
   - The photo+first-paragraph pairing is wrapped in a clearfix container
     so the float doesn't bleed into the paragraphs after it, rather than
     adding an explicit `clear: both` per paragraph.

3. **Keep the scroll-in fade.** Today the `.type-divider` and `.about-grid`
   wrappers both carry `reveal` (wired to `useRevealOnScroll()` in
   `AboutPage.jsx`, toggling `.up` via `IntersectionObserver` to fade/
   slide the block in — `assets/styles.css` around the `.reveal`/`.up`
   rules). Both of those wrapper elements are being deleted, so this
   behavior would silently disappear unless carried over deliberately.
   Decision: wrap the whole new intro block (identity line through the
   photo/body paragraphs) in a single `reveal` container so the existing
   fade-in is preserved, matching the rest of the page's motion language,
   rather than dropping it as an unstated side effect.

4. **Body copy** (`siteContent.about.body`): unchanged except the first
   paragraph's University of Chicago sentence gains the expected
   graduation year: "...University of Chicago, expected graduation 2028."
   (real date — matches `siteContent.education`'s UChicago `time: '2025 –
2028'`, not a placeholder; phrased as "expected graduation 2028"
   rather than a bare "expected 2028" so it can't be misread as the
   university itself being "expected").

   This also resolves issue #30's open question about the identity line
   and headline both naming "Evelyn Gao": the headline drops the name
   ("I build infrastructure..." instead of the mockup's "Evelyn Gao
   builds infrastructure...") and keeps it only in the identity line
   above it, rather than repeating it twice.

5. **New "Work" line** (`AboutSection.jsx`, `siteContent.about.work`):
   a compact two-line mono list folding career history into the intro —
   `bloom-mcp, Salk Institute — 2026 – Present` / `University of Chicago
— B.S. Computer Science, B.A. Statistics — 2028`. These are plain
   display strings in `siteContent.about`, not derived from
   `siteContent.experience`/`.education` — the shapes don't line up
   cleanly (e.g. "bloom-mcp" as a project name isn't a field on the
   experience item, only its `slug`) and this is presentation-specific
   phrasing, not a duplicate of the timeline's own copy. The two numbers
   (2026, 2028) do already match `siteContent.experience.items[0].time`
   and `siteContent.education.items[0].time` today; worth a comment in
   the data file noting they should stay in sync, not worth a shared
   computed helper for two static strings. Degree wording corrected to
   the real B.S. Computer Science / B.A. Statistics split (the original
   design mockups had wrongly combined it into "B.S. Computer Science
   & Statistics").

6. **Sign-off + link** (`AboutSection.jsx`, `siteContent.about.signoff`):
   a closing line ("Mostly building things researchers never have to
   think about. — E.G.") plus a link to `/projects`. Reuses the existing
   `.ct-more-link` class and arrow-span pattern already used by
   `ExperienceTimeline.jsx`'s "Click here for more →" links, rather than
   introducing a new link style or an SVG icon (the design mockups used
   an SVG arrow; the site's own convention is a plain `→` character in a
   `<span aria-hidden="true">`).

## Non-goals

- **No gradient transition into Skills.** The design mockups added a
  paper→paper2 gradient blend before the Skills marquee, on the
  assumption About sits on `--paper` and Skills on `--paper2`. In the
  real site, `.page--secondary #about { background: transparent; }`
  means About already renders on the page's `--paper2` canvas, same as
  `#skills`'s own `background: var(--paper2)` — there's no tone seam to
  blend between them. Dropped; relies on `.sec-inner`'s existing
  vertical padding for separation, consistent with the "no divider
  lines" convention already in the CSS.
- No changes to Skills, Experience, or Education content/layout — only
  the About intro/hero.
- No changes to the Home page hero (separate component, own bio/tagline
  copy, not touched here).
- `useTypewriter.js` becomes fully unused after this change (nothing
  else in the codebase imports it) — deleted rather than left dead.

## Risks

- `.about-headline`/`.about-body` are shared classes also used by
  `ProjectDetailPage.jsx`, `ExperienceDetailPage.jsx`, and
  `BloomMcpDetailPage.jsx` (always paired there with
  `project-detail-section-title`/`project-detail-prose`) — any change to
  their base rules (as opposed to adding new, separate rules) risks
  affecting those pages too. `.about-polaroid`/`.about-polaroid-img` are
  NOT shared — they're defined once and used only in `AboutSection.jsx`
  today, so those two can be adjusted directly for the inline-float
  treatment without any cross-page risk. Plan is to add new rules
  (`.about-identity`, `.about-photo-inline`, `.about-photo-caption`,
  `.about-work*`, `.about-signoff`) alongside the existing ones rather
  than editing `.about-headline`/`.about-body`'s shared base rules.
- Removing `.about-grid`'s mobile override needs a real replacement for
  small screens, not just a deletion — a left-floated 220px image at
  375px viewport width leaves almost no room for wrapped text.
