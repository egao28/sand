import React, { useEffect } from "react";

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

    const hoverTargets = ["img", ".hero-photo-wrap", ".project-art", ".project-info", ".resume-btn"];
    const hoverEls = Array.from(document.querySelectorAll(hoverTargets.join(",")));

    const linkEls = Array.from(document.querySelectorAll("a, button, .ct-item, .social-btn, .resume-btn"));

    const onHoverEnter = () => document.body.classList.add("cursor-hover");
    const onHoverLeave = () => document.body.classList.remove("cursor-hover");
    const onLinkEnter = () => document.body.classList.add("cursor-link");
    const onLinkLeave = () => document.body.classList.remove("cursor-link");

    hoverEls.forEach((el) => {
      el.addEventListener("mouseenter", onHoverEnter);
      el.addEventListener("mouseleave", onHoverLeave);
    });
    linkEls.forEach((el) => {
      el.addEventListener("mouseenter", onLinkEnter);
      el.addEventListener("mouseleave", onLinkLeave);
    });

    const darkContactSections = Array.from(document.querySelectorAll("section#contact"));
    const onDarkContactEnter = () => document.body.classList.add("cursor-dark-surface");
    const onDarkContactLeave = () => document.body.classList.remove("cursor-dark-surface");
    darkContactSections.forEach((el) => {
      el.addEventListener("mouseenter", onDarkContactEnter);
      el.addEventListener("mouseleave", onDarkContactLeave);
    });

    return () => {
      document.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(raf);
      hoverEls.forEach((el) => {
        el.removeEventListener("mouseenter", onHoverEnter);
        el.removeEventListener("mouseleave", onHoverLeave);
      });
      linkEls.forEach((el) => {
        el.removeEventListener("mouseenter", onLinkEnter);
        el.removeEventListener("mouseleave", onLinkLeave);
      });
      darkContactSections.forEach((el) => {
        el.removeEventListener("mouseenter", onDarkContactEnter);
        el.removeEventListener("mouseleave", onDarkContactLeave);
      });
    };
  }, []);

  return (
    <>
      <div id="cursor-dot" aria-hidden="true" />
      <div id="cursor-ring" aria-hidden="true" />
    </>
  );
}

