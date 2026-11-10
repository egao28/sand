/*
  Icon geometry for the seven nav entries.

  Every outline here is the artwork delivered in
  `website_final_handoff_v6/assets/{light,dark}/svg`, carried over verbatim.
  The two colour sets are the same geometry — they differ only in ink, #302D29
  against #F2EEE9 — so one set of paths is drawn with `currentColor` and the
  theme supplies the colour. Nothing below is redrawn, re-fitted or cropped.

  All seven share one `0 0 64 64` viewBox, stroke 2.4, round caps and round
  joins, exactly as delivered. None is cropped to its own ink or stretched to
  fill the box, and every one is aligned on the same fixed centre, so the
  drawing under the pointer never shifts between the two states.

  Three of the seven are new in V6 and replace earlier candidates outright:

    About    the A3 waving figure — a still round head and an arm that lifts.
             Not the A1 side-face head this file used to carry.
    GitHub   Branch Unfold with solid endpoints — a short branch that grows,
             carrying its filled node with it. Not the Travel dot that used to
             ride the long curve, and no hollow ring anywhere in it.
    Contact  the E1 looping envelope with the E2 letter, delivered as clean
             layered strokes. It replaces the filled contour that had to be
             split out of a PDF, and with it goes the lighter stroke width
             that artwork needed.

  Projects, Resume, LinkedIn and Theme are unchanged: the V6 files for those
  four are byte-identical in geometry to what this file already carried.
*/

/** The delivered weight, now shared by all seven — Contact included. */
export const STROKE_WIDTH = 2.4

// --- About -----------------------------------------------------------------
// about_start.svg / about_end.svg. A circle head and one arm path. The two
// files share a head and differ only in the arm's second cubic, and both arms
// are written with the same command list (`M` then two `C`), so the arm
// interpolates directly from one to the other: the hand lifts, and the figure
// is not redrawn.
export const ABOUT_HEAD_CIRCLE = { cx: 30, cy: 19, radius: 7 }
export const ABOUT_ARM_DOWN = 'M12 47 C17 35 26 36 33 41 C39 44 45 43 51 45'
export const ABOUT_ARM_RAISED = 'M12 47 C17 35 26 36 33 41 C43 47 45 26 53 31'

// --- Projects --------------------------------------------------------------
// projects_start.svg: one blade, drawn three times at 120 deg. The end file
// wraps all three in `rotate(24 32 32)`, so the hover turns the whole pinwheel
// about its hub. Unchanged in V6.
export const PINWHEEL_BLADE = 'M32 32 Q20 23 28 11 Q31 8 36 8 Q31 20 32 32'
export const PINWHEEL_BLADE_ANGLES = [0, 120, 240]
export const PINWHEEL_PIVOT = { x: 32, y: 32, degrees: 24 }

// --- GitHub ----------------------------------------------------------------
// github_start.svg / github_end.svg, the Branch Unfold drawing.
//
// The stem runs from (21,51) to (31,12) through the fork at (27,33), and it
// does not move. All three endpoints are filled dots of the same radius, all
// three are present in both files, and none of them is a hollow ring.
//
// The hover is the branch alone. Its path keeps the same command list in both
// files — `M27 33` then one `C` — so it interpolates, and it stays joined to
// the stem at the fork because that `M` is the fork. Its dot is carried along
// by a translate.
//
// `d` interpolation moves the curve's last point in a straight line from
// (36,31) to (49,25); the same translate moves the dot along that same line.
// Given one duration and one easing for both — see nav-icons.css — the dot sits
// on the end of the branch at every frame of the motion, so no bare stub of
// line is ever drawn ahead of its node and no line ever runs out through one.
export const GITHUB_STEM = 'M21 51 C23 43 27 37 27 33 C31 26 33 19 31 12'
export const GITHUB_FORK = { x: 27, y: 33 }
export const GITHUB_NODE_RADIUS = 2.6
/** The stem's own two endpoints. Fixed in both files. */
export const GITHUB_STEM_NODES = [
  { cx: 21, cy: 51 },
  { cx: 31, cy: 12 },
]
export const GITHUB_BRANCH_SHORT = 'M27 33 C30 33 33 32 36 31'
export const GITHUB_BRANCH_LONG = 'M27 33 C35 33 43 29 49 25'
/** Where the branch's node rests, and how far the unfold carries it. */
export const GITHUB_BRANCH_NODE = { cx: 36, cy: 31, endX: 49, endY: 25 }

