#!/usr/bin/env node
/*
 * Route and interaction checks for the built site (#65-#68, #70).
 *
 * Deliberately not a mirror of the implementation: it asserts the things that
 * would be quietly wrong after a refactor and that the build and the linter
 * cannot see — that every URL still resolves, that the entries which must not
 * resolve still don't, that the opening transition starts and finishes where
 * it should, that the nav lights the right entry, and that nothing overflows
 * sideways at the three widths.
 *
 *   npm run build && npm run verify
 *
 * Drives the Chrome already installed on the machine through puppeteer-core,
 * so there is no browser to download. Set CHROME_PATH to point it elsewhere.
 * Skips with a notice, rather than failing, when no Chrome is found — the
 * repo's CI runs build, lint and format, and this is for the person making
 * the change.
 */
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
// Only used by the resume PDF check below, which is commented out with it.
// import { createHash } from 'node:crypto'
import puppeteer from 'puppeteer-core'

const PORT = Number(process.env.VERIFY_PORT ?? 4178)
const BASE = `http://localhost:${PORT}`

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

const chrome = CHROME_CANDIDATES.find((p) => existsSync(p))
if (!chrome) {
  console.log('verify-site: no Chrome found — skipping. Set CHROME_PATH to run these checks.')
  process.exit(0)
}

/** Every URL the site serves, and what proves it rendered. */
const ROUTES = [
  ['/', '.opening-scene'],
  ['/about', '.profile-name'],
  ['/projects', '.worklist-title'],
  ['/projects/proxima', '.project-detail-title'],
  ['/projects/almabot', '.project-detail-title'],
  ['/projects/carelink', '.project-detail-title'],
  ['/projects/campus-vegetation', '.project-detail-title'],
  ['/experience/bloom-mcp', '.project-detail-title'],
  ['/experience/sony', '.project-detail-title'],
  ['/experience/tsinghua', '.project-detail-title'],
  ['/contact', '.contact-form'],
]

// Resume is hidden for now (its nav entry and `/resume` route are commented
// out in src/data/siteContent.js and src/App.jsx), so these checks have
// nothing to assert against. Uncomment them with it.
// /* `/resume` is deliberately not in ROUTES: since #70 it is a redirect to the
//  * PDF, so visiting it and then asking what rendered would be asking the PDF.
//  * It gets its own check further down. */
// const RESUME_PATH = '/resume'

/** `projects.listingOnly` entries carry an `id`, never a `slug`, so none of
 * them may resolve a project URL. If one ever does, a listing card has quietly
 * become a page. */
const NOT_ROUTES = [
  '/projects/chai',
  '/projects/bloom-mcp',
  '/projects/vehicle-emission-forecasting',
]

/** Which nav entry each path lights up. Detail pages belong to their section. */
const CURRENT = [
  ['/about', '/about'],
  ['/experience/sony', '/about'],
  ['/experience/bloom-mcp', '/about'],
  ['/projects', '/projects'],
  ['/projects/proxima', '/projects'],
  ['/projects/almabot', '/projects'],
  ['/contact', '/contact'],
  ['/', null],
]

/** The rail, in order, and what each entry is. #70's three kinds: a page can be
 * current, a download and an external link never can. */
const RAIL = [
  ['about', 'page'],
  ['projects', 'page'],
  ['contact', 'page'],
  // Resume is hidden for now; uncomment with its nav entry.
  // ['resume', 'download'],
  ['github', 'external'],
  ['linkedin', 'external'],
]

const WIDTHS = [
  [1440, 900],
  [1024, 800],
  [768, 1024],
  [430, 932],
  [390, 844],
  [320, 640],
]

const failures = []
function check(pass, message) {
  console.log(`${pass ? '  ok  ' : ' FAIL '} ${message}`)
  if (!pass) failures.push(message)
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
  detached: false,
})
const stop = () => {
  try {
    server.kill()
  } catch {
    /* already gone */
  }
}
process.on('exit', stop)

async function waitForServer() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(BASE + '/')
      if (res.ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`preview server never came up on ${BASE} — run \`npm run build\` first`)
}

await waitForServer()

const browser = await puppeteer.launch({ executablePath: chrome, headless: 'shell' })

/* Turnstile is stubbed in every page this run opens, never loaded. Defining
 * `window.turnstile` before any script runs is enough: src/hooks/useTurnstile.js
 * checks for it first and so never appends Cloudflare's api.js. That keeps this
 * run off Cloudflare entirely — the same rule the file already follows for the
 * mail service — and it keeps a third party's script out of the timings these
 * checks measure.
 *
 * The stub records what it was asked for, which is how the contact-form block
 * can tell that the widget is wired the invisible way and that a fresh token is
 * minted per submit rather than reused. */
const stubTurnstile = () => {
  window.__turnstile = { render: 0, execute: 0, reset: 0, options: null, tokens: [] }
  let callback = null
  window.turnstile = {
    render(element, options) {
      window.__turnstile.render += 1
      window.__turnstile.options = {
        execution: options.execution,
        appearance: options.appearance,
        theme: options.theme,
        sitekey: typeof options.sitekey === 'string' && options.sitekey.length > 0,
      }
      callback = options.callback
      return 'stub-widget-id'
    },
    execute() {
      window.__turnstile.execute += 1
      const token = `stub-token-${window.__turnstile.execute}`
      window.__turnstile.tokens.push(token)
      setTimeout(() => callback && callback(token), 0)
    },
    reset() {
      window.__turnstile.reset += 1
    },
    remove() {},
  }
}

async function newPage() {
  const fresh = await browser.newPage()
  await fresh.evaluateOnNewDocument(stubTurnstile)
  return fresh
}

const page = await newPage()

