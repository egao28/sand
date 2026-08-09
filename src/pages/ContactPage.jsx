import React from "react";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll.js";
import ContactSection from "../sections/ContactSection.jsx";
import { siteContent } from "../data/siteContent.js";

export default function ContactPage() {
  useRevealOnScroll();

  return (
    <main className="page page--secondary">
      <ContactSection content={siteContent.contact} />
    </main>
  );
}

