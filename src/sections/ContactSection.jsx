import { useState } from 'react'
import contactAvif from '../assets/contact.avif'
import contactWebp from '../assets/contact.webp'
import contactJpg from '../assets/contact.jpg'

// Public client-side submit key for Web3Forms — safe to expose in source,
// the service is designed around this (like a Formspree form ID).
const WEB3FORMS_ACCESS_KEY = '582a6f18-f79d-4578-bf3e-a29378790498'

const EMPTY_FORM = { name: '', email: '', message: '' }

export default function ContactSection({ content }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, topic: content.formTopics[0] ?? '' })
  // Honeypot. Held outside `form` so it can never be spread into the payload.
  const [botcheck, setBotcheck] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hasError, setHasError] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Nobody who can see the form can fill this field, so anything in it came
    // from a script walking the DOM. Drop it on the floor and report success:
    // a bot told it was caught just retries with the field left blank.
    if (botcheck) {
      // Clear it too. The field is off-screen rather than display:none, which
      // is what makes a bot fill it — and also what can make a password
      // manager fill it, since autocomplete="off" is only advisory. Left
      // sticky, one stray autofill would silently swallow every message a real
      // visitor sends for the rest of the page load while still saying "Sent".
      // Resetting caps the worst case at a single dropped message either way.
      setBotcheck('')
      setHasError(false)
      setIsSubmitted(true)
      setForm({ ...EMPTY_FORM, topic: content.formTopics[0] ?? '' })
      return
    }

    setIsSending(true)
    setIsSubmitted(false)
    setHasError(false)
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `Portfolio contact — ${form.topic}`,
          ...form,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Submission failed')
      setIsSubmitted(true)
      setForm({ ...EMPTY_FORM, topic: content.formTopics[0] ?? '' })
    } catch (err) {
      console.error('Contact form submission failed:', err)
      setHasError(true)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section id="contact">
      <picture className="contact-photo-bg">
        <source srcSet={contactAvif} type="image/avif" />
        <source srcSet={contactWebp} type="image/webp" />
        <img src={contactJpg} alt="" className="contact-photo-bg-img" decoding="async" />
      </picture>

      <div className="sec-inner">
        <div className="contact-panels">
          <div className="contact-panel contact-panel--info reveal">
            <h2 className="contact-panel-headline">{content.panelHeadline}</h2>
            <ul className="contact-info-list">
              {content.items
                .filter((it) => it.value)
                .map((item) => {
                  const isExternal = item.href?.startsWith('http')
                  const inner = (
                    <>
                      <span className="contact-info-label">{item.label}</span>
                      <span className="contact-info-value">{item.value}</span>
                      {item.href && (
                        <span className="contact-info-arrow" aria-hidden="true">
                          ↗
                        </span>
                      )}
                    </>
                  )
                  return (
                    <li key={item.key}>
                      {item.href ? (
                        <a
                          className="contact-info-link"
                          href={item.href}
                          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {inner}
                        </a>
                      ) : (
                        <div className="contact-info-link contact-info-link--static">{inner}</div>
                      )}
                    </li>
                  )
                })}
            </ul>
          </div>

          <form className="contact-panel contact-panel--form reveal" onSubmit={handleSubmit}>
            <h3 className="contact-panel-headline">{content.formHeadline}</h3>

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

            <label className="contact-field">
              <span>Topic</span>
              <select name="topic" value={form.topic} onChange={handleChange} disabled={isSending}>
                {content.formTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </label>

            <div className="contact-field-row">
              <label className="contact-field">
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  disabled={isSending}
                />
              </label>
              <label className="contact-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  disabled={isSending}
                />
              </label>
            </div>

            <label className="contact-field">
              <span>Message</span>
              <textarea
                name="message"
                rows={4}
                required
                value={form.message}
                onChange={handleChange}
                disabled={isSending}
              />
            </label>

            <div className="contact-form-footer">
              <button type="submit" className="contact-submit" disabled={isSending}>
                {isSending ? 'Sending…' : 'Send message'}
              </button>
              {isSubmitted && (
                <p className="contact-form-status contact-form-status--ok">
                  Sent — thank you, I&apos;ll get back to you soon.
                </p>
              )}
              {hasError && (
                <p className="contact-form-status contact-form-status--error">
                  Something went wrong — try emailing directly instead.
                </p>
              )}
            </div>
          </form>
        </div>

        <div className={`footer-bar${content.footerRight ? '' : ' footer-bar--single'}`}>
          <span>{content.footerLeft}</span>
          {content.footerRight ? <span>{content.footerRight}</span> : null}
        </div>
      </div>
    </section>
  )
}
