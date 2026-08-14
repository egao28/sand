import { useEffect, useMemo } from 'react'
import { useTypewriter } from '../hooks/useTypewriter.js'

export default function HeroSection({ content }) {
  const heroPhraseTyped = useTypewriter(content.tagline, { enabled: true, startDelayMs: 700 })

  const bottomPhrase = useMemo(() => {
    // Keep the existing visual direction in your current implementation.
    // If you want to swap/offer choices later, this is the only place to edit.
    return {
      words: ['build', 'with', 'clarity,', 'ship', 'with', 'intent'],
    }
  }, [])

  useEffect(() => {
    // Parallax is intentionally small (subtle movement only).
    const heroImg = document.getElementById('hero-img')
    if (!heroImg) return

    const onScroll = () => {
      const y = window.scrollY
      heroImg.style.transform = `translateY(${Math.min(y * 0.06, 18)}px)`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="hero-section" style={{ borderTop: 'none' }}>
      <a id="top" className="sr-only" href="#about">
        Skip to content
      </a>
      <div className="hero-lines" aria-hidden="true" />

      <div className="hero-left">
        <div className="hero-photo-wrap">
          <img
            src={content.photo.src}
            alt={content.photo.alt}
            className="hero-photo"
            id="hero-img"
            onError={(e) => {
               
              e.currentTarget.outerHTML =
                '<div class="hero-photo placeholder-photo">[ your photo here ]</div>'
            }}
          />
          <span className="hero-photo-caption">{content.photo.caption}</span>
        </div>

        <div className="hero-intro">
          <p className="hero-eyebrow">{content.eyebrow}</p>
          <h1 className="hero-name">
            {content.name} <em>{content.nameEm}</em>
          </h1>

          <div className="hero-tagline-wrap">
            <span id="typed-hero">{heroPhraseTyped}</span>
            <span id="cursor-blink" aria-hidden="true" />
          </div>

          <p className="hero-bio">{content.bio}</p>

          <div className="hero-social">
            <a
              href="https://linkedin.com/"
              className="social-btn"
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>

            <a
              href="mailto:evelyngao@uchicago.edu"
              className="social-btn"
              title="Email"
              aria-label="Email"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
            </a>

            <a href="#contact" className="social-btn" title="Contact" aria-label="Jump to contact">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <p className="hero-bottom-phrase" id="hero-phrase">
          {bottomPhrase.words.map((w, idx) => (
            <span className="hero-phrase-word" key={`${w}-${idx}`}>
              {w}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
