#!/usr/bin/env node
/*
 * A standing check that the contact form's credentials cannot reach the
 * browser or the repository.
 *
 * The test suite proves the server never puts a secret in a response or a log
 * line. That leaves two routes it cannot see, and this covers them:
 *
 *   the bundle   Vite inlines any environment variable whose name starts with
 *                VITE_, literally, into the JavaScript it ships. One rename —
 *                VITE_TURNSTILE_SECRET_KEY instead of the site key — and the
 *                secret is on a CDN. So: no client file may name a server-only
 *                variable, and no VITE_ name may look like a secret.
 *
 *   the repo     a committed .env, or a key pasted into a source file, is
 *                public the moment the repository is. Git keeps it in the
 *                history after it is deleted, so catching it before the commit
 *                is the only cheap moment.
 *
 *   npm run check:secrets
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, extname, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname

/* Variables that exist only on the server. None of these may be named in
 * anything the browser downloads. */
const SERVER_ONLY = [
  'RESEND_API_KEY',
  'TURNSTILE_SECRET_KEY',
  'UPSTASH_REDIS_REST_TOKEN',
  'UPSTASH_REDIS_REST_URL',
  'KV_REST_API_TOKEN',
  'KV_REST_API_URL',
  'CONTACT_TO_EMAIL',
  'CONTACT_FROM_EMAIL',
]

/* The shapes of real credentials, for the case where someone skips the
 * environment altogether and types the key into a file. Turnstile site keys
 * and secret keys share the 0x4 prefix, so both are refused in source: the
 * site key belongs in the environment too, even though it is public. */
const CREDENTIAL_SHAPES = [
  [/\bre_[A-Za-z0-9_-]{16,}/, 'a Resend API key'],
  [/\b0x4[A-Za-z0-9_-]{20,}/, 'a Turnstile key'],
  [/\bsk_live_[A-Za-z0-9]{16,}/, 'a live secret key'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'an AWS access key id'],
]

/* The same list minus the Turnstile shape, for scanning the built bundle. The
 * site key is *supposed* to be inlined there — that is what the VITE_ prefix
 * is for — and it is indistinguishable by shape from the secret key, so shape
 * is the wrong tool for the bundle. `secretsInEnvironment` below is the right
 * one: it compares against the actual values. */
const NEVER_IN_BUNDLE = CREDENTIAL_SHAPES.filter(([, label]) => !label.includes('Turnstile'))

/* The real values, when this runs somewhere they are set — a deploy, or a
 * developer with a .env loaded. Finding one of these in dist/ is not a guess
 * about a shape, it is the leak itself. */
function secretsInEnvironment() {
  return SERVER_ONLY.map((name) => [name, (process.env[name] ?? '').trim()]).filter(
    // Short values are placeholders and would match half the bundle.
    ([, value]) => value.length >= 12
  )
}

/* A VITE_ name carrying any of these is a secret heading for the bundle. */
const SUSPICIOUS_IN_VITE_NAME = /SECRET|TOKEN|PASSWORD|PRIVATE|API_KEY|ACCESS_KEY/

/** Directories the browser is served from. `api/` is deliberately not here —
 * that code runs on the server and is supposed to name these variables. */
const CLIENT_DIRS = ['src', 'public', 'assets']
const CLIENT_FILES = ['index.html', 'vite.config.js']

const TEXT_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.css',
  '.html',
  '.json',
  '.md',
  '.txt',
  '.yml',
  '.yaml',
  '.svg',
  '.example',
])

const problems = []

function fail(where, what) {
  problems.push(`${where}: ${what}`)
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      if (entry === 'node_modules' || entry === '.git') continue
      walk(path, out)
    } else if (TEXT_EXTENSIONS.has(extname(entry))) {
      out.push(path)
    }
  }
  return out
}

function read(path) {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return ''
  }
}

// ---------------------------------------------- 1. the client never names them

console.log('# server-only variables stay out of the client')
const clientFiles = [
  ...CLIENT_DIRS.flatMap((dir) => walk(join(ROOT, dir))),
  ...CLIENT_FILES.map((file) => join(ROOT, file)).filter((path) => existsSync(path)),
]
let namedInClient = 0
for (const path of clientFiles) {
  const text = read(path)
  for (const name of SERVER_ONLY) {
    if (text.includes(name)) {
      namedInClient += 1
      fail(relative(ROOT, path), `names the server-only variable ${name}`)
    }
  }
}
console.log(
  namedInClient === 0
    ? `  ok   ${clientFiles.length} client files, none naming a server-only variable`
    : `  FAIL ${namedInClient} reference(s)`
)

// ------------------------------------------- 2. no VITE_ name looks like a secret

