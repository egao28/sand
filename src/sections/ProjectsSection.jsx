import { Link } from 'react-router-dom'
import { useState } from 'react'
import photo1 from '../assets/projects/photo-1.png'
import photo2 from '../assets/projects/photo-2.png'
import photo3 from '../assets/projects/photo-3.png'
import photo4 from '../assets/projects/photo-4.png'
import photo5 from '../assets/projects/photo-5.png'

const PHOTOS = [photo1, photo2, photo3, photo4, photo5]

// Designed cascade slots (percent anchors inside the gallery canvas), sized
// against the real .sec-inner content width (~988px at desktop, ~673px at
// the 721px mobile-breakpoint edge) and the card width ceiling (220px, see
// CSS) so the rightmost slot can't push a card past the container edge even
// with max jitter applied.
const SLOTS = [
  { top: '3%', left: '3%' },
  { top: '9%', left: '19%' },
  { top: '1%', left: '36%' },
  { top: '10%', left: '53%' },
  { top: '5%', left: '70%' },
]

function shuffledIndices(n) {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function ProjectsSection({ content }) {
  // Lazy useState initializer, not useMemo: the shuffle/jitter is randomness
  // that must run exactly once per mount, which React's purity rules only
  // allow at this specific spot (useMemo is expected to be a pure function
  // of its deps and may be re-invoked by the framework at any time).
  const [arrangement] = useState(() => {
    const order = shuffledIndices(PHOTOS.length)
    return content.items.map((item, i) => ({
      item,
      photo: PHOTOS[order[i % PHOTOS.length]],
      slot: SLOTS[i % SLOTS.length],
      tilt: (Math.random() * 12 - 6).toFixed(2), // -6deg .. 6deg
      jitterX: (Math.random() * 3 - 1.5).toFixed(2), // -1.5% .. 1.5%
      jitterY: (Math.random() * 3 - 1.5).toFixed(2),
      zIndex: order[i % PHOTOS.length] + 1, // rides the same shuffle, not pinned to slot i
      delay: (i * 0.9 + Math.random() * 0.6).toFixed(2), // staggers the sway, mirrors hero
    }))
  })

  return (
    <section id="projects" className="projects-landing">
      <div className="sec-inner projects-gallery-wrap">
        <div className="projects-gallery" aria-label="Project links">
          {arrangement.map(({ item, photo, slot, tilt, jitterX, jitterY, zIndex, delay }) => (
            <Link
              key={item.slug}
              to={item.href}
              className="project-photo-card reveal"
              style={{
                top: `calc(${slot.top} + ${jitterY}%)`,
                left: `calc(${slot.left} + ${jitterX}%)`,
                '--tilt': `${tilt}deg`,
                '--delay': `${delay}s`,
                zIndex,
              }}
            >
              <span className="project-photo-swing">
                <img src={photo} alt="" className="project-photo-img" decoding="async" />
              </span>
              <span className="project-photo-label">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
