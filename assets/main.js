// Cursor
const dot = document.getElementById("cursor-dot");
const ring = document.getElementById("cursor-ring");
const spark = document.getElementById("cursor-spark");

let mx = 0, my = 0, rx = 0, ry = 0, sx = 0, sy = 0;

document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
});

function animateCursor() {
  if (dot) {
    dot.style.left = `${mx}px`;
    dot.style.top = `${my}px`;
  }

  rx += (mx - rx) * 0.14;
  ry += (my - ry) * 0.14;
  if (ring) {
    ring.style.left = `${rx}px`;
    ring.style.top = `${ry}px`;
    const angle = Math.atan2(my - ry, mx - rx) * 180 / Math.PI;
    ring.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  }

  sx += (mx - sx) * 0.22;
  sy += (my - sy) * 0.22;
  if (spark) {
    spark.style.left = `${sx}px`;
    spark.style.top = `${sy}px`;
  }

  requestAnimationFrame(animateCursor);
}
animateCursor();

const hoverTargets = ["img", ".hero-photo-wrap", ".project-art", ".project-info", ".resume-btn"];
document.querySelectorAll(hoverTargets.join(",")).forEach((el) => {
  el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
  el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
});
document.querySelectorAll("a, button, .ct-item, .social-btn, .resume-btn").forEach((el) => {
  el.addEventListener("mouseenter", () => document.body.classList.add("cursor-link"));
  el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-link"));
});

// Nav scroll
const nav = document.getElementById("main-nav");
window.addEventListener("scroll", () => {
  if (!nav) return;
  nav.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

// Hero photo subtle parallax (small movement only)
const heroImg = document.getElementById("hero-img");
window.addEventListener("scroll", () => {
  if (!heroImg) return;
  const y = window.scrollY;
  heroImg.style.transform = `translateY(${Math.min(y * 0.06, 18)}px)`;
}, { passive: true });

// Hero typewriter (practical options, easy to swap)
const heroOptions = [
  "ML + software, built to be used.",
  "Designing systems that feel calm.",
  "Turning messy data into decisions.",
  "Research-minded. Product-driven.",
];
const heroPhrase = heroOptions[0];
const heroTarget = document.getElementById("typed-hero");
let hi = 0;
function typeHero() {
  if (!heroTarget) return;
  if (hi <= heroPhrase.length) {
    heroTarget.textContent = heroPhrase.slice(0, hi);
    hi += 1;
    window.setTimeout(typeHero, hi === 1 ? 650 : 38 + Math.random() * 26);
  }
}
window.setTimeout(typeHero, 700);

// About divider: trigger typewriter on scroll into view
const nameTarget = document.getElementById("typed-name");
const nameText = "Evelyn Gao.";
let ni = 0;
function typeName() {
  if (!nameTarget) return;
  if (ni <= nameText.length) {
    nameTarget.textContent = nameText.slice(0, ni);
    ni += 1;
    window.setTimeout(typeName, ni === 1 ? 250 : 52 + Math.random() * 26);
  }
}

const divider = document.getElementById("type-divider");
if (divider) {
  const once = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        typeName();
        once.disconnect();
        break;
      }
    }
  }, { threshold: 0.35 });
  once.observe(divider);
}

// Reveal animations
const reveals = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add("up");
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
reveals.forEach((el) => io.observe(el));

// Skills marquee: duplicate contents for seamless loop
document.querySelectorAll(".skills-track").forEach((track) => {
  const children = Array.from(track.children);
  children.forEach((ch) => track.appendChild(ch.cloneNode(true)));
});

