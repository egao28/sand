import { useCallback, useEffect, useRef, useState } from 'react'

/*
 * Cloudflare Turnstile for the contact form.
 *
 * Two things shape how this is wired, and both are deliberate.
 *
 * It is invisible. The widget is rendered explicitly with
 * `execution: 'execute'` and `appearance: 'interaction-only'`, which means
 * nothing is drawn and nothing runs until the form asks for a token at submit
 * time, and a box only ever appears if Cloudflare decides this visitor should
 * prove something. On an ordinary visit the page looks exactly as it did
 * before — no badge, no checkbox, no reserved space in the form.
 *
 * The token is fetched per submit, not per page load. A Turnstile token is
 * single-use and expires 300 seconds after it is issued, so a token minted
 * when the page loaded is routinely stale by the time someone has finished
 * writing. Executing on submit means the token handed to the server is always
 * seconds old, and a replayed one has nothing to replay.
 *
 * The site key here is the public half of the pair and is meant to be in the
 * bundle. The secret half lives only in the server's environment and is the
 * only thing that can actually validate a token — see lib/contact/turnstile.js.
 */

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const SCRIPT_ID = 'cf-turnstile-api'

/** If Cloudflare never calls back at all, the form must not sit on "Sending…"
 * forever. Generous enough for a slow network and an interactive challenge. */
const TOKEN_TIMEOUT_MS = 45000

const siteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '').trim()

/* One load for the page, shared by anything that asks. The script is only
 * fetched when a form that needs it mounts — it is not in index.html, so the
 * other routes never pay for it. */
let scriptPromise = null

function loadScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID)
    const el = existing ?? document.createElement('script')
    if (!existing) {
      el.id = SCRIPT_ID
      el.src = SCRIPT_SRC
      el.async = true
      el.defer = true
    }
    el.addEventListener('load', () => resolve(), { once: true })
    el.addEventListener(
      'error',
      () => {
        // Let a later mount try again rather than caching the failure forever.
        scriptPromise = null
        reject(new Error('turnstile script failed to load'))
      },
      { once: true }
    )
    if (!existing) document.head.appendChild(el)
  })
  return scriptPromise
}

/**
 * @param {import('react').RefObject<HTMLElement>} containerRef
 * @returns {{configured: boolean, ready: boolean, getToken: () => Promise<string>}}
 */
export default function useTurnstile(containerRef) {
  const widgetId = useRef(null)
  // The in-flight `getToken` call, if there is one. Turnstile answers through
  // callbacks registered at render time, so the promise has to be reachable
  // from outside the call that created it.
  const pending = useRef(null)
  const [ready, setReady] = useState(false)

  const settle = useCallback((outcome) => {
    const waiting = pending.current
    if (!waiting) return
    pending.current = null
    clearTimeout(waiting.timer)
    if (outcome.token) waiting.resolve(outcome.token)
    else waiting.reject(new Error(outcome.reason ?? 'turnstile-failed'))
  }, [])

  useEffect(() => {
    if (!siteKey) return undefined
    let cancelled = false

    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || widgetId.current !== null) return
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          // Nothing runs until the form calls execute(), and nothing is drawn
          // unless this visitor is asked to interact.
          execution: 'execute',
          appearance: 'interaction-only',
          // The form takes a fresh token every submit, so there is nothing to
          // refresh in the background.
          'refresh-expired': 'never',
          // The site decides light or dark itself; `auto` would follow the OS,
          // which this site deliberately does not consult.
          theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
          callback: (token) => settle({ token }),
          'error-callback': () => {
            settle({ reason: 'turnstile-error' })
            // Returning true keeps the widget from painting its own error UI
            // in the middle of the form; the form says what went wrong.
            return true
          },
          'expired-callback': () => settle({ reason: 'turnstile-expired' }),
          'timeout-callback': () => settle({ reason: 'turnstile-timeout' }),
        })
        if (!cancelled) setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(false)
      })

    return () => {
      cancelled = true
      settle({ reason: 'turnstile-unmounted' })
      if (widgetId.current !== null) {
        try {
          window.turnstile?.remove(widgetId.current)
        } catch {
          /* the script never finished loading, or already tore the widget down */
        }
        widgetId.current = null
      }
    }
  }, [containerRef, settle])

  /** Runs the challenge and resolves with a fresh token. Rejects — never
   * resolves with a placeholder — when the widget is unconfigured, not loaded,
   * refused or slow, because the only thing a caller could do with a
   * placeholder is send it. */
  const getToken = useCallback(
    () =>
      new Promise((resolve, reject) => {
        if (!siteKey) return reject(new Error('turnstile-unconfigured'))
        if (widgetId.current === null) return reject(new Error('turnstile-not-ready'))
        if (pending.current) return reject(new Error('turnstile-busy'))

        const timer = setTimeout(() => settle({ reason: 'turnstile-timeout' }), TOKEN_TIMEOUT_MS)
        pending.current = { resolve, reject, timer }
        try {
          // Reset first: the widget holds the previous submission's token, and
          // the server will refuse a token it has already seen.
          window.turnstile.reset(widgetId.current)
          window.turnstile.execute(widgetId.current)
        } catch {
          settle({ reason: 'turnstile-error' })
        }
      }),
    [settle]
  )

  return { configured: siteKey !== '', ready, getToken }
}
