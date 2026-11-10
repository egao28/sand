/*
 * POST /api/contact — the contact form's delivery path (#72).
 *
 * Why there is a server step at all: the form used to call the mail service
 * straight from the browser with the submit key compiled into the bundle.
 * Anything in the bundle is public, and the recipient travelled in the request
 * body, where a visitor could edit it. Here the credential is an environment
 * variable the browser never sees, and the recipient is whatever the service
 * account is configured to deliver to — not a field in the request.
 *
 * It forwards to Web3Forms, which is the service this site already used: #72
 * asks to reuse what is configured rather than add a second one. `From` is
 * Web3Forms' own verified sender, and `replyto` is the visitor's address after
 * it has been validated here, so replying goes to them and nothing is sent as
 * them.
 *
 * Configuration, and the only thing this file needs:
 *
 *   WEB3FORMS_ACCESS_KEY   the access key for the mailbox the form delivers
 *                          to. Set it in the host's environment. Without it
 *                          this endpoint refuses every submission with a 503
 *                          rather than accepting messages it cannot deliver.
 *
 * Deliberately absent: any recipient address in the request, any fallback to
 * `mailto:`, and any path that answers `ok` without the service having said so.
 */

const ENDPOINT = 'https://api.web3forms.com/submit'

const LIMITS = { name: 100, email: 200, message: 4000 }
const MIN_MESSAGE = 2

// Same shape the form uses. Not RFC-complete on purpose: the stricter patterns
// reject real addresses, and the real test of an address is whether mail to it
// arrives.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/*
 * Rate limiting and duplicate suppression, in memory.
 *
 * Be clear about what this is: a serverless function is not one long-lived
 * process, so this map is per instance and resets on a cold start. It takes
 * the edge off a loop from one address and stops the same message arriving
 * three times because someone clicked twice — it is not a defence against a
 * distributed flood, and nothing here pretends otherwise. The honeypot and the
 * validation below are what actually keep the mailbox usable; a shared store
 * would be the next step if this ever needed to be real.
 */
const WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const MAX_PER_WINDOW = 5
const hits = new Map()

function tooMany(key, now) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent)
    return true
  }
  recent.push(now)
  hits.set(key, recent)

  // The map would otherwise grow for the life of the instance.
  if (hits.size > 500) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k)
    }
  }
  return false
}

const seen = new Map()

function isDuplicate(fingerprint, now) {
  const last = seen.get(fingerprint)
  if (last && now - last < WINDOW_MS) return true
  seen.set(fingerprint, now)
  if (seen.size > 500) {
    for (const [k, t] of seen) if (now - t >= WINDOW_MS) seen.delete(k)
  }
  return false
}

/** The client's address, as the platform reports it. `x-forwarded-for` is a
 * list when there are proxies in front; the first entry is the client. */
function clientKey(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress ?? 'unknown'
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return null
    }
  }
  return null
}

/** Returns the cleaned fields, or a message explaining what is wrong with
 * them. The form checks the same things; this is the one that counts, because
 * it is the one a script cannot skip. */
function validate(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!name || !email || !message) {
    return { error: 'Please fill in your name, your email and a message.' }
  }
  if (name.length > LIMITS.name) return { error: 'That name is too long.' }
  if (email.length > LIMITS.email) return { error: 'That email address is too long.' }
  if (message.length > LIMITS.message) return { error: 'That message is too long.' }
  if (message.length < MIN_MESSAGE) return { error: 'That message is too short.' }
  if (!EMAIL_SHAPE.test(email)) {
    return { error: 'That email address does not look right — please check it.' }
  }
  // A newline in a header field is how header injection starts. These two
  // values are handed to a mail service as a name and a reply-to.
  if (/[\r\n]/.test(name) || /[\r\n]/.test(email)) {
    return { error: 'That name or email contains characters that are not allowed.' }
  }
  return { fields: { name, email, message } }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method not allowed.' })
  }

  const body = readBody(req)
  if (!body) return res.status(400).json({ ok: false, error: 'Could not read that request.' })

  // The honeypot, checked again here: a script posting straight to this
  // endpoint never loaded the page, so it never saw which field was the trap.
  // Answer as though it worked — a bot told it was caught retries with the
  // field left blank — and send nothing.
  if (typeof body.botcheck === 'string' && body.botcheck.trim() !== '') {
    return res.status(200).json({ ok: true })
  }

  const { fields, error } = validate(body)
  if (error) return res.status(400).json({ ok: false, error })

  const now = Date.now()
  if (tooMany(clientKey(req), now)) {
    return res
      .status(429)
      .json({ ok: false, error: 'That is a lot of messages at once — please try again shortly.' })
  }
  if (isDuplicate(`${fields.email}::${fields.message}`, now)) {
    // Not an error to the visitor: their message did arrive, the first time.
    return res.status(200).json({ ok: true })
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY
  if (!accessKey) {
    // Loud on the server, vague to the visitor, and emphatically not a
    // success: a form that says "sent" with nothing configured is the exact
    // failure this endpoint exists to prevent.
    console.error('WEB3FORMS_ACCESS_KEY is not set — refusing to accept contact form submissions')
    return res.status(503).json({
      ok: false,
      error: 'The contact form is not available right now — please email directly instead.',
    })
  }

  try {
    const upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        // The credential, and the whole reason this runs on the server.
        access_key: accessKey,
        // The recipient is the mailbox this key belongs to. It is not in this
        // payload because it must not be something a request can choose.
        subject: `Portfolio contact from ${fields.name}`,
        from_name: 'Portfolio contact form',
        // Replying goes to the visitor; the message is still sent by the
        // service's own verified sender.
        replyto: fields.email,
        name: fields.name,
        email: fields.email,
        message: fields.message,
      }),
    })

    const result = await upstream.json().catch(() => null)

    if (!upstream.ok || !result?.success) {
      console.error('Web3Forms rejected the submission:', upstream.status, result?.message)
      return res.status(502).json({
        ok: false,
        error: 'Your message could not be sent — please email directly instead.',
      })
    }

    // Only here, with the service's own success in hand.
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Contact form delivery failed:', err)
    return res.status(502).json({
      ok: false,
      error: 'Your message could not be sent — please email directly instead.',
    })
  }
}

// Exported for the tests in scripts/test-contact-api.mjs, which exercise the
// validation and both delivery outcomes against a stubbed service.
module.exports.LIMITS = LIMITS
