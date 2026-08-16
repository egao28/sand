import React, { useEffect, useMemo, useRef, useState } from 'react'
import SectionLabel from '../components/SectionLabel.jsx'
import { useTypewriter } from '../hooks/useTypewriter.js'

export default function AboutSection({ content }) {
  const dividerRef = useRef(null)
  const [enabled, setEnabled] = useState(false)

  const typedName = useTypewriter(content.divider.typed, { enabled })

  useEffect(() => {
    const el = dividerRef.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setEnabled(true)
            io.disconnect()
            break
          }
        }
      },
      { threshold: 0.35 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  const headlineLines = useMemo(() => content.headline.split('\n'), [content.headline])

  return (
    <section id="about">
      <div className="sec-inner">
        <SectionLabel text={content.label} />

        <div className="type-divider reveal" id="type-divider" ref={dividerRef}>
          <div className="type-divider-text" aria-live="polite">
            <span className="type-lead">{content.divider.lead}</span>
            <span id="typed-name" className="type-name">
              {typedName}
            </span>
          </div>
        </div>

        <div className="about-grid reveal">
          <div>
            <h2 className="about-headline">
              {headlineLines.map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {i === 1 ? <em>{line}</em> : line}
                </React.Fragment>
              ))}
            </h2>
          </div>

          <div>
            {content.body.map((p) => (
              <p key={p} className="about-body">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
