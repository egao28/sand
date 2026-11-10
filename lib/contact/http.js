'use strict'

/*
 * Request plumbing for api/contact.js: how much of a request this endpoint is
 * willing to read, and how it reads it.
 *
 * The size cap is here rather than in the handler because it has to apply
 * before anything else looks at the body. A 4MB POST that is rejected after
 * being parsed has already cost the function its memory and its time.
 */

/*
 * The largest request this endpoint will accept.
 *
 * The fields cap out at 4.3KB of text (100 + 200 + 4000 characters), and a
 * Turnstile token is under 2KB. 16KB leaves room for JSON overhead and for
 * multi-byte characters — a 4000-character message of CJK text is 12KB on its
 * own — and refuses anything that is plainly not a message.
 *
 * Checked twice: against Content-Length before the body is touched, and
 * against the bytes actually read. Content-Length is a claim the client makes,
 * and a chunked request does not have to make it at all.
 */
const MAX_BODY_BYTES = 16 * 1024

/** `Content-Length`, as a number, or null when it is absent or not a number.
 * A request that lies about it is still caught while the body is read. */
function declaredLength(req) {
  const raw = req.headers?.['content-length']
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/** True when the request claims to carry JSON. A `multipart/form-data` post is
 * not something this endpoint knows how to read, and saying so is cheaper than
 * finding out. */
function isJsonRequest(req) {
  const raw = req.headers?.['content-type']
  if (typeof raw !== 'string') return false
  return raw.split(';')[0].trim().toLowerCase() === 'application/json'
}

/** Reads the request stream, giving up the moment it passes `maxBytes` rather
 * than buffering the whole thing and measuring afterwards. */
function readStream(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let settled = false

    const fail = (code) => {
      if (settled) return
      settled = true
      const err = new Error(code)
      err.code = code
      reject(err)
      // Stop the sender rather than keep paying for bytes already refused.
      req.destroy()
    }

    req.on('data', (chunk) => {
      if (settled) return
      size += chunk.length
      if (size > maxBytes) return fail('TOO_LARGE')
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (settled) return
      settled = true
      resolve(Buffer.concat(chunks))
    })
    req.on('error', () => fail('UNREADABLE'))
  })
}

/*
 * Returns `{ value }` with the parsed object, or `{ error }` where error is
 * 'too_large', 'unreadable' or 'not_object'.
 *
 * Two shapes have to be handled. On the host, the platform parses a JSON body
 * and hands it over as `req.body` — the stream is gone by then, so the only
 * thing left to do is measure what arrived. Everywhere else (and for a chunked
 * request) the stream is still there and is read with a cap.
 */
async function readJsonBody(req, maxBytes = MAX_BODY_BYTES) {
  const declared = declaredLength(req)
  if (declared !== null && declared > maxBytes) return { error: 'too_large' }

  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      if (Buffer.byteLength(req.body, 'utf8') > maxBytes) return { error: 'too_large' }
      try {
        return asObject(JSON.parse(req.body))
      } catch {
        return { error: 'unreadable' }
      }
    }
    if (typeof req.body === 'object') {
      // Already parsed by the platform. Measuring the re-serialised form is
      // the only size signal left, and it is close enough to the wire size to
      // refuse the things this cap exists to refuse.
      let serialised
      try {
        serialised = JSON.stringify(req.body)
      } catch {
        return { error: 'unreadable' }
      }
      if (serialised === undefined || Buffer.byteLength(serialised, 'utf8') > maxBytes) {
        return { error: 'too_large' }
      }
      return asObject(req.body)
    }
    return { error: 'not_object' }
  }

  let raw
  try {
    raw = await readStream(req, maxBytes)
  } catch (err) {
    return { error: err.code === 'TOO_LARGE' ? 'too_large' : 'unreadable' }
  }
  if (raw.length === 0) return { error: 'unreadable' }
  try {
    return asObject(JSON.parse(raw.toString('utf8')))
  } catch {
    return { error: 'unreadable' }
  }
}

/** A JSON body that parses to an array, a string or null is not a submission.
 * Arrays are objects to `typeof`, which is exactly the kind of thing that
 * turns into a surprise two functions later. */
function asObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return { error: 'not_object' }
  }
  return { value }
}

/** The client's address as the platform reports it. `x-forwarded-for` is a
 * list when there are proxies in front; the first entry is the client. */
function clientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim() !== '') {
    return forwarded.split(',')[0].trim()
  }
  const real = req.headers?.['x-real-ip']
  if (typeof real === 'string' && real.trim() !== '') return real.trim()
  return req.socket?.remoteAddress ?? 'unknown'
}

module.exports = { MAX_BODY_BYTES, readJsonBody, clientIp, isJsonRequest, declaredLength }
