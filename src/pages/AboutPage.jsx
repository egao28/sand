import React from "react";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll.js";
import AboutSection from "../sections/AboutSection.jsx";
import SkillsMarquee from "../sections/SkillsMarquee.jsx";
import ExperienceTimeline from "../sections/ExperienceTimeline.jsx";
import { siteContent } from "../data/siteContent.js";

export default function AboutPage() {
  useRevealOnScroll();

  return (
    <main className="page page--secondary">
      <AboutSection content={siteContent.about} />
      <SkillsMarquee content={siteContent.skills} />
      <ExperienceTimeline content={siteContent.experience} education={siteContent.education} />
    </main>
  );
}

