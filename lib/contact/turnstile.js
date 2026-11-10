'use strict'

/*
 * Cloudflare Turnstile, verified server-side.
 *
 * The widget in the browser produces a token. The token is worth nothing until
 * Cloudflare is asked about it here, with the secret key, which is why the
 * secret never leaves the server and why the browser's word that it solved the
 * challenge is not used for anything.
 *
 * A token is single-use and expires 300 seconds after it is issued. Both of
 * those come back as `timeout-or-duplicate`, and both are refusals: the form
 * executes a fresh challenge on every submit precisely so a replayed or stale
 * token has nothing to replay.
 *
 * Configuration:
 *
 *   TURNSTILE_SECRET_KEY      the secret half of the widget's key pair. Server
 *                             only. The site key is the public half and is the
 *                             one the browser gets.
 *   TURNSTILE_CHECK_REMOTE_IP optional, 'true' to have Cloudflare also check
 *                             the token against the caller's address. Off by
 *                             default: a phone that changes network between
 *                             solving and submitting would be refused.
 *
 * Every outcome is one of three, and the caller is not given a fourth:
 *
 *   ok           Cloudflare said the token is good.
 *   rejected     Cloudflare said it is not — missing, forged, replayed, stale.
 *   unavailable  nobody said anything: the secret is wrong, Cloudflare is
 *                down, or the request timed out. The handler answers 503 and
 *                sends no mail. There is no "carry on without it" branch.
 */

const ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TIMEOUT_MS = 5000

/* Error codes that mean the deployment is wrong rather than the visitor. They
 * must not be reported as a failed challenge: that would tell a visitor to try
 * again at a form that cannot work until someone fixes an environment
 * variable. */
const OUR_FAULT = new Set([
  'missing-input-secret',
  'invalid-input-secret',
  'bad-request',
  'internal-error',
])

function secret() {
  return (process.env.TURNSTILE_SECRET_KEY || '').trim()
}

function isConfigured() {
  return secret() !== ''
}

/**
 * @returns {Promise<{status: 'ok'|'rejected'|'unavailable', codes?: string[]}>}
 */
async function verify(token, { remoteIp } = {}) {
  if (!isConfigured()) return { status: 'unavailable', codes: ['not-configured'] }

  // An absent or empty token never reaches Cloudflare. It is a refusal on its
  // own, and a request without one is the commonest shape of a script posting
  // straight to this endpoint.
  if (typeof token !== 'string' || token.trim() === '') {
    return { status: 'rejected', codes: ['missing-input-response'] }
  }

  const body = new URLSearchParams()
  body.set('secret', secret())
  body.set('response', token)
  if (remoteIp && process.env.TURNSTILE_CHECK_REMOTE_IP === 'true') {
    body.set('remoteip', remoteIp)
  }

  let response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    // Not the error object: it can quote the request, and the request body is
    // the secret.
    return { status: 'unavailable', codes: ['request-failed'] }
  }

  if (!response.ok) return { status: 'unavailable', codes: [`http-${response.status}`] }

  let result
  try {
    result = await response.json()
  } catch {
    return { status: 'unavailable', codes: ['unreadable-reply'] }
  }

  const codes = Array.isArray(result?.['error-codes']) ? result['error-codes'].map(String) : []

  if (result?.success === true) return { status: 'ok', codes }
  if (codes.some((code) => OUR_FAULT.has(code))) return { status: 'unavailable', codes }
  return { status: 'rejected', codes }
}

module.exports = { verify, isConfigured, ENDPOINT, TIMEOUT_MS, OUR_FAULT }
