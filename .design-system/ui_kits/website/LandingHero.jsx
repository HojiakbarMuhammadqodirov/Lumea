// Lumea Landing Hero — website UI kit component
// Load with: <script type="text/babel" src="LandingHero.jsx">

function LumeaHero({ onLogin, onCTA }) {
  const unis = [
    { src: "../../assets/images/harvard.png", alt: "Harvard", style: { top: "18%", left: "8%" } },
    { src: "../../assets/images/mit.png", alt: "MIT", style: { top: "12%", right: "10%" } },
    { src: "../../assets/images/yale.png", alt: "Yale", style: { bottom: "28%", left: "5%" } },
    { src: "../../assets/images/princeton.png", alt: "Princeton", style: { bottom: "22%", right: "7%" } },
    { src: "../../assets/images/duke.png", alt: "Duke", style: { top: "55%", left: "14%" } },
  ];

  return (
    <section style={{
      width: "min(1180px, calc(100% - 32px))", margin: "0 auto",
      minHeight: "calc(100vh - 180px)",
      display: "grid", placeItems: "center",
      padding: "clamp(76px, 10vw, 132px) 0 clamp(24px, 4vw, 40px)",
      textAlign: "center", position: "relative", zIndex: 1,
    }}>
      {/* Floating uni logos */}
      {unis.map(u => (
        <img key={u.alt} src={u.src} alt={u.alt}
          style={{ position: "absolute", width: 90, maxWidth: 90, opacity: 0.4, objectFit: "contain",
            filter: "drop-shadow(0 8px 16px rgba(23,59,100,0.1))", userSelect: "none", pointerEvents: "none",
            ...u.style }}
        />
      ))}

      <div style={{ position: "relative", display: "grid", gap: 24, justifyItems: "center" }}>
        {/* Eyebrow badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,222,112,0.18)", border: "1px solid rgba(255,222,112,0.5)", borderRadius: 999, padding: "6px 16px" }}>
          <svg width="16" height="16" viewBox="0 0 72 72" aria-hidden="true">
            <path d="M36 6c10.4 0 20.8 3 28 8.8v19.4c0 15.4-10.4 25.5-28 31.8C18.4 59.7 8 49.6 8 34.2V14.8C15.2 9 25.6 6 36 6Z"
              fill="#ffde70" stroke="#173B64" strokeWidth="5" strokeLinejoin="round"/>
            <path d="M22 37.5 31 46.5 49.5 25.5" fill="none" stroke="#173B64" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#173B64", letterSpacing: "0.03em" }}>SAT · IELTS · AP · College Admissions</span>
        </div>

        {/* Headline */}
        <h1 style={{
          margin: 0,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "clamp(2.6rem, 6vw, 5.2rem)",
          fontWeight: 900, lineHeight: 1.04,
          color: "#173B64",
          maxWidth: 860,
          textWrap: "balance",
        }}>
          Everything you need to secure{" "}
          <span style={{ color: "#ffde70", WebkitTextStroke: "2px #173B64" }}>
            the next chapter
          </span>{" "}
          of your life.
        </h1>

        {/* Subtitle */}
        <p style={{
          margin: 0, maxWidth: 620, color: "#7c858d",
          fontSize: "clamp(1rem, 1.8vw, 1.2rem)", lineHeight: 1.65,
        }}>
          Prepare for IELTS, SAT, and AP with structured courses, AI-powered insights,
          and expert guidance designed to maximize your scores and admission success.
        </p>

        {/* CTA row */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
          <button
            onClick={onCTA}
            style={{ borderRadius: 999, border: "1px solid #173B64", minHeight: 52, padding: "0 36px",
              color: "#F6FAFF", background: "#173B64", fontWeight: 800, fontSize: "1rem",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "all 180ms ease" }}
          >
            Start Preparing
          </button>
          <button
            onClick={onLogin}
            style={{ borderRadius: 999, border: "1px solid #173B64", minHeight: 52, padding: "0 36px",
              color: "#173B64", background: "transparent", fontWeight: 800, fontSize: "1rem",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "all 180ms ease" }}
          >
            Log in
          </button>
        </div>

        {/* Stat pills */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 12 }}>
          {[
            { val: "1560", label: "Top SAT Score" },
            { val: "7.5", label: "IELTS Band" },
            { val: "8,000+", label: "Practice Questions" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(246,250,255,0.9)", border: "1px solid rgba(23,59,100,0.08)", borderRadius: 999, padding: "8px 18px", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontWeight: 900, fontSize: "1.1rem", color: "#173B64" }}>{s.val}</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#9EB3C8" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { LumeaHero });
