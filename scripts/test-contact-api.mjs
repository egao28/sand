#!/usr/bin/env node
/*
 * Tests for api/contact.js and its helpers.
 *
 * Everything the endpoint talks to is stubbed: Cloudflare's siteverify, the
 * Upstash REST store and Resend. No real network call is made, no real token
 * is verified and no mail is sent. That is not a convenience — the recipient
 * is a person's actual inbox, and a test suite is not allowed to be the thing
 * that floods it. For the same reason nothing here hammers a deployed URL:
 * what is being tested is the decisions this code makes, and those are visible
 * from a stub.
 *
 * The store stub is a small in-memory Redis rather than a `() => true`, so the
 * limiter's real arithmetic runs. Several cases load *two independent copies*
 * of the handler pointed at that one store, which is how an instance boundary
 * is simulated: if a counter ever moved back into module scope, those cases
 * fail.
 *
 *   npm run test:contact
 */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { Readable } from 'node:stream'

const require = createRequire(import.meta.url)
const HANDLER = require.resolve('../api/contact.js')
const LIB = ['http', 'message', 'store', 'turnstile', 'mail'].map((name) =>
  require.resolve(`../lib/contact/${name}.js`)
)

/* Distinctive values, so "did a secret reach the logs or the response" is a
 * substring search rather than a judgement call. Deliberately not shaped like
 * the real credentials: scripts/check-secrets.mjs scans every tracked file for
 * things that look like keys, and a convincing fake here would be a permanent
 * false positive there. */
const SECRETS = {
  RESEND_API_KEY: 'STUB-ONLY-resend-key-8a7b6c',
  TURNSTILE_SECRET_KEY: 'STUB-ONLY-turnstile-secret-9d8e7f',
  UPSTASH_REDIS_REST_TOKEN: 'STUB-ONLY-upstash-token-1a2b3c',
}
const ENV = {
  ...SECRETS,
  UPSTASH_REDIS_REST_URL: 'https://stub-redis.invalid',
  CONTACT_TO_EMAIL: 'owner@example.com',
  CONTACT_FROM_EMAIL: 'Portfolio <form@example.com>',
}

const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello — I read your note on reproducible analysis and had a question.',
  'cf-turnstile-response': 'a-fresh-token',
}

// ---------------------------------------------------------------- the stubs

/** An in-memory stand-in for the three Redis commands this code uses. Shared
 * between "instances" on purpose: that sharing is the thing under test. */
function fakeRedis() {
  const data = new Map()
  const calls = []
  return {
    data,
    calls,
    run(command) {
      const [verb, key] = command
      calls.push(command)
      switch (verb) {
        case 'INCR': {
          const next = (data.get(key) ?? 0) + 1
          data.set(key, next)
          return next
        }
        case 'PEXPIRE':
          return data.has(key) ? 1 : 0
        case 'GET':
          return data.has(key) ? data.get(key) : null
        case 'SET': {
          const value = command[2]
          if (command.includes('NX')) {
            if (data.has(key)) return null
            data.set(key, value)
            return 'OK'
          }
          if (command.includes('XX')) {
            if (!data.has(key)) return command.includes('GET') ? null : null
            const previous = data.get(key)
            data.set(key, value)
            return command.includes('GET') ? previous : 'OK'
          }
          const previous = data.has(key) ? data.get(key) : null
          data.set(key, value)
          return command.includes('GET') ? previous : 'OK'
        }
        case 'DEL':
          return data.delete(key) ? 1 : 0
        default:
          throw new Error(`unexpected command ${verb}`)
      }
    },
  }
}

/** The store key a submission claims, computed the same way the handler does:
 * a sha256 of the three fields, then a sha256 of that for the key. Spelled out
 * here rather than imported so a change to either hop fails loudly. */
function claimKey({ name, email, message }) {
  const print = createHash('sha256').update(`${name}\u0000${email}\u0000${message}`).digest('hex')
  return `contact:sent:${createHash('sha256').update(print).digest('hex').slice(0, 32)}`
}

