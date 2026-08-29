/** Splits a project's `·`-separated `technical` string into a clean array of
 * keyword labels. */
export function splitTechnical(technical) {
  return technical
    .split('·')
    .map((s) => s.trim())
    .filter(Boolean)
}
