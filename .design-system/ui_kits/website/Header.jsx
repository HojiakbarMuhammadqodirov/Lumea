// Lumea Public Header — website UI kit component
// Load with: <script type="text/babel" src="Header.jsx">

const { useState, useEffect } = React;

function LumeaHeader({ navItems, currentView, onNav }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navbarStyle = scrolled ? {
    position: "fixed", top: 28, left: "50%",
    transform: "translateX(-50%)",
    width: "min(calc(100% - 60px), 1120px)",
    zIndex: 20,
    minHeight: 70,
    display: "grid",
    gridTemplateColumns: "auto minmax(0,1fr) auto",
    gap: 26,
    alignItems: "center",
    padding: "12px 28px",
    background: "rgba(246,250,255,0.96)",
    border: "1px solid rgba(23,59,100,0.1)",
    borderRadius: 999,
    transition: "all 960ms cubic-bezier(0.22,1,0.36,1)",
  } : {
    position: "fixed", top: 0, left: "50%",
    transform: "translateX(-50%)",
    width: "min(calc(100% - 24px), 1400px)",
    zIndex: 20,
    minHeight: 82,
    display: "grid",
    gridTemplateColumns: "auto minmax(0,1fr) auto",
    gap: 26,
    alignItems: "center",
    padding: "16px clamp(18px, 5vw, 72px)",
    background: "#F6FAFF",
    border: "1px solid transparent",
    borderRadius: 0,
    transition: "all 960ms cubic-bezier(0.22,1,0.36,1)",
  };

  return (
    <nav style={navbarStyle} aria-label="Main navigation">
      {/* Logo */}
      <button
        onClick={() => onNav("landing")}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0,
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "2rem", fontWeight: 900,
          color: "#173B64", lineHeight: 1, whiteSpace: "nowrap", letterSpacing: "-0.02em" }}
        aria-label="Lumea home"
      >
        Lumea
      </button>

      {/* Nav links */}
      <div style={{ display: "flex", justifyContent: "center", gap: "clamp(12px, 2vw, 30px)", alignItems: "center" }}>
        {navItems.map(item =>
          item.soon ? (
            <span key={item.label}
              style={{ position: "relative", display: "inline-flex", alignItems: "center", minHeight: 42, paddingBottom: 10,
                color: "#a8b1b8", cursor: "default", fontSize: "0.92rem", fontWeight: 600 }}
            >
              {item.label}
              <span style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", top: 28,
                color: "#c5ccd3", fontSize: "0.46rem", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Soon
              </span>
            </span>
          ) : (
            <button
              key={item.label}
              onClick={() => onNav(item.view)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: currentView === item.view ? "#173B64" : "#5f6b76",
                fontWeight: currentView === item.view ? 800 : 600,
                fontSize: "0.92rem",
                fontFamily: "'DM Sans', sans-serif",
                padding: "0 2px",
                minHeight: 42,
                display: "inline-flex", alignItems: "center",
                position: "relative",
                transition: "color 180ms ease",
              }}
            >
              {item.label}
              {currentView === item.view && (
                <span style={{ position: "absolute", bottom: 2, left: 0, right: 0, height: 2, borderRadius: 999, background: "#173B64" }} />
              )}
            </button>
          )
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "flex-end" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#7c858d", fontWeight: 800, fontSize: "0.88rem", padding: "6px 12px", borderRadius: 999, fontFamily: "'DM Sans', sans-serif", transition: "color 180ms" }}>
          ENG
        </button>
        <button
          onClick={() => onNav("login")}
          style={{ borderRadius: 999, border: "1px solid #173B64", minHeight: 42, padding: "0 22px",
            color: "#F6FAFF", background: "#173B64", fontWeight: 800, fontSize: "0.9rem",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            transition: "all 180ms ease" }}
        >
          Log in
        </button>
      </div>
    </nav>
  );
}

Object.assign(window, { LumeaHeader });
