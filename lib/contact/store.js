'use strict'

/*
 * The shared counter store, and the reason this file exists at all.
 *
 * The previous version of this endpoint kept its rate limit and its duplicate
 * guard in two module-level `Map`s. On a host that runs one long-lived process
 * that is a rate limit. On Vercel it is not: every concurrent request can land
 * on a different instance with its own empty maps, and every cold start wipes
 * what was there. A limit of five per ten minutes, held per instance, is a
 * limit of five per ten minutes *per instance* — which is to say, no limit.
 *
 * So the counters live in Redis, reached over Upstash's REST API. REST rather
 * than a client library because the only thing needed here is `INCR`, `EXPIRE`
 * and `SET NX`, and `fetch` already does that without adding a dependency to
 * the bundle the host installs.
 *
 * Configuration (either pair; the Vercel Upstash integration injects the
 * KV_ names, a direct Upstash database gives the UPSTASH_ ones):
 *
 *   UPSTASH_REDIS_REST_URL   / KV_REST_API_URL
 *   UPSTASH_REDIS_REST_TOKEN / KV_REST_API_TOKEN
 *
 * Everything here fails closed. `isConfigured()` is false when the variables
 * are absent, and every call throws when the store cannot be reached. The
 * handler turns both into a 503 and sends nothing. That is the whole point: a
 * rate limiter that waves requests through when it is unavailable is not a
 * rate limiter, it is a rate limiter with a documented bypass.
 */

const { createHash } = require('node:crypto')

/** A store that takes longer than this is treated as unavailable. Short on
 * purpose — the visitor is waiting, and a slow limiter must not become a way
 * to hold the function open. */
const TIMEOUT_MS = 3000

function credentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || ''
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || ''
  return { url: url.trim().replace(/\/+$/, ''), token: token.trim() }
}

function isConfigured() {
  const { url, token } = credentials()
  return url !== '' && token !== ''
}

/**
 * Runs a list of Redis commands and returns their results in order.
 *
 * Throws on anything that is not a clean success — unreachable, timed out,
 * rejected credentials, or one command in the batch reporting an error. The
 * caller is not given the choice of carrying on regardless.
 */
async function pipeline(commands) {
  const { url, token } = credentials()
  if (!url || !token) throw new Error('rate-limit store is not configured')

  let response
  try {
    response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    // Deliberately not including the thrown error: it can carry the request
    // URL, and the URL is half the credential.
    throw new Error('rate-limit store is unreachable')
  }

  if (!response.ok) {
    // The status, and nothing else. An Upstash error body echoes the command,
    // and the command contains the key.
    throw new Error(`rate-limit store returned ${response.status}`)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('rate-limit store returned an unreadable reply')
  }
  if (!Array.isArray(payload) || payload.length !== commands.length) {
    throw new Error('rate-limit store returned an unexpected reply')
  }
  for (const entry of payload) {
    if (entry && entry.error) throw new Error('rate-limit store rejected a command')
  }
  return payload.map((entry) => (entry ? entry.result : null))
}

/** Keys are hashes, so an address or a message never sits in the store in a
 * form anyone reading it could use. Truncated because collisions here cost a
 * shared counter, not a security property. */
function hashKey(value) {
  return createHash('sha256').update(String(value)).digest('hex').slice(0, 32)
}

/**
 * A fixed-window counter. Returns `{ limited, count }`.
 *
 * The window number is part of the key, so the counter rolls over on its own
 * and the TTL only has to be long enough to outlive the window it belongs to.
 * That avoids the usual `EXPIRE`-on-every-hit bug, where a steady stream of
 * requests keeps pushing the expiry out and the window never ends.
 *
 * Several counters are checked in one round trip: one for the address, one for
 * everybody. The second is what bounds the bill if a thousand addresses each
 * send their allowance.
 */
