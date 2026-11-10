#!/usr/bin/env node
/*
 * Tests for api/contact.js (#72).
 *
 * The mail service is stubbed throughout — `fetch` is replaced before every
 * case and the real endpoint is never called, so running this sends no mail to
 * anyone. That is deliberate and is the only way these run: the recipient is a
 * person's actual inbox.
 *
 * What is worth testing here is the thing the UI cannot be trusted on: that
 * the server rejects what it should, that it never reports success the service
 * did not give it, and that the credential and the recipient stay on this
 * side. The styling and the field sizes are not tested — they are CSS numbers,
 * and a test asserting them would just be the stylesheet written twice.
 *
 *   npm run test:contact
 */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const handlerPath = require.resolve('../api/contact.js')

const KEY = 'test-access-key-not-a-real-one'

/** A fresh copy of the module per case, so the in-memory rate-limit and
 * duplicate maps do not leak between tests. */
function loadHandler() {
  delete require.cache[handlerPath]
  return require(handlerPath)
}

function mockRes() {
  const res = {
    statusCode: null,
    body: null,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v
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
  return res
}

function mockReq(body, { method = 'POST', ip = '203.0.113.5' } = {}) {
  return { method, body, headers: { 'x-forwarded-for': ip }, socket: { remoteAddress: ip } }
}

/** Replaces global fetch for one case and records what the handler sent. */
function stubFetch(impl) {
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init, payload: JSON.parse(init.body) })
    return impl()
  }
  return calls
}

const jsonResponse = (status, payload) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
})

const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello — I read your note on reproducible analysis and had a question.',
}

let failures = 0
async function test(name, fn) {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.WEB3FORMS_ACCESS_KEY
  // Several cases drive the handler's failure paths on purpose, and it logs
  // each one. That logging is wanted in production and only noise here.
  const originalError = console.error
  console.error = () => {}
  process.env.WEB3FORMS_ACCESS_KEY = KEY
  try {
    await fn()
    console.log(`  ok   ${name}`)
  } catch (err) {
    failures += 1
    console.log(` FAIL  ${name}`)
    console.log(`       ${err.message.split('\n')[0]}`)
  } finally {
    console.error = originalError
    globalThis.fetch = originalFetch
    if (originalKey === undefined) delete process.env.WEB3FORMS_ACCESS_KEY
    else process.env.WEB3FORMS_ACCESS_KEY = originalKey
  }
}

console.log('\n# a complete, valid message is delivered')
await test('a valid submission reports success and calls the service once', async () => {
  const handler = loadHandler()
  const calls = stubFetch(() => jsonResponse(200, { success: true }))
  const res = mockRes()
  await handler(mockReq(VALID), res)
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body, { ok: true })
  assert.equal(calls.length, 1)
})

await test('the credential is sent to the service and never returned to the browser', async () => {
  const handler = loadHandler()
  const calls = stubFetch(() => jsonResponse(200, { success: true }))
  const res = mockRes()
  await handler(mockReq(VALID), res)
  assert.equal(calls[0].payload.access_key, KEY)
  assert.equal(JSON.stringify(res.body).includes(KEY), false)
})

await test('the visitor becomes Reply-To, never the sender', async () => {
  const handler = loadHandler()
  const calls = stubFetch(() => jsonResponse(200, { success: true }))
  await handler(mockReq(VALID), mockRes())
  assert.equal(calls[0].payload.replyto, VALID.email)
  assert.equal(calls[0].payload.from_name, 'Portfolio contact form')
})

await test('no recipient address travels in the request', async () => {
  const handler = loadHandler()
  const calls = stubFetch(() => jsonResponse(200, { success: true }))
  // Even when the caller tries to supply one.
  await handler(mockReq({ ...VALID, to: 'attacker@example.net' }), mockRes())
  const sent = calls[0].payload
  assert.equal('to' in sent, false)
  assert.equal(JSON.stringify(sent).includes('attacker@example.net'), false)
})

console.log('\n# what the server refuses')
for (const [label, body] of [
  ['no name', { ...VALID, name: '' }],
  ['no email', { ...VALID, email: '' }],
  ['no message', { ...VALID, message: '' }],
  ['whitespace only', { name: '   ', email: '  ', message: '   ' }],
  ['a malformed address', { ...VALID, email: 'ada-at-example.com' }],
  ['an over-long name', { ...VALID, name: 'a'.repeat(101) }],
  ['an over-long message', { ...VALID, message: 'a'.repeat(4001) }],
  ['a newline in the name', { ...VALID, name: 'Ada\r\nBcc: someone@example.net' }],
]) {
  await test(`${label} is rejected with 400 and nothing is sent`, async () => {
    const handler = loadHandler()
    const calls = stubFetch(() => jsonResponse(200, { success: true }))
    const res = mockRes()
    await handler(mockReq(body), res)
    assert.equal(res.statusCode, 400)
    assert.equal(res.body.ok, false)
    assert.ok(res.body.error)
    assert.equal(calls.length, 0, 'the service must not be called')
  })
}

