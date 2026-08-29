/** Dark-band "Technical" chip grid used on every project/experience detail
 * page. `chips` is an array of label strings. */
export default function TechChipGrid({ chips }) {
  return (
    <div className="project-tech-grid" aria-label="Technical stack">
      {chips.map((label) => (
        <span key={label} className="project-tech-chip">
          {label}
        </span>
      ))}
    </div>
  )
}
