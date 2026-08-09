import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function NavBar({ items }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const nav = document.getElementById("main-nav");
    if (!nav) return;

    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleContactClick = (item) => {
    if (!item.anchorId) return;
    if (location.pathname === "/") {
      const target = document.getElementById(item.anchorId);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate("/#contact");
  };

  return (
    <nav id="main-nav">
      <Link to="/" className="nav-logo" aria-label="Home">
        <img
          className="nav-logo-img"
          src="/logo.png"
          alt=""
          width={56}
          height={56}
          decoding="async"
        />
        <span className="nav-logo-text">evelyn gao</span>
      </Link>
      <ul>
        {items.map((it) => (
          <li key={it.to}>
            {it.isHomeAnchor ? (
              <button
                type="button"
                onClick={() => handleContactClick(it)}
                className="nav-link-btn"
              >
                {it.label}
              </button>
            ) : (
              <Link to={it.to}>{it.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

