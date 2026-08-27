import { useEffect, useRef, useState } from 'react'
import SectionLabel from '../components/SectionLabel.jsx'
import { useTypewriter } from '../hooks/useTypewriter.js'
import polaroidPhoto from '../assets/about/myself.png'

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
          <div className="about-photo-col">
            <div className="about-polaroid">
              <img src={polaroidPhoto} alt={content.photo.alt} className="about-polaroid-img" />
            </div>
          </div>

          <div>
            <p className="about-intro">{content.intro}</p>
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
