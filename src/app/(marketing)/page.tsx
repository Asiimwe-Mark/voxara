"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/* ─── Colour tokens ─────────────────────────────────────────── */
const C = {
  bg: "#04040a",
  surface: "#0c0c18",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(120,100,255,0.4)",
  accent: "#7b5cff",
  accentB: "#ff5ca8",
  accentC: "#5cf0ff",
  text: "#f0eeff",
  muted: "rgba(240,238,255,0.45)",
  glow: "rgba(123,92,255,0.18)",
};

/* ─── Keyframes injected once ───────────────────────────────── */
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: ${C.bg};
    color: ${C.text};
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  @keyframes drift {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    33%      { transform: translateY(-22px) rotate(1.5deg); }
    66%      { transform: translateY(12px) rotate(-1deg); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes float-particle {
    0%   { transform: translateY(100vh) translateX(0px) scale(0); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(-10vh) translateX(60px) scale(1); opacity: 0; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes noise {
    0%,100% { transform: translate(0,0); }
    10%  { transform: translate(-2px,-2px); }
    20%  { transform: translate(2px,2px); }
    30%  { transform: translate(-1px,2px); }
    40%  { transform: translate(2px,-1px); }
    50%  { transform: translate(-2px,1px); }
    60%  { transform: translate(1px,2px); }
    70%  { transform: translate(-1px,-2px); }
    80%  { transform: translate(2px,1px); }
    90%  { transform: translate(-2px,2px); }
  }
  @keyframes count-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .animate-fade-up  { animation: fade-up 0.7s cubic-bezier(.22,1,.36,1) both; }
  .animate-scale-in { animation: scale-in 0.6s cubic-bezier(.22,1,.36,1) both; }

  .shimmer-text {
    background: linear-gradient(90deg, ${C.text} 0%, ${C.accent} 30%, ${C.accentB} 55%, ${C.accentC} 70%, ${C.text} 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 4s linear infinite;
  }

  .noise-overlay::after {
    content: '';
    position: fixed; inset: -200%;
    width: 400%; height: 400%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.028;
    pointer-events: none;
    animation: noise 0.15s steps(1) infinite;
    z-index: 9999;
    mix-blend-mode: overlay;
  }

  .magnetic-btn {
    position: relative;
    transition: transform 0.15s cubic-bezier(.22,1,.36,1);
    cursor: pointer;
  }
  .magnetic-btn:hover { transform: translateY(-2px); }

  .card-hover {
    transition: transform 0.35s cubic-bezier(.22,1,.36,1),
                border-color 0.35s ease,
                box-shadow 0.35s ease;
  }
  .card-hover:hover {
    transform: translateY(-6px);
    border-color: rgba(123,92,255,0.35) !important;
    box-shadow: 0 24px 60px rgba(123,92,255,0.12), 0 0 0 1px rgba(123,92,255,0.15);
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.accent}; border-radius: 2px; }

  /* ── Responsive grid helpers ─────────────────────────── */

  /* Stats: 4-col → 2×2 → 1-col */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2px;
  }
  .stats-cell {
    border-right: 1px solid ${C.border};
  }
  .stats-cell:last-child { border-right: none; }

  /* Features / Testimonials: 3-col → 2-col → 1-col */
  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  /* Pricing: 3-col → stack */
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    align-items: start;
  }

  /* Steps: 3-col → 1-col */
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    position: relative;
  }
  .step-cell {
    border-right: 1px solid ${C.border};
  }
  .step-cell:last-child { border-right: none; }

  /* Hero CTA buttons */
  .hero-ctas {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 14px;
    margin-bottom: 64px;
  }

  /* Footer */
  .footer-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  /* Nav desktop/mobile */
  .nav-links, .nav-cta { display: flex; }
  .mobile-menu-btn     { display: none !important; }

  /* ── 1024px — collapse 3-col to 2-col ──────────────── */
  @media (max-width: 1024px) {
    .grid-3 {
      grid-template-columns: repeat(2, 1fr);
    }
    .pricing-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* ── 768px — tablet / large phone ──────────────────── */
  @media (max-width: 768px) {
    .nav-links, .nav-cta { display: none !important; }
    .mobile-menu-btn     { display: block !important; }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .stats-cell {
      border-right: none;
      border-bottom: 1px solid ${C.border};
    }
    /* Reset nth-child borders so 2-col looks clean */
    .stats-cell:nth-child(odd)  { border-right: 1px solid ${C.border}; }
    .stats-cell:nth-child(even) { border-right: none; }
    .stats-cell:nth-last-child(-n+2) { border-bottom: none; }

    .grid-3 {
      grid-template-columns: repeat(2, 1fr);
    }
    .pricing-grid {
      grid-template-columns: 1fr;
      max-width: 420px;
      margin: 0 auto;
    }
    /* Remove scale bump on highlighted card so it doesn't clip */
    .pricing-highlighted { transform: scale(1) !important; }

    .steps-grid {
      grid-template-columns: 1fr;
    }
    .step-cell {
      border-right: none;
      border-bottom: 1px solid ${C.border};
    }
    .step-cell:last-child { border-bottom: none; }

    .hero-ctas a {
      width: 100%;
      justify-content: center;
    }
  }

  /* ── 540px — small phone ────────────────────────────── */
  @media (max-width: 540px) {
    .grid-3 {
      grid-template-columns: 1fr;
    }
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "FAQ", href: "#faq" },
];

/* ─── Particle System ───────────────────────────────────────── */
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${5 + (i * 5.3) % 90}%`,
    delay: `${(i * 1.1) % 8}s`,
    duration: `${8 + (i * 0.7) % 12}s`,
    size: `${1.5 + (i * 0.3) % 3}px`,
    color: i % 3 === 0 ? C.accent : i % 3 === 1 ? C.accentB : C.accentC,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.left,
            bottom: 0,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            boxShadow: `0 0 8px 2px ${p.color}`,
            animation: `float-particle ${p.duration} ${p.delay} linear infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Mesh gradient background ──────────────────────────────── */
function MeshBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", width: "900px", height: "900px",
        top: "-300px", left: "-200px",
        background: "radial-gradient(circle, rgba(123,92,255,0.12) 0%, transparent 65%)",
        animation: "drift 14s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: "700px", height: "700px",
        top: "200px", right: "-150px",
        background: "radial-gradient(circle, rgba(255,92,168,0.09) 0%, transparent 65%)",
        animation: "drift 18s ease-in-out infinite reverse",
        animationDelay: "-5s",
      }} />
      <div style={{
        position: "absolute", width: "600px", height: "600px",
        bottom: "100px", left: "30%",
        background: "radial-gradient(circle, rgba(92,240,255,0.07) 0%, transparent 65%)",
        animation: "drift 22s ease-in-out infinite",
        animationDelay: "-10s",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
      }} />
    </div>
  );
}

