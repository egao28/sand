import { Link } from 'react-router-dom'
import SectionLabel from '../components/SectionLabel.jsx'
import polaroidPhoto from '../assets/about/myself.png'

export default function AboutSection({ content }) {
  return (
    <section id="about">
      <div className="sec-inner">
        <SectionLabel text={content.label} />

        <div className="about-intro-block reveal">
          <div className="about-identity">{content.identity}</div>

          <h1 className="about-headline">{content.headline}</h1>

          <div className="about-lede">
            <div className="about-photo-inline">
              <div className="about-polaroid">
                <img src={polaroidPhoto} alt={content.photo.alt} className="about-polaroid-img" />
              </div>
              <div className="about-photo-caption">{content.photo.caption}</div>
            </div>
            <p className="about-body">{content.body[0]}</p>
          </div>

          {content.body.slice(1).map((p) => (
            <p key={p} className="about-body">
              {p}
            </p>
          ))}

          <div className="about-more-links">
            <Link to="/projects" className="ct-more-link">
              See what I&rsquo;ve built <span aria-hidden="true">→</span>
            </Link>
            <a href="#experience" className="ct-more-link">
              Experience <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
