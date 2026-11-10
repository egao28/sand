'use strict'

/*
 * Delivery, through Resend.
 *
 * The one thing this file is careful about: `to` and `from` are read from the
 * environment inside this function and are not parameters a caller can pass.
 * There is no argument here that a request body could reach, so there is no
 * path from a submission to a different recipient — the question "what if
 * someone posts a `to` field" has no code to answer it.
 *
 * Configuration:
 *
 *   RESEND_API_KEY       server only, never prefixed VITE_, never logged.
 *   CONTACT_TO_EMAIL     the mailbox the form delivers to.
 *   CONTACT_FROM_EMAIL   the sender, which must be an address on a domain
 *                        verified in Resend. Accepts "Name <a@b.com>".
 *
 * The visitor's address becomes `reply_to` and nothing else. Mail is never
 * sent *as* them: that is someone else's domain, and forging it is what gets a
 * sending domain blocked.
 */

const ENDPOINT = 'https://api.resend.com/emails'
const TIMEOUT_MS = 10000

function config() {
  return {
    apiKey: (process.env.RESEND_API_KEY || '').trim(),
    to: (process.env.CONTACT_TO_EMAIL || '').trim(),
    from: (process.env.CONTACT_FROM_EMAIL || '').trim(),
  }
}

/** Which of the three are missing, so the handler can log a precise cause
 * without ever logging a value. */
function missingConfig() {
  const { apiKey, to, from } = config()
  const missing = []
  if (!apiKey) missing.push('RESEND_API_KEY')
  if (!to) missing.push('CONTACT_TO_EMAIL')
  if (!from) missing.push('CONTACT_FROM_EMAIL')
  return missing
}

function isConfigured() {
  return missingConfig().length === 0
}

/**
 * Sends one message.
 *
 * `idempotencyKey` is the same fingerprint the shared store claims on. It is a
 * second, independent guard against a duplicate: if this function retried, or
 * two instances somehow both got past the claim, Resend returns the original
 * send rather than making a second one.
 *
 * @returns {Promise<{ok: true, id: string|null} | {ok: false, reason: string, status: number|null}>}
 */
async function send({ subject, text, html, replyTo, idempotencyKey }) {
  const { apiKey, to, from } = config()
  if (!apiKey || !to || !from) return { ok: false, reason: 'not-configured', status: null }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

  let response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        // Both ends of the envelope come from the environment, two lines up.
        from,
        to: [to],
        reply_to: replyTo,
        subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    // The thrown error is dropped rather than logged: a fetch failure can
    // carry the request headers, and the headers carry the API key.
    return { ok: false, reason: 'request-failed', status: null }
  }

  let result = null
  try {
    result = await response.json()
  } catch {
    result = null
  }

  if (!response.ok || !result?.id) {
    return { ok: false, reason: 'rejected', status: response.status }
  }
  return { ok: true, id: String(result.id) }
}

module.exports = { send, isConfigured, missingConfig, ENDPOINT, TIMEOUT_MS }
