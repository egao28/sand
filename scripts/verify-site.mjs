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
  ['/contact', '.contact-form'],
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
  ['contact', 'page'],
  ['resume', 'download'],
  ['github', 'external'],
  ['linkedin', 'external'],
]

const WIDTHS = [
  [1440, 900],
  [1024, 800],
  [768, 1024],
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
  resume: '.nav-icon-resume-page',
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

console.log('\n# the contact form, against a stubbed endpoint')
/* The endpoint is intercepted here, so running this sends no mail to anyone.
 * What is being checked is the form's behaviour, which the API tests cannot
 * see: that it refuses to submit what is incomplete, that it shows a sending
 * state, that a failure keeps what was typed, and — the one that matters —
 * that it never says "sent" unless the server said so. */
{
  const form = await browser.newPage()
  await form.setViewport({ width: 1440, height: 900 })
  await form.setRequestInterception(true)

  let reply = { status: 200, body: { ok: true } }
  let posted = null
  form.on('request', (req) => {
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
  check(
    posted && !('botcheck' in posted) && !('to' in posted),
    `the payload is the three fields only (${Object.keys(posted ?? {}).join(', ')})`
  )

  await form.close()
}

console.log('\n# the dark theme is the specified palette, and is flat')
{
  const dark = await browser.newPage()
  await dark.setViewport({ width: 1440, height: 900 })
  await dark.goto(BASE + '/about', { waitUntil: 'networkidle0' })
  await dark.evaluate(() => localStorage.setItem('evelyn-site-theme', 'dark'))

  const TOKENS = [
    ['--paper', 'rgb(81, 70, 56)'],
    ['--ink', 'rgb(245, 239, 228)'],
    ['--ink-muted', 'rgb(216, 204, 186)'],
    ['--accent-link', 'rgb(213, 183, 125)'],
    ['--rule', 'rgb(122, 107, 87)'],
    ['--rail-current-bg', 'rgb(107, 90, 67)'],
  ]

  for (const [path] of [
    ['/'],
    ['/about'],
    ['/projects'],
    ['/contact'],
    ['/experience/bloom-mcp'],
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

    check(r.bg === 'rgb(81, 70, 56)', `${path} paints the dark page background (${r.bg})`)
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
  const rm = await browser.newPage()
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

console.log('\n# the rail groups three pages, then three actions, then the theme')
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
check(
  grouping.groups.join(',') === 'pages,pages,pages,tools,tools,tools',
  `three pages then three actions (${grouping.groups.join(', ')})`
)
check(
  grouping.gaps.join(',') === '12,12,24,12,12',
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

console.log('\n# the compact bar is seven icons, not a row of words')
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
check(bar.count === 7, `seven controls in the bar (${bar.count})`)
check(bar.logo, 'the original logo is on its own row above them')
check(bar.visibleText === 0, `none of them paints a word (${bar.visibleText} with text)`)
check(bar.names === 7, `all seven keep an accessible name (${bar.names})`)
check(
  bar.hits.every(([w, h]) => w >= 44 && h >= 44),
  `every tap target is at least 44x44 (${bar.hits.map((h) => h.join('x')).join(' ')})`
)
check(
  bar.icons.every((i) => i && i[0] === '28' && i[1] === '28'),
  `every icon is 28x28 (${JSON.stringify(bar.icons)})`
)
check(
  bar.gaps.join(',') === '0,0,8,0,0' && bar.themeGap === 8,
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
check(narrow.scrollable, 'the row scrolls sideways instead')

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