async function visit(path, width = 1440, height = 900) {
  await page.setViewport({ width, height })
  await page.goto(BASE + path, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  await new Promise((r) => setTimeout(r, 200))
}

console.log('\n# every route resolves')
for (const [path, marker] of ROUTES) {
  await visit(path)
  const found = await page.$(marker)
  const notFound = await page.$('.not-found-headline')
  check(!!found && !notFound, `${path} renders ${marker}`)
}

console.log('\n# listing-only work never resolves a project URL')
for (const path of NOT_ROUTES) {
  await visit(path)
  check(!!(await page.$('.not-found-headline')), `${path} is the not-found page`)
}

console.log('\n# the nav marks the right entry')
for (const [path, expected] of CURRENT) {
  await visit(path)
  const current = await page.evaluate(() => {
    const el = document.querySelector('.site-rail-link[aria-current="page"]')
    return el ? el.getAttribute('href') : null
  })
  check(
    current === expected,
    `${path} -> ${current ?? 'nothing'} (expected ${expected ?? 'nothing'})`
  )
}

console.log('\n# the rail carries seven controls, in order')
await visit('/about')
const rail = await page.evaluate(() => {
  const items = [...document.querySelectorAll('.site-rail-item')].map((li) => {
    const a = li.querySelector('a')
    const link = li.querySelector('.site-rail-link')
    const icon = li.querySelector('svg.nav-icon')
    const box = link.getBoundingClientRect()
    return {
      id: [...li.classList]
        .find((c) => c.startsWith('site-rail-item--') && !c.includes('group'))
        ?.replace('site-rail-item--', ''),
      href: a.getAttribute('href'),
      download: a.getAttribute('download'),
      target: a.getAttribute('target'),
      rel: a.getAttribute('rel'),
      current: a.getAttribute('aria-current'),
      hit: [Math.round(box.width), Math.round(box.height)],
      icon: icon ? [icon.getAttribute('width'), icon.getAttribute('height')] : null,
      label: li.querySelector('.site-rail-label')?.textContent,
    }
  })
  const theme = document.querySelector('.site-rail-theme')
  const themeBox = theme.getBoundingClientRect()
  return {
    items,
    theme: {
      tag: theme.tagName,
      icon: theme.querySelector('svg.nav-icon') ? 'yes' : 'no',
      hit: [Math.round(themeBox.width), Math.round(themeBox.height)],
      // Distance from the bottom of the last entry to the top of the button.
      gap: Math.round(
        themeBox.top -
          document.querySelector('.site-rail-item:last-child').getBoundingClientRect().bottom
      ),
      name: theme.textContent.trim(),
    },
  }
})

check(
  rail.items.map((i) => i.id).join(',') === RAIL.map(([id]) => id).join(','),
  `rail order is ${rail.items.map((i) => i.id).join(', ')}`
)
check(
  rail.items.every((i) => i.hit[0] === 48 && i.hit[1] === 48),
  `every hit area is 48x48 (${rail.items.map((i) => i.hit.join('x')).join(' ')})`
)
check(
  rail.items.every((i) => i.icon && i.icon[0] === '40' && i.icon[1] === '40'),
  'every icon is a 40x40 inline SVG'
)
check(
  rail.items.every((i) => i.label),
  `every entry has a label (${rail.items.map((i) => i.label).join(', ')})`
)

for (const [id, kind] of RAIL) {
  const item = rail.items.find((i) => i.id === id)
  if (kind === 'external') {
    check(
      item.href.startsWith('https://') &&
        item.target === '_blank' &&
        /noopener/.test(item.rel) &&
        !item.current,
      `${id} is an external link, new tab, safe rel, never current (${item.href})`
    )
  } else if (kind === 'download') {
    check(
      item.download === 'Evelyn_Gao_Resume.pdf' &&
        item.href.endsWith('.pdf') &&
        !item.href.startsWith('http') &&
        !item.current,
      `${id} downloads a same-origin PDF as Evelyn_Gao_Resume.pdf (${JSON.stringify(item)})`
    )
  }
}

check(
  rail.theme.tag === 'BUTTON' && rail.theme.icon === 'yes',
  `the theme control is a button with an icon (${rail.theme.tag})`
)
check(
  rail.theme.gap === 16,
  `the theme button sits 16px below the last entry (${rail.theme.gap}px)`
)
check(!!rail.theme.name, `the theme button has an accessible name (${rail.theme.name})`)

console.log('\n# the icons are the V6 set, and each one actually moves')
await visit('/about')
/* The pointer has to be parked off the rail first: puppeteer leaves it wherever
 * the last hover put it, and an icon already under it would report its hover
 * state as its rest state and pass this trivially. */
await page.mouse.move(1200, 500)
await new Promise((r) => setTimeout(r, 400))

const canvases = await page.evaluate(() =>
  [...document.querySelectorAll('.site-rail .nav-icon')].map((svg) => ({
    viewBox: svg.getAttribute('viewBox'),
    strokes: [
      ...new Set(
        [...svg.querySelectorAll('[stroke-width]')].map((el) => el.getAttribute('stroke-width'))
      ),
    ],
  }))
)
check(
  canvases.every((c) => c.viewBox === '0 0 64 64'),
  `every icon is drawn on one 64x64 canvas (${[...new Set(canvases.map((c) => c.viewBox))].join(', ')})`
)
check(
  canvases.every((c) => c.strokes.every((w) => w === '2.4')),
  `every stroke in every icon is 2.4 (${[...new Set(canvases.flatMap((c) => c.strokes))].join(', ')})`
)

/* Every endpoint in the GitHub drawing is a filled dot. A hollow ring or a
 * stroked circle here would be the old G2 artwork coming back. */
const githubNodes = await page.evaluate(() =>
  [...document.querySelectorAll('.site-rail .nav-icon--github circle')].map((c) => ({
    fill: getComputedStyle(c).fill,
    stroke: getComputedStyle(c).stroke,
    r: c.getAttribute('r'),
  }))
)
check(
  githubNodes.length === 3 &&
    githubNodes.every((n) => n.fill !== 'none' && n.stroke === 'none' && n.r === '2.6'),
  `GitHub has three solid endpoints and no hollow ring (${JSON.stringify(githubNodes.map((n) => n.r))})`
)

/* Two icons of the same kind can be in one document — the rail and the compact
 * bar are both on the homepage — so a shared clipPath id would have one of them
 * masking the other. */
await visit('/')
const clipIds = await page.evaluate(() =>
  [...document.querySelectorAll('clipPath[id]')].map((c) => c.id)
)
check(
  new Set(clipIds).size === clipIds.length,
  `${clipIds.length} clipPath id(s) in the document, all distinct`
)

/* What proves the motion is real: a geometric reading of the part that moves,
 * taken at rest and again after the hover has settled. Deliberately not an
 * assertion about the numbers themselves — only that hovering changes the
 * drawing and that leaving puts it back. */
await visit('/about')
await page.mouse.move(1200, 500)
await new Promise((r) => setTimeout(r, 400))

const MOVERS = {
  about: '.nav-icon-about-arm',
  projects: '.nav-icon-pinwheel',
  // Resume is hidden for now; uncomment with its nav entry.
  // resume: '.nav-icon-resume-page',
  contact: '.nav-icon-contact-letter',
  github: '.nav-icon-github-branch',
  linkedin: '.nav-icon-linkedin-dot',
}

const shapeOf = (id, sel) =>
  page.evaluate(
    ([itemId, selector]) => {
      const el = document.querySelector(`.site-rail-item--${itemId} ${selector}`)
      const box = el.getBoundingClientRect()
      return [box.x, box.y, box.width, box.height].map((n) => Math.round(n * 100) / 100).join(',')
    },
    [id, sel]
  )

for (const [id, sel] of Object.entries(MOVERS)) {
  const rest = await shapeOf(id, sel)
  await page.hover(`.site-rail-item--${id} .site-rail-link`)
  await new Promise((r) => setTimeout(r, 600))
  const hovered = await shapeOf(id, sel)
  await page.mouse.move(1200, 500)
  await new Promise((r) => setTimeout(r, 600))
  const back = await shapeOf(id, sel)

  check(rest !== hovered, `${id} changes on hover (${rest} -> ${hovered})`)
  check(back === rest, `${id} returns to rest when the pointer leaves (${back})`)
}

/* Keyboard focus has to do the same thing the pointer does, or the motion is
 * only there for people using a mouse. */
const focusMoved = await page.evaluate(async () => {
  const link = document.querySelector('.site-rail-item--github .site-rail-link')
  const branch = document.querySelector('.site-rail-item--github .nav-icon-github-branch')
  const read = () => Math.round(branch.getBoundingClientRect().width * 100) / 100
  const before = read()
  link.focus()
  await new Promise((r) => setTimeout(r, 600))
  const after = read()
  link.blur()
  return { before, after }
})
check(
  focusMoved.before !== focusMoved.after,
  `keyboard focus plays the motion too (${focusMoved.before} -> ${focusMoved.after})`
)

// Resume is hidden for now (its nav entry and `/resume` route are commented
// out in src/data/siteContent.js and src/App.jsx), so these checks have
// nothing to assert against. Uncomment them with it.
// console.log('\n# /resume still resolves, and it resolves to the PDF')
// await page.setViewport({ width: 1440, height: 900 })
// await page.goto(BASE + RESUME_PATH, { waitUntil: 'networkidle0' })
// const landed = page.url()
// check(
//   landed.endsWith('.pdf') && landed.startsWith(BASE),
//   `${RESUME_PATH} lands on a same-origin PDF (${landed.replace(BASE, '')})`
// )
// const pdf = await fetch(landed)
// const pdfHead = Buffer.from(await pdf.arrayBuffer())
//   .subarray(0, 5)
//   .toString()
// check(
//   pdf.ok && pdfHead === '%PDF-',
//   `that PDF is a real PDF, not a placeholder (${pdf.status}, starts ${JSON.stringify(pdfHead)})`
// )
// The viewport the block above set is kept: the checks below were written
// against 1440x900.
await page.setViewport({ width: 1440, height: 900 })

console.log('\n# the theme choice survives a reload')
await visit('/about')
const themed = await page.evaluate(() => {
  const before = document.documentElement.dataset.theme ?? 'light'
  document.querySelector('.site-rail-theme').click()
  return { before, after: document.documentElement.dataset.theme }
})
check(
  themed.before !== 'dark' && themed.after === 'dark',
  `clicking the moon switches to dark (${themed.before} -> ${themed.after})`
)
await page.reload({ waitUntil: 'networkidle0' })
const persisted = await page.evaluate(() => ({
  theme: document.documentElement.dataset.theme,
  // Read before React mounts anything of its own: the inline script in
  // index.html is what has to have set this, or the page flashes light first.
  stored: localStorage.getItem('evelyn-site-theme'),
}))
check(
  persisted.theme === 'dark' && persisted.stored === 'dark',
  `and it is still dark after a reload (${JSON.stringify(persisted)})`
)
await page.evaluate(() => {
  document.querySelector('.site-rail-theme').click()
  localStorage.removeItem('evelyn-site-theme')
})

console.log('\n# theme A is the stated six values, and only colour changes')
const EXPECTED_DARK = {
  background: 'rgb(75, 69, 66)', // #4B4542
  ink: 'rgb(242, 238, 233)', // #F2EEE9
  secondary: 'rgb(210, 202, 196)', // #D2CAC4
  link: 'rgb(215, 199, 172)', // #D7C7AC
  selected: 'rgb(98, 89, 80)', // #625950
  divider: 'rgb(130, 118, 108)', // #82766C
}

await visit('/about')
const themed2 = await page.evaluate(async (expected) => {
  const read = () => {
    const cs = getComputedStyle(document.documentElement)
    const v = (n) => cs.getPropertyValue(n).trim()
    const toRgb = (hex) => {
      const d = document.createElement('div')
      d.style.color = hex
      document.body.appendChild(d)
      const out = getComputedStyle(d).color
      d.remove()
      return out
    }
    return {
      background: toRgb(v('--paper')),
      ink: toRgb(v('--ink')),
      soft: toRgb(v('--ink-soft')),
      muted: toRgb(v('--ink-muted')),
      link: toRgb(v('--accent-link')),
      selected: toRgb(v('--rail-current-bg')),
      rule: toRgb(v('--rule')),
      line: toRgb(v('--line')),
      logo: toRgb(v('--logo-ink')),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      bodyBgImage: getComputedStyle(document.body).backgroundImage,
    }
  }
  const light = read()
  document.querySelector('.site-rail-theme').click()
  await new Promise((r) => setTimeout(r, 400))
  const dark = read()
  // Anything with a filter on it would be an inverted image.
  const filtered = [...document.querySelectorAll('img, picture, video, .site-logo-img')].filter(
    (el) => {
      const f = getComputedStyle(el).filter
      return f && f !== 'none'
    }
  ).length
  const sun = !!document.querySelector('.site-rail-theme .nav-icon--theme circle')
  document.querySelector('.site-rail-theme').click()
  await new Promise((r) => setTimeout(r, 400))
  const moonBack = !document.querySelector('.site-rail-theme .nav-icon--theme circle')
  localStorage.removeItem('evelyn-site-theme')
  return { light, dark, filtered, sun, moonBack, expected }
})

check(
  themed2.dark.background === EXPECTED_DARK.background,
  `background is #4B4542 (${themed2.dark.background})`
)
check(themed2.dark.ink === EXPECTED_DARK.ink, `body text is #F2EEE9 (${themed2.dark.ink})`)
check(
  themed2.dark.soft === EXPECTED_DARK.secondary && themed2.dark.muted === EXPECTED_DARK.secondary,
  `secondary text is #D2CAC4 (${themed2.dark.soft} / ${themed2.dark.muted})`
)
check(themed2.dark.link === EXPECTED_DARK.link, `accent links are #D7C7AC (${themed2.dark.link})`)
check(
  themed2.dark.selected === EXPECTED_DARK.selected,
  `the selected background is #625950 (${themed2.dark.selected})`
)
check(
  themed2.dark.rule === EXPECTED_DARK.divider && themed2.dark.line === EXPECTED_DARK.divider,
  `dividers and input underlines are #82766C (${themed2.dark.rule} / ${themed2.dark.line})`
)
check(
  themed2.dark.bodyBg === EXPECTED_DARK.background && themed2.dark.bodyBgImage === 'none',
  `the page is that flat colour, with no gradient or texture over it (${themed2.dark.bodyBgImage})`
)
check(themed2.filtered === 0, `no image carries a filter (${themed2.filtered})`)
check(themed2.sun, 'dark shows the sun')
check(themed2.moonBack, 'and light shows the moon again')

/* The light theme is not part of this change and must come back untouched. */
check(
  themed2.light.background === 'rgb(255, 253, 248)' && themed2.light.ink === 'rgb(48, 45, 41)',
  `light is still cream and dark brown (${themed2.light.background}, ${themed2.light.ink})`
)
check(
  themed2.light.logo === 'rgb(0, 0, 0)' && themed2.dark.logo === EXPECTED_DARK.ink,
  `the logo is black in light and #F2EEE9 in dark (${themed2.light.logo} -> ${themed2.dark.logo})`
)

/* Every instance of the logo, on every surface that carries one. */
for (const [path, w, h] of [
  ['/', 1440, 900],
  ['/', 390, 844],
  ['/about', 1440, 900],
  ['/about', 390, 844],
  ['/projects', 390, 844],
]) {
  await visit(path, w, h)
  const logos = await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark'
    const shown = [...document.querySelectorAll('.site-logo-img')].filter(
      (el) => el.getBoundingClientRect().width > 0
    )
    return shown.map((el) => {
      const cs = getComputedStyle(el)
      return {
        colour: cs.backgroundColor,
        masked: cs.maskImage !== 'none' || cs.webkitMaskImage !== 'none',
      }
    })
  })
  check(
    logos.length > 0 && logos.every((l) => l.colour === EXPECTED_DARK.ink && l.masked),
    `${path} @${w}: ${logos.length} logo(s), cream and masked (${JSON.stringify(logos)})`
  )
}

