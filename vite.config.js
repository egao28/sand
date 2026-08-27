const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function getResumeLastUpdated() {
  const resumePath = path.resolve(__dirname, 'resume.pdf')
  try {
    const commitDate = execSync('git log -1 --format=%cI -- resume.pdf', {
      cwd: __dirname,
    })
      .toString()
      .trim()
    if (commitDate) return formatDate(new Date(commitDate))
  } catch {
    // no git history available (e.g. a shallow clone) — fall back to mtime
  }
  return formatDate(fs.statSync(resumePath).mtime)
}

function formatDate(date) {
  return `${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear()}`
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
