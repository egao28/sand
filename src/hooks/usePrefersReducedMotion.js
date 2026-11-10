import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

const getSnapshot = () => window.matchMedia(QUERY).matches

/** Whether the visitor has asked for reduced motion, kept live if they change
 * the setting while the page is open. `useSyncExternalStore` rather than an
 * effect so the first render already has the right answer: the homepage decides
 * from this whether to mount the scroll transition at all, and mounting it for
 * one frame would be a flash of exactly the motion they turned off. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
