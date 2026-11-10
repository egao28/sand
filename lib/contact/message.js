'use strict'

/*
 * What the server accepts from a submission, and what it turns it into.
 *
 * Two rules shape this file:
 *
 *   1. The request is read through a whitelist, never spread. `name`, `email`,
 *      `message`, the honeypot and the Turnstile token are the only things a
 *      client can say. A `to`, `from`, `cc`, `bcc`, `subject` or `html` in the
 *      body is not rejected, it is simply never read — there is no code path
 *      that could carry it into the mail.
 *
 *   2. Nothing a visitor typed is ever concatenated into something that parses.
 *      The body goes out as plain text; the HTML alternative is built from
 *      escaped values; the subject and Reply-To are stripped of the line breaks
 *      that header injection needs.
 */

const LIMITS = { name: 100, email: 200, message: 4000, token: 4096 }
const MIN_MESSAGE = 2

/* Deliberately not RFC-complete: the stricter patterns reject real addresses,
 * and the real test of an address is whether mail to it arrives. This catches
 * the typo and, with the control-character rule below, the injection. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* C0 and C1 controls, minus tab and newline, plus the Unicode line and
 * paragraph separators. A message may contain newlines; a name and an address
 * may not contain anything in this class at all. */
// eslint-disable-next-line no-control-regex
const CONTROL_IN_MESSAGE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u2028\u2029]/
// eslint-disable-next-line no-control-regex
const CONTROL_IN_LINE = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/

/** Reads one string field through the whitelist. Anything that is not a string
 * — a number, an object, an array of strings — reads as absent rather than
 * being coerced into something that looks like text. */
function field(body, key) {
  const value = body[key]
  return typeof value === 'string' ? value.trim() : ''
}

/** The honeypot's value, read the same careful way. Non-empty means a script
 * walked the DOM: nobody who can see the form can type into this field. */
function honeypot(body) {
  return field(body, 'botcheck')
}

/** The Turnstile token, length-capped before it is ever sent anywhere. */
function token(body) {
  const value = body['cf-turnstile-response'] ?? body.turnstileToken
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  return trimmed.length > LIMITS.token ? '' : trimmed
}

/**
 * Returns `{ fields }` with the three cleaned values, or `{ error }` with a
 * sentence for the visitor.
 *
 * The form checks most of this too. This is the copy that counts, because it
 * is the one a script posting straight to the endpoint cannot skip.
 */
function validate(body) {
  const name = field(body, 'name')
  const email = field(body, 'email')
  const message = field(body, 'message')

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
  // A line break in a name or an address is how header injection starts: these
  // two become a subject and a Reply-To. The message keeps its newlines and
  // loses everything else in the control range.
  if (CONTROL_IN_LINE.test(name) || CONTROL_IN_LINE.test(email)) {
    return { error: 'That name or email contains characters that are not allowed.' }
  }
  if (CONTROL_IN_MESSAGE.test(message)) {
    return { error: 'That message contains characters that are not allowed.' }
  }
  return { fields: { name, email, message } }
}

/** Collapses a value to something safe to put on one header line. Used for the
 * subject, which is built from a visitor's name. */
function singleLine(value, max = 120) {
  return value.replace(/\s+/g, ' ').trim().slice(0, max)
}

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** Every character that can end an attribute, open a tag or start an entity.
 * The quotes matter because the address below sits inside an `href`. */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}

/**
 * The mail itself. `text` is the real body and is plain by construction. The
 * HTML alternative exists because most clients prefer it, and every visitor
 * value in it has been through `escapeHtml` — there is no interpolation here
 * that has not.
 */
function buildEmail(fields) {
  const subject = `Portfolio contact from ${singleLine(fields.name)}`

  const text = [
    `Name:    ${singleLine(fields.name)}`,
    `Email:   ${singleLine(fields.email)}`,
    '',
    'Message:',
    fields.message,
    '',
    '--',
    'Sent from the contact form on the site. Reply to this mail to answer the sender.',
  ].join('\n')

  const html = [
    '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.6;color:#2b2724">',
    `<p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(fields.name)}</p>`,
    `<p style="margin:0 0 16px"><strong>Email:</strong> <a href="mailto:${escapeHtml(fields.email)}">${escapeHtml(fields.email)}</a></p>`,
    `<div style="white-space:pre-wrap">${escapeHtml(fields.message)}</div>`,
    '<hr style="border:0;border-top:1px solid #ddd6cc;margin:24px 0 12px" />',
    '<p style="margin:0;font-size:13px;color:#6b635c">Sent from the contact form on the site. Reply to this mail to answer the sender.</p>',
    '</div>',
  ].join('')

  return { subject, text, html }
}

module.exports = {
  LIMITS,
  MIN_MESSAGE,
  EMAIL_SHAPE,
  validate,
  honeypot,
  token,
  buildEmail,
  escapeHtml,
  singleLine,
}
