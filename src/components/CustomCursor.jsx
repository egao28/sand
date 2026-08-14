import { useEffect } from "react";

const HOVER_GROUPS = [
  {
    selector: "img, .hero-photo-wrap, .project-corner-link, .resume-download-here",
    className: "cursor-hover",
  },
  { selector: "a, button, .ct-item, .social-btn", className: "cursor-link" },
  { selector: "section#contact", className: "cursor-dark-surface" },
];

const ANY_GROUP_SELECTOR = HOVER_GROUPS.map(({ selector }) => selector).join(", ");

export default function CustomCursor() {
  useEffect(() => {
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    if (!dot || !ring) return;

    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    document.addEventListener("mousemove", onMove);

    let raf = 0;
    const animate = () => {
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;

      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;

      raf = window.requestAnimationFrame(animate);
    };

    raf = window.requestAnimationFrame(animate);

    // Delegated on document (not queried once at mount) so elements from
    // later client-side route changes are matched too — CustomCursor never
    // remounts across routes, since it lives outside <Routes> in App.jsx.
    const onPointerOver = (e) => {
      if (!e.target.closest(ANY_GROUP_SELECTOR)) return;
      HOVER_GROUPS.forEach(({ selector, className }) => {
        const match = e.target.closest(selector);
        if (match && !match.contains(e.relatedTarget)) {
          document.body.classList.add(className);
        }
      });
    };
    const onPointerOut = (e) => {
      if (!e.target.closest(ANY_GROUP_SELECTOR)) return;
      HOVER_GROUPS.forEach(({ selector, className }) => {
        const match = e.target.closest(selector);
        if (!match || match.contains(e.relatedTarget)) return;
        // Moving to a sibling in the same group shouldn't flicker the class
        // off and back on within the same tick.
        if (e.relatedTarget && e.relatedTarget.closest(selector)) return;
        document.body.classList.remove(className);
      });
    };

    document.addEventListener("mouseover", onPointerOver);
    document.addEventListener("mouseout", onPointerOut);

    return () => {
      document.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(raf);
      document.removeEventListener("mouseover", onPointerOver);
      document.removeEventListener("mouseout", onPointerOut);
    };
  }, []);

  return (
    <>
      <div id="cursor-dot" aria-hidden="true" />
      <div id="cursor-ring" aria-hidden="true" />
    </>
  );
}