/* ─── Nav ───────────────────────────────────────────────────── */
function Nav({ scrolled }: { scrolled: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 max(16px, 5vw)",
      height: "72px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(4,4,10,0.88)" : "transparent",
      backdropFilter: scrolled ? "blur(24px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.border}` : "none",
      transition: "all 0.4s cubic-bezier(.22,1,.36,1)",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "10px",
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentB})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 20px rgba(123,92,255,0.4)`,
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.5px" }}>
          voxara
        </span>
      </div>

      {/* Desktop Links */}
      <div className="nav-links" style={{ alignItems: "center", gap: "max(20px, 4vw)" }}>
        {NAV_ITEMS.map((item) => (
          <a key={item.label} href={item.href} style={{
            color: C.muted, fontSize: "14px", fontWeight: 500,
            textDecoration: "none", letterSpacing: "0.02em", transition: "color 0.2s",
          }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = C.text}
            onMouseLeave={e => (e.target as HTMLElement).style.color = C.muted}
          >{item.label}</a>
        ))}
      </div>

      {/* Desktop CTA */}
      <div className="nav-cta" style={{ gap: "12px", alignItems: "center" }}>
        <a href="/login" style={{
          color: C.muted, fontSize: "14px", fontWeight: 500,
          textDecoration: "none", padding: "8px 16px", transition: "color 0.2s",
        }}
          onMouseEnter={e => (e.target as HTMLElement).style.color = C.text}
          onMouseLeave={e => (e.target as HTMLElement).style.color = C.muted}
        >Sign in</a>
        <a href="/signup" className="magnetic-btn" style={{
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentB})`,
          color: "white", fontSize: "14px", fontWeight: 600,
          textDecoration: "none", padding: "9px 22px", borderRadius: "10px",
          boxShadow: `0 0 24px rgba(123,92,255,0.35)`, letterSpacing: "0.02em",
        }}>Start free →</a>
      </div>

      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{
        background: "none", border: "none", cursor: "pointer", padding: "8px",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2">
          {menuOpen
            ? <path d="M6 6l12 12M6 18L18 6" />
            : <path d="M3 12h18M3 6h18M3 18h18" />}
        </svg>
      </button>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div style={{
          position: "absolute", top: "72px", left: 0, right: 0,
          background: "rgba(4,4,10,0.98)", backdropFilter: "blur(24px)",
          borderBottom: `1px solid ${C.border}`,
          padding: "20px 24px",
          display: "flex", flexDirection: "column", gap: "16px",
        }}>
          {NAV_ITEMS.map((item) => (
            <a key={item.label} href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{ color: C.muted, fontSize: "16px", fontWeight: 500, textDecoration: "none" }}
            >{item.label}</a>
          ))}
          <hr style={{ border: "none", borderTop: `1px solid ${C.border}` }} />
          <a href="/login" style={{ color: C.muted, fontSize: "16px", textDecoration: "none" }}>Sign in</a>
          <a href="/signup" style={{
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentB})`,
            color: "white", fontSize: "14px", fontWeight: 600,
            textDecoration: "none", padding: "12px 20px", borderRadius: "10px",
            textAlign: "center",
          }}>Start free →</a>
        </div>
      )}
    </nav>
  );
}

/* ─── useInView ─────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/* ─── Animated Counter ──────────────────────────────────────── */
function Counter({ target, suffix = "", prefix = "" }: { target: string; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    const duration = 1800, steps = 60, inc = num / steps;
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + inc, num);
      setCount(Math.floor(cur));
      if (cur >= num) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  const display = target.includes("M") ? `${count}M`
                : target.includes("K") ? `${count}K`
                : target.includes("%") ? `${count}%`
                : `${count}`;

  return (
    <span ref={ref} style={{
      fontFamily: "Syne, sans-serif", fontWeight: 800,
      fontSize: "clamp(1.8rem, 4vw, 3.5rem)",
      background: `linear-gradient(135deg, ${C.accent}, ${C.accentC})`,
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      display: "block",
      animation: inView ? "count-up 0.6s cubic-bezier(.22,1,.36,1) both" : "none",
    }}>
      {prefix}{display}{suffix}
    </span>
  );
}

/* ─── Section scroll-reveal wrapper ────────────────────────── */
function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Pill badge ─────────────────────────────────────────────── */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "8px",
      padding: "6px 16px", borderRadius: "100px",
      border: `1px solid rgba(123,92,255,0.3)`,
      background: "rgba(123,92,255,0.08)",
      fontSize: "13px", color: C.accent, fontWeight: 500,
      letterSpacing: "0.05em", marginBottom: "28px",
      backdropFilter: "blur(12px)",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: C.accent, boxShadow: `0 0 8px ${C.accent}`,
        animation: "pulse-ring 2s ease-out infinite",
        display: "inline-block", flexShrink: 0,
      }} />
      {children}
    </div>
  );
}

/* ─── Feature card ──────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, color, delay }: {
  icon: React.ReactNode; title: string; desc: string; color: string; delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="card-hover" style={{
        padding: "28px", borderRadius: "20px",
        border: `1px solid ${C.border}`,
        background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(12px)",
        height: "100%",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: "20%", right: "20%", height: "1px",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }} />
        <div style={{
          width: 52, height: 52, borderRadius: "14px", flexShrink: 0,
          background: `linear-gradient(135deg, ${color}22, ${color}11)`,
          border: `1px solid ${color}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "20px", fontSize: "22px",
        }}>{icon}</div>
        <h3 style={{
          fontFamily: "Syne, sans-serif", fontWeight: 700,
          fontSize: "17px", marginBottom: "10px", color: C.text,
        }}>{title}</h3>
        <p style={{ fontSize: "14px", lineHeight: "1.7", color: C.muted }}>{desc}</p>
      </div>
    </Reveal>
  );
}

