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
  CONTACT_STROKE_WIDTH,
  CONTACT_TOP_EDGE,
  GITHUB_NODES,
  GITHUB_STROKES,
  GITHUB_TRAVEL,
  GITHUB_TRAVEL_PATH,
  LINKEDIN_DOT,
  LINKEDIN_LETTERS,
  PINWHEEL_BLADE,
  PINWHEEL_BLADE_ANGLES,
  RESUME_CLOSED,
  RESUME_OPEN,
  STROKE_WIDTH,
  THEME_MOON,
  THEME_SUN_CORE,
  THEME_SUN_RAY,
  THEME_SUN_RAY_ANGLES,
} from './iconPaths.js'

/* Seven inline SVGs: one per nav entry, plus the theme button's two symbols.
 *
 * None of them animates itself. Each exposes the parts that move as their own
 * groups, and nav-icons.css transitions those groups from the hover and focus
 * state of the control they sit in. That is what makes the motion play once on
 * entry, hold, and ease back on leave: there is no loop to stop, no timer to
 * clear, no listener to stack up, and interrupting a transition half-way is
 * something the browser already does smoothly.
 *
 * Every icon is 64x64 and `aria-hidden`: the control's own label is the
 * accessible name. All seven are drawn on the same fixed centre — nothing is
 * cropped to its own ink and no state gets a canvas of its own — so the
 * drawing under the pointer never jumps between the two states.
 */

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

/* Contact is the one icon that is filled artwork rather than a stroked
 * skeleton. The delivered file brings it up to the group's weight by stroking
 * its own contour at a lighter width — see CONTACT_STROKE_WIDTH — so it takes
 * these props and never `strokeProps`. Both fill and stroke are currentColor,
 * which is what lets one colour change carry the whole drawing; a stroke-only
 * swap would leave the fill behind. */
const contactInkProps = {
  fill: 'currentColor',
  stroke: 'currentColor',
  strokeWidth: CONTACT_STROKE_WIDTH,
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
  // One rail can hold more than one Contact icon — the rail and the compact bar
  // are both in the document at some widths — and two <clipPath> elements
  // sharing an id would leave whichever lost the race clipping both. useId is
  // per instance, so each copy refers to its own.
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
        <path d={CONTACT_FLAP} {...contactInkProps} />
      </g>

      <g clipPath={`url(#${clipId})`}>
        <g className="nav-icon-contact-letter">
          {/* Page colour under the outline, so the flap behind it is covered
              rather than showing through the paper. Deliberately unstroked:
              it is a backing shape, not part of the drawing. */}
          <path d={CONTACT_LETTER_FILL} className="nav-icon-contact-paper" />
          <path d={CONTACT_LETTER} {...contactInkProps} />
        </g>
      </g>

      <path d={CONTACT_BODY + CONTACT_TOP_EDGE + CONTACT_CORNER} {...contactInkProps} />
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
          straight line between the two ends. The branch and the three nodes
          underneath it do not move. */}
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

function LinkedinIcon() {
  return (
    <svg className="nav-icon nav-icon--linkedin" {...svgProps}>
      {/* The letters are outside the moving group and carry no transform of
          their own: the whole hover is the dot above the i, and the two files
          differ in nothing else. */}
      <path d={LINKEDIN_LETTERS} {...strokeProps} />
      <circle
        className="nav-icon-linkedin-dot"
        cx={LINKEDIN_DOT.cx}
        cy={LINKEDIN_DOT.restY}
        r={LINKEDIN_DOT.radius}
        fill="currentColor"
        style={{ '--dot-rise': `${LINKEDIN_DOT.hoverY - LINKEDIN_DOT.restY}px` }}
      />
    </svg>
  )
}

/** The theme button's symbol. `theme` is the theme the page is in now, not the
 * one the button switches to: light shows the moon, dark shows the sun. This is
 * not a hover pair — hovering turns the symbol a few degrees and changes
 * nothing else; see nav-icons.css. */
function ThemeIcon({ theme }) {
  return (
    <svg className="nav-icon nav-icon--theme" {...svgProps}>
      <g className="nav-icon-theme-turn">
        {theme === 'dark' ? (
          <>
            <circle
              cx={THEME_SUN_CORE.cx}
              cy={THEME_SUN_CORE.cy}
              r={THEME_SUN_CORE.radius}
              {...strokeProps}
            />
            {THEME_SUN_RAY_ANGLES.map((angle) => (
              <path
                key={angle}
                d={THEME_SUN_RAY}
                transform={`rotate(${angle} 32 32)`}
                {...strokeProps}
              />
            ))}
          </>
        ) : (
          <path d={THEME_MOON} {...strokeProps} />
        )}
      </g>
    </svg>
  )
}

const ICONS = {
  about: AboutIcon,
  projects: ProjectsIcon,
  resume: ResumeIcon,
  contact: ContactIcon,
  github: GithubIcon,
  linkedin: LinkedinIcon,
}

export { ThemeIcon }

export default function NavIcon({ id }) {
  const Icon = ICONS[id]
  return Icon ? <Icon /> : null
}
