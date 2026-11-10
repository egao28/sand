'use strict'

/*
 * POST /api/contact — the contact form's delivery path.
 *
 * Why there is a server step at all: the form used to call a mail service
 * straight from the browser with the submit key compiled into the bundle.
 * Anything in the bundle is public, and the recipient travelled in the request
 * body, where a visitor could edit it. Here the credentials are environment
 * variables the browser never sees, and both ends of the envelope are read
 * from the environment inside lib/contact/mail.js — there is no parameter a
 * request could reach.
 *
 * The order of the checks below is the design, not an accident. Each step is
 * cheaper than the one after it, and each one that fails ends the request:
 *
 *   1.  method, origin, content type        headers only
 *   2.  size                                before the body is read
 *   3.  shape and honeypot                  local
 *   4.  field validation                    local
 *   5.  configuration                       local, and fails closed
 *   6.  rate limit                          one round trip to Redis
 *   7.  Turnstile                           one round trip to Cloudflare
 *   8.  duplicate claim                     one atomic SET NX
 *   9.  delivery                            Resend
 *
 * The rate limit comes before Turnstile so that a flood cannot be turned into
 * a flood of siteverify calls, and both come before Resend so that neither a
 * flood nor a bot can spend the mail quota.
 *
 * What this is not: proof against a determined attacker. A distributed botnet
 * with solved challenges can still fill the mailbox, and nothing in a public
 * form can prevent that outright. What it does is make the mailbox cost
 * something to reach, keep the credentials off the client, and refuse rather
 * than guess whenever a protection cannot be checked.
 *
 * Environment — every one of these is required, and the endpoint answers 503
 * to every submission until they are all present:
 *
 *   RESEND_API_KEY             Resend API key.                      secret
 *   CONTACT_TO_EMAIL           the mailbox this form delivers to.
 *   CONTACT_FROM_EMAIL         sender on a domain verified in Resend.
 *   TURNSTILE_SECRET_KEY       secret half of the Turnstile key pair. secret
 *   UPSTASH_REDIS_REST_URL     shared store for the rate limit and the
 *   UPSTASH_REDIS_REST_TOKEN   duplicate guard (or the KV_ equivalents). secret
 *
 * Optional:
 *
 *   CONTACT_ALLOWED_ORIGINS    comma-separated; when set, an Origin header
 *                              that is present and not on the list is refused.
 *   TURNSTILE_CHECK_REMOTE_IP  'true' to bind the token to the caller's IP.
 *   CONTACT_RATE_PER_IP        default 5
 *   CONTACT_RATE_WINDOW_MIN    default 10
 *   CONTACT_RATE_GLOBAL        default 60 per hour, across everyone
 */

/* The helpers live in lib/contact/, not in api/. Vercel turns every file under
 * api/ into an endpoint unless it is prefixed with an underscore, and its own
 * docs advise against keeping shared modules there at all; bundling them from
 * outside api/ is the documented layout and avoids the reports of `api/_lib`
 * helpers not making it into a function's bundle. `require` traces across the
 * repo root the same either way. */
const { readJsonBody, clientIp, isJsonRequest, MAX_BODY_BYTES } = require('../lib/contact/http.js')
const {
  validate,
  honeypot,
  token: readToken,
  buildEmail,
  LIMITS,
} = require('../lib/contact/message.js')
const store = require('../lib/contact/store.js')
const turnstile = require('../lib/contact/turnstile.js')
const mail = require('../lib/contact/mail.js')
const { createHash } = require('node:crypto')

/** How long an identical submission is remembered. Long enough to cover a
 * double click, a double-tap on a phone, a refresh-and-resubmit and a retry
 * after a timeout; short enough that someone who genuinely means to write
 * twice is not blocked for the afternoon. */
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000

function positiveInt(value, fallback) {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : fallback
}

function rateLimits() {
  const windowMs = positiveInt(process.env.CONTACT_RATE_WINDOW_MIN, 10) * 60 * 1000
  return [
    {
      name: 'ip',
      limit: positiveInt(process.env.CONTACT_RATE_PER_IP, 5),
      windowMs,
    },
    {
      // The ceiling that bounds the bill. One address behaving itself is not
      // the thing that empties a mail quota; a thousand addresses each sending
      // their allowance is.
      name: 'all',
      limit: positiveInt(process.env.CONTACT_RATE_GLOBAL, 60),
      windowMs: 60 * 60 * 1000,
    },
  ]
}