/** Replaces global fetch and routes by host. Returns the recorded calls. */
function stubNetwork({ redis, turnstile, resend } = {}) {
  const record = { turnstile: [], resend: [], store: [] }
  const verify = turnstile ?? (() => ({ status: 200, body: { success: true } }))
  const deliver = resend ?? (() => ({ status: 200, body: { id: 'resend-id-123' } }))

  globalThis.fetch = async (url, init) => {
    const href = String(url)

    if (href.includes('challenges.cloudflare.com')) {
      record.turnstile.push({ body: new URLSearchParams(init.body), headers: init.headers })
      const out = verify(record.turnstile.length)
      if (out instanceof Error) throw out
      return jsonResponse(out)
    }

    if (href.includes('api.resend.com')) {
      record.resend.push({ payload: JSON.parse(init.body), headers: init.headers })
      const out = deliver(record.resend.length)
      if (out instanceof Error) throw out
      return jsonResponse(out)
    }

    if (href.includes('stub-redis.invalid')) {
      const commands = JSON.parse(init.body)
      record.store.push(commands)
      if (!redis) throw new Error('store unreachable')
      if (redis instanceof Error) throw redis
      if (typeof redis === 'function') {
        const out = redis(commands, record.store.length)
        if (out instanceof Error) throw out
        return jsonResponse(out)
      }
      return jsonResponse({
        status: 200,
        body: commands.map((command) => ({ result: redis.run(command) })),
      })
    }

    throw new Error(`unexpected fetch to ${href}`)
  }
  return record
}

function jsonResponse({ status, body, malformed }) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (malformed) throw new Error('Unexpected token < in JSON')
      return body
    },
  }
}

// --------------------------------------------------------- request/response

function mockRes() {
  return {
    statusCode: null,
    body: null,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

function mockReq(body, { method = 'POST', ip = '203.0.113.5', headers = {}, raw } = {}) {
  const base = {
    method,
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
      ...headers,
    },
    socket: { remoteAddress: ip },
  }
  if (raw) {
    // A real stream, so the size cap is tested the way it actually runs when
    // the platform has not pre-parsed the body.
    const stream = Readable.from([Buffer.from(raw, 'utf8')])
    return Object.assign(stream, base)
  }
  return { ...base, body }
}

/** A fresh copy of every module, so each "instance" starts with empty module
 * scope. Anything that survives between these is shared state the real
 * deployment does not have. */
function loadHandler() {
  for (const path of [HANDLER, ...LIB]) delete require.cache[path]
  return require(HANDLER)
}

// ------------------------------------------------------------- the runner

let failures = 0
const consoleOutput = []

async function test(name, fn, { env = {} } = {}) {
  const originalFetch = globalThis.fetch
  const originalEnv = { ...process.env }
  const originalLog = console.log
  const originalError = console.error
  const captured = []
  console.log = (...args) => captured.push(args.join(' '))
  console.error = (...args) => captured.push(args.join(' '))

  for (const [key, value] of Object.entries({ ...ENV, ...env })) {
    if (value === null) delete process.env[key]
    else process.env[key] = value
  }

  try {
    await fn()
    // Every case, not just the ones that look like they are about logging:
    // the cheapest way to keep a credential out of the logs forever is to
    // check for it on every path the suite walks.
    for (const [name_, secret] of Object.entries(SECRETS)) {
      const leak = captured.find((line) => line.includes(secret))
      assert.equal(leak, undefined, `${name_} appeared in a log line: ${leak}`)
    }
    const urlLeak = captured.find((line) => line.includes(ENV.UPSTASH_REDIS_REST_URL))
    assert.equal(urlLeak, undefined, `the store URL appeared in a log line: ${urlLeak}`)
    consoleOutput.push(...captured)
    originalLog(`  ok   ${name}`)
  } catch (err) {
    failures += 1
    originalLog(` FAIL  ${name}`)
    originalLog(`       ${String(err.message).split('\n')[0]}`)
  } finally {
    console.log = originalLog
    console.error = originalError
    globalThis.fetch = originalFetch
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key]
    }
    Object.assign(process.env, originalEnv)
  }
}

function section(title) {
  console.log(`\n# ${title}`)
}

/** Drives one submission end to end against a stubbed world. */
async function submit(body, options = {}) {
  const { handler = loadHandler(), net, ...reqOptions } = options
  const res = mockRes()
  await handler(mockReq(body, reqOptions), res)
  return { res, net }
}

/** The common case: one handler, one store, everything saying yes. */
function world(overrides = {}) {
  const redis = overrides.redis === undefined ? fakeRedis() : overrides.redis
  const net = stubNetwork({ ...overrides, redis })
  return { redis, net }
}

// ============================================================ 1. Turnstile

section('1. a submission without a good Turnstile token is never delivered')