// Resume is hidden for now (its nav entry and `/resume` route are commented
// out in src/data/siteContent.js and src/App.jsx), so these checks have
// nothing to assert against. Uncomment them with it.
// console.log('\n# the resume download is the new file, everywhere it is offered')
// await visit('/about', 1440, 900)
// const resumeHrefs = await page.evaluate(() => {
//   const all = [...document.querySelectorAll('a[download]')]
//   return {
//     count: all.length,
//     hrefs: [...new Set(all.map((a) => a.getAttribute('href')))],
//     names: [...new Set(all.map((a) => a.getAttribute('download')))],
//   }
// })
// check(
//   resumeHrefs.hrefs.length === 1,
//   `every download entry points at one file (${resumeHrefs.count} links, ${resumeHrefs.hrefs.join(', ')})`
// )
// check(
//   resumeHrefs.names.length === 1 && resumeHrefs.names[0] === 'Evelyn_Gao_Resume.pdf',
//   `and all save as Evelyn_Gao_Resume.pdf (${resumeHrefs.names.join(', ')})`
// )
// check(
//   /-[A-Za-z0-9_-]{8,}\.pdf$/.test(resumeHrefs.hrefs[0]),
//   `the published name carries a content hash, so no cache can serve the old one (${resumeHrefs.hrefs[0]})`
// )
//
// const EXPECTED_PDF_SHA = '2f5bf9768255ce997f7e13465c6561c95aa04a0b2d74482805a8dd7570f22b7b'
// /* The nav's own href, and the file `/resume` ends up on. The second one has to
//  * be read by driving the browser: `/resume` is a client-side route that hands
//  * over to the PDF from JavaScript, so fetching it directly returns the app
//  * shell rather than following anything. */
// await page.goto(BASE + RESUME_PATH, { waitUntil: 'networkidle0' })
// const legacyLanded = page.url().replace(BASE, '')
//
// for (const [label, from] of [
//   ['the nav download', resumeHrefs.hrefs[0]],
//   [`${RESUME_PATH} (via ${legacyLanded})`, legacyLanded],
// ]) {
//   const res = await fetch(BASE + from)
//   const bytes = Buffer.from(await res.arrayBuffer())
//   const sha = createHash('sha256').update(bytes).digest('hex')
//   check(
//     sha === EXPECTED_PDF_SHA,
//     `${label} delivers the handoff PDF (${bytes.length} bytes, sha256 ${sha.slice(0, 16)}…)`
//   )
// }

