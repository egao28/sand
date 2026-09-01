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
  if (ISO_DATE.test(fromEnv)) return formatDate(fromEnv)

  const fromGit = readResumeCommitDate()
  if (fromGit) return formatDate(fromGit)

  return formatDate(RESUME_FALLBACK_DATE)
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
    return ISO_DATE.test(date) ? date : null
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
