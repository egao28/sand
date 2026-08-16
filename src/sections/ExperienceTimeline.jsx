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
            <article key={item.title} className={`ct-item ${item.side}`} tabIndex="0">
              <header className="ct-head">
                <div className="ct-time">{item.time}</div>
                <div className={`ct-title${item.editorialTitle ? ' ct-title--editorial' : ''}`}>
                  {item.title}
                </div>
                <div className="ct-sub">{item.sub}</div>
              </header>

              {item.layout === 'layered' && item.motivation && item.technologyTags ? (
                <div className="ct-detail ct-detail--layered">
                  <div className="ct-layer-section">
                    <p className="ct-layer-kicker">Motivation</p>
                    <div className="ct-layer-body">
                      {item.motivation.map((p, i) => (
                        <p key={i} className="ct-motivation-p">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="ct-layer-section">
                    <p className="ct-layer-kicker">Technology</p>
                    <ul className="ct-tech-tags" aria-label="Technologies">
                      {item.technologyTags.map((t) => (
                        <li key={t}>
                          <span className="ct-tech-tag">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="ct-detail">
                  <ul>
                    {(item.details ?? []).map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>

        <EducationTimeline content={education} />
      </div>
    </section>
  )
}
