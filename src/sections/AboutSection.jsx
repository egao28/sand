import { Link } from 'react-router-dom'
import polaroidPhoto from '../assets/about/myself.png'

// The page's only <h1> is the name, so the heading order is h1 (name) →
// h2 (Selected Experience) → h3 (each institution). Deliberately no slogan,
// tagline or hero headline above it, and the first body sentence is set at
// body size — enlarging it would recreate the headline this rewrite removed.
function ProfileLink({ link, resume }) {
  const label = (
    <>
      {link.label}
      {link.arrow ? <span aria-hidden="true"> →</span> : null}
    </>
  )
  const className = `profile-link${link.lead ? ' profile-link--lead' : ''}`

  if (link.to) {
    return (
      <Link to={link.to} className={className}>
        {label}
      </Link>
    )
  }

  // CV resolves through `resume` so this link and /resume always serve the same
  // imported resume.pdf under the same filename.
  const href = link.fromResume ? resume.href : link.href
  const isExternal = href.startsWith('http')

  return (
    <a
      href={href}
      className={className}
      {...(link.fromResume ? { download: resume.fileName } : {})}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
    </a>
  )
}

export default function AboutSection({ content, resume }) {
  return (
    <section id="about" aria-labelledby="profile-name">
      <div className="sec-inner profile-inner">
        <div className="profile-intro reveal">
          <div className="profile-intro-text">
            <h1 id="profile-name" className="profile-name">
              {content.name}
            </h1>

            {content.narrative.map((paragraph) => (
              <p key={paragraph} className="profile-prose">
                {paragraph}
              </p>
            ))}

            <p className="profile-prose profile-interests">{content.interests}</p>
          </div>

          <figure className="profile-portrait">
            <img src={polaroidPhoto} alt={content.photo.alt} className="profile-portrait-img" />
            <figcaption className="profile-portrait-caption">{content.photo.caption}</figcaption>
          </figure>
        </div>

        <section className="profile-experience reveal" aria-labelledby="profile-experience-heading">
          <h2 id="profile-experience-heading" className="profile-section-heading">
            Selected Experience
          </h2>

          <ul className="profile-roles">
            {content.roles.map((role) => (
              <li key={role.id} className="profile-role">
                <h3 className="profile-role-org">{role.org}</h3>
                <p className="profile-role-title">{`${role.role} · ${role.time}`}</p>
                <p className="profile-role-note">{role.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <nav className="profile-links reveal" aria-label="Elsewhere">
          {content.links.map((link) => (
            <ProfileLink key={link.label} link={link} resume={resume} />
          ))}
        </nav>
      </div>
    </section>
  )
}