console.log('\n# the contact form, against a stubbed endpoint')
/* The endpoint is intercepted here, so running this sends no mail to anyone.
 * What is being checked is the form's behaviour, which the API tests cannot
 * see: that it refuses to submit what is incomplete, that it shows a sending
 * state, that a failure keeps what was typed, and — the one that matters —
 * that it never says "sent" unless the server said so. */
{
  const form = await newPage()
  await form.setViewport({ width: 1440, height: 900 })
  await form.setRequestInterception(true)

  let reply = { status: 200, body: { ok: true } }
  let posted = null
  let cloudflareRequests = 0
  form.on('request', (req) => {
    if (req.url().includes('challenges.cloudflare.com')) {
      cloudflareRequests += 1
      return req.abort('failed')
    }
    if (req.url().endsWith('/api/contact')) {
      posted = JSON.parse(req.postData() || '{}')
      if (reply.abort) return req.abort('failed')
      return req.respond({
        status: reply.status,
        contentType: 'application/json',
        body: JSON.stringify(reply.body),
      })
    }
    req.continue()
  })

  const open = async () => {
    await form.goto(BASE + '/contact', { waitUntil: 'networkidle0' })
    await form.evaluate(() => document.fonts.ready)
  }
  const fill = async (fields) => {
    for (const [id, value] of Object.entries(fields)) {
      await form.$eval(`#contact-${id}`, (el) => {
        el.value = ''
      })
      if (value) await form.type(`#contact-${id}`, value)
    }
  }
  const submit = async () => {
    await form.click('.contact-submit')
    await new Promise((r) => setTimeout(r, 400))
  }
  const state = () =>
    form.evaluate(() => ({
      ok: document.querySelector('.contact-form-status--ok')?.textContent ?? null,
      error: document.querySelector('.contact-form-status--error')?.textContent ?? null,
      name: document.querySelector('#contact-name').value,
      message: document.querySelector('#contact-message').value,
      button: document.querySelector('.contact-submit').textContent.trim(),
    }))

  await open()
  const shape = await form.evaluate(() => {
    const labelFor = (id) => document.querySelector(`label[for="contact-${id}"]`)?.textContent
    const hidden = document.querySelector('.contact-botcheck')
    const box = hidden.getBoundingClientRect()
    return {
      fields: ['name', 'email', 'message'].map(labelFor),
      removed: {
        topic: !!document.querySelector('select'),
        photo: !!document.querySelector('.contact-photo-bg'),
        socialList: !!document.querySelector('.contact-info-list'),
      },
      honeypotOnScreen: box.right > 0 && box.left < window.innerWidth,
      honeypotName: hidden.querySelector('input')?.getAttribute('name'),
      submitIsButton: document.querySelector('.contact-submit').tagName,
      submitHeight: Math.round(
        document.querySelector('.contact-submit').getBoundingClientRect().height
      ),
      direct: document.querySelector('.contact-direct-link')?.getAttribute('href'),
      headings: [...document.querySelectorAll('h1, h2, h3')].map((h) => h.textContent),
    }
  })
  check(
    shape.fields.join(',') === 'Name,Email,Message',
    `the form is Name, Email, Message (${shape.fields.join(', ')})`
  )
  check(
    !shape.removed.topic && !shape.removed.photo && !shape.removed.socialList,
    `the topic select, the photo and the address list are gone (${JSON.stringify(shape.removed)})`
  )
  check(
    !shape.honeypotOnScreen && shape.honeypotName === 'botcheck',
    'the honeypot is present and off-screen'
  )
  check(
    shape.submitIsButton === 'BUTTON' && shape.submitHeight >= 44,
    `the submit is a button at least 44px tall (${shape.submitIsButton}, ${shape.submitHeight}px)`
  )
  check(
    shape.direct === 'mailto:evelyneyi@outlook.com',
    `the address under the form is the real one (${shape.direct})`
  )
  check(shape.headings.length === 1, `one heading on the page (${shape.headings.join(' / ')})`)

  /* The challenge, and whether this build has a site key at all. A bundle
   * built without VITE_TURNSTILE_SITE_KEY cannot render the widget, and the
   * form is then correctly unavailable — so the submission checks below are
   * skipped rather than failed, with a notice saying how to run them. */
  const widget = await form.evaluate(() => window.__turnstile)
  const challengeWired = widget.render > 0

  if (!challengeWired) {
    console.log(
      '  --   no VITE_TURNSTILE_SITE_KEY in this build, so the form cannot submit.\n' +
        "       Rebuild with Cloudflare's always-passes test key to run these:\n" +
        '       VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA npm run build && npm run verify'
    )
  } else {
    check(
      widget.options.execution === 'execute' && widget.options.appearance === 'interaction-only',
      `the challenge is invisible until it is needed (${widget.options.execution}, ${widget.options.appearance})`
    )
    check(
      widget.options.theme === 'light' || widget.options.theme === 'dark',
      `the challenge follows the site's theme, not the OS (${widget.options.theme})`
    )
    check(widget.execute === 0, 'and nothing runs until the form is submitted')
  }

  /* Whatever the widget did, it must not have changed the page. The container
   * is in the form on every visit; it is only allowed to take up space when a
   * challenge is actually being shown. */
  const spacing = await form.evaluate(() => {
    const container = document.querySelector('.contact-turnstile')
    // Not `:last-of-type` — that is the last *div*, which is the footer.
    const field = [...document.querySelectorAll('.contact-field')].at(-1)
    const footer = document.querySelector('.contact-form-footer')
    return {
      present: !!container,
      height: container ? Math.round(container.getBoundingClientRect().height) : null,
      gap: Math.round(footer.getBoundingClientRect().top - field.getBoundingClientRect().bottom),
    }
  })
  check(
    spacing.present && spacing.height === 0,
    `the challenge container reserves no space (${spacing.height}px)`
  )
  check(
    spacing.gap === 32,
    `the 32px gap between the last field and the submit is unchanged (${spacing.gap}px)`
  )

  await fill({ name: 'Ada', email: '', message: 'hello there' })
  await submit()
  let s1 = await state()
  check(
    !s1.ok && !!s1.error && posted === null,
    `a missing field is refused without a request (${s1.error})`
  )

  await fill({ name: 'Ada', email: 'not-an-address', message: 'hello there' })
  await submit()
  s1 = await state()
  check(
    !s1.ok && !!s1.error && posted === null,
    `a malformed address is refused without a request (${s1.error})`
  )

  if (challengeWired) {
    reply = { status: 502, body: { ok: false, error: 'Your message could not be sent.' } }
    await fill({ name: 'Ada', email: 'ada@example.com', message: 'a message worth keeping' })
    await submit()
    s1 = await state()
    check(!!posted, 'a complete message does reach the endpoint')
    check(
      !s1.ok && !!s1.error,
      `a service failure is reported as a failure, not a success (${s1.error})`
    )
    check(
      s1.name === 'Ada' && s1.message === 'a message worth keeping',
      'and the typed message is still there afterwards'
    )

    reply = { abort: true }
    await submit()
    s1 = await state()
    check(!s1.ok && !!s1.error, 'a network failure is reported as a failure too')

    reply = { status: 200, body: { ok: true } }
    posted = null
    await submit()
    s1 = await state()
    check(!!s1.ok && !s1.error, `a server success is the only thing that says sent (${s1.ok})`)
    check(
      s1.name === '' && s1.message === '',
      'and the form is cleared only once the server has confirmed'
    )

    /* The payload, which is the whole of what a visitor can say to the mail
     * service. Four fields: the three they typed and the challenge token. A
     * recipient, a sender or a subject in here would be a visitor choosing
     * where this site's mail goes. */
    const keys = Object.keys(posted ?? {}).sort()
    check(
      keys.join(',') === 'cf-turnstile-response,email,message,name',
      `the payload is the three fields and the token, nothing else (${keys.join(', ')})`
    )

    /* A fresh challenge per submit. Turnstile tokens are single-use and
     * expire after 300 seconds, so a form that solved once at page load would
     * be posting a stale token by the time anyone finished writing. */
    const after = await form.evaluate(() => window.__turnstile)
    /* Three, not five. Five submits were made, but the first two were refused
     * by the form itself — an empty field and a malformed address — and a form
     * that is not filled in correctly has no business spending a challenge, or
     * a request. The three that reached the endpoint each ran one. */
    check(
      after.execute === 3 && after.reset === 3,
      `every submit that reaches the endpoint runs a fresh challenge (${after.execute} executes, ${after.reset} resets)`
    )
    check(
      new Set(after.tokens).size === after.tokens.length &&
        posted['cf-turnstile-response'] === after.tokens.at(-1),
      'and each submit carries its own fresh token'
    )
  }

  check(
    cloudflareRequests === 0,
    `this run never reached Cloudflare (${cloudflareRequests} request(s))`
  )

  await form.close()
}

console.log('\n# the dark theme is the specified palette, and is flat')
{
  const dark = await newPage()
  await dark.setViewport({ width: 1440, height: 900 })
  await dark.goto(BASE + '/about', { waitUntil: 'networkidle0' })
  await dark.evaluate(() => localStorage.setItem('evelyn-site-theme', 'dark'))

  /* Theme A's six values, carried on every route. */
  const TOKENS = [
    ['--paper', 'rgb(75, 69, 66)'], // #4B4542
    ['--ink', 'rgb(242, 238, 233)'], // #F2EEE9
    ['--ink-soft', 'rgb(210, 202, 196)'], // #D2CAC4
    ['--ink-muted', 'rgb(210, 202, 196)'], // #D2CAC4
    ['--accent-link', 'rgb(215, 199, 172)'], // #D7C7AC
    ['--rail-current-bg', 'rgb(98, 89, 80)'], // #625950
    ['--rule', 'rgb(130, 118, 108)'], // #82766C
    ['--line', 'rgb(130, 118, 108)'], // #82766C
    ['--logo-ink', 'rgb(242, 238, 233)'], // #F2EEE9
  ]

  for (const [path] of [
    ['/'],
    ['/about'],
    ['/projects'],
    ['/contact'],
    ['/experience/bloom-mcp'],
    ['/experience/sony'],
    ['/experience/tsinghua'],
    ['/projects/proxima'],
    ['/projects/almabot'],
    ['/projects/carelink'],
    ['/projects/campus-vegetation'],
  ]) {
    await dark.goto(BASE + path, { waitUntil: 'networkidle0' })
    await dark.evaluate(() => document.fonts.ready)
    const r = await dark.evaluate((tokens) => {
      // Read each token as a colour the way a rule would, so the check is on
      // what paints rather than on the literal in the stylesheet.
      const probe = document.createElement('span')
      document.body.appendChild(probe)
      const read = (name) => {
        probe.style.color = `var(${name})`
        return getComputedStyle(probe).color
      }
      const values = Object.fromEntries(tokens.map(([n]) => [n, read(n)]))
      probe.remove()

      // Anything painting a gradient, and anything putting a filter on an
      // image. The Technical band is deliberately dark in both themes.
      const gradients = [...document.querySelectorAll('*')].filter((el) => {
        if (el.closest('.project-detail-tech')) return false
        // The opening's hanging lines are 1px rules that fade along their
        // length — part of the composition the brief keeps, not a background.
        if (el.classList.contains('hang-line')) return false
        if (!el.getClientRects().length) return false
        const st = getComputedStyle(el)
        return st.backgroundImage !== 'none' && !st.backgroundImage.startsWith('url')
      }).length
      const filtered = [...document.querySelectorAll('img, picture img')].filter(
        (el) => getComputedStyle(el).filter !== 'none'
      ).length

      return { bg: getComputedStyle(document.body).backgroundColor, values, gradients, filtered }
    }, TOKENS)

    check(r.bg === 'rgb(75, 69, 66)', `${path} paints the dark page background (${r.bg})`)
    check(r.filtered === 0, `${path} leaves images un-filtered (${r.filtered} filtered)`)
    // The homepage's hanging line is a fading 1px rule, not a background — it
    // is part of the opening the brief keeps, so it is the one allowance.
    check(r.gradients === 0, `${path} paints no background gradient (${r.gradients})`)
    const wrong = TOKENS.filter(([n, want]) => r.values[n] !== want)
    check(
      wrong.length === 0,
      `${path} token values${wrong.length ? ': ' + wrong.map(([n, w]) => `${n} is ${r.values[n]}, wanted ${w}`).join('; ') : ' all match'}`
    )
  }

  console.log('\n# the theme button switches, and does nothing else')
  await dark.goto(BASE + '/', { waitUntil: 'networkidle0' })
  await dark.evaluate(() => localStorage.removeItem('evelyn-site-theme'))
  await dark.reload({ waitUntil: 'networkidle0' })
  // Scroll the opening out of the way so the rail is live, then switch.
  await dark.evaluate(() => window.scrollTo(0, window.innerHeight * 0.8))
  await new Promise((r) => setTimeout(r, 400))
  const before = await dark.evaluate(() => ({
    url: location.href,
    scroll: Math.round(window.scrollY),
    progress: Number(
      getComputedStyle(document.documentElement).getPropertyValue('--opening-progress')
    ),
    theme: document.documentElement.dataset.theme ?? 'light',
  }))
  await dark.click('.site-rail-theme')
  await new Promise((r) => setTimeout(r, 400))
  const after = await dark.evaluate(() => ({
    url: location.href,
    scroll: Math.round(window.scrollY),
    progress: Number(
      getComputedStyle(document.documentElement).getPropertyValue('--opening-progress')
    ),
    theme: document.documentElement.dataset.theme,
  }))
  check(
    before.theme === 'light' && after.theme === 'dark',
    `the button switches the theme (${before.theme} -> ${after.theme})`
  )
  check(after.url === before.url, `and does not navigate (${after.url === before.url})`)
  check(
    after.scroll === before.scroll && after.progress === before.progress,
    `and does not replay the opening (scroll ${before.scroll}->${after.scroll}, progress ${before.progress}->${after.progress})`
  )

  // Hover must not switch anything: the moon and the sun are the two themes'
  // symbols, not a hover pair.
  await dark.goto(BASE + '/about', { waitUntil: 'networkidle0' })
  const themeBefore = await dark.evaluate(() => document.documentElement.dataset.theme)
  await dark.hover('.site-rail-theme')
  await new Promise((r) => setTimeout(r, 500))
  const themeAfterHover = await dark.evaluate(() => document.documentElement.dataset.theme)
  check(
    themeBefore === themeAfterHover,
    `hovering the theme button changes nothing (${themeBefore} -> ${themeAfterHover})`
  )

  await dark.evaluate(() => localStorage.removeItem('evelyn-site-theme'))
  await dark.close()
}