for (const [label, token] of [
  ['no token field at all', undefined],
  ['an empty token', ''],
  ['a whitespace token', '   '],
  ['a token that is not a string', 12345],
  ['a token that is an object', { response: 'x' }],
  ['a token past the length cap', 'a'.repeat(5000)],
]) {
  await test(`${label} is refused with 403 and nothing is sent`, async () => {
    const { net } = world()
    const body = { ...VALID }
    if (token === undefined) delete body['cf-turnstile-response']
    else body['cf-turnstile-response'] = token
    const { res } = await submit(body)
    assert.equal(res.statusCode, 403)
    assert.equal(res.body.ok, false)
    assert.equal(net.resend.length, 0, 'no mail may be sent')
    // A token this code can see is bad never costs a call to Cloudflare.
    assert.equal(net.turnstile.length, 0, 'siteverify should not be called')
  })
}

for (const [label, codes] of [
  ['a forged token', ['invalid-input-response']],
  ['an expired or replayed token', ['timeout-or-duplicate']],
  ['a token for another site key', ['invalid-input-response', 'invalid-widget-id']],
]) {
  await test(`${label} is refused with 403 and nothing is sent`, async () => {
    const { net } = world({
      turnstile: () => ({ status: 200, body: { success: false, 'error-codes': codes } }),
    })
    const { res } = await submit({ ...VALID })
    assert.equal(res.statusCode, 403)
    assert.equal(net.turnstile.length, 1, 'the token should have been checked')
    assert.equal(net.resend.length, 0, 'no mail may be sent')
  })
}

await test('a verified token is checked with the secret and then delivered', async () => {
  const { net } = world()
  const { res } = await submit({ ...VALID })
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body, { ok: true })
  assert.equal(net.turnstile.length, 1)
  assert.equal(net.turnstile[0].body.get('secret'), SECRETS.TURNSTILE_SECRET_KEY)
  assert.equal(net.turnstile[0].body.get('response'), VALID['cf-turnstile-response'])
  assert.equal(net.resend.length, 1)
})

await test('the caller IP is not sent to Cloudflare unless it is asked for', async () => {
  const { net } = world()
  await submit({ ...VALID })
  assert.equal(net.turnstile[0].body.get('remoteip'), null)
})

await test(
  'TURNSTILE_CHECK_REMOTE_IP=true binds the token to the caller',
  async () => {
    const { net } = world()
    await submit({ ...VALID }, { ip: '198.51.100.9' })
    assert.equal(net.turnstile[0].body.get('remoteip'), '198.51.100.9')
  },
  { env: { TURNSTILE_CHECK_REMOTE_IP: 'true' } }
)

await test('verification happens before delivery, not alongside it', async () => {
  const { net } = world({
    turnstile: () => ({ status: 200, body: { success: false, 'error-codes': ['bad'] } }),
  })
  await submit({ ...VALID })
  assert.equal(net.resend.length, 0, 'Resend must not be called speculatively')
})

// ====================================================== 2. the rate limit

section('2. the rate limit is shared, not per instance')

await test('the sixth message in the window is refused even across instances', async () => {
  const { redis, net } = world()
  let last
  for (let i = 0; i < 6; i += 1) {
    // A new module copy every time: module scope is empty, so anything that
    // counts has to be counting in the store.
    last = (
      await submit({ ...VALID, message: `${VALID.message} (${i})` }, { handler: loadHandler() })
    ).res
  }
  assert.equal(last.statusCode, 429)
  assert.equal(net.resend.length, 5, 'five delivered, the sixth refused')
  assert.ok(
    [...redis.data.keys()].some((key) => key.startsWith('contact:rl:ip:')),
    'the counter must live in the shared store'
  )
})

await test('a different address is not limited by the first one', async () => {
  const { net } = world()
  for (let i = 0; i < 5; i += 1) {
    await submit({ ...VALID, message: `${VALID.message} (${i})` }, { handler: loadHandler() })
  }
  const { res } = await submit(
    { ...VALID, message: 'a message from elsewhere' },
    { handler: loadHandler(), ip: '198.51.100.7' }
  )
  assert.equal(res.statusCode, 200)
  assert.equal(net.resend.length, 6)
})

await test(
  'a global ceiling bounds what every address together can send',
  async () => {
    const { net } = world()
    let last
    for (let i = 0; i < 4; i += 1) {
      last = (
        await submit(
          { ...VALID, message: `message ${i}` },
          { handler: loadHandler(), ip: `203.0.113.${20 + i}` }
        )
      ).res
    }
    assert.equal(last.statusCode, 429, 'the fourth overall is past the global cap of 3')
    assert.equal(net.resend.length, 3)
  },
  { env: { CONTACT_RATE_GLOBAL: '3', CONTACT_RATE_PER_IP: '50' } }
)

