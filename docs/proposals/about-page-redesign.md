# About page redesign

Tracking issue: [egao28/sand#28](https://github.com/egao28/sand/issues/28)

## Problem

The About page (`/about`) mixes visual languages across sections and its content
has drifted from the current resume (outdated bio, GPA, skills; missing Salk
Institute; Sony/Tsinghua copy not aligned to resume bullets). Separately, the
Experience timeline crams long-form content into hover-reveal cards, which
doesn't scale now that there's a much more detailed Bloom MCP write-up to
include.

## Scope

1. **Intro/hero** (`AboutSection.jsx`): add a Polaroid-style photo pinned to
   the left with text reflowing to the right (replacing the current flat,
   photo-less two-column grid); vary the intro copy's typographic
   emphasis (size/weight) across lines; replace the copy with the new
   bio provided by the user.
2. **Skills** (`siteContent.skills`): reconcile `primary`/`secondary` chip
   lists against the resume's Languages / ML & Data / AI Engineering /
   Tools & Frameworks groups. `primary` = resume-matching core skills;
   `secondary` = additional site-only skills beyond the resume.
3. **Education** (`siteContent.education`): UChicago GPA `3.92 → 3.76` to
   match the resume.
4. **Experience** (`siteContent.experience`, `ExperienceTimeline.jsx`):
   - Add a Salk Institute entry (title/sub only — no inline detail).
   - Rewrite Sony and Tsinghua's copy from the resume's bullets, stored as
     a `details: []` array for use on their detail pages (not shown inline).
   - Timeline cards drop all inline detail content (motivation paragraphs /
     tech tags / bullet lists) and instead show a persistent
     "Click here for more →" link to the experience's own detail page.
     The card/timeline visual design itself is unchanged.
5. **Experience detail pages** (new `/experience/:slug` route):
   - `ExperienceDetailPage.jsx` — generic template (hero + bullet list),
     reusing the existing `/projects/:slug` visual system, for Sony and
     Tsinghua.
   - `BloomMcpDetailPage.jsx` — a bespoke page for Salk Institute/Bloom MCP,
     using the fuller custom design supplied separately (masthead, stat
     strip, architecture diagram, tool catalog, build timeline, testing
     section, process section). Its typography (Fraunces / Source Serif 4 /
     IBM Plex Mono) and palette are intentionally distinct from the rest of
     the site, scoped under a `.bloom-detail-page` wrapper class (own CSS
     file, fonts loaded only while the page is mounted) so nothing leaks
     onto other routes.
6. **Bug fix** (`ProjectsSection.jsx`): the working tree already has
   `src/assets/projects/photo-1.png` deleted but the file still imports it,
   which breaks the dev/build. Drop `photo1` from the `PHOTOS` pool (down to
   4 photos — the gallery already handles an arbitrary pool size via modulo).
7. **New asset**: `myself.png` (a self-captured Polaroid-framed photo) moves
   into `src/assets/about/` and is used as the intro's Polaroid image.
   `new.JPG` (a tree photo) is unused by this change — not obviously part of
   the redesign, left out.

## Non-goals

- No dark mode / theme toggle is introduced sitewide — the Bloom MCP page's
  design is fixed-light only, matching the rest of the site.
- No changes to Proxima/AlmaBot/CareLink/Campus Vegetation project pages.
- No changes to the Contact section.

## Risks

- Scoping the Bloom MCP page's custom CSS under `.bloom-detail-page` (rather
  than `:root`) is required to avoid clobbering the main site's CSS custom
  properties and global element selectors (`a`, `h1`–`h3`, `*`) — verified by
  hand during the CSS port; needs a visual smoke test on both the Bloom page
  and an adjacent page (e.g. `/projects/proxima`) to confirm no bleed.
- Converting the source HTML/SVG diagram to JSX requires camelCasing SVG
  presentation attributes (`stroke-width` → `strokeWidth`, etc.) and removing
  HTML comments (`<!-- -->` is invalid inside JSX) — a missed conversion
  would silently drop a style or break the JSX parse.
