import { useEffect } from "react";

export function useRevealOnScroll() {
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("up");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    reveals.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