await test(
  'the limit is counted before Turnstile, so a flood cannot become a siteverify flood',
  async () => {
    const { net } = world()
    for (let i = 0; i < 7; i += 1) {
      await submit({ ...VALID, message: `message ${i}` }, { handler: loadHandler() })
    }
    assert.equal(net.turnstile.length, 5, 'the refused requests never reached Cloudflare')
  },
  { env: { CONTACT_RATE_PER_IP: '5' } }
)

// ========================================================== 3. the secrets

section('3. secrets stay on the server')

await test('no secret is ever returned to the browser', async () => {
  const seen = []
  for (const scenario of [
    () => world(),
    () =>
      world({ turnstile: () => ({ status: 200, body: { success: false, 'error-codes': ['x'] } }) }),
    () => world({ turnstile: () => ({ status: 500, body: {} }) }),
    () => world({ resend: () => ({ status: 422, body: { message: 'bad from' } }) }),
    () => world({ redis: new Error('down') }),
  ]) {
    scenario()
    const { res } = await submit({ ...VALID }, { handler: loadHandler() })
    seen.push(JSON.stringify(res.body))
  }
  for (const body of seen) {
    for (const [name, secret] of Object.entries(SECRETS)) {
      assert.equal(body.includes(secret), false, `${name} reached the response body`)
    }
  }
})

await test('the Resend key travels as a bearer header, not in the payload', async () => {
  const { net } = world()
  await submit({ ...VALID })
  assert.equal(net.resend[0].headers.Authorization, `Bearer ${SECRETS.RESEND_API_KEY}`)
  assert.equal(
    JSON.stringify(net.resend[0].payload).includes(SECRETS.RESEND_API_KEY),
    false,
    'the key must not be in the mail payload'
  )
})

await test('the store token travels as a bearer header to the store and nowhere else', async () => {
  const { net } = world()
  await submit({ ...VALID })
  assert.equal(
    JSON.stringify(net.turnstile[0].body.toString()).includes(SECRETS.UPSTASH_REDIS_REST_TOKEN),
    false
  )
  assert.equal(JSON.stringify(net.resend[0]).includes(SECRETS.UPSTASH_REDIS_REST_TOKEN), false)
})

await test('the Turnstile secret never goes to Resend', async () => {
  const { net } = world()
  await submit({ ...VALID })
  assert.equal(JSON.stringify(net.resend[0]).includes(SECRETS.TURNSTILE_SECRET_KEY), false)
})

// ============================================== 4. the envelope is the server's

section('4. the recipient and the sender are the server’s, not the request’s')

await test('to and from come from the environment', async () => {
  const { net } = world()
  await submit({ ...VALID })
  assert.deepEqual(net.resend[0].payload.to, [ENV.CONTACT_TO_EMAIL])
  assert.equal(net.resend[0].payload.from, ENV.CONTACT_FROM_EMAIL)
})

await test('a request cannot name a recipient, a sender or a body', async () => {
  const { net } = world()
  const { res } = await submit({
    ...VALID,
    to: 'attacker@evil.example',
    from: 'ceo@example.com',
    cc: 'list@evil.example',
    bcc: 'archive@evil.example',
    reply_to: 'attacker@evil.example',
    replyTo: 'attacker@evil.example',
    subject: 'Account verification required',
    html: '<a href="https://evil.example">click</a>',
    text: 'click https://evil.example',
    headers: { 'X-Forged': 'yes' },
    attachments: [{ filename: 'x.exe', content: 'AAAA' }],
    tags: [{ name: 'x', value: 'y' }],
  })
  assert.equal(res.statusCode, 200)
  const sent = JSON.stringify(net.resend[0].payload)
  assert.equal(sent.includes('evil.example'), false, 'nothing attacker-supplied may reach the mail')
  assert.equal(net.resend[0].payload.subject, 'Portfolio contact from Ada Lovelace')
  assert.deepEqual(net.resend[0].payload.to, [ENV.CONTACT_TO_EMAIL])
  assert.equal('cc' in net.resend[0].payload, false)
  assert.equal('bcc' in net.resend[0].payload, false)
  assert.equal('attachments' in net.resend[0].payload, false)
  assert.equal('headers' in net.resend[0].payload, false)
})

await test('the visitor becomes Reply-To and never the sender', async () => {
  const { net } = world()
  await submit({ ...VALID })
  assert.equal(net.resend[0].payload.reply_to, VALID.email)
  assert.notEqual(net.resend[0].payload.from, VALID.email)
})