console.log('\n# reduced motion: the theme does not fade')
{
  const rm = await newPage()
  await rm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await rm.setViewport({ width: 1440, height: 900 })
  await rm.goto(BASE + '/about', { waitUntil: 'networkidle0' })
  /* What matters is whether a colour change would animate, which needs both a
   * colour in transition-property and a duration. `all` at 0s is the browser
   * default and animates nothing. */
  const fades = await rm.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll(
      'body, .page, .site-rail-link, .site-rail-theme, .nav-icon, .worklist-entry, .contact-field input'
    )) {
      const st = getComputedStyle(el)
      const props = st.transitionProperty.split(',').map((x) => x.trim())
      const durs = st.transitionDuration.split(',').map((x) => parseFloat(x) || 0)
      props.forEach((prop, i) => {
        const dur = durs[i % durs.length] ?? 0
        const colourish = prop === 'all' || prop.includes('color') || prop.includes('background')
        if (colourish && dur > 0) {
          out.push(`${el.className || el.tagName}: ${prop} ${dur}s`)
        }
      })
    }
    return out
  })
  check(
    fades.length === 0,
    `nothing animates colour under reduced motion${fades.length ? ': ' + fades.join('; ') : ''}`
  )
  await rm.close()
}

console.log('\n# the opening transition runs on scroll and finishes flush')
await visit('/')
const reading = async () =>
  page.evaluate(() => {
    const about = document.querySelector('.home-about')
    const letter = document.querySelector('.hang-letter')
    return {
      progress: Number(
        getComputedStyle(document.documentElement).getPropertyValue('--opening-progress')
      ),
      aboutOpacity: Number(getComputedStyle(about).opacity),
      aboutTop: Math.round(about.getBoundingClientRect().top),
      letterShifted: getComputedStyle(letter).transform !== 'matrix(1, 0, 0, 1, 0, 0)',
      railOpacity: Number(getComputedStyle(document.querySelector('.site-rail-nav')).opacity),
    }
  })
const scrollTo = async (fraction) => {
  await page.evaluate((f) => window.scrollTo(0, window.innerHeight * 0.8 * f), fraction)
  await new Promise((r) => setTimeout(r, 250))
}
const atStart = await reading()
check(
  atStart.progress === 0 && atStart.aboutOpacity === 0,
  'at the top: no progress, About invisible'
)
await scrollTo(0.5)
const middle = await reading()
check(
  middle.aboutOpacity > 0 && middle.aboutOpacity < 1 && middle.letterShifted,
  `mid-transition: letters moving, About at ${middle.aboutOpacity.toFixed(2)} — not a blank frame`
)
await scrollTo(1)
const atEnd = await reading()
check(
  atEnd.progress === 1 &&
    atEnd.aboutOpacity === 1 &&
    atEnd.aboutTop === 0 &&
    atEnd.railOpacity === 1,
  `at the end: About fully in place at the top of the viewport, rail revealed`
)
await scrollTo(0)
const back = await reading()
check(
  back.progress === 0 && back.aboutOpacity === 0,
  'scrolling back up returns the letters and hides About'
)

console.log('\n# /about never plays the opening')
await visit('/about')
check(!(await page.$('.opening-scene')), '/about has no opening scene')

// Resume is hidden for now, so the nav is one entry shorter. Restore the
// commented line and drop the one under it when its entry comes back.
// console.log('\n# the rail groups three pages, then three actions, then the theme')
console.log('\n# the rail groups three pages, then two actions, then the theme')
await visit('/about', 1440, 900)
const grouping = await page.evaluate(() => {
  const items = [...document.querySelectorAll('.site-rail-item')]
  const gaps = []
  for (let i = 1; i < items.length; i += 1) {
    gaps.push(
      Math.round(items[i].getBoundingClientRect().top - items[i - 1].getBoundingClientRect().bottom)
    )
  }
  const theme = document.querySelector('.site-rail-theme').getBoundingClientRect()
  return {
    gaps,
    groups: items.map((li) =>
      [...li.classList]
        .find((c) => c.startsWith('site-rail-item--group-'))
        ?.replace('site-rail-item--group-', '')
    ),
    themeGap: Math.round(theme.top - items[items.length - 1].getBoundingClientRect().bottom),
    // The theme button has to be part of the rail, not pinned to the bottom of
    // the screen with a hole above it.
    themeFromBottom: Math.round(window.innerHeight - theme.bottom),
    radius: getComputedStyle(document.querySelector('.site-rail-link')).borderRadius,
  }
})
// Resume is hidden for now, so the nav is one entry shorter. Restore the
// commented line and drop the one under it when its entry comes back.
// check(
//   grouping.groups.join(',') === 'pages,pages,pages,tools,tools,tools',
//   `three pages then three actions (${grouping.groups.join(', ')})`
// )
// check(
//   grouping.gaps.join(',') === '12,12,24,12,12',
//   `gaps are 12/12 inside the groups and 24 between them (${grouping.gaps.join(', ')})`
// )
check(
  grouping.groups.join(',') === 'pages,pages,pages,tools,tools',
  `three pages then two actions (${grouping.groups.join(', ')})`
)
check(
  grouping.gaps.join(',') === '12,12,24,12',
  `gaps are 12/12 inside the groups and 24 between them (${grouping.gaps.join(', ')})`
)
check(grouping.themeGap === 16, `the theme button follows at 16px (${grouping.themeGap}px)`)
check(
  grouping.themeFromBottom > 200,
  `and is not pinned to the bottom of the screen (${grouping.themeFromBottom}px above it)`
)
check(grouping.radius === '12px', `the selected background is 12px round (${grouping.radius})`)

/* Nothing draws a line between the groups: the grouping is space. */
const rules = await page.evaluate(
  () =>
    [...document.querySelectorAll('.site-rail, .site-rail *')].filter((el) => {
      const s = getComputedStyle(el)
      const painted = (v) => v && v !== 'none' && v !== '0px' && !/rgba\(0, 0, 0, 0\)/.test(v)
      return (
        painted(s.borderTopWidth !== '0px' ? s.borderTopColor : '') ||
        painted(s.boxShadow) ||
        (el.classList.contains('site-rail') && painted(s.backgroundColor))
      )
    }).length
)
check(rules === 0, `no frame, divider or shadow anywhere in the rail (${rules} found)`)

// Resume is hidden for now, so the nav is one entry shorter. Restore the
// commented line and drop the one under it when its entry comes back.
// console.log('\n# the compact bar is seven icons, not a row of words')
console.log('\n# the compact bar is six icons, not a row of words')
await visit('/about', 390, 844)
const bar = await page.evaluate(() => {
  const links = [...document.querySelectorAll('.site-topbar-link')]
  const theme = document.querySelector('.site-topbar-theme')
  const controls = [...links, theme]
  const box = (el) => el.getBoundingClientRect()
  const items = [...document.querySelectorAll('.site-topbar-item')]
  const gaps = []
  for (let i = 1; i < items.length; i += 1) {
    gaps.push(Math.round(box(items[i]).left - box(items[i - 1]).right))
  }
  return {
    count: controls.length,
    // Text the bar actually paints. The theme button carries its name in an
    // .sr-only span, which announces but is clipped to nothing on screen, so
    // what counts here is text outside those spans.
    visibleText: controls
      .map((el) =>
        [...el.childNodes]
          .filter((n) => !(n.nodeType === 1 && n.classList.contains('sr-only')))
          .map((n) => n.textContent.trim())
          .join('')
      )
      .filter(Boolean).length,
    // An accessible name, however it is given: aria-label on the six links,
    // the .sr-only span on the theme button.
    names: controls
      .map((el) => el.getAttribute('aria-label') || el.textContent.trim())
      .filter(Boolean).length,
    hits: controls.map((el) => [Math.round(box(el).width), Math.round(box(el).height)]),
    icons: controls.map((el) => {
      const svg = el.querySelector('svg.nav-icon')
      return svg ? [svg.getAttribute('width'), svg.getAttribute('height')] : null
    }),
    gaps,
    themeGap: Math.round(box(theme).left - box(links[links.length - 1]).right),
    logo: !!document.querySelector('.site-topbar-logo-row .site-logo'),
    logoAbove: Math.round(
      box(document.querySelector('.site-topbar-row')).top -
        box(document.querySelector('.site-topbar-logo-row')).bottom
    ),
    edge: getComputedStyle(document.querySelector('.site-topbar')).paddingLeft,
    sticky: getComputedStyle(document.querySelector('.site-topbar')).position,
    bg: getComputedStyle(document.querySelector('.site-topbar')).backgroundColor,
    pageBg: getComputedStyle(document.body).backgroundColor,
    shadow: getComputedStyle(document.querySelector('.site-topbar')).boxShadow,
  }
})
// Resume is hidden for now, so the nav is one entry shorter. Restore the
// commented line and drop the one under it when its entry comes back.
// check(bar.count === 7, `seven controls in the bar (${bar.count})`)
check(bar.count === 6, `six controls in the bar (${bar.count})`)
check(bar.logo, 'the original logo is on its own row above them')
check(bar.visibleText === 0, `none of them paints a word (${bar.visibleText} with text)`)
// Resume is hidden for now, so the nav is one entry shorter. Restore the
// commented line and drop the one under it when its entry comes back.
// check(bar.names === 7, `all seven keep an accessible name (${bar.names})`)
check(bar.names === 6, `all six keep an accessible name (${bar.names})`)
check(
  bar.hits.every(([w, h]) => w >= 44 && h >= 44),
  `every tap target is at least 44x44 (${bar.hits.map((h) => h.join('x')).join(' ')})`
)
check(
  bar.icons.every((i) => i && i[0] === '28' && i[1] === '28'),
  `every icon is 28x28 (${JSON.stringify(bar.icons)})`
)
// Resume is hidden for now, so the nav is one entry shorter. Restore the
// commented line and drop the one under it when its entry comes back.
// check(
//   bar.gaps.join(',') === '0,0,8,0,0' && bar.themeGap === 8,
//   `8px between the groups and before the theme (${bar.gaps.join(',')} then ${bar.themeGap})`
// )
check(
  bar.gaps.join(',') === '0,0,8,0' && bar.themeGap === 8,
  `8px between the groups and before the theme (${bar.gaps.join(',')} then ${bar.themeGap})`
)
check(bar.edge === '12px', `12px down each side of the bar (${bar.edge})`)
check(bar.sticky === 'sticky', `the bar is sticky (${bar.sticky})`)
check(bar.bg === bar.pageBg, `its background is the page colour (${bar.bg})`)
check(bar.shadow === 'none', `and it casts no shadow (${bar.shadow})`)