console.log('\n# no VITE_ variable is a secret')
const viteNames = new Set()
for (const path of [
  ...clientFiles,
  ...walk(join(ROOT, 'api')),
  ...walk(join(ROOT, 'lib')),
  ...walk(join(ROOT, 'scripts')),
]) {
  // This file names the bad example in its own comments; scanning itself
  // would make it permanently red.
  if (path.endsWith('check-secrets.mjs')) continue
  for (const match of read(path).matchAll(/\bVITE_[A-Z0-9_]+/g)) viteNames.add(match[0])
}
let suspicious = 0
for (const name of viteNames) {
  if (SUSPICIOUS_IN_VITE_NAME.test(name)) {
    suspicious += 1
    fail('vite', `${name} is inlined into the bundle and its name says it is a secret`)
  }
}
console.log(
  suspicious === 0
    ? `  ok   ${[...viteNames].sort().join(', ') || 'none'}`
    : `  FAIL ${suspicious} name(s)`
)

// ------------------------------------------- 3. no credential is written down

console.log('\n# no credential is hard-coded in a tracked file')
// The patterns are assembled, never written out, so this file stays clean
// while still proving it would catch the real thing.
for (const [shape, label] of CREDENTIAL_SHAPES) {
  const sample = {
    re: 're_' + 'A1b2C3d4E5f6G7h8J9k0',
    '0x': '0x4' + 'AAAABBBBCCCCDDDDEEEE1',
    sk: 'sk_live_' + 'A1b2C3d4E5f6G7h8',
    AK: 'AKIA' + 'ABCDEFGHIJKLMNOP',
  }
  const probe = Object.values(sample).find((value) => shape.test(value))
  if (!probe)
    fail('check-secrets.mjs', `the pattern for ${label} no longer matches a key of that shape`)
}
let tracked = []
try {
  tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
} catch {
  console.log('  --   not a git checkout; skipping the tracked-file scan')
}
let hardcoded = 0
for (const file of tracked) {
  if (!TEXT_EXTENSIONS.has(extname(file))) continue
  const text = read(join(ROOT, file))
  for (const [shape, label] of CREDENTIAL_SHAPES) {
    const match = text.match(shape)
    // The scanner's own patterns are not findings.
    if (match && !file.endsWith('check-secrets.mjs')) {
      hardcoded += 1
      fail(file, `looks like it contains ${label}`)
    }
  }
}
console.log(
  hardcoded === 0 ? `  ok   ${tracked.length} tracked files clean` : `  FAIL ${hardcoded} file(s)`
)

// --------------------------------------------- 4. no .env is tracked or ignorable

console.log('\n# no environment file is committed')
const envTracked = tracked.filter(
  (file) => /(^|\/)\.env($|\.)/.test(file) && !file.endsWith('.env.example')
)
for (const file of envTracked) fail(file, 'an environment file is tracked in git')
const gitignore = read(join(ROOT, '.gitignore'))
if (!/^\.env\*?$/m.test(gitignore) && !/^\.env\*/m.test(gitignore)) {
  fail('.gitignore', 'does not ignore .env files by a wildcard')
}
console.log(envTracked.length === 0 ? '  ok   none tracked' : `  FAIL ${envTracked.length} file(s)`)

// ----------------------------------------------------- 5. the built bundle

console.log('\n# the built bundle, if there is one')
const dist = join(ROOT, 'dist')
if (!existsSync(dist)) {
  console.log('  --   no dist/; run `npm run build` first to check the real output')
} else {
  const built = walk(dist)
  const live = secretsInEnvironment()
  let inBundle = 0
  for (const path of built) {
    const text = read(path)
    for (const name of SERVER_ONLY) {
      if (text.includes(name)) {
        inBundle += 1
        fail(relative(ROOT, path), `the built bundle contains the name ${name}`)
      }
    }
    for (const [shape, label] of NEVER_IN_BUNDLE) {
      if (shape.test(text)) {
        inBundle += 1
        fail(relative(ROOT, path), `the built bundle looks like it contains ${label}`)
      }
    }
    for (const [name] of live) {
      if (text.includes(process.env[name].trim())) {
        inBundle += 1
        // The name, never the value: this message goes to a CI log.
        fail(relative(ROOT, path), `the built bundle contains the value of ${name}`)
      }
    }
  }
  console.log(
    inBundle === 0
      ? `  ok   ${built.length} built files clean` +
          (live.length > 0 ? `, checked against ${live.length} live value(s)` : '')
      : `  FAIL ${inBundle} finding(s)`
  )
  if (live.length === 0) {
    console.log(
      '  --   no server secrets in this environment, so only names and shapes were checked'
    )
  }
}

// ------------------------------------------------------------------ verdict

if (problems.length > 0) {
  console.log('\nfindings:')
  for (const problem of problems) console.log(`  - ${problem}`)
  console.log(`\n${problems.length} problem(s)`)
  process.exit(1)
}
console.log('\nno secret can reach the bundle or the repository by these routes')
