import { useEffect, useRef, useState } from 'react'

export function useTypewriter(text, { enabled = true, startDelayMs = 0 } = {}) {
  const [value, setValue] = useState('')
  const startedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return
    if (startedRef.current) return
    startedRef.current = true

    let i = 0
    let timeoutId = null
    const tick = () => {
      setValue(text.slice(0, i))
      i += 1
      if (i <= text.length) {
        const jitter = 26 + Math.random() * 30
        timeoutId = window.setTimeout(tick, i === 1 ? 600 : 38 + jitter)
      }
    }

    timeoutId = window.setTimeout(tick, startDelayMs)
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [enabled, startDelayMs, text])

  return value
}