/* In flow, not over the content: the first thing on the page has to start
 * below the bar, not underneath it. */
const flow = await page.evaluate(() => {
  const barBox = document.querySelector('.site-topbar').getBoundingClientRect()
  const first = document.querySelector('.profile-name').getBoundingClientRect()
  return { barBottom: Math.round(barBox.bottom), contentTop: Math.round(first.top) }
})
check(
  flow.contentTop >= flow.barBottom,
  `the content starts below the bar (bar ends ${flow.barBottom}, content starts ${flow.contentTop})`
)

/* 320px: the row scrolls sideways rather than shrinking the targets. */
await visit('/about', 320, 640)
const narrow = await page.evaluate(() => {
  const row = document.querySelector('.site-topbar-row')
  const controls = [
    ...document.querySelectorAll('.site-topbar-link'),
    document.querySelector('.site-topbar-theme'),
  ]
  return {
    scrollable: row.scrollWidth > row.clientWidth,
    hits: controls.map((el) => Math.round(el.getBoundingClientRect().width)),
    rows: new Set(controls.map((el) => Math.round(el.getBoundingClientRect().top))).size,
  }
})
check(
  narrow.hits.every((w) => w >= 44),
  `at 320px the targets are still 44px wide (${narrow.hits.join(' ')})`
)
check(narrow.rows === 1, `and still on one line (${narrow.rows} line(s))`)
// Resume is hidden for now, so six controls fit at 320px and there is nothing
// left to scroll. The two checks above still hold the line that matters — 44px
// targets, one row. Restore the commented check and drop the one under it when
// the Resume entry comes back.
// check(narrow.scrollable, 'the row scrolls sideways instead')
check(!narrow.scrollable, 'and the six of them fit at 320px without scrolling')

console.log('\n# the opening carries the logo and the theme control, and nothing else')
await visit('/', 1440, 900)
const opening = await page.evaluate(() => {
  const nav = document.querySelector('.site-rail-nav')
  const theme = document.querySelector('.site-rail-theme').getBoundingClientRect()
  const logo = document.querySelector('.site-rail-logo').getBoundingClientRect()
  return {
    navOpacity: getComputedStyle(nav).opacity,
    inert: nav.hasAttribute('inert'),
    focusable: [...nav.querySelectorAll('a')].filter((a) => a.tabIndex >= 0 && a.offsetParent)
      .length,
    themeBelowLogo: Math.round(theme.top - logo.bottom),
  }
})
check(opening.navOpacity === '0', `the six entries are not painted (opacity ${opening.navOpacity})`)
check(opening.inert, 'and the nav is inert, so Tab cannot reach them')
check(
  opening.themeBelowLogo < 48,
  `the theme button sits right under the logo, not below a gap (${opening.themeBelowLogo}px)`
)

/* Scroll past the handover: the nav arrives whole and the button comes down. */
const handedOver = await page.evaluate(async () => {
  window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'instant' })
  await new Promise((r) => setTimeout(r, 700))
  const nav = document.querySelector('.site-rail-nav')
  const theme = document.querySelector('.site-rail-theme').getBoundingClientRect()
  const items = [...document.querySelectorAll('.site-rail-item')]
  return {
    opacity: getComputedStyle(nav).opacity,
    inert: nav.hasAttribute('inert'),
    // Every entry at the same opacity: the group arrives as one piece, not
    // one icon at a time.
    opacities: new Set(items.map((li) => getComputedStyle(li).opacity)).size,
    themeGap: Math.round(theme.top - items[items.length - 1].getBoundingClientRect().bottom),
  }
})
check(handedOver.opacity === '1', `after the handover the nav is painted (${handedOver.opacity})`)
check(!handedOver.inert, 'and reachable again')
check(handedOver.opacities === 1, 'every entry arrives at once, none staggered')
check(
  handedOver.themeGap === 16,
  `the theme button lands 16px under the last entry (${handedOver.themeGap}px)`
)

/* A direct visit to a real page never waits for an opening. */
for (const path of ['/about', '/projects', '/contact', '/experience/sony']) {
  await visit(path, 1440, 900)
  const live = await page.evaluate(() => {
    const nav = document.querySelector('.site-rail-nav')
    return { opacity: getComputedStyle(nav).opacity, inert: nav.hasAttribute('inert') }
  })
  check(live.opacity === '1' && !live.inert, `${path} has the nav immediately`)
}

/* Switching the theme must not navigate or send you back through the opening. */
await visit('/projects', 1440, 900)
const afterToggle = await page.evaluate(async () => {
  const before = location.pathname + location.hash
  const y = window.scrollY
  document.querySelector('.site-rail-theme').click()
  await new Promise((r) => setTimeout(r, 300))
  const after = { path: location.pathname + location.hash, y: window.scrollY }
  document.querySelector('.site-rail-theme').click()
  localStorage.removeItem('evelyn-site-theme')
  return { before, ...after, movedBy: Math.abs(after.y - y) }
})
check(
  afterToggle.before === afterToggle.path && afterToggle.movedBy === 0,
  `switching the theme changes neither the route nor the scroll (${afterToggle.path})`
)

console.log('\n# Selected Experience: four links, and rules that stay in their column')
await visit('/about', 1440, 900)
const list = await page.evaluate(() => {
  const ul = document.querySelector('.profile-roles')
  const items = [...document.querySelectorAll('.profile-role')]
  const note = document.querySelector('.profile-role-note')
  const intro = document.querySelector('.profile-prose')
  const photo = document.querySelector('.profile-portrait')
  const gaps = []
  for (let i = 1; i < items.length; i += 1) {
    const prev = items[i - 1]
    const cur = items[i]
    gaps.push(
      Math.round(
        parseFloat(getComputedStyle(prev).paddingBottom) +
          parseFloat(getComputedStyle(cur).paddingTop)
      )
    )
  }
  return {
    width: Math.round(ul.getBoundingClientRect().width),
    ruleRight: Math.round(ul.getBoundingClientRect().right),
    photoLeft: photo ? Math.round(photo.getBoundingClientRect().left) : Infinity,
    parentWidth: Math.round(ul.parentElement.getBoundingClientRect().width),
    parentRight: Math.round(document.querySelector('.profile-inner').getBoundingClientRect().right),
    listLeft: Math.round(ul.getBoundingClientRect().left),
    introLeft: Math.round(intro.getBoundingClientRect().left),
    gaps,
    noteSize: getComputedStyle(note).fontSize,
    noteLeading: getComputedStyle(note).lineHeight,
    noteAlign: getComputedStyle(note).textAlign,
    links: [...document.querySelectorAll('.profile-role-org-link')].map((a) => ({
      href: a.getAttribute('href'),
      deco: getComputedStyle(a).textDecorationLine,
      color: getComputedStyle(a).color,
      size: getComputedStyle(a).fontSize,
    })),
  }
})
check(list.width <= 820, `the list is at most 820px wide (${list.width}px)`)
check(
  list.listLeft === list.introLeft,
  `its left edge lines up with the introduction (${list.listLeft} vs ${list.introLeft})`
)
check(
  list.width <= list.parentWidth,
  `and never wider than its container (${list.width} inside ${list.parentWidth})`
)
/* The rules used to run the full width of the content area, out past the text
 * and across the empty right-hand side. 820px is where the brief stops them;
 * what this asserts is that they stop well short of that edge. */
