import { useEffect, useRef } from 'react'

/** Toggles the dark custom-cursor variant while the attached element (a dark
 * section) is meaningfully in view, and cleans up on unmount. */
export function useDarkSurfaceOnIntersect() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (!e) return
        const on = e.isIntersecting && e.intersectionRatio > 0.15
        document.body.classList.toggle('cursor-dark-surface', on)
      },
      { threshold: [0, 0.15, 0.35, 0.6, 1] }
    )

    io.observe(el)
    return () => {
      io.disconnect()
      document.body.classList.remove('cursor-dark-surface')
    }
  }, [])

  return ref
}
