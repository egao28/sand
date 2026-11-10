import { useRef, useState } from 'react'

const EMPTY_FORM = { name: '', email: '', message: '' }

/* The form posts to this site's own endpoint, never to a mail service
 * directly. That is what keeps the service's credential on the server (#72):
 * the browser used to carry a submit key in its bundle, and anything in the
 * bundle is public. It also means the recipient is fixed on the server, where
 * a visitor cannot reach it.
 *
 * The limits here are the server's, repeated so the field can say "too long"
 * before a round trip. api/contact.js enforces them for real — these are a
 * courtesy, not a check. */
const LIMITS = { name: 100, email: 200, message: 4000 }

/** Good enough to catch a typo before the round trip; the server does this
 * again with the same shape. Deliberately not an RFC-complete pattern — those
 * reject real addresses, and the real test of an address is whether mail to it
 * arrives. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactSection({ content }) {
  const [form, setForm] = useState(EMPTY_FORM)
  // Honeypot. Held outside `form` so it can never be spread into the payload.
  const [botcheck, setBotcheck] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')
  // Guards a double submit from a double click or a fast Enter-Enter, which
  // state alone cannot: two events in the same tick both see `status` as it
  // was at the start of the tick.
  const inFlight = useRef(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (status === 'error') setStatus('idle')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (inFlight.current) return

    // Nobody who can see the form can fill this field, so anything in it came
    // from a script walking the DOM. Drop it on the floor and report success:
    // a bot told it was caught just retries with the field left blank. The
    // server applies the same rule to the same field.
    if (botcheck) {
      setBotcheck('')
      setStatus('sent')
      setForm(EMPTY_FORM)
      return
    }

    const trimmed = {
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    }
    if (!trimmed.name || !trimmed.email || !trimmed.message) {
      setStatus('error')
      setError('Please fill in your name, your email and a message.')
      return
    }
    if (!EMAIL_SHAPE.test(trimmed.email)) {
      setStatus('error')
      setError('That email address does not look right — please check it.')
      return
    }

    inFlight.current = true
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(trimmed),
      })

      // A non-JSON body means something upstream answered instead of the
      // function — a platform error page, say. Treat it as a failure rather
      // than letting `.json()` throw something unreadable.
      const data = await res.json().catch(() => null)

      // The success message is the server's to give. There is no path here
      // where the form says "sent" without a 2xx and an explicit `ok`.
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Your message could not be sent.')
      }

      setStatus('sent')
      setForm(EMPTY_FORM)
    } catch (err) {
      // The inputs are deliberately left as they are: a failure must not cost
      // someone the message they just wrote.
      setStatus('error')
      setError(err.message || 'Your message could not be sent.')
    } finally {
      inFlight.current = false
    }
  }

  const sending = status === 'sending'

  return (
    <section id="contact" aria-labelledby="contact-title">
      <div className="sec-inner contact-inner">
        <h1 id="contact-title" className="contact-title">
          {content.title}
        </h1>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          {/* Off-screen rather than display:none, which is what makes a bot
              fill it. aria-hidden and tabIndex -1 keep it away from anyone
              reading the page with assistive technology or a keyboard. */}
          <div className="contact-botcheck" aria-hidden="true">
            <label htmlFor="contact-botcheck">Leave this field empty</label>
            <input
              id="contact-botcheck"
              type="text"
              name="botcheck"
              tabIndex={-1}
              autoComplete="off"
              value={botcheck}
              onChange={(e) => setBotcheck(e.target.value)}
            />
          </div>

          {/* Real <label>s, every one tied to its field. A placeholder is not a
              label: it is gone the moment someone starts typing. */}
          <div className="contact-field">
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              type="text"
              name="name"
              required
              maxLength={LIMITS.name}
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              disabled={sending}
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              name="email"
              required
              maxLength={LIMITS.email}
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              disabled={sending}
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              required
              maxLength={LIMITS.message}
              rows={5}
              value={form.message}
              onChange={handleChange}
              disabled={sending}
            />
          </div>

          <div className="contact-form-footer">
            <button type="submit" className="contact-submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send message'}
              <span className="contact-submit-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>

          {/* One live region, present from the first render rather than mounted
              with the message, so a screen reader is already watching it when
              the text arrives. */}
          <p className="contact-form-status" role="status" aria-live="polite">
            {status === 'sent' && (
              <span className="contact-form-status--ok">
                Thank you — your message has been sent.
              </span>
            )}
            {status === 'error' && <span className="contact-form-status--error">{error}</span>}
          </p>
        </form>

        <p className="contact-direct">
          <a className="contact-direct-link" href={`mailto:${content.email}`}>
            {content.email}
          </a>
        </p>

        <div className="footer-bar footer-bar--single">
          <span>{content.footerLeft}</span>
        </div>
      </div>
    </section>
  )
}
