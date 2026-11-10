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
              // The id is what `← About` on a write-up comes back to, so the
              // entry you left is the one you land on.
              <li key={role.id} id={`experience-${role.id}`} className="profile-role">
                <h3 className="profile-role-org">
                  {/* The heading itself is the link — no extra button and no
                      added words beside it. All four carry one, and all four
                      are marked the same way, so none of them reads as though
                      there is nothing behind it. */}
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

        {/* The narrow-screen GitHub link that used to sit here is gone with
            #70: the compact top bar carries GitHub and LinkedIn itself now, so
            this was a second link to the same place on exactly the widths
            where the bar is the navigation. */}
      </div>
    </section>
  )
}
