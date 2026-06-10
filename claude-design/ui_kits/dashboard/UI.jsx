// Learnova Dashboard UI Primitives — ui kit component
// Load with: <script type="text/babel" src="UI.jsx">

// ── Color tokens ─────────────────────────────────────────────
const C = {
  blue: "#173B64", blueAccent: "#2563EB", blueDim: "rgba(37,99,235,0.09)", blueBorder: "rgba(37,99,235,0.18)",
  green: "#0F9E6A", greenDim: "rgba(15,158,106,0.09)", greenBorder: "rgba(15,158,106,0.2)",
  purple: "#6D28D9", purpleDim: "rgba(109,40,217,0.08)",
  amber: "#D97706", red: "#DC2626",
  bg: "#F0F5FC", card: "#FFFFFF", card2: "#F0F5FC",
  border: "#DDE6F0", muted: "#6B7E96", hint: "#9EB3C8",
  text: "#173B64", textBright: "#0F2746", textSub: "#4A6580",
};

const TAG = {
  blue:   { background: "rgba(37,99,235,0.09)",  color: "#1D4ED8" },
  green:  { background: "rgba(15,158,106,0.09)", color: "#065F46" },
  purple: { background: "rgba(109,40,217,0.08)", color: "#5B21B6" },
  amber:  { background: "rgba(217,119,6,0.09)",  color: "#92400E" },
  red:    { background: "rgba(220,38,38,0.09)",  color: "#991B1B" },
  gray:   { background: "#EEF4FB",               color: "#6B7E96" },
};

// ── Buttons ───────────────────────────────────────────────────
function BtnPrimary({ children, onClick, style = {}, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: "100%", background: disabled ? "#173B64" : "#173B64", color: "#fff", border: "none", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", opacity: disabled ? 0.4 : 1, transition: "background 150ms", ...style }}>
      {children}
    </button>
  );
}

function BtnGhost({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick}
      style={{ width: "100%", background: "transparent", color: "#6B7E96", border: "1px solid #DDE6F0", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 150ms", ...style }}>
      {children}
    </button>
  );
}

function BtnIcon({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick}
      style={{ background: "#F0F5FC", border: "1px solid #DDE6F0", borderRadius: 12, padding: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 150ms", ...style }}>
      {children}
    </button>
  );
}

// ── Tag ───────────────────────────────────────────────────────
function Tag({ label, type = "gray" }) {
  const s = TAG[type] || TAG.gray;
  return (
    <span style={{ background: s.background, color: s.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {label}
    </span>
  );
}

// ── Progress Bar ──────────────────────────────────────────────
function PBar({ pct, color, height = 5 }) {
  return (
    <div style={{ height, background: "#DDE6F0", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height, background: color, borderRadius: 999, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────
function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick}
      style={{ background: "#fff", border: "1px solid #DDE6F0", borderRadius: 16, padding: 20,
        cursor: onClick ? "pointer" : "default",
        transition: onClick ? "border-color 150ms" : "none", ...style }}>
      {children}
    </div>
  );
}

function Card2({ children, style = {} }) {
  return (
    <div style={{ background: "#F0F5FC", border: "1px solid #DDE6F0", borderRadius: 12, padding: 14, ...style }}>
      {children}
    </div>
  );
}

// ── Section Label ─────────────────────────────────────────────
function SLabel({ children, style = {} }) {
  return (
    <div style={{ fontSize: 10, color: "#9EB3C8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 10, ...style }}>
      {children}
    </div>
  );
}

// ── Separator ─────────────────────────────────────────────────
function Sep({ style = {} }) {
  return <div style={{ height: 1, background: "#DDE6F0", margin: "12px 0", ...style }} />;
}

// ── Avatar ────────────────────────────────────────────────────
function Avatar({ initials, size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#173B64", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ── Icon Box ──────────────────────────────────────────────────
function IconBox({ icon, color, glow, size = 34 }) {
  return (
    <div style={{ width: size, height: size, background: glow || "rgba(37,99,235,0.09)", color, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
      {icon}
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────
function Row({ children, noBorder = false, style = {} }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: noBorder ? "none" : "1px solid #DDE6F0", ...style }}>
      {children}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ value, label, color }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #DDE6F0", borderRadius: 16, padding: 16, textAlign: "center" }}>
      <div style={{ color, fontSize: 24, fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#9EB3C8", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ── Activity Bars ─────────────────────────────────────────────
function ActivityBars({ data, days, todayIdx }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 56 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ height: `${Math.max((v / max) * 44, 4)}px`, width: "100%", background: i === todayIdx ? "#173B64" : "#DDE6F0", borderRadius: 2, transition: "height 600ms" }} />
          <div style={{ fontSize: 9, color: i === todayIdx ? "#173B64" : "#9EB3C8", fontWeight: i === todayIdx ? 700 : 400 }}>{days[i]}</div>
        </div>
      ))}
    </div>
  );
}

// ── Countdown Boxes ───────────────────────────────────────────
function CountdownBoxes({ examDate }) {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, examDate - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      {[{ v: days, l: "Kun" }, { v: hours, l: "Soat" }, { v: mins, l: "Daqiqa" }, { v: secs, l: "Soniya" }].map(({ v, l }) => (
        <div key={l} style={{ flex: 1, background: "#F0F5FC", border: "1px solid #DDE6F0", borderRadius: 12, padding: "8px 4px", textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#173B64", lineHeight: 1 }}>{String(v).padStart(2, "0")}</div>
          <div style={{ fontSize: 9, color: "#9EB3C8", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

// ── Question Option ───────────────────────────────────────────
function QuestionOption({ label, text, state = "idle", onClick }) {
  const stateStyles = {
    idle:     { border: "1px solid #DDE6F0", background: "transparent", color: "#173B64" },
    selected: { border: "1px solid #173B64", background: "#EEF4FB", color: "#173B64" },
    correct:  { border: "1px solid #22c55e", background: "#f0fdf4", color: "#166534" },
    wrong:    { border: "1px solid #ef4444", background: "#fef2f2", color: "#991b1b" },
  };
  return (
    <div onClick={onClick}
      style={{ display: "flex", alignItems: "flex-start", gap: 12, borderRadius: 12, padding: "10px 14px", marginBottom: 10, cursor: "pointer", transition: "all 150ms", ...stateStyles[state] }}>
      <span style={{ fontWeight: 700, fontSize: 13, flexShrink: 0, width: 18 }}>{label}.</span>
      <span style={{ fontSize: 13, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const isErr = toast?.type === "error";
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 16, boxShadow: "0 8px 24px rgba(23,59,100,0.16)", fontSize: 13, fontWeight: 500, animation: "toastIn .25s ease", ...(isErr ? { background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" } : { background: "#173B64", color: "#fff" }) }}>
      <span>{isErr ? "⚠" : "✓"}</span>
      {typeof toast === "string" ? toast : toast?.msg}
    </div>
  );
}

Object.assign(window, { C, TAG, BtnPrimary, BtnGhost, BtnIcon, Tag, PBar, Card, Card2, SLabel, Sep, Avatar, IconBox, Row, StatCard, ActivityBars, CountdownBoxes, QuestionOption, Toast });