await test('a GET is refused', async () => {
  const handler = loadHandler()
  const calls = stubFetch(() => jsonResponse(200, { success: true }))
  const res = mockRes()
  await handler(mockReq(VALID, { method: 'GET' }), res)
  assert.equal(res.statusCode, 405)
  assert.equal(calls.length, 0)
})

console.log('\n# the service failing is never reported as success')
await test('a service error gives 502 and ok:false', async () => {
  const handler = loadHandler()
  stubFetch(() => jsonResponse(500, { success: false, message: 'upstream exploded' }))
  const res = mockRes()
  await handler(mockReq(VALID), res)
  assert.equal(res.statusCode, 502)
  assert.equal(res.body.ok, false)
})

await test('a 200 with success:false is still a failure', async () => {
  const handler = loadHandler()
  stubFetch(() => jsonResponse(200, { success: false, message: 'invalid access key' }))
  const res = mockRes()
  await handler(mockReq(VALID), res)
  assert.equal(res.statusCode, 502)
  assert.equal(res.body.ok, false)
})

await test('a network failure gives 502 and ok:false', async () => {
  const handler = loadHandler()
  globalThis.fetch = async () => {
    throw new Error('getaddrinfo ENOTFOUND')
  }
  const res = mockRes()
  await handler(mockReq(VALID), res)
  assert.equal(res.statusCode, 502)
  assert.equal(res.body.ok, false)
})

await test('an upstream reply that is not JSON is a failure, not a crash', async () => {
  const handler = loadHandler()
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new Error('Unexpected token < in JSON')
    },
  })
  const res = mockRes()
  await handler(mockReq(VALID), res)
  assert.equal(res.statusCode, 502)
  assert.equal(res.body.ok, false)
})

console.log('\n# with nothing configured, nothing is accepted')
await test('a missing access key gives 503 and never claims delivery', async () => {
  const handler = loadHandler()
  const calls = stubFetch(() => jsonResponse(200, { success: true }))
  delete process.env.WEB3FORMS_ACCESS_KEY
  const res = mockRes()
  await handler(mockReq(VALID), res)
  assert.equal(res.statusCode, 503)
  assert.equal(res.body.ok, false)
  assert.equal(calls.length, 0)
})

console.log('\n# the honeypot, the rate limit and the duplicate guard')
await test('a filled honeypot sends nothing but does not tell the bot', async () => {
  const handler = loadHandler()
  const calls = stubFetch(() => jsonResponse(200, { success: true }))
  const res = mockRes()
  await handler(mockReq({ ...VALID, botcheck: 'http://spam.example' }), res)
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body, { ok: true })
  assert.equal(calls.length, 0, 'nothing may be delivered')
})

await test('the same message twice is delivered once', async () => {
  const handler = loadHandler()
  const calls = stubFetch(() => jsonResponse(200, { success: true }))
  const first = mockRes()
  const second = mockRes()
  await handler(mockReq(VALID), first)
  await handler(mockReq(VALID), second)
  assert.equal(first.statusCode, 200)
  assert.equal(second.statusCode, 200)
  assert.equal(calls.length, 1, 'the duplicate must not be sent again')
})

await test('a sixth message from one address in the window is rate limited', async () => {
  const handler = loadHandler()
  const calls = stubFetch(() => jsonResponse(200, { success: true }))
  let last
  for (let i = 0; i < 6; i += 1) {
    last = mockRes()
    // Distinct messages, so the duplicate guard is not what stops them.
    await handler(mockReq({ ...VALID, message: `${VALID.message} (${i})` }), last)
  }
  assert.equal(last.statusCode, 429)
  assert.equal(calls.length, 5)
})

await test('a different address is not limited by the first one', async () => {
  const handler = loadHandler()
  const calls = stubFetch(() => jsonResponse(200, { success: true }))
  for (let i = 0; i < 5; i += 1) {
    await handler(mockReq({ ...VALID, message: `${VALID.message} (${i})` }), mockRes())
  }
  const other = mockRes()
  await handler(
    mockReq({ ...VALID, message: 'a message from elsewhere' }, { ip: '198.51.100.7' }),
    other
  )
  assert.equal(other.statusCode, 200)
  assert.equal(calls.length, 6)
})

console.log(failures ? `\n${failures} test(s) failed` : '\nall contact API tests passed')
process.exit(failures ? 1 : 0)
