// Lumea Footer — website UI kit component
// Load with: <script type="text/babel" src="Footer.jsx">

function LumeaFooter({ onNav, onLogin }) {
  const links = [
    { label: "Home", view: "landing" },
    { label: "SAT", view: "sat" },
    { label: "IELTS", view: "ielts" },
    { label: "Pricing", view: "pricing" },
    { label: "FAQ", view: "faq" },
  ];

  return (
    <footer style={{ width: "100%", borderTop: "1px solid rgba(23,59,100,0.1)", padding: "42px 0 32px" }}>
      <div style={{ width: "min(1180px, calc(100% - 32px))", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) repeat(2, minmax(0,0.7fr))", gap: 28, alignItems: "start" }}>
          {/* Brand */}
          <div style={{ display: "grid", gap: 14 }}>
            <button onClick={() => onNav("landing")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.8rem", fontWeight: 900, color: "#173B64", letterSpacing: "-0.02em", textAlign: "left" }}>
              Lumea
            </button>
            <p style={{ margin: 0, maxWidth: 400, color: "#7c858d", lineHeight: 1.7, fontSize: "0.95rem" }}>
              Structured prep, AI-powered guidance, real materials, and support from experienced teachers that keeps moving with you.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "grid", gap: 10 }}>
            {links.map(l => (
              <button key={l.label} onClick={() => onNav(l.view)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#7c858d", fontWeight: 700, fontSize: "0.9rem", textAlign: "left", fontFamily: "'DM Sans', sans-serif", transition: "color 180ms" }}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
            <a href="mailto:info@lumea.uz" style={{ color: "#7c858d", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>
              info@lumea.uz
            </a>
            <button
              onClick={onLogin}
              style={{ borderRadius: 999, border: "1px solid #173B64", minHeight: 44, padding: "0 22px",
                color: "#F6FAFF", background: "#173B64", fontWeight: 800, fontSize: "0.9rem",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              Log in
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid rgba(23,59,100,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: "0.82rem", color: "#9EB3C8" }}>© 2026 Lumea. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            {["Privacy", "Terms", "Support"].map(l => (
              <a key={l} href="#" style={{ fontSize: "0.82rem", color: "#9EB3C8", textDecoration: "none", fontWeight: 700 }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { LumeaFooter });
