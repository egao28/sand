import { useId } from 'react'
import {
  ABOUT_ARM_DOWN,
  ABOUT_ARM_RAISED,
  ABOUT_HEAD_CIRCLE,
  CONTACT_CLOSED_RIM,
  CONTACT_ENVELOPE_BODY,
  CONTACT_FRONT_FOLD,
  CONTACT_LETTER,
  CONTACT_PAPER_REVEAL,
  CONTACT_REAR_FLAP,
  GITHUB_BRANCH_LONG,
  GITHUB_BRANCH_NODE,
  GITHUB_BRANCH_SHORT,
  GITHUB_NODE_RADIUS,
  GITHUB_STEM,
  GITHUB_STEM_NODES,
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
 * groups or as a `d` the stylesheet can swap, and nav-icons.css transitions
 * those from the hover and focus state of the control they sit in. That is what
 * makes the motion play once on entry, hold, and ease back on leave: there is
 * no loop to stop, no timer to clear, no listener to stack up, and interrupting
 * a transition half-way is something the browser already does smoothly.
 *
 * Every icon is 64x64 and `aria-hidden`: the control's own label is the
 * accessible name. All seven are drawn on the same fixed centre — nothing is
 * cropped to its own ink and no state gets a canvas of its own — so the drawing
 * under the pointer never jumps between the two states.
 *
 * `size` is the rendered square, and the only thing that changes between the
 * rail and the compact bar: 40 inside a 48 button on the desktop rail, 28
 * inside a 44 tap target on narrow screens. The viewBox is the same 64 at both,
 * so the line weight scales with the drawing instead of being overridden.
 */

export const DESKTOP_ICON_SIZE = 40
export const MOBILE_ICON_SIZE = 28

function svgProps(size) {
  return {
    viewBox: '0 0 64 64',
    width: size,
    height: size,
    'aria-hidden': 'true',
    focusable: 'false',
  }
}

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: STROKE_WIDTH,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

/** A filled node. Every endpoint in the GitHub drawing is one of these: solid,
 * the same radius, and present in both delivered states. No hollow ring and no
 * bare line end appears anywhere in that icon. */
const nodeProps = {
  fill: 'currentColor',
  stroke: 'none',
}

function AboutIcon({ size }) {
  return (
    <svg className="nav-icon nav-icon--about" {...svgProps(size)}>
      {/* The head does not move. The delivered pair shares it exactly, and the
          V6 drawing is the waving figure — a round head, never a profile. */}
      <circle
        cx={ABOUT_HEAD_CIRCLE.cx}
        cy={ABOUT_HEAD_CIRCLE.cy}
        r={ABOUT_HEAD_CIRCLE.radius}
        {...strokeProps}
      />
      {/* Shoulder and arm as one stroke. Both outlines ride on the element as
          custom properties so the stylesheet can interpolate between them; the
          shoulder half of the path is identical in the two files, so only the
          hand actually travels. */}
      <path
        className="nav-icon-about-arm"
        style={{
          '--arm-down': `path("${ABOUT_ARM_DOWN}")`,
          '--arm-raised': `path("${ABOUT_ARM_RAISED}")`,
        }}
        d={ABOUT_ARM_DOWN}
        {...strokeProps}
      />
    </svg>
  )
}

function ProjectsIcon({ size }) {
  return (
    <svg className="nav-icon nav-icon--projects" {...svgProps(size)}>
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

function ResumeIcon({ size }) {
  return (
    <svg className="nav-icon nav-icon--resume" {...svgProps(size)}>
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

function ContactIcon({ size }) {
  // More than one Contact icon can be in the document at once — the rail and
  // the compact bar are both rendered on the homepage — and two <clipPath>
  // elements sharing an id would leave whichever lost the race clipping both.
  // useId is per instance, so each copy refers to its own mask.
  const clipId = `${useId()}-paper-reveal`

  return (
    <svg className="nav-icon nav-icon--contact" {...svgProps(size)}>
      <defs>
        <clipPath id={clipId}>
          <path d={CONTACT_PAPER_REVEAL} />
        </clipPath>
      </defs>

      {/* Painted in the delivered order, back to front: the top edge and the
          wings, then the letter behind the fold, then the envelope itself. */}
      <path className="nav-icon-contact-rim" d={CONTACT_CLOSED_RIM} {...strokeProps} />
      <path className="nav-icon-contact-wings" d={CONTACT_REAR_FLAP} {...strokeProps} />

      <g clipPath={`url(#${clipId})`}>
        <g className="nav-icon-contact-letter">
          <path d={CONTACT_LETTER} {...strokeProps} />
        </g>
      </g>

      {/* Both fixed: the body with its lower-left loop, and the V of the front
          panel the letter comes up from behind. */}
      <path d={CONTACT_ENVELOPE_BODY} {...strokeProps} />
      <path d={CONTACT_FRONT_FOLD} {...strokeProps} />
    </svg>
  )
}

function GithubIcon({ size }) {
  return (
    <svg className="nav-icon nav-icon--github" {...svgProps(size)}>
      {/* The stem runs through the fork at (27,33) and never moves. */}
      <path d={GITHUB_STEM} {...strokeProps} />

      {/* The branch leaves the stem at that same fork, so the two stay joined:
          there is no break at the junction and no spur sticking out past it.
          Its two outlines ride on the element for the stylesheet to
          interpolate. */}
      <path
        className="nav-icon-github-branch"
        style={{
          '--branch-short': `path("${GITHUB_BRANCH_SHORT}")`,
          '--branch-long': `path("${GITHUB_BRANCH_LONG}")`,
        }}
        d={GITHUB_BRANCH_SHORT}
        {...strokeProps}
      />

      {GITHUB_STEM_NODES.map((node) => (
        <circle
          key={`${node.cx}-${node.cy}`}
          cx={node.cx}
          cy={node.cy}
          r={GITHUB_NODE_RADIUS}
          {...nodeProps}
        />
      ))}

      {/* The branch's own node. It is drawn in both states and simply travels
          with the end of the branch — see the note in iconPaths.js on why the
          two stay welded together for the whole of the motion. */}
      <circle
        className="nav-icon-github-node"
        cx={GITHUB_BRANCH_NODE.cx}
        cy={GITHUB_BRANCH_NODE.cy}
        r={GITHUB_NODE_RADIUS}
        style={{
          '--node-reach': `${GITHUB_BRANCH_NODE.endX - GITHUB_BRANCH_NODE.cx}px`,
          '--node-rise': `${GITHUB_BRANCH_NODE.endY - GITHUB_BRANCH_NODE.cy}px`,
        }}
        {...nodeProps}
      />
    </svg>
  )
}

function LinkedinIcon({ size }) {
  return (
    <svg className="nav-icon nav-icon--linkedin" {...svgProps(size)}>
      {/* The letters are outside the moving group and carry no transform of
          their own: the whole hover is the dot above the i, and the two files
          differ in nothing else. */}
      <path d={LINKEDIN_LETTERS} {...strokeProps} />
      <circle
        className="nav-icon-linkedin-dot"
        cx={LINKEDIN_DOT.cx}
        cy={LINKEDIN_DOT.restY}
        r={LINKEDIN_DOT.radius}
        style={{ '--dot-rise': `${LINKEDIN_DOT.hoverY - LINKEDIN_DOT.restY}px` }}
        {...nodeProps}
      />
    </svg>
  )
}

/** The theme button's symbol. `theme` is the theme the page is in now, not the
 * one the button switches to: light shows the moon, dark shows the sun. This is
 * not a hover pair — hovering turns the symbol a few degrees and changes
 * nothing else; see nav-icons.css. */
function ThemeIcon({ theme, size = DESKTOP_ICON_SIZE }) {
  return (
    <svg className="nav-icon nav-icon--theme" {...svgProps(size)}>
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

export default function NavIcon({ id, size = DESKTOP_ICON_SIZE }) {
  const Icon = ICONS[id]
  return Icon ? <Icon size={size} /> : null
}