/*
 * Logging.
 *
 * Server logs are read by people and shipped to third parties, so nothing that
 * reaches them here is a secret or a visitor's words: no API keys (they are
 * never passed to this function in the first place), no Turnstile token, no
 * email address, no message body. What is left is an event name, a status, and
 * short fixed-vocabulary reasons — which is what is actually useful when
 * something is wrong at 2am.
 *
 * `scrub` exists for the one field that is not fixed vocabulary, the Turnstile
 * error codes, which come from Cloudflare. A newline in a log line is how a
 * forged log entry gets written.
 */
function scrub(value) {
  return String(value)
    .replace(/[^\w .:/@-]+/g, ' ')
    .trim()
    .slice(0, 120)
}

function logEvent(event, details = {}) {
  const parts = [`contact: ${event}`]
  for (const [key, value] of Object.entries(details)) {
    if (value === undefined || value === null) continue
    parts.push(`${key}=${scrub(value)}`)
  }
  console.log(parts.join(' '))
}

/** The same string the store claims on and Resend's idempotency key uses. A
 * hash, so neither the store nor a log line ever holds the message. */
function fingerprint(fields) {
  return createHash('sha256')
    .update(`${fields.name}\u0000${fields.email}\u0000${fields.message}`)
    .digest('hex')
}

function refuse(res, status, error, log) {
  if (log) logEvent(log.event, { status, ...log.details })
  return res.status(status).json({ ok: false, error })
}

/** The answer a bot gets, and the answer a duplicate gets. Both are `ok` on
 * purpose: a bot told it was caught retries with the trap left empty, and a
 * duplicate's message really did arrive — the first time. */
function quietOk(res, log) {
  if (log) logEvent(log.event, log.details)
  return res.status(200).json({ ok: true })
}

const ORIGIN_MISMATCH = 'This request did not come from the site.'
const UNAVAILABLE = 'The contact form is not available right now — please email directly instead.'
const SEND_FAILED = 'Your message could not be sent — please email directly instead.'