// ============================================= 5. validation, escaping, size

section('5. what the server refuses, and what it escapes')

for (const [label, body] of [
  ['no name', { ...VALID, name: '' }],
  ['no email', { ...VALID, email: '' }],
  ['no message', { ...VALID, message: '' }],
  ['whitespace only', { ...VALID, name: '   ', email: '  ', message: '   ' }],
  ['a malformed address', { ...VALID, email: 'ada-at-example.com' }],
  ['an over-long name', { ...VALID, name: 'a'.repeat(101) }],
  ['an over-long address', { ...VALID, email: `${'a'.repeat(200)}@example.com` }],
  ['an over-long message', { ...VALID, message: 'a'.repeat(4001) }],
  ['a one-character message', { ...VALID, message: 'a' }],
  ['a newline in the name', { ...VALID, name: 'Ada\r\nBcc: someone@evil.example' }],
  ['a newline in the address', { ...VALID, email: 'ada@example.com\nBcc: x@evil.example' }],
  ['a NUL in the message', { ...VALID, message: 'hello\u0000world' }],
  ['a line separator in the name', { ...VALID, name: 'Ada Lovelace' }],
  ['a name that is a number', { ...VALID, name: 42 }],
  ['a message that is an array', { ...VALID, message: ['a', 'b'] }],
]) {
  await test(`${label} is refused with 400 and nothing is sent`, async () => {
    const { net } = world()
    const { res } = await submit(body)
    assert.equal(res.statusCode, 400)
    assert.equal(res.body.ok, false)
    assert.ok(res.body.error)
    assert.equal(net.resend.length, 0)
    assert.equal(net.turnstile.length, 0, 'a malformed request never costs a verification')
  })
}

await test('a GET is refused', async () => {
  const { net } = world()
  const { res } = await submit({ ...VALID }, { method: 'GET' })
  assert.equal(res.statusCode, 405)
  assert.equal(net.resend.length, 0)
})

await test('a non-JSON content type is refused', async () => {
  const { net } = world()
  const { res } = await submit({ ...VALID }, { headers: { 'content-type': 'text/plain' } })
  assert.equal(res.statusCode, 415)
  assert.equal(net.resend.length, 0)
})

await test('a body that is an array, not an object, is refused', async () => {
  const { net } = world()
  const { res } = await submit([VALID])
  assert.equal(res.statusCode, 400)
  assert.equal(net.resend.length, 0)
})

await test('a request that declares a huge Content-Length is refused with 413', async () => {
  const { net } = world()
  const { res } = await submit(
    { ...VALID },
    { headers: { 'content-length': String(5 * 1024 * 1024) } }
  )
  assert.equal(res.statusCode, 413)
  assert.equal(net.resend.length, 0)
})

await test('a huge pre-parsed body is refused with 413', async () => {
  const { net } = world()
  const { res } = await submit({ ...VALID, message: 'a'.repeat(200_000) })
  assert.equal(res.statusCode, 413)
  assert.equal(net.resend.length, 0)
})

await test('a huge streamed body is cut off and refused with 413', async () => {
  const { net } = world()
  // No content-length at all, so the cap has to hold while reading.
  const raw = JSON.stringify({ ...VALID, message: 'a'.repeat(100_000) })
  const { res } = await submit(null, { raw })
  assert.equal(res.statusCode, 413)
  assert.equal(net.resend.length, 0)
})

await test('a normal streamed body is read and delivered', async () => {
  const { net } = world()
  const { res } = await submit(null, { raw: JSON.stringify(VALID) })
  assert.equal(res.statusCode, 200)
  assert.equal(net.resend.length, 1)
})

await test('unparseable JSON is refused with 400', async () => {
  const { net } = world()
  const { res } = await submit(null, { raw: '{"name": "Ada", ' })
  assert.equal(res.statusCode, 400)
  assert.equal(net.resend.length, 0)
})