// --- Resume ----------------------------------------------------------------
// resume_start.svg and resume_end.svg. The two outlines are built from
// different commands — four quadratics against a mix of lines and quadratics —
// so neither CSS nor SMIL can interpolate them as delivered. Both have been
// walked from the same corner in the same direction and resampled to the same
// 44 points per subpath, which leaves two `d` values with an identical command
// list and the same shapes at each end. The page genuinely unfolds; it is not
// two drawings dissolving into each other.
//
// Unchanged in V6: the delivered files are the same outlines these were
// resampled from.
export const RESUME_CLOSED =
  'M17.00,18.00L19.78,17.95L22.56,17.82L25.33,17.61L28.09,17.32L30.85,16.95L33.59,16.51L36.33,16.01L39.05,15.45L41.76,14.82L44.45,14.14L44.59,16.18L44.07,18.91L43.53,21.64L42.99,24.36L42.45,27.09L41.89,29.81L41.33,32.53L40.76,35.26L40.18,37.98L39.60,40.69L39.01,43.41L38.41,46.13L37.15,47.85L34.41,47.39L31.66,46.99L28.90,46.67L26.13,46.43L23.35,46.28L20.58,46.20L17.80,46.23L15.02,46.35L12.25,46.58L9.49,46.93L9.63,44.80L10.38,42.13L11.14,39.45L11.88,36.77L12.63,34.10L13.37,31.42L14.10,28.74L14.83,26.05L15.56,23.37L16.28,20.69ZM45.00,14.00L45.30,15.12L45.60,16.24L45.91,17.35L46.22,18.47L46.54,19.58L46.86,20.70L47.18,21.81L47.50,22.92L47.83,24.03L48.16,25.14L48.50,26.25L48.84,27.36L49.18,28.47L49.52,29.57L49.87,30.68L50.22,31.78L50.57,32.89L50.93,33.99L51.29,35.09L51.65,36.19L52.01,37.29L52.38,38.39L52.75,39.49L53.12,40.58L53.50,41.68L53.87,42.78L54.25,43.87L54.64,44.96L54.94,45.99L53.80,45.78L52.66,45.56L51.52,45.35L50.39,45.13L49.25,44.92L48.11,44.71L46.97,44.49L45.83,44.28L44.69,44.07L43.55,43.85L42.42,43.64L41.28,43.43L40.14,43.21L39.00,43.00'
export const RESUME_OPEN =
  'M10.00,20.00L13.09,18.96L16.29,18.29L19.54,18.01L22.80,18.12L26.03,18.59L29.20,19.40L32.29,19.56L35.42,18.65L38.62,17.97L41.85,17.54L45.11,17.34L48.38,17.39L51.63,17.66L53.94,18.87L53.71,22.13L53.47,25.39L53.24,28.64L53.01,31.90L52.77,35.16L52.54,38.41L52.31,41.67L52.08,44.93L49.84,45.64L46.59,45.36L43.32,45.39L40.07,45.70L36.86,46.28L33.70,47.10L30.60,47.86L27.48,46.90L24.29,46.21L21.05,45.82L17.79,45.72L14.53,45.93L11.31,46.45L9.03,46.11L9.15,42.84L9.27,39.58L9.40,36.32L9.52,33.05L9.64,29.79L9.76,26.53L9.88,23.26ZM31.00,20.00L31.00,20.65L31.00,21.30L31.00,21.95L31.00,22.60L31.00,23.26L31.00,23.91L31.00,24.56L31.00,25.21L31.00,25.86L31.00,26.51L31.00,27.16L31.00,27.81L31.00,28.47L31.00,29.12L31.00,29.77L31.00,30.42L31.00,31.07L31.00,31.72L31.00,32.37L31.00,33.02L31.00,33.67L31.00,34.33L31.00,34.98L31.00,35.63L31.00,36.28L31.00,36.93L31.00,37.58L31.00,38.23L31.00,38.88L31.00,39.53L31.00,40.19L31.00,40.84L31.00,41.49L31.00,42.14L31.00,42.79L31.00,43.44L31.00,44.09L31.00,44.74L31.00,45.40L31.00,46.05L31.00,46.70L31.00,47.35L31.00,48.00'