async function hitCounters(counters, now = Date.now()) {
  const commands = []
  for (const counter of counters) {
    const window = Math.floor(now / counter.windowMs)
    const key = `contact:rl:${counter.name}:${counter.id}:${window}`
    commands.push(['INCR', key])
    // Twice the window, so the key is gone well before its number comes round
    // again and a stale count can never be read as a current one.
    commands.push(['PEXPIRE', key, String(counter.windowMs * 2)])
  }

  const results = await pipeline(commands)
  const outcome = []
  counters.forEach((counter, index) => {
    const count = Number(results[index * 2])
    outcome.push({ name: counter.name, count, limited: count > counter.limit })
  })
  return { limited: outcome.some((entry) => entry.limited), counters: outcome }
}

/*
 * Claiming a fingerprint for one delivery.
 *
 * `SET NX` is a single atomic operation in Redis, and that is what makes this
 * work across instances: two identical submissions arriving at the same moment
 * on two different functions both reach the same key, and exactly one of them
 * gets the `OK`. A `Map` cannot do that, and neither can a read followed by a
 * write.
 *
 * The claim records which of two things it is, because they are not the same
 * and answering them the same way is how a message gets lost:
 *
 *   p:<ms>  someone is sending this right now.
 *   s:<ms>  this was delivered.
 *
 * A claim that is still `p:` long after any run could still be alive belongs to
 * a function that died between claiming and sending — a timeout, an instance
 * pulled away mid-request. Without this distinction that message is a black
 * hole: the visitor is told it arrived, every retry for the next ten minutes is
 * swallowed as a duplicate, and nothing was ever sent. So a stale `p:` is taken
 * over rather than honoured.
 *
 * The takeover is itself atomic — `SET ... XX GET` returns the value it
 * replaced, so of two retries racing to take over the same dead claim, only the
 * one that gets the value it expected proceeds.
 */

/** How long a `p:` claim is believed. Comfortably longer than any single run:
 * the Resend call gives up at 10s and the platform stops the function well
 * before this. Past it, the holder is dead, not slow. */
const STALE_CLAIM_MS = 60 * 1000

const DELIVERED = 's'
const PENDING = 'p'

async function claim(fingerprint, ttlMs, now = Date.now()) {
  const key = `contact:sent:${hashKey(fingerprint)}`
  const mine = `${PENDING}:${now}`

  const [first] = await pipeline([['SET', key, mine, 'NX', 'PX', String(ttlMs)]])
  if (first === 'OK') return { status: 'claimed', key }

  const [held] = await pipeline([['GET', key]])
  if (held === null || held === undefined) {
    // It expired in the gap between the two calls. One more try, and if that
    // loses as well someone else is plainly on it.
    const [second] = await pipeline([['SET', key, mine, 'NX', 'PX', String(ttlMs)]])
    return { status: second === 'OK' ? 'claimed' : 'in-flight', key }
  }

  const value = String(held)
  if (value.startsWith(`${DELIVERED}:`)) return { status: 'delivered', key }

  const startedAt = Number(value.slice(2))
  if (!Number.isFinite(startedAt) || now - startedAt < STALE_CLAIM_MS) {
    return { status: 'in-flight', key }
  }

  // Stale. Take it over, but only if nobody else did first.
  const [previous] = await pipeline([['SET', key, mine, 'XX', 'GET', 'PX', String(ttlMs)]])
  return { status: previous === value ? 'claimed' : 'in-flight', key }
}

/** Turns a held claim into a delivery, so every later copy of the same message
 * is answered as the duplicate it is rather than retried. */
async function markDelivered(key, ttlMs, now = Date.now()) {
  try {
    await pipeline([['SET', key, `${DELIVERED}:${now}`, 'PX', String(ttlMs)]])
    return true
  } catch {
    // The mail is already sent; the worst this costs is one duplicate being
    // let through later, which is better than reporting a failure that did not
    // happen.
    return false
  }
}

/** Gives a claim back, so a delivery that failed does not lock the visitor out
 * of retrying the message they just lost. Never throws: by the time this is
 * called the response is already decided, and a store that has gone away must
 * not turn a failed send into a crash. */
async function release(key) {
  try {
    await pipeline([['DEL', key]])
    return true
  } catch {
    return false
  }
}

module.exports = {
  isConfigured,
  hitCounters,
  claim,
  markDelivered,
  release,
  hashKey,
  pipeline,
  TIMEOUT_MS,
  STALE_CLAIM_MS,
}