await test('the text body is plain and the HTML body is escaped', async () => {
  const { net } = world()
  const nasty = {
    ...VALID,
    name: 'Ada <img src=x onerror=alert(1)>',
    message: 'Compare a < b && c > d, and see "quotes" & \'apostrophes\'.\nSecond line.',
  }
  await submit(nasty)
  const { text, html, subject } = net.resend[0].payload

  // Plain text, carrying the message exactly as typed and parsing as nothing.
  assert.ok(text.includes(nasty.message), 'the plain body keeps the message verbatim')
  assert.equal(text.includes('<'), true, 'plain text is allowed to contain <')

  // HTML, carrying no tag the visitor wrote. The strong form of that: every
  // tag in the finished document is one this codebase put there. The word
  // "onerror" does survive as text, which is the point — it is text now.
  const tags = [...html.matchAll(/<\/?([a-zA-Z][\w-]*)/g)].map((match) => match[1].toLowerCase())
  assert.deepEqual(
    [...new Set(tags)].sort(),
    ['a', 'div', 'hr', 'p', 'strong'],
    'a tag the visitor wrote reached the HTML body'
  )
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'))
  assert.ok(html.includes('a &lt; b &amp;&amp; c &gt; d'))
  assert.ok(html.includes('&quot;quotes&quot;'))
  assert.ok(html.includes('&#39;apostrophes&#39;'))

  // The subject is one line, whatever the name was.
  assert.equal(/[\r\n]/.test(subject), false)
})

await test('an address with a quote cannot break out of the mailto href', async () => {
  const { net } = world()
  await submit({ ...VALID, email: 'a"onmouseover=x@example.com' })
  const { html } = net.resend[0].payload
  assert.equal(html.includes('"onmouseover'), false)
  assert.ok(html.includes('&quot;onmouseover'))
})

await test('the honeypot sends nothing and does not tell the bot', async () => {
  const { net } = world()
  const { res } = await submit({ ...VALID, botcheck: 'http://spam.example' })
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body, { ok: true })
  assert.equal(net.resend.length, 0, 'nothing may be delivered')
  assert.equal(net.turnstile.length, 0, 'and nothing may be spent checking it')
})

// ======================================================= 6. no double sends

section('6. a repeat, a race and a retry never deliver twice')

await test('the same message twice, on two instances, is delivered once', async () => {
  const { net } = world()
  const first = await submit({ ...VALID }, { handler: loadHandler() })
  const second = await submit({ ...VALID }, { handler: loadHandler() })
  assert.equal(first.res.statusCode, 200)
  assert.equal(second.res.statusCode, 200, 'the visitor is told it arrived, because it did')
  assert.equal(net.resend.length, 1, 'the duplicate must not be sent again')
})

await test('two identical submissions racing are delivered once', async () => {
  const { net } = world()
  const handlers = [loadHandler(), loadHandler(), loadHandler()]
  const results = await Promise.all(handlers.map((handler) => submit({ ...VALID }, { handler })))
  assert.deepEqual(
    results.map((r) => r.res.statusCode),
    [200, 200, 200]
  )
  assert.equal(net.resend.length, 1, 'SET NX must let exactly one through')
})

await test('the claim is an atomic SET NX in the shared store', async () => {
  const { redis } = world()
  await submit({ ...VALID })
  const claims = redis.calls.filter((c) => c[0] === 'SET' && c[1].startsWith('contact:sent:'))
  assert.ok(claims[0].includes('NX'), 'the claim is taken with NX')
  assert.ok(claims[0][1].startsWith('contact:sent:'))
  // The message itself is not what is stored.
  assert.equal(claims[0][1].includes(VALID.email), false)
  assert.equal(String(claims[0][2]).includes(VALID.email), false)
  // And it is marked delivered afterwards, not before.
  assert.equal(claims.length, 2)
  assert.ok(String(claims[1][2]).startsWith('s:'), 'the second write records delivery')
})

await test('a claim left pending by a function that died is taken over, not honoured', async () => {
  const { redis, net } = world()
  // What a crash between claiming and sending leaves behind: a pending claim,
  // older than any run could still be alive, and no mail.
  const handler = loadHandler()
  redis.data.set(claimKey(VALID), `p:${Date.now() - 5 * 60 * 1000}`)

  const res = mockRes()
  await handler(mockReq({ ...VALID }), res)
  assert.equal(res.statusCode, 200)
  assert.equal(net.resend.length, 1, 'the retry must actually send, not be swallowed')
  assert.ok(String(redis.data.get(claimKey(VALID))).startsWith('s:'))
})

await test('a claim that is pending but fresh is treated as in flight', async () => {
  const { redis, net } = world()
  const handler = loadHandler()
  redis.data.set(claimKey(VALID), `p:${Date.now() - 500}`)

  const res = mockRes()
  await handler(mockReq({ ...VALID }), res)
  assert.equal(res.statusCode, 200)
  assert.equal(net.resend.length, 0, 'the other request is delivering it')
})

