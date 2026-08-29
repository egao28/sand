/** Reusable SVG arrowhead marker for the box-and-arrow diagrams on detail
 * pages. `id` must be unique within the page — reference it as `url(#id)`. */
export default function DiagramArrowMarker({ id }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="6.5"
      markerHeight="6.5"
      orient="auto-start-reverse"
    >
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"></path>
    </marker>
  )
}
