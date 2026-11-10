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
  ['/contact', '#contact'],
]

/* `/resume` is deliberately not in ROUTES: since #70 it is a redirect to the
 * PDF, so visiting it and then asking what rendered would be asking the PDF.
 * It gets its own check further down. */
const RESUME_PATH = '/resume'

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
  ['resume', 'download'],
  ['contact', 'page'],
  ['github', 'external'],
  ['linkedin', 'external'],
]

const WIDTHS = [
  [1440, 900],
  [1024, 800],
  [390, 844],
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
const page = await browser.newPage()

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
  rail.theme.gap === 24,
  `the theme button sits 24px below the external pair (${rail.theme.gap}px)`
)
check(!!rail.theme.name, `the theme button has an accessible name (${rail.theme.name})`)

console.log('\n# /resume still resolves, and it resolves to the PDF')
await page.setViewport({ width: 1440, height: 900 })
await page.goto(BASE + RESUME_PATH, { waitUntil: 'networkidle0' })
const landed = page.url()
check(
  landed.endsWith('.pdf') && landed.startsWith(BASE),
  `${RESUME_PATH} lands on a same-origin PDF (${landed.replace(BASE, '')})`
)
const pdf = await fetch(landed)
const pdfHead = Buffer.from(await pdf.arrayBuffer())
  .subarray(0, 5)
  .toString()
check(
  pdf.ok && pdfHead === '%PDF-',
  `that PDF is a real PDF, not a placeholder (${pdf.status}, starts ${JSON.stringify(pdfHead)})`
)

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

console.log('\n# only one navigation is interactive at a time')
for (const [w, h] of WIDTHS) {
  await visit('/about', w, h)
  const navs = await page.evaluate(() => ({
    rail: getComputedStyle(document.querySelector('.site-rail')).display !== 'none',
    bar: getComputedStyle(document.querySelector('.site-topbar')).display !== 'none',
  }))
  check(navs.rail !== navs.bar, `${w}px: rail=${navs.rail} bar=${navs.bar}`)
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
