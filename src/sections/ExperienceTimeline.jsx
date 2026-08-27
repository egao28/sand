import { Link } from 'react-router-dom'
import EducationTimeline from './EducationTimeline.jsx'

export default function ExperienceTimeline({ content, education }) {
  return (
    <section id="experience">
      <div className="sec-inner">
        <div className="sec-label">
          <span>{content.label}</span>
        </div>

        <div className="center-timeline reveal" aria-label="Experience timeline">
          {content.items.map((item) => (
            <article key={item.title} className={`ct-item ${item.side}`}>
              <header className="ct-head">
                <div className="ct-time">{item.time}</div>
                <div className={`ct-title${item.editorialTitle ? ' ct-title--editorial' : ''}`}>
                  {item.title}
                </div>
                <div className="ct-sub">{item.sub}</div>
              </header>

              <Link to={item.href} className="ct-more-link">
                Click here for more <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>

        <EducationTimeline content={education} />
      </div>
    </section>
  )
}
