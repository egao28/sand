import { Link } from 'react-router-dom'
import { useState } from 'react'
import photo2Avif from '../assets/projects/photo-2.avif'
import photo2Webp from '../assets/projects/photo-2.webp'
import photo2Png from '../assets/projects/photo-2.png'
import photo3Avif from '../assets/projects/photo-3.avif'
import photo3Webp from '../assets/projects/photo-3.webp'
import photo3Png from '../assets/projects/photo-3.png'
import photo4Avif from '../assets/projects/photo-4.avif'
import photo4Webp from '../assets/projects/photo-4.webp'
import photo4Png from '../assets/projects/photo-4.png'
import photo5Avif from '../assets/projects/photo-5.avif'
import photo5Webp from '../assets/projects/photo-5.webp'
import photo5Png from '../assets/projects/photo-5.png'

const PHOTOS = [
  { avif: photo2Avif, webp: photo2Webp, png: photo2Png },
  { avif: photo3Avif, webp: photo3Webp, png: photo3Png },
  { avif: photo4Avif, webp: photo4Webp, png: photo4Png },
  { avif: photo5Avif, webp: photo5Webp, png: photo5Png },
]

// Handcrafted cascade wave, as percent anchors inside the gallery canvas.
//
// Gap is intentionally narrower than a card so adjacent cards overlap like a
// scattered photo pile. A card is clamp(190px, 24vw, 300px) against a canvas of
// min(100vw, 1100px) - 7rem, i.e. 27-30% of it depending on viewport, so four
// across cannot fit in 100% without overlapping. At 23 the gap leaves roughly a
// quarter of each card covered.
//
// Cards are positioned by their centre (see slotFor), so a row is centred at
// any card width and the overlap is the only thing this number decides. Raising
// it much further pushes the outermost cards past the canvas; there is room for
// that in .projects-gallery-wrap's 3.5rem of padding, and .projects-gallery
// sets no overflow, but it is padding meant for the section, not for cards.
const STEP = 23 // percent gap between adjacent slot centres

// Where the pile sits vertically, and the per-column stagger applied on top of
// it. Kept apart on purpose: TOP_WAVE is the shape, PILE_TOP is the position,
// and retuning one no longer means preserving the other by hand.
//
// A card is its image plus a label that wraps to two lines on the longest
// title, which comes to roughly 275px at the 300px width ceiling, against a
// 520-680px canvas. Anchored near zero the pile left about half the canvas
// empty below it.
const PILE_TOP = 23
const TOP_WAVE = [2, 8, 0, 9]
const ROW_LENGTH = TOP_WAVE.length
const ROW_GAP = 9 // percent of vertical space between wrapped rows

// One slot per item, independent of PHOTOS.length/ROW_LENGTH: a 5th project
// (or more) wraps to a new row with a shifted top instead of silently
// reusing an earlier item's exact position. Each row is centered on its own
// item count, so a partial row (e.g. a lone 5th item) doesn't sit lopsided
// in the leftover space of a wider, never-filled 4-across layout.
function slotFor(index, count) {
  const col = index % ROW_LENGTH
  const row = Math.floor(index / ROW_LENGTH)
  const itemsInRow = Math.min(ROW_LENGTH, count - row * ROW_LENGTH)
  // Offset of this card's centre from the canvas centre. Anchoring centres
  // rather than left edges is what keeps a row centred: the previous version
  // measured from a constant 31% card width, but the real card is 27-30% of the
  // canvas below a ~1250px viewport, and the difference piled up as dead space
  // on the right — 42px at 1100px wide.
  const centreOffset = (col - (itemsInRow - 1) / 2) * STEP
  return {
    top: `${PILE_TOP + TOP_WAVE[col] + row * ROW_GAP}%`,
    centreOffset,
  }
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
                // 50% puts the card's left edge at the canvas centre; backing off
                // half a card width centres the card itself, whatever that width
                // currently resolves to.
                left: `calc(50% + ${slot.centreOffset + Number(jitterX)}% - (var(--card-w) / 2))`,
                '--tilt': `${tilt}deg`,
                '--delay': `${delay}s`,
                zIndex,
              }}
            >
              <span className="project-photo-swing">
                <picture>
                  <source srcSet={photo.avif} type="image/avif" />
                  <source srcSet={photo.webp} type="image/webp" />
                  <img src={photo.png} alt="" className="project-photo-img" decoding="async" />
                </picture>
              </span>
              <span className="project-photo-label">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
