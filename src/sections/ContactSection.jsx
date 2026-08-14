import { useMemo } from 'react'
import SectionLabel from '../components/SectionLabel.jsx'

export default function ContactSection({ content, variant = 'default' }) {
  const [line1, line2] = useMemo(() => content.headline.split('\n'), [content.headline])
  const isHome = variant === 'home'

  return (
    <section id="contact">
      <div className="sec-inner">
        <SectionLabel text={isHome ? 'contact' : content.label} />

        {isHome ? (
          content.homeIntro ? (
            <h2 className="contact-home-statement reveal">{content.homeIntro}</h2>
          ) : null
        ) : (
          <h2 className="contact-headline reveal">
            {line1}
            <br />
            <em>{line2}</em>
          </h2>
        )}

        <ul className="contact-links reveal">
          {content.items
            .filter((it) => it.value)
            .map((item) => {
              const isExternal = item.href?.startsWith('http')
              const inner = (
                <>
                  <span className="contact-link-label">{item.label}</span>
                  <span className="contact-link-value">{item.value}</span>
                  <span className="contact-link-arrow" aria-hidden="true">
                    {item.href ? '↗' : ''}
                  </span>
                </>
              )
              return (
                <li className="contact-link-row" key={item.key}>
                  {item.href ? (
                    <a
                      className="contact-link"
                      href={item.href}
                      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="contact-link contact-link--static">{inner}</div>
                  )}
                </li>
              )
            })}
        </ul>

        <div className={`footer-bar${content.footerRight ? '' : ' footer-bar--single'}`}>
          <span>{content.footerLeft}</span>
          {content.footerRight ? <span>{content.footerRight}</span> : null}
        </div>
      </div>
    </section>
  )
}
