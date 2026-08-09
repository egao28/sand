import React from "react";
import SectionLabel from "../components/SectionLabel.jsx";

function SkillsTrack({ chips }) {
  // Render twice to create the seamless marquee loop (CSS translates by 50%).
  const doubled = [...chips, ...chips];
  return (
    <div className="skills-track" aria-hidden="false">
      {doubled.map((chip, idx) => (
        <div key={`${chip.text}-${idx}`} className={`skill-chip ${chip.subtle ? "subtle" : ""}`}>
          <span className="skill-icon" aria-hidden="true">
            {chip.icon}
          </span>
          <span>{chip.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function SkillsMarquee({ content }) {
  const primary = content.primary;
  const secondary = content.secondary.map((c) => ({ ...c, subtle: true }));

  return (
    <section id="skills">
      <div className="sec-inner">
        <SectionLabel text={content.label} />
        <h2 className="skills-title reveal">{content.title}</h2>

        <div className="skills-marquee reveal" aria-label="Skills">
          <SkillsTrack chips={primary} />
          <div className="skills-track reverse" aria-hidden="false">
            {[...secondary, ...secondary].map((chip, idx) => (
              <div key={`${chip.text}-${idx}`} className="skill-chip subtle">
                <span className="skill-icon" aria-hidden="true">
                  {chip.icon}
                </span>
                <span>{chip.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