/* ─── Pricing card ──────────────────────────────────────────── */
function PricingCard({ plan, highlighted, delay }: { plan: any; highlighted: boolean; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div
        className={`card-hover${highlighted ? " pricing-highlighted" : ""}`}
        style={{
          padding: "36px 28px", borderRadius: "24px",
          border: highlighted ? `1px solid rgba(123,92,255,0.5)` : `1px solid ${C.border}`,
          background: highlighted
            ? "linear-gradient(145deg, rgba(123,92,255,0.15), rgba(255,92,168,0.08), rgba(92,240,255,0.05))"
            : "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
          backdropFilter: "blur(20px)",
          position: "relative", overflow: "hidden",
          boxShadow: highlighted ? `0 0 60px rgba(123,92,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)` : "none",
          /* Scale only on desktop via CSS class */
          transform: highlighted ? "scale(1.03)" : "scale(1)",
          display: "flex", flexDirection: "column",
        }}
      >
        {highlighted && (
          <>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "2px",
              background: `linear-gradient(90deg, ${C.accent}, ${C.accentB}, ${C.accentC})`,
            }} />
            <div style={{
              position: "absolute", top: "16px", right: "16px",
              padding: "4px 12px", borderRadius: "100px",
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentB})`,
              fontSize: "11px", fontWeight: 700, color: "white", letterSpacing: "0.08em",
            }}>MOST POPULAR</div>
          </>
        )}

        <div style={{ marginBottom: "8px" }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "22px", color: C.text }}>
            {plan.name}
          </span>
        </div>
        <p style={{ fontSize: "13px", color: C.muted, marginBottom: "28px" }}>{plan.description}</p>

        <div style={{ marginBottom: "28px" }}>
          <span style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: "clamp(2.5rem, 6vw, 3.2rem)", color: C.text, lineHeight: 1,
          }}>${plan.price}</span>
          {plan.price > 0 && (
            <span style={{ fontSize: "14px", color: C.muted, marginLeft: "8px" }}>/mo</span>
          )}
        </div>

        <ul style={{
          listStyle: "none", marginBottom: "32px",
          flex: 1, display: "flex", flexDirection: "column", gap: "13px",
        }}>
          {plan.features.map((f: string) => (
            <li key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: C.muted }}>
              <span style={{
                width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                background: highlighted ? `linear-gradient(135deg, ${C.accent}, ${C.accentB})` : "rgba(123,92,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>

        <a href={plan.href} className="magnetic-btn" style={{
          display: "block", textAlign: "center",
          padding: "14px 28px", borderRadius: "12px",
          background: highlighted ? `linear-gradient(135deg, ${C.accent}, ${C.accentB})` : "rgba(255,255,255,0.06)",
          border: highlighted ? "none" : `1px solid ${C.border}`,
          color: "white", fontSize: "15px", fontWeight: 600,
          textDecoration: "none",
          boxShadow: highlighted ? `0 0 30px rgba(123,92,255,0.4)` : "none",
          letterSpacing: "0.02em", transition: "all 0.2s ease",
        }}>{plan.cta}</a>
      </div>
    </Reveal>
  );
}

/* ─── Marquee logos ─────────────────────────────────────────── */
function LogoMarquee() {
  const logos = ["Google Gemini", "ElevenLabs", "HeyGen", "D-ID", "Synthesia", "Mux", "Pexels", "Paddle"];
  const doubled = [...logos, ...logos];
  return (
    <div style={{
      overflow: "hidden", padding: "24px 0",
      borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
      background: "rgba(255,255,255,0.015)", position: "relative",
    }}>
      <div style={{ display: "flex", animation: "marquee 20s linear infinite", width: "max-content" }}>
        {doubled.map((name, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "0 36px", whiteSpace: "nowrap",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentB})`,
            }} />
            <span style={{
              fontFamily: "Syne, sans-serif", fontWeight: 600,
              fontSize: "14px", color: C.muted, letterSpacing: "0.04em",
            }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Testimonial card ───────────────────────────────────────── */
function TestimonialCard({ name, role, text, initials, delay }: {
  name: string; role: string; text: string; initials: string; delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="card-hover" style={{
        padding: "28px", borderRadius: "20px",
        border: `1px solid ${C.border}`,
        background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
        backdropFilter: "blur(12px)", height: "100%",
      }}>
        <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: "13px", color: "#fbbf24" }}>★</span>)}
        </div>
        <p style={{
          fontSize: "14px", lineHeight: "1.75", color: C.muted,
          fontStyle: "italic", marginBottom: "20px",
        }}>"{text}"</p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentB})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 700, color: "white",
          }}>{initials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px", color: C.text }}>{name}</div>
            <div style={{ fontSize: "12px", color: C.muted }}>{role}</div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ─── FAQ item ───────────────────────────────────────────────── */
function FAQItem({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={delay}>
      <div onClick={() => setOpen(!open)} style={{
        padding: "22px 24px", borderRadius: "16px",
        border: `1px solid ${open ? "rgba(123,92,255,0.3)" : C.border}`,
        background: open ? "rgba(123,92,255,0.05)" : "rgba(255,255,255,0.02)",
        cursor: "pointer", transition: "all 0.3s ease", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <span style={{
            fontFamily: "Syne, sans-serif", fontWeight: 600,
            fontSize: "clamp(13px, 2vw, 15px)", color: C.text,
          }}>{q}</span>
          <span style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: open ? `linear-gradient(135deg, ${C.accent}, ${C.accentB})` : "rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", color: "white", fontWeight: 300,
            transition: "all 0.3s ease",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}>+</span>
        </div>
        {open && (
          <p style={{
            marginTop: "14px", fontSize: "14px", lineHeight: "1.7", color: C.muted,
            animation: "fade-up 0.3s ease both",
          }}>{a}</p>
        )}
      </div>
    </Reveal>
  );
}

/* ─── Mux URL helpers ───────────────────────────────────────── */
function muxStream(playbackId: string) {
  return `https://stream.mux.com/${playbackId}/high.mp4`;
}
function muxPoster(playbackId: string) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=3&width=1920`;
}

/* ─── HeroVideo ──────────────────────────────────────────────── */
type HeroVideoState =
  | { phase: "loading" }
  | { phase: "ready"; playbackId: string; title: string }
  | { phase: "error" };

function HeroVideo() {
  const [state, setState] = useState<HeroVideoState>({ phase: "loading" });
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("mux_playback_id, title")
        .not("mux_playback_id", "is", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (error || !data?.mux_playback_id) {
        setState({ phase: "error" });
      } else {
        setState({
          phase: "ready",
          playbackId: data.mux_playback_id,
          title: data.title ?? "Generated with Voxara",
        });
      }
    })();
  }, []);

  const handlePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  /* ── Loading skeleton ── */
  if (state.phase === "loading") {
    return (
      <div style={{
        aspectRatio: "16/9",
        background: "linear-gradient(135deg, #06061a, #0d0818, #04040c)",
        borderRadius: "0 0 20px 20px",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(rgba(123,92,255,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(123,92,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        {/* Animated skeleton shimmer */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(90deg,
            rgba(123,92,255,0) 0%,
            rgba(123,92,255,0.06) 50%,
            rgba(123,92,255,0) 100%)`,
          backgroundSize: "200% 100%",
          animation: "shimmer 1.8s linear infinite",
        }} />
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", zIndex: 2,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            border: `2px solid rgba(123,92,255,0.3)`,
            borderTopColor: C.accent,
            animation: "spin-slow 0.9s linear infinite",
          }} />
          <span style={{ fontSize: "12px", color: C.muted, letterSpacing: "0.05em" }}>
            Loading sample video…
          </span>
        </div>
      </div>
    );
  }

  /* ── Error → fall back to waveform mock ── */
  if (state.phase === "error") {
    return (
      <div style={{
        aspectRatio: "16/9",
        background: "linear-gradient(135deg, #06061a, #0d0818, #04040c)",
        borderRadius: "0 0 20px 20px",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(rgba(123,92,255,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(123,92,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        <div style={{
          position: "absolute", bottom: "30%", left: "10%", right: "10%",
          display: "flex", alignItems: "center", gap: "3px", height: "60px",
        }}>
          {Array.from({ length: 60 }, (_, i) => {
            const heights = [20,35,48,55,60,58,52,44,36,25,28,40,52,58,60,56,48,38,30,22];
            return (
              <div key={i} style={{
                flex: 1, height: `${heights[i % heights.length]}%`,
                background: `linear-gradient(180deg, ${C.accent}88, ${C.accentB}44)`,
                borderRadius: "2px",
                animation: `drift ${0.8 + (i % 5) * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s`,
              }} />
            );
          })}
        </div>
        <StatusPill label="Sample preview · Generated with Voxara" />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 20% 80%, rgba(123,92,255,0.08), transparent 50%)",
        }} />
      </div>
    );
  }

  /* ── Real video ── */
  const { playbackId, title } = state;
  return (
    <div style={{
      aspectRatio: "16/9",
      background: "#000",
      borderRadius: "0 0 20px 20px",
      position: "relative", overflow: "hidden",
      cursor: "pointer",
    }}
      onClick={handlePlay}
    >
      <video
        ref={videoRef}
        src={muxStream(playbackId)}
        poster={muxPoster(playbackId)}
        playsInline
        loop
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />

      {/* Overlay gradient (fades when playing) */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(4,4,10,0.7) 0%, transparent 40%)",
        pointerEvents: "none",
        opacity: playing ? 0 : 1,
        transition: "opacity 0.4s ease",
      }} />

      {/* Play / Pause button */}
      {!playing && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)",
            border: "2px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 40px rgba(123,92,255,0.4)`,
            transition: "all 0.25s ease",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}>
              <path d="M5 3l14 9-14 9V3z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Status pill */}
      <StatusPill label={title} live />
    </div>
  );
}