// --- Contact ---------------------------------------------------------------
// contact_start.svg and contact_end.svg, verbatim. V6 delivers this icon as
// layered strokes with the moving parts already named, which is why none of the
// splitting, re-fitting and silhouette-tracing the previous artwork needed
// survives here. It is stroked at the group's 2.4 like the other six; there is
// no filled contour left to carry a lighter weight of its own.
//
// Four pieces, and only three of them move:
//
//   ENVELOPE_BODY  the body and the loop at its lower left. Fixed.
//   FRONT_FOLD     the V of the front panel. Fixed.
//   CLOSED_RIM     the closed top edge. Visible at rest.
//   REAR_FLAP      the two open wings. Visible at the end.
//   LETTER         rises from behind the front fold.
//
// The top edge and the wings are the same edge of the same envelope in its two
// positions, which is the one place the delivered files swap rather than move;
// everything else is the same ink throughout. No two drawings are dissolved
// into each other, and nothing is scaled up to pass for an opened envelope.
export const CONTACT_ENVELOPE_BODY =
  'M9 29 C5 33 5 44 7 47 C10 53 21 51 19 46 C17 41 11 46 12 50 C13 55 20 55 28 54 L48 54 Q56 54 57 48 Q59 34 55 29'
export const CONTACT_FRONT_FOLD = 'M9 29 C19 33 28 41 32 41 C36 41 45 32 55 29'
export const CONTACT_CLOSED_RIM = 'M9 29 C17 24 25 27 32 26 C41 26 51 23 55 29'
export const CONTACT_REAR_FLAP = 'M9 29 Q12 25 16 25 M48 25 Q53 25 55 29'
export const CONTACT_LETTER = 'M18 32 L18 19 Q18 15 23 15 L41 15 Q46 14 46 20 L46 32'

/** The delivered `paper-reveal` mask: everything above the envelope's own front
 * fold. It is what keeps the letter behind the V rather than across it, both
 * at rest and all the way up. */
export const CONTACT_PAPER_REVEAL = 'M0 0 H64 V29 C49 29 37 41 32 41 C27 41 16 31 0 27 Z'

/* How far down the letter sits at rest.
 *
 * The delivered start file parks it at `translate(0 13)` and then sets
 * `opacity: 0` on top of that, because 13 is nowhere near far enough to hide
 * it: CONTACT_PAPER_REVEAL reaches its deepest at the point of the V, (32,41),
 * and at an offset of 13 the letter's top edge sits at y=26.8 there — a wide
 * band of paper standing up out of the envelope. The delivered file covers
 * that with the opacity rather than with the mask.
 *
 * 28 is where the mask takes over at every column of the letter, the point of
 * the V included. Past it the letter is genuinely behind the front fold at
 * rest, so the hover is a slide and nothing else — no fade, and no sliver of
 * paper showing through the notch of the V before the motion starts.
 *
 * Both delivered states are still reproduced exactly: no letter at rest, and
 * the letter at `translate(0 0)` at the end. The one value that differs from
 * the file is the one the mask makes invisible either way.
 */
export const CONTACT_LETTER_REST_Y = 28

// --- LinkedIn --------------------------------------------------------------
// linkedin_start.svg and linkedin_end.svg (the L1 drawing). The two files are
// the same three letter strokes and the same dot; the only difference between
// them is the dot's cy, 19 against 13. So the hover is that one move and
// nothing else: the letters are not redrawn, nudged or rescaled, and there is
// no arrow, trail, second dot, frame or underline anywhere in either file.
// Unchanged in V6.
export const LINKEDIN_LETTERS =
  'M19 28 Q18.6 38 19 48 M30 48 L30 28 M30 34 C33 27 39 26 43 29 C47 32 45 41 46 48'
export const LINKEDIN_DOT = { cx: 19, restY: 19, hoverY: 13, radius: 1.5 }

// --- Theme -----------------------------------------------------------------
// theme_start.svg (moon) and theme_end.svg (sun). Unlike the six above, these
// are not two ends of one hover: they are the button's symbol in each theme —
// moon while the page is light, sun while it is dark — so the switch between
// them follows the theme, and hovering only turns the symbol a few degrees.
// Unchanged in V6.
export const THEME_MOON =
  'M43 12 C25 10 13 23 17 38 C21 53 43 56 52 39 C39 43 27 34 29 23 C30 18 34 14 43 12Z'
export const THEME_SUN_CORE = { cx: 32, cy: 32, radius: 10 }
export const THEME_SUN_RAY = 'M32 10 L32 15'
export const THEME_SUN_RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]