check(
  list.ruleRight < list.parentRight - 100,
  `the rules stop well short of the right edge (rule ends ${list.ruleRight}, content ends ${list.parentRight})`
)
check(
  list.gaps.every((g) => g === 64),
  `32px above and below each entry (${list.gaps.join(', ')} between them)`
)
check(
  list.noteSize === '18px' && list.noteLeading === '29.7px',
  `the notes are 18px/1.65 (${list.noteSize}/${list.noteLeading})`
)
check(list.noteAlign === 'left', `left-aligned, not justified (${list.noteAlign})`)
check(list.links.length === 4, `all four institutions are links (${list.links.length})`)
check(
  list.links.map((l) => l.href).join(' ') ===
    '/projects#project-chai /experience/bloom-mcp /experience/sony /experience/tsinghua',
  `and they point where they should (${list.links.map((l) => l.href).join(', ')})`
)
check(
  new Set(list.links.map((l) => `${l.deco}|${l.color}|${l.size}`)).size === 1,
  `all four are marked the same way (${list.links[0].deco}, ${list.links[0].size})`
)

/* Each link has to land on something. The CHAI one is the new anchor; the
 * other three are pages that must not 404. */
for (const [href, marker] of [
  ['/projects#project-chai', '#project-chai'],
  ['/experience/bloom-mcp', '.project-detail-title'],
  ['/experience/sony', '.project-detail-title'],
  ['/experience/tsinghua', '.project-detail-title'],
]) {
  await visit(href)
  const landed = await page.evaluate((m) => {
    const el = document.querySelector(m)
    return {
      found: !!el,
      notFound: !!document.querySelector('.not-found-headline'),
      // For the anchor: it has to be on screen, not scrolled past the top.
      top: el ? Math.round(el.getBoundingClientRect().top) : null,
    }
  }, marker)
  check(
    landed.found && !landed.notFound,
    `${href} resolves to ${marker}${landed.top !== null ? ` (${landed.top}px from the top)` : ''}`
  )
}

/* The fragment has to actually scroll, and clear the sticky bar on narrow
 * screens rather than landing underneath it. */
for (const [w, h] of [
  [1440, 900],
  [390, 844],
]) {
  await visit('/projects#project-chai', w, h)
  const anchored = await page.evaluate(() => {
    const el = document.getElementById('project-chai')
    const bar = document.querySelector('.site-topbar')
    const barVisible = bar && getComputedStyle(bar).display !== 'none'
    return {
      top: Math.round(el.getBoundingClientRect().top),
      barBottom: barVisible ? Math.round(bar.getBoundingClientRect().bottom) : 0,
    }
  })
  check(
    anchored.top >= anchored.barBottom && anchored.top <= anchored.barBottom + 40,
    `${w}px: the CHAI anchor lands clear of the bar (${anchored.top}px, bar ends ${anchored.barBottom}px)`
  )
}