await test('Resend is given a stable idempotency key as a second guard', async () => {
  const { net } = world()
  await submit({ ...VALID }, { handler: loadHandler() })
  const key = net.resend[0].headers['Idempotency-Key']
  assert.ok(key && key.length >= 32)
  // Same submission, fresh store, so the claim does not stop it: the key still
  // matches, which is what makes it a guard at Resend's end too.
  const second = world()
  await submit({ ...VALID }, { handler: loadHandler() })
  assert.equal(second.net.resend[0].headers['Idempotency-Key'], key)
})

await test('a failed delivery releases the claim so the retry can go through', async () => {
  let attempt = 0
  const { net } = world({
    resend: () => {
      attempt += 1
      return attempt === 1
        ? { status: 500, body: { message: 'upstream' } }
        : { status: 200, body: { id: 'ok' } }
    },
  })
  const first = await submit({ ...VALID }, { handler: loadHandler() })
  assert.equal(first.res.statusCode, 502, 'the visitor is told it failed')
  const second = await submit({ ...VALID }, { handler: loadHandler() })
  assert.equal(second.res.statusCode, 200, 'the retry must not be swallowed as a duplicate')
  assert.equal(net.resend.length, 2)
})

await test('a different message from the same person is not a duplicate', async () => {
  const { net } = world()
  await submit({ ...VALID }, { handler: loadHandler() })
  const { res } = await submit(
    { ...VALID, message: 'One more thing I forgot to ask.' },
    { handler: loadHandler() }
  )
  assert.equal(res.statusCode, 200)
  assert.equal(net.resend.length, 2)
})

// ================================================== 7. failures fail closed

section('7. a protection that cannot be checked is not skipped')

await test('an unreachable store gives 503 and sends nothing', async () => {
  const { net } = world({ redis: new Error('ECONNREFUSED') })
  const { res } = await submit({ ...VALID })
  assert.equal(res.statusCode, 503)
  assert.equal(res.body.ok, false)
  assert.equal(net.resend.length, 0)
  assert.equal(net.turnstile.length, 0)
})

await test('a store that returns 500 gives 503 and sends nothing', async () => {
  const { net } = world({ redis: () => ({ status: 500, body: { error: 'oh no' } }) })
  const { res } = await submit({ ...VALID })
  assert.equal(res.statusCode, 503)
  assert.equal(net.resend.length, 0)
})

await test('a store that rejects the credential gives 503 and sends nothing', async () => {
  const { net } = world({ redis: () => ({ status: 401, body: { error: 'unauthorized' } }) })
  const { res } = await submit({ ...VALID })
  assert.equal(res.statusCode, 503)
  assert.equal(net.resend.length, 0)
})

await test('a store that errors on one command gives 503 and sends nothing', async () => {
  const { net } = world({
    redis: () => ({ status: 200, body: [{ result: 1 }, { error: 'WRONGTYPE' }] }),
  })
  const { res } = await submit({ ...VALID })
  assert.equal(res.statusCode, 503)
  assert.equal(net.resend.length, 0)
})

await test(
  'an unconfigured store gives 503 and sends nothing',
  async () => {
    const { net } = world()
    const { res } = await submit({ ...VALID })
    assert.equal(res.statusCode, 503)
    assert.equal(net.resend.length, 0)
  },
  { env: { UPSTASH_REDIS_REST_URL: null, UPSTASH_REDIS_REST_TOKEN: null } }
)

await test('an unreachable Cloudflare gives 503 and sends nothing', async () => {
  const { net } = world({ turnstile: () => new Error('ETIMEDOUT') })
  const { res } = await submit({ ...VALID })
  assert.equal(res.statusCode, 503)
  assert.equal(net.resend.length, 0)
})

await test('a Cloudflare 5xx gives 503 and sends nothing', async () => {
  const { net } = world({ turnstile: () => ({ status: 503, body: {} }) })
  const { res } = await submit({ ...VALID })
  assert.equal(res.statusCode, 503)
  assert.equal(net.resend.length, 0)
})

await test('an unreadable Cloudflare reply gives 503 and sends nothing', async () => {
  const { net } = world({ turnstile: () => ({ status: 200, malformed: true }) })
  const { res } = await submit({ ...VALID })
  assert.equal(res.statusCode, 503)
  assert.equal(net.resend.length, 0)
})

await test('a wrong Turnstile secret is our fault, not the visitor’s: 503, not 403', async () => {
  const { net } = world({
    turnstile: () => ({
      status: 200,
      body: { success: false, 'error-codes': ['invalid-input-secret'] },
    }),
  })
  const { res } = await submit({ ...VALID })
  assert.equal(res.statusCode, 503, 'telling a visitor to try again would be a lie')
  assert.equal(net.resend.length, 0)
})

