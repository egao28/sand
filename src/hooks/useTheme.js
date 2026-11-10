import { useCallback, useSyncExternalStore } from 'react'

/*
 * The light/dark choice (#70, #73).
 *
 * One value, held on `<html data-theme>`, which is where the stylesheets read
 * it from. The inline script in index.html sets that attribute from storage
 * before the first paint, so there is no flash of the wrong theme and no
 * moment where React and the document disagree — this module starts from
 * whatever that script decided rather than guessing a second time.
 *
 * Deliberately not a context: the toggle is one control in the navigation and
 * the attribute is global, so a provider around the tree would be plumbing for
 * a single consumer.
 *
 * Note what is *not* here: no `prefers-color-scheme` fallback. #73 asks for a
 * light first visit and a remembered manual choice, so the system setting is
 * not consulted. Changing that means changing the inline script too, or the
 * two will disagree for one paint.
 */

export const THEME_STORAGE_KEY = 'evelyn-site-theme'

const listeners = new Set()

function readDom() {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  listeners.forEach((listener) => listener())
}

/** Writes the theme everywhere it is read from: the attribute the CSS keys off,
 * and storage so the next visit starts here. A storage failure — private mode,
 * a blocked origin — must not cost the visitor the switch they just made, so
 * it is swallowed and the attribute still changes. */
export function applyTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.theme = next
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch {
    /* the switch still works for this visit; only the memory of it is lost */
  }
  emit()
}

export function useTheme() {
  // The server snapshot is the same 'light' the inline script falls back to.
  const theme = useSyncExternalStore(subscribe, readDom, () => 'light')
  const toggleTheme = useCallback(() => {
    applyTheme(readDom() === 'dark' ? 'light' : 'dark')
  }, [])
  return { theme, toggleTheme }
}
