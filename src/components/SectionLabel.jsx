export default function SectionLabel({ text, noRule }) {
  return (
    <div className={noRule ? 'sec-label sec-label--no-rule' : 'sec-label'}>
      <span>{text}</span>
    </div>
  )
}