for (const [label, missing] of [
  ['RESEND_API_KEY', { RESEND_API_KEY: null }],
  ['CONTACT_TO_EMAIL', { CONTACT_TO_EMAIL: null }],
  ['CONTACT_FROM_EMAIL', { CONTACT_FROM_EMAIL: null }],
  ['TURNSTILE_SECRET_KEY', { TURNSTILE_SECRET_KEY: null }],
]) {
  await test(
    `a missing ${label} gives 503 and never claims delivery`,
    async () => {
      const { net } = world()
      const { res } = await submit({ ...VALID })
      assert.equal(res.statusCode, 503)
      assert.equal(res.body.ok, false)
      assert.equal(net.resend.length, 0)
      assert.equal(net.turnstile.length, 0)
      assert.equal(net.store.length, 0, 'an unconfigured deploy spends nothing')
    },
    { env: missing }
  )
}

await test('a Resend rejection is never reported as success', async () => {
  const { net } = world({
    resend: () => ({ status: 422, body: { message: 'from is not verified' } }),
  })
  const { res } = await submit({ ...VALID })
  assert.equal(res.statusCode, 502)
  assert.equal(res.body.ok, false)
  assert.equal(net.resend.length, 1)
})

await test('a Resend 200 with no id is still a failure', async () => {
  const { res } = await (async () => {
    world({ resend: () => ({ status: 200, body: { message: 'queued, maybe' } }) })
    return submit({ ...VALID })
  })()
  assert.equal(res.statusCode, 502)
  assert.equal(res.body.ok, false)
})

await test('a network failure reaching Resend gives 502, not ok', async () => {
  world({ resend: () => new Error('ENOTFOUND') })
  const { res } = await submit({ ...VALID })
  assert.equal(res.statusCode, 502)
  assert.equal(res.body.ok, false)
})

await test('an unreadable Resend reply gives 502, not ok', async () => {
  world({ resend: () => ({ status: 200, malformed: true }) })
  const { res } = await submit({ ...VALID })
  assert.equal(res.statusCode, 502)
  assert.equal(res.body.ok, false)
})

// ======================================================== logs and origins

section('8. logs, and the optional origin check')

await test('no log line carries an address, a message or a token', async () => {
  const lines = []
  const originalLog = console.log
  const originalError = console.error
  console.log = (...a) => lines.push(a.join(' '))
  console.error = (...a) => lines.push(a.join(' '))
  try {
    world()
    await submit({ ...VALID }, { handler: loadHandler() })
    world({
      turnstile: () => ({
        status: 200,
        body: { success: false, 'error-codes': ['bad\ninjected'] },
      }),
    })
    await submit({ ...VALID }, { handler: loadHandler() })
  } finally {
    console.log = originalLog
    console.error = originalError
  }
  const all = lines.join('\n')
  assert.equal(all.includes(VALID.email), false, 'the visitor address reached the log')
  assert.equal(all.includes('reproducible analysis'), false, 'the message reached the log')
  assert.equal(all.includes(VALID['cf-turnstile-response']), false, 'the token reached the log')
  // A newline in a Cloudflare error code must not become a second log line.
  const injected = lines.find((line) => line.includes('injected'))
  assert.ok(injected, 'the code should still be reported')
  assert.equal(injected.includes('\n'), false, 'scrubbed to one line')
})

await test(
  'with an origin allowlist set, another site is refused',
  async () => {
    const { net } = world()
    const { res } = await submit({ ...VALID }, { headers: { origin: 'https://evil.example' } })
    assert.equal(res.statusCode, 403)
    assert.equal(net.resend.length, 0)
  },
  { env: { CONTACT_ALLOWED_ORIGINS: 'https://example.com' } }
)

await test(
  'with an origin allowlist set, the site itself is allowed',
  async () => {
    const { net } = world()
    const { res } = await submit({ ...VALID }, { headers: { origin: 'https://example.com' } })
    assert.equal(res.statusCode, 200)
    assert.equal(net.resend.length, 1)
  },
  { env: { CONTACT_ALLOWED_ORIGINS: 'https://example.com' } }
)

await test('no CORS header is ever set', async () => {
  world()
  const { res } = await submit({ ...VALID })
  const names = Object.keys(res.headers).map((key) => key.toLowerCase())
  assert.equal(
    names.some((name) => name.startsWith('access-control-')),
    false
  )
})

console.log(failures ? `\n${failures} test(s) failed` : `\nall contact API tests passed`)
process.exit(failures ? 1 : 0)
