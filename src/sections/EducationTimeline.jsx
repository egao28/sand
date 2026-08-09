import React from "react";

export default function EducationTimeline({ content }) {
  return (
    <div className="education-block" style={{ marginTop: "5rem" }}>
      <div className="sec-label">
        <span>{content.label}</span>
      </div>

      <div className="center-timeline reveal" aria-label="Education timeline">
        {content.items.map((item) => {
          const lines = item.coursework ?? item.details ?? [];
          const detailLabel = item.detailLabel ?? "Coursework";
          const baseSub = (item.subLine ?? item.sub ?? "").trim();
          const hasGpa = item.gpa != null && String(item.gpa).trim() !== "";
          const subDisplay = hasGpa
            ? baseSub
              ? `${baseSub} · GPA: ${item.gpa}`
              : `GPA: ${item.gpa}`
            : baseSub;
          const eduLines = Array.isArray(item.eduLines) ? item.eduLines : null;

          return (
            <article
              key={item.id ?? `${item.time}-${item.title}`}
              className={`ct-item ${item.side}`}
              tabIndex="0"
            >
              <header className="ct-head">
                <div className="ct-time">{item.time}</div>
                <div className="ct-title">{item.title}</div>
                {eduLines && eduLines.length > 0 ? (
                  <div className="ct-edu-meta">
                    {eduLines.map((line) => (
                      <div key={line} className="ct-sub ct-sub-line">
                        {line}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ct-sub">{subDisplay}</div>
                )}
              </header>

              {lines.length > 0 ? (
                <div className="ct-detail">
                  <p className="ct-detail-kicker">{detailLabel}</p>
                  <ul>
                    {lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
