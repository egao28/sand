import { Link } from 'react-router-dom'
import polaroidPhoto from '../assets/about/myself.png'

/**
 * The About page, rendered by both `/about` and the homepage below the opening.
 * One component and one copy of the data; the routes differ only in whether the
 * opening is played first.
 *
 * The page's only <h1> is the name, so the heading order is h1 (name) →
 * h2 (Selected Experience) → h3 (each institution). Deliberately no slogan,
 * tagline or hero headline above it, and the first body sentence is set at body
 * size — enlarging it would recreate the headline the #58 rewrite removed.
 */
export default function AboutSection({ content }) {
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
                <h3 className="profile-role-org">
                  {/* A role with an `href` is the only entry point its detail
                      page has, so the heading itself is the link — no extra
                      button and no added words beside it. */}
                  {role.href ? (
                    <Link to={role.href} className="profile-role-org-link">
                      {role.org}
                    </Link>
                  ) : (
                    role.org
                  )}
                </h3>
                <p className="profile-role-title">{`${role.role} · ${role.time}`}</p>
                <p className="profile-role-note">{role.note}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Under 900px the rail is not rendered and the compact top bar carries
            only the four pages, so this is GitHub's only place on the site at
            that width. Above it the rail has GitHub, and this is `display:
            none` — which takes it out of the tab order and the accessibility
            tree too, so there is never a second GitHub link to land on. */}
        <p className="profile-outbound">
          <a
            className="profile-outbound-link"
            href={content.github.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {content.github.label}
          </a>
        </p>
      </div>
    </section>
  )
}
