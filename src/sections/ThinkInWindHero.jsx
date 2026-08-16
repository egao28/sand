import { useEffect, useMemo, useState } from 'react'

export default function ThinkInWindHero() {
  const [windBoost, setWindBoost] = useState(0)

  useEffect(() => {
    let lastY = window.scrollY
    let rafId = 0
    let boost = 0

    const tick = () => {
      boost *= 0.88
      if (boost < 0.008) boost = 0
      setWindBoost(boost)
      rafId = window.requestAnimationFrame(tick)
    }

    const onScroll = () => {
      const current = window.scrollY
      const delta = current - lastY
      if (delta < -0.5) {
        boost = Math.min(1, boost + Math.min(0.42, Math.abs(delta) / 90))
      }
      if (delta > 0.5) {
        boost = Math.min(1, boost + Math.min(0.14, Math.abs(delta) / 200))
      }
      lastY = current
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    rafId = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.cancelAnimationFrame(rafId)
    }
  }, [])

  /*
   * Percent-based placement inside .home-hanging: scales with container width.
   * Wider container on large viewports → letters breathe across the full phrase.
   * h uses clamp(rem, vh, rem) so line length responds to height without random jumps.
   */
  /* Symmetric around 50%; “the wind” nudged right for optical balance; larger type + longer drops */
  const letters = useMemo(
    () => [
      {
        ch: 't',
        leftPct: 11,
        top: '0.35vh',
        h: 'clamp(12.5rem, 38vh, 28rem)',
        cls: 'serif',
        size: 'clamp(2.2rem, 1.65vw + 1.15rem, 3.55rem)',
        d: '-0.5s',
      },
      {
        ch: 'h',
        leftPct: 17,
        top: '0',
        h: 'clamp(14.5rem, 44vh, 32rem)',
        cls: 'serif',
        size: 'clamp(2.45rem, 1.85vw + 1.2rem, 3.85rem)',
        d: '-1.6s',
      },
      {
        ch: 'i',
        leftPct: 22.5,
        top: '1.6vh',
        h: 'clamp(11.5rem, 34vh, 24rem)',
        cls: 'mono',
        size: 'clamp(1.65rem, 1.05vw + 1.05rem, 2.35rem)',
        d: '-2.4s',
      },
      {
        ch: 'n',
        leftPct: 28,
        top: '0.5vh',
        h: 'clamp(13rem, 37vh, 26rem)',
        cls: 'serif',
        size: 'clamp(2.2rem, 1.45vw + 1.08rem, 3.2rem)',
        d: '-1s',
      },
      {
        ch: 'k',
        leftPct: 33.5,
        top: '0.15vh',
        h: 'clamp(14rem, 41vh, 29.5rem)',
        cls: 'serif',
        size: 'clamp(2.35rem, 1.6vw + 1.12rem, 3.5rem)',
        d: '-3s',
      },

      {
        ch: 'i',
        leftPct: 40,
        top: '2.4vh',
        h: 'clamp(9.5rem, 28vh, 20rem)',
        cls: 'mono',
        size: 'clamp(1.55rem, 1vw + 0.98rem, 2.2rem)',
        d: '-0.7s',
      },
      {
        ch: 'n',
        leftPct: 45.5,
        top: '1.9vh',
        h: 'clamp(10rem, 30vh, 21rem)',
        cls: 'mono',
        size: 'clamp(1.58rem, 1.02vw + 1rem, 2.25rem)',
        d: '-2.6s',
      },

      {
        ch: 't',
        leftPct: 52,
        top: '1vh',
        h: 'clamp(11.5rem, 34vh, 24.5rem)',
        cls: 'mono',
        size: 'clamp(1.58rem, 1.02vw + 1rem, 2.25rem)',
        d: '-1.3s',
      },
      {
        ch: 'h',
        leftPct: 58,
        top: '0.4vh',
        h: 'clamp(12.5rem, 38vh, 27rem)',
        cls: 'serif',
        size: 'clamp(2.15rem, 1.45vw + 1.08rem, 3.25rem)',
        d: '-2.9s',
      },
      {
        ch: 'e',
        leftPct: 64,
        top: '1.7vh',
        h: 'clamp(10.5rem, 32vh, 22.5rem)',
        cls: 'serif',
        size: 'clamp(2rem, 1.32vw + 1.05rem, 3rem)',
        d: '-1.8s',
      },

      {
        ch: 'w',
        leftPct: 71,
        top: '0',
        h: 'clamp(15rem, 45vh, 33rem)',
        cls: 'serif',
        size: 'clamp(2.4rem, 1.75vw + 1.15rem, 3.75rem)',
        d: '-3.4s',
      },
      {
        ch: 'i',
        leftPct: 77.5,
        top: '2.2vh',
        h: 'clamp(9.75rem, 29vh, 20.5rem)',
        cls: 'mono',
        size: 'clamp(1.55rem, 1vw + 0.98rem, 2.2rem)',
        d: '-1.2s',
      },
      {
        ch: 'n',
        leftPct: 83.5,
        top: '0.55vh',
        h: 'clamp(12.5rem, 36vh, 25.5rem)',
        cls: 'serif',
        size: 'clamp(2.18rem, 1.4vw + 1.06rem, 3.15rem)',
        d: '-2.4s',
      },
      {
        ch: 'd',
        leftPct: 89,
        top: '0.1vh',
        h: 'clamp(14.25rem, 42vh, 30rem)',
        cls: 'serif',
        size: 'clamp(2.35rem, 1.58vw + 1.1rem, 3.55rem)',
        d: '-0.9s',
      },
    ],
    []
  )

  return (
    <section className="home-hero" role="img" aria-label="think in the wind">
      <div className="home-hanging" aria-hidden="true" style={{ '--wind-boost': windBoost }}>
        {letters.map((letter, idx) => (
          <div
            className="hang-letter"
            key={`${letter.ch}-${idx}`}
            style={{
              left: `${letter.leftPct}%`,
              top: letter.top,
              '--hangH': letter.h,
              '--letter-size': letter.size,
              '--delay': letter.d,
            }}
          >
            <div className="hang-letter__swing">
              <div className="hang-line" aria-hidden="true" />
              <div
                className={`hang-text ${letter.cls === 'mono' ? 'hang-text--mono' : 'hang-text--serif'}`}
              >
                {letter.ch}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