console.log('\n# Sony and Tsinghua read as one short note')
for (const path of ['/experience/sony', '/experience/tsinghua']) {
  await visit(path, 1440, 900)
  const note = await page.evaluate(() => {
    const main = document.querySelector('main')
    const container = document.querySelector('.sec-inner')
    const col = document.querySelector('.project-detail-prose')
    const paras = [...document.querySelectorAll('.project-detail-prose')]
    const words = paras.map((p) => p.textContent.trim().split(/\s+/).length)
    const tinted = [...main.querySelectorAll('*')].filter((el) => {
      const s = getComputedStyle(el)
      return (
        /gradient/.test(s.backgroundImage) ||
        (s.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          s.backgroundColor !== getComputedStyle(document.body).backgroundColor)
      )
    }).length
    return {
      container: Math.round(container.getBoundingClientRect().width),
      column: Math.round(col.getBoundingClientRect().width),
      words: words.reduce((a, b) => a + b, 0),
      paragraphs: paras.length,
      headings: [...main.querySelectorAll('h2')].map((h) => h.textContent.trim()),
      headingFont: getComputedStyle(main.querySelector('h2'))
        .fontFamily.split(',')[0]
        .replace(/['"]/g, ''),
      back: main.querySelector('.project-detail-back')?.getAttribute('href'),
      // Everything the trim was supposed to remove.
      stats: main.querySelectorAll('.detail-stat-strip, .detail-stat-num').length,
      cards: main.querySelectorAll('.detail-tool-card, .detail-tool-grid').length,
      chips: main.querySelectorAll('.tech-chip-grid, .project-detail-tech').length,
      diagrams: main.querySelectorAll('.detail-diagram, svg').length,
      code: main.querySelectorAll('.detail-code, code').length,
      tinted,
    }
  })
  check(
    note.container <= 1000 && note.column === 800,
    `${path}: an 800px reading column in the shared container (${note.column}px in ${note.container}px)`
  )
  check(
    note.words >= 150 && note.words <= 220,
    `${path}: ${note.words} words of body copy (150-220)`
  )
  check(
    note.paragraphs === 3 && note.headings.length === 2,
    `${path}: a summary and two topics (${note.paragraphs} paragraphs, ${note.headings.join(' / ')})`
  )
  check(note.headingFont === 'Alegreya', `${path}: headings in Alegreya (${note.headingFont})`)
  check(
    note.stats === 0 &&
      note.cards === 0 &&
      note.chips === 0 &&
      note.diagrams === 0 &&
      note.code === 0,
    `${path}: no stat strip, cards, chips, diagram or code block (${JSON.stringify({
      stats: note.stats,
      cards: note.cards,
      chips: note.chips,
      diagrams: note.diagrams,
      code: note.code,
    })})`
  )
  check(note.tinted === 0, `${path}: nothing tinted or gradient-filled (${note.tinted})`)
  check(
    note.back === `/about#experience-${path.split('/').pop()}`,
    `${path}: back goes to its own entry on /about (${note.back})`
  )
}

console.log('\n# only one navigation is interactive at a time')
for (const [w, h] of WIDTHS) {
  await visit('/about', w, h)
  const navs = await page.evaluate(() => ({
    rail: getComputedStyle(document.querySelector('.site-rail')).display !== 'none',
    bar: getComputedStyle(document.querySelector('.site-topbar')).display !== 'none',
  }))
  check(navs.rail !== navs.bar, `${w}px: rail=${navs.rail} bar=${navs.bar}`)
}

console.log('\n# one desktop container: /about, /projects and /contact')
/* The three pages are a layout system or they are three pages that happen to
 * look alike. What is asserted is the system: one left edge, one top, one gap
 * under the title, one width limit — measured, at both of the widths the brief
 * names, from what actually painted. */
for (const [w, h] of [
  [1280, 900],
  [1440, 900],
]) {
  const read = async (path) => {
    await visit(path, w, h)
    return page.evaluate(() => {
      const shell = document.querySelector('.page-shell')
      const title = document.querySelector('.page-shell-title')
      const sb = shell.getBoundingClientRect()
      const tb = title.getBoundingClientRect()
      const next = title.nextElementSibling ?? title.parentElement.nextElementSibling
      return {
        left: Math.round(tb.left),
        shellLeft: Math.round(sb.left),
        width: Math.round(sb.width),
        // Top of the content area to the top of the title.
        top: Math.round(tb.top - sb.top),
        gap: Math.round(next.getBoundingClientRect().top - tb.bottom),
        marginRight: getComputedStyle(shell).marginRight,
      }
    })
  }

  const about = await read('/about')
  const projects = await read('/projects')
  const contact = await read('/contact')
  const all = { about, projects, contact }
  const lefts = Object.values(all).map((v) => v.left)
  const tops = Object.values(all).map((v) => v.top)
  const widths = Object.values(all).map((v) => v.width)

  check(
    new Set(lefts).size === 1,
    `${w}px: the three titles start on one left edge (${lefts.join(', ')})`
  )
  check(
    Object.values(all).every((v) => v.left === v.shellLeft),
    `${w}px: and that edge is the container's, with nothing offsetting it (${Object.entries(all)
      .map(([k, v]) => `${k} ${v.left}/${v.shellLeft}`)
      .join(', ')})`
  )
  check(
    new Set(tops).size === 1 && tops[0] === 96,
    `${w}px: all three titles start 96px down (${tops.join(', ')})`
  )
  check(
    new Set(Object.values(all).map((v) => v.gap)).size === 1,
    `${w}px: one gap under the title (${Object.values(all)
      .map((v) => v.gap)
      .join(', ')})`
  )
  check(
    widths.every((x) => x <= 1000) && new Set(widths).size === 1,
    `${w}px: one container width, 1000px at most (${widths.join(', ')})`
  )
  check(
    Object.values(all).every((v) => v.marginRight !== 'auto'),
    `${w}px: nothing is centred in the content area (${Object.values(all)
      .map((v) => v.marginRight)
      .join(', ')})`
  )

  /* The form keeps its own measure inside that container, and the space to its
   * right is left empty rather than filled. */
  await visit('/contact', w, h)
  const form = await page.evaluate(() => {
    const f = document.querySelector('.contact-form')
    const shell = document.querySelector('.page-shell')
    return {
      width: Math.round(f.getBoundingClientRect().width),
      left: Math.round(f.getBoundingClientRect().left),
      shellLeft: Math.round(shell.getBoundingClientRect().left),
    }
  })
  check(
    form.width === 640 && form.left === form.shellLeft,
    `${w}px: the contact form is 640px on the common left edge (${form.width}px at ${form.left})`
  )
}

console.log('\n# every technical note is on that same edge, in an 800px column')
for (const path of [
  '/experience/bloom-mcp',
  '/projects/almabot',
  '/experience/sony',
  '/experience/tsinghua',
]) {
  for (const [w, h] of [
    [1280, 900],
    [1440, 900],
  ]) {
    await visit(path, w, h)
    const note = await page.evaluate(() => {
      const left = (sel) => {
        const el = document.querySelector(sel)
        return el ? Math.round(el.getBoundingClientRect().left) : null
      }
      const widthOf = (sel) => {
        const el = document.querySelector(sel)
        return el ? Math.round(el.getBoundingClientRect().width) : null
      }
      return {
        edges: {
          back: left('.project-detail-back'),
          title: left('.project-detail-title'),
          meta: left('.experience-detail-subtitle'),
          heading: left('.project-detail-section-title'),
          prose: left('.project-detail-prose'),
        },
        container: widthOf('.sec-inner'),
        title: widthOf('.project-detail-title'),
        prose: widthOf('.project-detail-prose'),
        centred: [...document.querySelectorAll('.sec-inner')].filter(
          (el) => getComputedStyle(el).marginRight === 'auto'
        ).length,
        // A <br> inside the title would be a hand-made line break standing in
        // for a measure.
        titleBreaks: document.querySelectorAll('.project-detail-title br').length,
      }
    })
    const edges = Object.values(note.edges).filter((x) => x !== null)
    check(
      new Set(edges).size === 1,
      `${w}px ${path}: back link, title, meta, heading and body share one left edge (${Object.entries(
        note.edges
      )
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')})`
    )
    check(
      note.prose === 800 && note.title === 800,
      `${w}px ${path}: an 800px column, title included (prose ${note.prose}, title ${note.title})`
    )
    check(
      note.container <= 1000 && note.centred === 0,
      `${w}px ${path}: in a container of ${note.container}px, none of it centred (${note.centred} centred)`
    )
    check(
      note.titleBreaks === 0,
      `${w}px ${path}: the title wraps on its own (${note.titleBreaks} hard breaks)`
    )
  }
}

/* The left edge of a note has to be the left edge of the three main pages, not
 * merely consistent among the notes. */
await visit('/about', 1440, 900)
const aboutEdge = await page.evaluate(() =>
  Math.round(document.querySelector('.page-shell-title').getBoundingClientRect().left)
)
for (const path of [
  '/experience/bloom-mcp',
  '/projects/almabot',
  '/experience/sony',
  '/experience/tsinghua',
]) {
  await visit(path, 1440, 900)
  const noteEdge = await page.evaluate(() =>
    Math.round(document.querySelector('.project-detail-title').getBoundingClientRect().left)
  )
  check(noteEdge === aboutEdge, `${path} starts where /about does (${noteEdge} vs ${aboutEdge})`)
}

console.log('\n# the contact form lines are drawn, and only there')
for (const theme of ['light', 'dark']) {
  await visit('/contact', 1440, 900)
  const lines = await page.evaluate(async (mode) => {
    document.documentElement.dataset.theme = mode
    /* Longer than the 0.2s colour transition on `.contact-field-rule`, not
     * equal to it. Waiting exactly the duration is a coin flip — anything that
     * delays the transition's start by a frame leaves this reading an
     * interpolated colour a couple of steps short of the token, which looks
     * exactly like a wrong colour and is not one. 400ms is what the focus
     * checks below already wait. */
    await new Promise((r) => setTimeout(r, 400))
    const probe = document.createElement('span')
    document.body.appendChild(probe)
    const token = (name) => {
      probe.style.color = `var(${name})`
      return getComputedStyle(probe).color
    }
    const rule = token('--rule')
    const accent = token('--accent-link')
    probe.remove()

    const svgs = [...document.querySelectorAll('.contact-field-rule')]
    const read = (svg) => {
      const path = svg.querySelector('path')
      const cs = getComputedStyle(path)
      return {
        colour: cs.stroke,
        width: cs.strokeWidth,
        cap: cs.strokeLinecap,
        effect: path.getAttribute('vector-effect'),
        // How many separate subpaths the drawing is made of: one smooth line,
        // not a double stroke and not a scribble.
        moves: (path.getAttribute('d').match(/[Mm]/g) || []).length,
        paths: svg.querySelectorAll('path').length,
        pointer: getComputedStyle(svg).pointerEvents,
        animation: cs.animationName,
        // Rendered width follows the field it sits under.
        width_px: Math.round(svg.getBoundingClientRect().width),
        fieldWidth: Math.round(svg.parentElement.getBoundingClientRect().width),
      }
    }
    const rest = svgs.map(read)

    document.querySelector('#contact-email').focus()
    await new Promise((r) => setTimeout(r, 400))
    const focused = read(svgs[1])
    document.querySelector('#contact-email').blur()
    await new Promise((r) => setTimeout(r, 400))

    return {
      rule,
      accent,
      rest,
      focused,
      // Nothing outside the form grew a drawn line.
      strays: document.querySelectorAll('.contact-field-rule').length,
      onSubmit: document.querySelectorAll('.contact-submit svg, .contact-submit path').length,
      ds: svgs.map((s) => s.querySelector('path').getAttribute('d')),
      borders: [...document.querySelectorAll('.contact-field input, .contact-field textarea')].map(
        (el) => getComputedStyle(el).borderBottomWidth
      ),
    }
  }, theme)

  check(lines.rest.length === 3, `${theme}: three fields carry a drawn line (${lines.rest.length})`)
  check(
    lines.rest.every((l) => l.paths === 1 && l.moves === 1),
    `${theme}: each one is a single smooth path (${lines.rest.map((l) => `${l.paths}/${l.moves}`).join(' ')})`
  )
  check(
    new Set(lines.ds).size === 3,
    `${theme}: the three curves differ (${new Set(lines.ds).size} distinct)`
  )
  check(
    lines.rest.every((l) => l.colour === lines.rule),
    `${theme}: at rest they are the theme's divider colour (${lines.rest[0].colour} vs ${lines.rule})`
  )
  check(
    lines.rest.every((l) => l.width === '1.25px' && l.cap === 'round'),
    `${theme}: 1.25px, round caps (${lines.rest.map((l) => `${l.width} ${l.cap}`).join(' ')})`
  )
  check(
    lines.rest.every((l) => l.effect === 'non-scaling-stroke' && l.width_px === l.fieldWidth),
    `${theme}: each line spans its field without stretching the stroke (${lines.rest
      .map((l) => `${l.width_px}/${l.fieldWidth}`)
      .join(' ')})`
  )
  check(
    lines.rest.every((l) => l.pointer === 'none'),
    `${theme}: none of them takes a pointer event (${lines.rest.map((l) => l.pointer).join(' ')})`
  )
  check(
    lines.rest.every((l) => l.animation === 'none'),
    `${theme}: nothing animates (${lines.rest.map((l) => l.animation).join(' ')})`
  )
  check(
    lines.focused.colour === lines.accent && parseFloat(lines.focused.width) > 1.25,
    `${theme}: focus takes the accent and a heavier line (${lines.focused.colour} ${lines.focused.width})`
  )
  check(
    lines.borders.every((b) => b === '0px'),
    `${theme}: the inputs carry no border of their own (${lines.borders.join(' ')})`
  )
  check(
    lines.onSubmit === 0,
    `${theme}: the Send message button is untouched (${lines.onSubmit} drawings on it)`
  )
}

/* The change must not have leaked onto any other page's dividers. */
for (const path of ['/about', '/projects', '/experience/bloom-mcp', '/projects/almabot', '/']) {
  await visit(path, 1440, 900)
  const strays = await page.evaluate(() => document.querySelectorAll('.contact-field-rule').length)
  check(strays === 0, `${path} has no drawn field line on it (${strays})`)
}

console.log('\n# nothing overflows sideways')
for (const [w, h] of WIDTHS) {
  for (const [path] of ROUTES) {
    await visit(path, w, h)
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
    check(
      over <= 0,
      `${String(w).padStart(4)}px ${path}${over > 0 ? ` overflows by ${over}px` : ''}`
    )
  }
}

console.log('\n# the content font is the real Alegreya, and the wind letters are not')
await visit('/about')
const fonts = await page.evaluate(() => ({
  heading: getComputedStyle(document.querySelector('.profile-name'))
    .fontFamily.split(',')[0]
    .replace(/['"]/g, ''),
  weight: getComputedStyle(document.querySelector('.profile-name')).fontWeight,
  body: getComputedStyle(document.querySelector('.profile-prose'))
    .fontFamily.split(',')[0]
    .replace(/['"]/g, ''),
  loaded: [...document.fonts]
    .filter((f) => f.status === 'loaded')
    .map((f) => `${f.family} ${f.weight}`),
}))
check(
  fonts.heading === 'Alegreya' && fonts.weight === '400',
  `headings are Alegreya 400 (${fonts.heading} ${fonts.weight})`
)
check(
  fonts.loaded.some((f) => f.startsWith('Alegreya')),
  `Alegreya actually loaded (${fonts.loaded.join(', ')})`
)
check(fonts.body === 'Space Grotesk', `body keeps its sans (${fonts.body})`)
await visit('/')
const hero = await page.evaluate(() =>
  getComputedStyle(document.querySelector('.hang-text--serif'))
    .fontFamily.split(',')[0]
    .replace(/['"]/g, '')
)
check(hero === 'Cormorant Garamond', `wind letters keep Cormorant Garamond (${hero})`)

await browser.close()
stop()

console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nall checks passed')
process.exit(failures.length ? 1 : 0)
