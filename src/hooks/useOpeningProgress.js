import { useEffect, useState } from 'react'

/** How far you scroll to get from the opening scene to the About content, as a
 * fraction of the viewport height. Mirrored by `--opening-distance` in
 * global.css: the sticky scene and the About offset are both sized from it, so
 * the two must agree or the transition will not finish flush with the content.
 */
export const OPENING_DISTANCE = 0.8

/** Past this the opening is background and the rail is the live navigation.
 * One threshold for both, so there is never a frame where the scroll hint and
 * the nav are both reachable by Tab, or neither is. */
const HANDOVER_AT = 0.6

/**
 * Drives the homepage opening from native scroll position.
 *
 * Writes progress onto `<html>` as `--opening-progress` rather than into React
 * state: the letters' drift, the hanging lines, the scroll hint, the About fade
 * and the rail reveal are all derived from that one custom property in CSS, so
 * a scroll frame costs a single style write and no re-render. It goes on the
 * root element because the rail is not inside the page — it has to inherit the
 * same value.
 *
 * The one thing that does go through state is `dormant`, which flips once in
 * each direction and decides what is focusable and what takes pointer events.
 *
 * Nothing here intercepts the wheel, hijacks the scroll, or runs on a timer:
 * progress is a pure function of `window.scrollY`, which is what makes the
 * transition reversible and makes a fast flick land where it should.
 */
export function useOpeningProgress(enabled) {
  const [dormant, setDormant] = useState(false)

  useEffect(() => {
    const root = document.documentElement

    if (!enabled) return undefined

    let frame = 0
    root.classList.add('has-opening')

    const apply = () => {
      frame = 0
      const distance = window.innerHeight * OPENING_DISTANCE
      const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 1
      root.style.setProperty('--opening-progress', progress.toFixed(4))
      const next = progress >= HANDOVER_AT
      setDormant((was) => (was === next ? was : next))
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(apply)
    }

    // First read on the next frame rather than inline: a reload part-way down
    // the page has to land on the right progress, and doing it in the effect
    // body would set state during the commit.
    frame = window.requestAnimationFrame(apply)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
      root.classList.remove('has-opening')
      root.style.removeProperty('--opening-progress')
    }
  }, [enabled])

  // `false` while there is no opening, so a page without one never reports
  // that its opening has finished.
  return enabled && dormant
}
