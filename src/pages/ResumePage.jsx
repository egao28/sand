import { siteContent } from '../data/siteContent.js'
import polaroidAvif from '../../polaroid-840.avif'
import polaroidWebp from '../../polaroid-840.webp'
import polaroidPng from '../../polaroid-840.png'

export default function ResumePage() {
  return (
    <main className="page page--secondary resume-page-minimal">
      <a
        href={siteContent.resume.href}
        download={siteContent.resume.fileName}
        className="resume-photo-link"
        aria-label={siteContent.resume.buttonLabel}
      >
        <picture>
          <source srcSet={polaroidAvif} type="image/avif" />
          <source srcSet={polaroidWebp} type="image/webp" />
          <img
            src={polaroidPng}
            alt=""
            className="resume-photo"
            decoding="async"
            width="840"
            height="754"
          />
        </picture>
      </a>
    </main>
  )
}
