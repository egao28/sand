const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const { execSync } = require('child_process')

// The date shown on /resume, resolved at build time in this order:
//   1. RESUME_LAST_UPDATED (YYYY-MM-DD) — set it in the host's build env.
//   2. the commit that last touched resume.pdf — reliable locally.
//   3. RESUME_FALLBACK_DATE below.
// Vercel and Netlify build from a shallow clone, so step 2 usually finds
// nothing there. The old code fell back to fs.statSync().mtime, but a fresh
// clone stamps every file with the checkout time, which made the page claim
// the resume was updated on whatever day the site happened to deploy. Bump
// RESUME_FALLBACK_DATE whenever you replace resume.pdf.
const RESUME_FALLBACK_DATE = '2026-08-17'
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function getResumeLastUpdated() {
  const fromEnv = (process.env.RESUME_LAST_UPDATED ?? '').trim()
  if (fromEnv) {
    // Fail the build rather than fall through. This is the one knob the deploy
    // is documented to reach for, so a typo in it has to be loud — silently
    // serving the constant instead would look exactly like success.
    if (!isRealDate(fromEnv)) {
      throw new Error(`RESUME_LAST_UPDATED must be a real YYYY-MM-DD date, got "${fromEnv}"`)
    }
    return formatDate(fromEnv)
  }

  const fromGit = readResumeCommitDate()
  if (fromGit) {
    // The two sources never meet: a shallow production clone always takes the
    // constant, a full local checkout always takes git. Compare them here,
    // where git is the one answering, or the constant goes stale in silence
    // and only production shows it.
    if (fromGit !== RESUME_FALLBACK_DATE) {
      console.warn(
        `vite.config: resume.pdf was last committed ${fromGit}, but ` +
          `RESUME_FALLBACK_DATE is ${RESUME_FALLBACK_DATE}. Deploys build from a shallow ` +
          `clone and will show the constant — update it in vite.config.js.`
      )
    }
    return formatDate(fromGit)
  }

  if (!isRealDate(RESUME_FALLBACK_DATE)) {
    throw new Error(
      `RESUME_FALLBACK_DATE must be a real YYYY-MM-DD date, got "${RESUME_FALLBACK_DATE}"`
    )
  }
  return formatDate(RESUME_FALLBACK_DATE)
}

// The shape test alone accepts 2026-13-45, which formatDate would cheerfully
// render as "13.45.2026". Round-tripping through Date rejects it.
function isRealDate(value) {
  if (!ISO_DATE.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

function readResumeCommitDate() {
  try {
    // A shallow clone grafts its oldest commit into a root commit, so every
    // tracked file looks like it was added there and `git log -- resume.pdf`
    // happily reports the deploy date. Refuse to answer rather than lie.
    if (git('rev-parse --is-shallow-repository') !== 'false') return null

    // %cs is the committer date as YYYY-MM-DD, which keeps the displayed day
    // from shifting with the build machine's timezone.
    const date = git('log -1 --format=%cs -- resume.pdf')
    return isRealDate(date) ? date : null
  } catch {
    // not a git checkout, or git is not on PATH
    return null
  }
}

function git(args) {
  return execSync(`git ${args}`, {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim()
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${Number(month)}.${Number(day)}.${year}`
}

module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  define: {
    'import.meta.env.VITE_RESUME_LAST_UPDATED': JSON.stringify(getResumeLastUpdated()),
  },
})
