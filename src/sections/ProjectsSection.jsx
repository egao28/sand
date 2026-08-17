import { Link } from 'react-router-dom'
import { useState } from 'react'
import photo1 from '../assets/projects/photo-1.png'
import photo2 from '../assets/projects/photo-2.png'
import photo3 from '../assets/projects/photo-3.png'
import photo4 from '../assets/projects/photo-4.png'
import photo5 from '../assets/projects/photo-5.png'

const PHOTOS = [photo1, photo2, photo3, photo4, photo5]

// Handcrafted cascade wave (percent anchors inside the gallery canvas), sized
// against the real .sec-inner content width (~988px at desktop, ~673px at
// the 721px mobile-breakpoint edge) and the card width ceiling (300px, see
// CSS) so the rightmost slot can't push a card past the container edge even
// with max jitter applied.
// Gap is intentionally narrower than CARD_WIDTH_PCT so adjacent cards overlap
// like a scattered photo pile — but it must track the card width below (both
// are % of the same canvas) or the overlap balloons. At the old 220px card
// width this gap gave ~25% overlap; at the current 300px width, 21 preserves
// that same ~25% ratio while still leaving room for jitter at the row edges.
const STEP = 21 // percent gap between adjacent slot left-anchors
const TOP_WAVE = [3, 9, 1, 10] // per-column vertical stagger for the scattered look
const ROW_LENGTH = TOP_WAVE.length
const ROW_GAP = 9 // percent of vertical space between wrapped rows
// Real card width is clamp(190px, 24vw, 300px) (see CSS), which maxes out at
// 300px against the ~974px .sec-inner canvas on any normal desktop screen —
// ~31% of canvas width. ROW_LENGTH is capped at 4 (not 5) so a full row at
// that real width still leaves comfortable margin for jitter/tilt on both
// edges; used only to center each row. Keep this in sync with the CSS card
// width, and re-tune STEP above whenever this changes.
const CARD_WIDTH_PCT = 31

// One slot per item, independent of PHOTOS.length/ROW_LENGTH: a 5th project
// (or more) wraps to a new row with a shifted top instead of silently
// reusing an earlier item's exact position. Each row is centered on its own
// item count, so a partial row (e.g. a lone 5th item) doesn't sit lopsided
// in the leftover space of a wider, never-filled 4-across layout.
function slotFor(index, count) {
  const col = index % ROW_LENGTH
  const row = Math.floor(index / ROW_LENGTH)
  const itemsInRow = Math.min(ROW_LENGTH, count - row * ROW_LENGTH)
  const rowStart = (100 - CARD_WIDTH_PCT - STEP * (itemsInRow - 1)) / 2
  return { top: `${TOP_WAVE[col] + row * ROW_GAP}%`, left: `${rowStart + col * STEP}%` }
}

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
    // Photo choice and z-index are shuffled independently of each other and
    // of slot position, each sized to its own count, so neither collides
    // with (or is limited by) how many photo assets happen to exist.
    const photoOrder = shuffledIndices(PHOTOS.length)
    const zOrder = shuffledIndices(content.items.length)
    return content.items.map((item, i) => ({
      item,
      photo: PHOTOS[photoOrder[i % PHOTOS.length]],
      slot: slotFor(i, content.items.length),
      tilt: (Math.random() * 12 - 6).toFixed(2), // -6deg .. 6deg
      jitterX: (Math.random() * 3 - 1.5).toFixed(2), // -1.5% .. 1.5%
      jitterY: (Math.random() * 3 - 1.5).toFixed(2),
      zIndex: zOrder[i] + 1,
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