module.exports = async function handler(req, res) {
  // No CORS headers anywhere in this file. The form is served from the same
  // origin as this function, so it does not need them, and adding them would
  // be handing every other site on the internet a way to post here.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return refuse(res, 405, 'Method not allowed.', { event: 'method-refused' })
  }

  const allowed = (process.env.CONTACT_ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const origin = req.headers?.origin
  if (
    allowed.length > 0 &&
    typeof origin === 'string' &&
    origin !== '' &&
    !allowed.includes(origin)
  ) {
    // Only checked when the header is there. A header a client controls is not
    // a security boundary; this is here to turn away the lazy cross-site post,
    // and Turnstile is what actually ties a submission to this site.
    return refuse(res, 403, ORIGIN_MISMATCH, { event: 'origin-refused' })
  }

  if (!isJsonRequest(req)) {
    return refuse(res, 415, 'This endpoint accepts JSON.', { event: 'content-type-refused' })
  }

  const { value: body, error: bodyError } = await readJsonBody(req, MAX_BODY_BYTES)
  if (bodyError === 'too_large') {
    return refuse(res, 413, 'That message is too long.', {
      event: 'body-too-large',
      details: { limit: MAX_BODY_BYTES },
    })
  }
  if (bodyError) {
    return refuse(res, 400, 'Could not read that request.', {
      event: 'body-unreadable',
      details: { reason: bodyError },
    })
  }

  // The honeypot, checked again here: a script posting straight to this
  // endpoint never loaded the page, so it never saw which field was the trap.
  if (honeypot(body) !== '') {
    return quietOk(res, { event: 'honeypot' })
  }

  const { fields, error: invalid } = validate(body)
  if (invalid) {
    return refuse(res, 400, invalid, { event: 'validation-refused' })
  }

  // Configuration is checked after validation and before anything leaves the
  // building, so a half-configured deploy cannot spend a Cloudflare or Redis
  // call on a request it was never going to deliver. Loud on the server, vague
  // to the visitor, and emphatically not a success: a form that says "sent"
  // with nothing configured is the exact failure this endpoint exists to
  // prevent.
  const missing = [
    ...mail.missingConfig(),
    ...(turnstile.isConfigured() ? [] : ['TURNSTILE_SECRET_KEY']),
    ...(store.isConfigured() ? [] : ['UPSTASH_REDIS_REST_URL/TOKEN']),
  ]
  if (missing.length > 0) {
    // Names of variables, never their values.
    console.error(`contact: refusing submissions — not configured: ${missing.join(', ')}`)
    return refuse(res, 503, UNAVAILABLE, { event: 'not-configured' })
  }

  const ip = clientIp(req)

  // 6. Rate limit, in the shared store. A failure here is a 503 and no mail:
  //    the alternative is a limiter with an off switch anyone can reach by
  //    making it unreachable.
  let limit
  try {
    limit = await store.hitCounters(
      rateLimits().map((counter) => ({
        ...counter,
        id: counter.name === 'ip' ? store.hashKey(ip) : 'everyone',
      }))
    )
  } catch {
    console.error('contact: rate-limit store unavailable — refusing submission')
    return refuse(res, 503, UNAVAILABLE, { event: 'rate-store-unavailable' })
  }
  if (limit.limited) {
    const which = limit.counters.find((counter) => counter.limited)
    return refuse(res, 429, 'That is a lot of messages at once — please try again shortly.', {
      event: 'rate-limited',
      details: { counter: which?.name },
    })
  }

  // 7. Turnstile. Missing, malformed, replayed and expired tokens all end here
  //    with a 403 and nothing sent; an unreachable Cloudflare ends with a 503
  //    and nothing sent.
  const verdict = await turnstile.verify(readToken(body), { remoteIp: ip })
  if (verdict.status === 'unavailable') {
    console.error(`contact: Turnstile unavailable (${verdict.codes.map(scrub).join(',')})`)
    return refuse(res, 503, UNAVAILABLE, { event: 'turnstile-unavailable' })
  }
  if (verdict.status !== 'ok') {
    return refuse(res, 403, 'Could not confirm that was a person — please try again.', {
      event: 'turnstile-rejected',
      details: { codes: verdict.codes.join(',') },
    })
  }

  // 8. The duplicate claim. `SET NX` is atomic, so of two identical
  //    submissions racing on two instances exactly one gets the claim and the
  //    other is answered without a second delivery.
  const print = fingerprint(fields)
  let claim
  try {
    claim = await store.claim(print, DUPLICATE_WINDOW_MS)
  } catch {
    console.error('contact: duplicate store unavailable — refusing submission')
    return refuse(res, 503, UNAVAILABLE, { event: 'claim-store-unavailable' })
  }
  if (claim.status !== 'claimed') {
    // Either it was delivered already, or an identical request is in the
    // middle of delivering it. Both are `ok` to the visitor, and both send
    // nothing: their message did arrive, or is arriving.
    return quietOk(res, { event: `duplicate-${claim.status}` })
  }

  // 9. Delivery.
  const { subject, text, html } = buildEmail(fields)
  const result = await mail.send({
    subject,
    text,
    html,
    replyTo: fields.email,
    // Resend's own guard, independent of the claim above.
    idempotencyKey: print.slice(0, 64),
  })

  if (!result.ok) {
    // Hand the claim back, or the visitor's retry would be swallowed as a
    // duplicate of a message that was never delivered.
    await store.release(claim.key)
    console.error(`contact: delivery failed (${scrub(result.reason)} ${result.status ?? '-'})`)
    return refuse(res, 502, SEND_FAILED, { event: 'delivery-failed' })
  }

  // The claim stops being "someone is sending this" and becomes "this was
  // sent". Until this line it was the first, which is what lets a retry after
  // a function that died mid-send go through instead of being answered as a
  // duplicate of a message nobody ever received.
  await store.markDelivered(claim.key, DUPLICATE_WINDOW_MS)

  // Only here, with the service's own id in hand. There is no path above that
  // answers ok:true after a delivery that did not happen.
  logEvent('delivered', { id: result.id })
  return res.status(200).json({ ok: true })
}

// Exported for scripts/test-contact-api.mjs.
module.exports.LIMITS = LIMITS
module.exports.DUPLICATE_WINDOW_MS = DUPLICATE_WINDOW_MS