/* ── Tiny reusable status pill ── */
function StatusPill({ label, live = false }: { label: string; live?: boolean }) {
  return (
    <div style={{
      position: "absolute", bottom: 20, right: 20, zIndex: 3,
      padding: "6px 14px", borderRadius: "100px",
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(12px)",
      border: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", gap: "8px",
      fontSize: "12px", color: C.muted,
      maxWidth: "calc(100% - 40px)",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
        background: live ? "#4ade80" : C.accent,
        boxShadow: `0 0 8px ${live ? "#4ade80" : C.accent}`,
        animation: "pulse-ring 2s ease-out infinite",
      }} />
      <span style={{
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{label}</span>
    </div>
  );
}

/* ─── Data ───────────────────────────────────────────────────── */
const FEATURES = [
  { icon: "✦", color: C.accent,  title: "AI Script Generation",   desc: "Powered by Google Gemini Flash. Generate engaging, platform-optimised scripts from any topic in seconds — with tone, length, and style customisation." },
  { icon: "◈", color: C.accentB, title: "AI Voice Cloning",        desc: "ElevenLabs voice technology. Clone your voice or choose from 500+ natural-sounding voices in 90+ languages for any audience." },
  { icon: "◉", color: C.accentC, title: "Photorealistic Avatars",  desc: "HeyGen, D-ID & Synthesia. Create photorealistic AI avatars that speak with facial expressions, gestures, and lip sync." },
  { icon: "◆", color: "#f59e0b", title: "One-Click Publishing",    desc: "Auto-publish to YouTube, TikTok, and Instagram with scheduling, built-in SEO metadata, and platform-specific formatting." },
  { icon: "◇", color: "#22d3ee", title: "Real-Time Analytics",     desc: "Deep cross-platform analytics. Track views, retention, engagement, and CTR from every publishing channel in one unified dashboard." },
  { icon: "◎", color: "#a78bfa", title: "Template Marketplace",    desc: "Buy and sell video templates. Create once, monetise infinitely. Earn passive income from your best-performing video formats." },
];

const STATS = [
  { number: "50K",  suffix: "+",  label: "Videos Created",   prefix: "" },
  { number: "500",  suffix: "M+", label: "Total Views",      prefix: "" },
  { number: "95",   suffix: "%",  label: "Satisfaction Rate", prefix: "" },
  { number: "24",   suffix: "/7", label: "Support",          prefix: "" },
];

const PLANS = [
  {
    name: "Free", price: 0, description: "Perfect for trying out the platform",
    features: ["1 video/month", "720p quality", "Watermark", "Basic voices", "Community access"],
    cta: "Get started free", href: "/signup",
  },
  {
    name: "Pro", price: 29, description: "Most popular for content creators",
    features: ["30 videos/month", "1080p quality", "No watermark", "Voice cloning", "All avatars", "Priority support", "Scheduling", "API access"],
    cta: "Start Pro", href: "/signup?plan=pro",
  },
  {
    name: "Agency", price: 99, description: "For teams and agencies",
    features: ["100+ videos/month", "4K quality", "White-label", "Team workspace (5)", "Full API access", "Dedicated support", "Custom branding", "Priority rendering"],
    cta: "Start Agency", href: "/signup?plan=agency",
  },
];

const TESTIMONIALS = [
  { name: "Sarah M.", role: "YouTube Creator",       initials: "SM", text: "I went from 0 to 100k subscribers in 6 months. The quality is unbelievable — my audience can't tell it's AI-generated." },
  { name: "James D.", role: "Marketing Agency Owner", initials: "JD", text: "We use it for all our clients' video ads. The ROI has been incredible and clients love the turnaround time. Total game changer." },
  { name: "Emma L.", role: "E-Commerce Brand",        initials: "EL", text: "Product demo videos that used to take weeks now take hours. Our conversion rate increased by 35% in the first month." },
];

const FAQS = [
  { q: "How long does it take to generate a video?",  a: "Most videos are generated within 5–15 minutes depending on length and complexity. You'll receive a notification the moment it's ready." },
  { q: "Can I use these videos commercially?",         a: "Yes! All videos generated with paid plans are yours to use commercially. Free plan videos include a watermark. You retain full rights." },
  { q: "What video quality can I get?",                a: "Free: 720p | Pro: 1080p | Agency: 4K. All videos include auto-captions and are optimised per platform." },
  { q: "Do you offer API access?",                     a: "Yes, Pro and Agency plans include full API access. Programmatically generate videos and integrate Voxara into your own applications." },
  { q: "What if I run out of credits?",                a: "Purchase additional credits anytime. Auto-top-up is available on Pro and Agency plans so you never run dry mid-project." },
];

/* ─── Shared section wrapper styles ─────────────────────────── */
const sectionPad: React.CSSProperties = {
  position: "relative", zIndex: 10,
  padding: "80px clamp(16px, 5vw, 48px)",
  maxWidth: "1200px", margin: "0 auto",
};

/* ─── MAIN APP ───────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onMouse  = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMouse); };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="noise-overlay" style={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>

        <MeshBg />
        <Particles />
        <Nav scrolled={scrolled} />

        {/* Cursor spotlight */}
        <div style={{
          position: "fixed",
          left: mousePos.x - 200, top: mousePos.y - 200,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(123,92,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 2,
          transition: "left 0.1s linear, top 0.1s linear",
        }} />

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section style={{
          position: "relative", zIndex: 10,
          padding: "clamp(100px, 16vh, 140px) clamp(16px, 5vw, 48px) 80px",
          maxWidth: "1200px", margin: "0 auto",
          textAlign: "center",
        }}>
          <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
            <Pill>Powered by Gemini · ElevenLabs · HeyGen · D-ID</Pill>
          </div>

          <h1 className="animate-fade-up" style={{
            animationDelay: "80ms",
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: "clamp(2.4rem, 8vw, 7rem)",
            lineHeight: 1.04, letterSpacing: "-0.03em",
            marginBottom: "28px",
          }}>
            <span className="shimmer-text">Create Viral</span>
            <br />
            <span style={{ color: C.text }}>AI Videos in</span>
            <br />
            <span style={{
              background: `linear-gradient(135deg, ${C.accentB}, ${C.accent})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Minutes.</span>
          </h1>

          <p className="animate-fade-up" style={{
            animationDelay: "160ms",
            fontSize: "clamp(0.95rem, 2.5vw, 1.25rem)",
            lineHeight: 1.7, color: C.muted,
            maxWidth: "620px", margin: "0 auto 48px",
          }}>
            Turn any topic into a polished, professional video with AI voiceover,
            avatars, and stock footage. No camera. No editing. No limits.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-up hero-ctas" style={{ animationDelay: "240ms" }}>
            <a href="/signup" className="magnetic-btn" style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "16px 36px", borderRadius: "14px",
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentB})`,
              color: "white", fontSize: "16px", fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.02em",
              boxShadow: `0 0 40px rgba(123,92,255,0.45), 0 0 80px rgba(123,92,255,0.15)`,
              position: "relative", overflow: "hidden",
            }}>
              <span style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.15), transparent)" }} />
              Start Creating Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>

            <a href="#features" className="magnetic-btn" style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "16px 32px", borderRadius: "14px",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${C.border}`,
              backdropFilter: "blur(12px)",
              color: C.text, fontSize: "16px", fontWeight: 600,
              textDecoration: "none", letterSpacing: "0.02em",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><path d="M0 0L10 6L0 12Z"/></svg>
              </div>
              See How It Works
            </a>
          </div>

          {/* Trust signals */}
          <div className="animate-fade-up" style={{
            animationDelay: "320ms",
            display: "flex", flexWrap: "wrap",
            justifyContent: "center", gap: "clamp(12px, 4vw, 28px)", marginBottom: "80px",
          }}>
            {[
              { icon: "🔒", text: "No credit card required" },
              { icon: "🎬", text: "1 free video per month" },
              { icon: "⚡", text: "Generate in 5 minutes" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: C.muted }}>
                <span>{icon}</span> {text}
              </div>
            ))}
          </div>

          {/* Hero preview window */}
          <div className="animate-scale-in" style={{
            animationDelay: "400ms",
            maxWidth: "960px", margin: "0 auto",
            borderRadius: "24px",
            border: `1px solid ${C.border}`,
            background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
            backdropFilter: "blur(20px)",
            padding: "4px",
            boxShadow: `0 40px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)`,
          }}>
            {/* Window chrome */}
            <div style={{
              padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              {["#ff5f57", "#febc2e", "#28c840"].map(c => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c, flexShrink: 0 }} />
              ))}
              <div style={{
                flex: 1, margin: "0 16px", height: "26px", borderRadius: "6px",
                background: "rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", paddingLeft: "12px",
                minWidth: 0,
              }}>
                <span style={{ fontSize: "11px", color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  app.voxara.app/studio
                </span>
              </div>
            </div>

            {/* Video area — real Mux video from DB */}
            <HeroVideo />
          </div>
        </section>

        {/* ── LOGO MARQUEE ───────────────────────────────────── */}
        <LogoMarquee />

        {/* ── STATS ─────────────────────────────────────────── */}
        <section style={{ ...sectionPad, padding: "80px clamp(16px, 5vw, 48px)" }}>
          <div className="stats-grid" style={{
            borderRadius: "24px", overflow: "hidden",
            border: `1px solid ${C.border}`,
          }}>
            {STATS.map(({ number, suffix, label, prefix }, i) => (
              <div key={label} className="stats-cell" style={{
                padding: "clamp(28px, 5vw, 48px) clamp(16px, 4vw, 32px)",
                background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.015)",
                textAlign: "center", backdropFilter: "blur(12px)",
              }}>
                <Counter target={`${number}${suffix}`} prefix={prefix} />
                <p style={{ fontSize: "13px", color: C.muted, marginTop: "8px", letterSpacing: "0.05em" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────── */}
        <section id="features" style={{ ...sectionPad, paddingBottom: "100px" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "72px" }}>
              <Pill>Platform Capabilities</Pill>
              <h2 style={{
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: "clamp(1.9rem, 5vw, 3.5rem)",
                letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "20px",
              }}>
                Everything you need to{" "}
                <span style={{
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentC})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>go viral</span>
              </h2>
              <p style={{ fontSize: "16px", color: C.muted, maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
                Powered by the latest AI and enterprise infrastructure. Used by 50K+ creators worldwide.
              </p>
            </div>
          </Reveal>
          <div className="grid-3">
            {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 80} />)}
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────── */}
        <section id="use-cases" style={{
          position: "relative", zIndex: 10,
          background: "rgba(255,255,255,0.01)",
          borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
          padding: "80px clamp(16px, 5vw, 48px) 100px",
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: "72px" }}>
                <Pill>Simple Process</Pill>
                <h2 style={{
                  fontFamily: "Syne, sans-serif", fontWeight: 800,
                  fontSize: "clamp(1.9rem, 5vw, 3.5rem)",
                  letterSpacing: "-0.03em", lineHeight: 1.1,
                }}>
                  From idea to video{" "}
                  <span style={{
                    background: `linear-gradient(135deg, ${C.accentB}, ${C.accent})`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>in 3 steps</span>
                </h2>
              </div>
            </Reveal>

            <div className="steps-grid">
              {[
                { num: "01", title: "Describe your video", desc: "Enter a topic, paste a URL, or choose a template. Our AI understands context, audience, and intent.", color: C.accent },
                { num: "02", title: "Customise & generate", desc: "Pick your voice, avatar, language, and style. Hit generate — our pipeline handles everything else.", color: C.accentB },
                { num: "03", title: "Publish everywhere", desc: "One-click publishing to YouTube, TikTok, and Instagram with auto-optimised metadata and scheduling.", color: C.accentC },
              ].map((step, i) => (
                <Reveal key={step.num} delay={i * 120}>
                  <div className="step-cell" style={{
                    padding: "clamp(28px, 5vw, 48px) clamp(20px, 4vw, 36px)",
                    background: "rgba(255,255,255,0.02)", position: "relative",
                  }}>
                    <div style={{
                      fontFamily: "Syne, sans-serif", fontWeight: 800,
                      fontSize: "clamp(48px, 8vw, 80px)", lineHeight: 1,
                      color: "rgba(255,255,255,0.04)", marginBottom: "-12px",
                      userSelect: "none",
                    }}>{step.num}</div>
                    <h3 style={{
                      fontFamily: "Syne, sans-serif", fontWeight: 700,
                      fontSize: "clamp(16px, 2.5vw, 20px)", color: C.text,
                      marginBottom: "14px", position: "relative",
                    }}>
                      <span style={{
                        display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                        background: step.color, marginRight: "10px",
                        boxShadow: `0 0 10px ${step.color}`, verticalAlign: "middle", flexShrink: 0,
                      }} />
                      {step.title}
                    </h3>
                    <p style={{ fontSize: "14px", color: C.muted, lineHeight: "1.7" }}>{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ──────────────────────────────────── */}
        <section style={{ ...sectionPad, padding: "100px clamp(16px, 5vw, 48px)" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "72px" }}>
              <Pill>Social Proof</Pill>
              <h2 style={{
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: "clamp(1.9rem, 5vw, 3.5rem)", letterSpacing: "-0.03em",
              }}>
                Trusted by{" "}
                <span style={{
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentB})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>50K+ creators</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => <TestimonialCard key={t.name} {...t} delay={i * 100} />)}
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────── */}
        <section id="pricing" style={{
          position: "relative", zIndex: 10,
          padding: "80px clamp(16px, 5vw, 48px) 100px",
          borderTop: `1px solid ${C.border}`, background: "rgba(255,255,255,0.01)",
        }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: "72px" }}>
                <Pill>Pricing</Pill>
                <h2 style={{
                  fontFamily: "Syne, sans-serif", fontWeight: 800,
                  fontSize: "clamp(1.9rem, 5vw, 3.5rem)",
                  letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "20px",
                }}>
                  Simple, transparent{" "}
                  <span style={{
                    background: `linear-gradient(135deg, ${C.accentC}, ${C.accent})`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>pricing</span>
                </h2>
                <p style={{ fontSize: "16px", color: C.muted, maxWidth: "480px", margin: "0 auto" }}>
                  Start free and scale as you grow. No surprises. Cancel anytime.
                </p>
              </div>
            </Reveal>
            <div className="pricing-grid">
              {PLANS.map((plan, i) => <PricingCard key={plan.name} plan={plan} highlighted={i === 1} delay={i * 100} />)}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────── */}
        <section id="faq" style={{
          position: "relative", zIndex: 10,
          padding: "100px clamp(16px, 5vw, 48px)",
          maxWidth: "800px", margin: "0 auto",
        }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <Pill>Got Questions?</Pill>
              <h2 style={{
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: "clamp(1.9rem, 5vw, 3rem)", letterSpacing: "-0.03em",
              }}>Frequently asked questions</h2>
            </div>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {FAQS.map((faq, i) => <FAQItem key={faq.q} {...faq} delay={i * 60} />)}
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────── */}
        <section style={{
          position: "relative", zIndex: 10,
          padding: "100px clamp(16px, 5vw, 48px)",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse 70% 60% at 50% 50%, rgba(123,92,255,0.12), transparent)`,
          }} />
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "1px",
            background: `linear-gradient(90deg, transparent, ${C.accent}, ${C.accentB}, ${C.accentC}, transparent)`,
          }} />
          <div style={{
            position: "absolute", width: "min(600px, 90vw)", height: "min(600px, 90vw)",
            border: "1px solid rgba(123,92,255,0.08)", borderRadius: "50%",
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            animation: "spin-slow 30s linear infinite",
          }} />
          <div style={{
            position: "absolute", width: "min(400px, 60vw)", height: "min(400px, 60vw)",
            border: "1px solid rgba(255,92,168,0.06)", borderRadius: "50%",
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            animation: "spin-slow 20s linear infinite reverse",
          }} />

          <Reveal>
            <div style={{ textAlign: "center", position: "relative" }}>
              <h2 style={{
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: "clamp(2rem, 7vw, 5.5rem)",
                letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "24px",
              }}>
                <span className="shimmer-text">Ready to go viral?</span>
              </h2>
              <p style={{
                fontSize: "clamp(15px, 2.5vw, 18px)", color: C.muted,
                marginBottom: "52px", maxWidth: "480px", margin: "0 auto 52px", lineHeight: 1.7,
              }}>
                Join 50,000+ creators, agencies, and businesses already using Voxara to grow their audience.
              </p>

              <div style={{
                display: "flex", justifyContent: "center",
                gap: "16px", flexWrap: "wrap",
              }}>
                <a href="/signup" className="magnetic-btn" style={{
                  display: "inline-flex", alignItems: "center", gap: "12px",
                  padding: "clamp(14px, 3vw, 18px) clamp(24px, 5vw, 44px)",
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentB})`,
                  color: "white", fontSize: "clamp(14px, 2.5vw, 17px)", fontWeight: 700,
                  textDecoration: "none", letterSpacing: "0.02em",
                  boxShadow: `0 0 60px rgba(123,92,255,0.5), 0 0 120px rgba(123,92,255,0.2)`,
                  position: "relative", overflow: "hidden",
                }}>
                  <span style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.12), transparent)" }} />
                  Create your first video — it's free
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
                <a href="mailto:sales@voxara.app" className="magnetic-btn" style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  padding: "clamp(14px, 3vw, 18px) clamp(20px, 4vw, 36px)",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                  backdropFilter: "blur(12px)",
                  color: C.text, fontSize: "clamp(14px, 2.5vw, 17px)", fontWeight: 600,
                  textDecoration: "none",
                }}>Talk to sales</a>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <footer style={{
          position: "relative", zIndex: 10,
          padding: "32px clamp(16px, 5vw, 48px)",
          borderTop: `1px solid ${C.border}`,
          maxWidth: "1200px", margin: "0 auto",
        }}>
          <div className="footer-inner">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div style={{
                width: 30, height: 30, borderRadius: "8px", flexShrink: 0,
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentB})`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "16px" }}>voxara</span>
              <span style={{ fontSize: "13px", color: C.muted }}>© 2025 Voxara. All rights reserved.</span>
            </div>
            <div style={{ display: "flex", gap: "clamp(12px, 3vw, 32px)", flexWrap: "wrap" }}>
              {[
                { label: "Privacy", href: "/legal/privacy" },
                { label: "Terms", href: "/legal/terms" },
                { label: "Cookies", href: "/legal/cookies" },
                { label: "Contact", href: "mailto:sales@voxara.app" },
              ].map(link => (
                <a key={link.label} href={link.href} style={{
                  fontSize: "13px", color: C.muted, textDecoration: "none", transition: "color 0.2s",
                }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = C.text}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = C.muted}
                >{link.label}</a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}