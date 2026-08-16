import { siteContent } from '../data/siteContent.js'
import polaroidUrl from '../../polaroid.png'

export default function ResumePage() {
  return (
    <main className="page page--secondary resume-page-minimal">
      <a
        href={siteContent.resume.href}
        download
        className="resume-photo-link"
        aria-label={siteContent.resume.buttonLabel}
      >
        <img src={polaroidUrl} alt="" className="resume-photo" decoding="async" />
      </a>
    </main>
  )
}
