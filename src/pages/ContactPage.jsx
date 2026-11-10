import ContactSection from '../sections/ContactSection.jsx'
import { siteContent } from '../data/siteContent.js'

/** `/contact`. The route already existed; before #66 it redirected to the
 * contact section at the bottom of the homepage. The homepage is now the
 * opening and About only, so the same section — unchanged — lives here
 * instead, and the nav's Contact entry points at a real page rather than an
 * anchor that no longer exists. */
export default function ContactPage() {
  return (
    <main className="page page--secondary contact-page">
      <ContactSection content={siteContent.contact} />
    </main>
  )
}
