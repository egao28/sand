import { useId } from 'react'
import {
  ABOUT_HEAD,
  ABOUT_PIVOT,
  CONTACT_BODY,
  CONTACT_CORNER,
  CONTACT_FLAP,
  CONTACT_LETTER,
  CONTACT_LETTER_FILL,
  CONTACT_OCCLUDER,
  CONTACT_TOP_EDGE,
  GITHUB_NODES,
  GITHUB_STROKES,
  GITHUB_TRAVEL,
  GITHUB_TRAVEL_PATH,
  PINWHEEL_BLADE,
  PINWHEEL_BLADE_ANGLES,
  RESUME_CLOSED,
  RESUME_OPEN,
  STROKE_WIDTH,
} from './iconPaths.js'

/* Five inline SVGs, one per nav entry.
 *
 * None of them animates itself. Each exposes the parts that move as their own
 * groups, and nav-icons.css transitions those groups from the hover and focus
 * state of the link they sit in. That is what makes the motion play once on
 * entry, hold, and ease back on leave: there is no loop to stop, no timer to
 * clear, no listener to stack up, and interrupting a transition half-way is
 * something the browser already does smoothly.
 *
 * Every icon is 64x64 and `aria-hidden`: the link's own label is the accessible
 * name. */

const svgProps = {
  viewBox: '0 0 64 64',
  width: 40,
  height: 40,
  'aria-hidden': 'true',
  focusable: 'false',
}

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: STROKE_WIDTH,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function AboutIcon() {
  return (
    <svg className="nav-icon nav-icon--about" {...svgProps}>
      {/* Lifts its chin by 7 degrees about the point the end file hinges on. */}
      <g
        className="nav-icon-about-head"
        style={{ transformOrigin: `${ABOUT_PIVOT.x}px ${ABOUT_PIVOT.y}px` }}
      >
        <path d={ABOUT_HEAD} {...strokeProps} />
      </g>
    </svg>
  )
}

function ProjectsIcon() {
  return (
    <svg className="nav-icon nav-icon--projects" {...svgProps}>
      <g className="nav-icon-pinwheel">
        {PINWHEEL_BLADE_ANGLES.map((angle) => (
          <g key={angle} transform={`rotate(${angle} 32 32)`}>
            <path d={PINWHEEL_BLADE} {...strokeProps} />
          </g>
        ))}
      </g>
    </svg>
  )
}

function ResumeIcon() {
  return (
    <svg className="nav-icon nav-icon--resume" {...svgProps}>
      {/* Both outlines ride on the element as custom properties so the stylesheet
          can swap between them; see the resampling note in iconPaths.js. */}
      <path
        className="nav-icon-resume-page"
        style={{
          '--page-closed': `path("${RESUME_CLOSED}")`,
          '--page-open': `path("${RESUME_OPEN}")`,
        }}
        d={RESUME_CLOSED}
        {...strokeProps}
      />
    </svg>
  )
}

function ContactIcon() {
  const clipId = `${useId()}-envelope`

  return (
    <svg className="nav-icon nav-icon--contact" {...svgProps}>
      <defs>
        <clipPath id={clipId}>
          <path d={CONTACT_OCCLUDER} />
        </clipPath>
      </defs>

      {/* Back to front: flap, then letter, then the front panel — so the letter
          rises out from behind the panel and in front of the opened flap. */}
      <g className="nav-icon-contact-flap">
        <path d={CONTACT_FLAP} fill="currentColor" />
      </g>

      <g clipPath={`url(#${clipId})`}>
        <g className="nav-icon-contact-letter">
          {/* Page colour under the outline, so the flap behind it is covered
              rather than showing through the paper. */}
          <path d={CONTACT_LETTER_FILL} className="nav-icon-contact-paper" />
          <path d={CONTACT_LETTER} fill="currentColor" />
        </g>
      </g>

      <path d={CONTACT_BODY + CONTACT_TOP_EDGE + CONTACT_CORNER} fill="currentColor" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg className="nav-icon nav-icon--github" {...svgProps}>
      <path d={GITHUB_STROKES} {...strokeProps} />
      {GITHUB_NODES.map((node) => (
        <circle key={`${node.cx}-${node.cy}`} cx={node.cx} cy={node.cy} r={2.4} {...strokeProps} />
      ))}
      {/* Travels the right-hand curve once and stops where the end file draws
          it. `offset-path` keeps it on the curve itself rather than on a
          straight line between the two ends. */}
      <circle
        className="nav-icon-github-dot"
        r={GITHUB_TRAVEL.radius}
        fill="currentColor"
        style={{
          offsetPath: `path("${GITHUB_TRAVEL_PATH}")`,
          '--travel-end': `${GITHUB_TRAVEL.endAt}%`,
        }}
      />
    </svg>
  )
}

const ICONS = {
  about: AboutIcon,
  projects: ProjectsIcon,
  resume: ResumeIcon,
  contact: ContactIcon,
  github: GithubIcon,
}

export default function NavIcon({ id }) {
  const Icon = ICONS[id]
  return Icon ? <Icon /> : null
}
