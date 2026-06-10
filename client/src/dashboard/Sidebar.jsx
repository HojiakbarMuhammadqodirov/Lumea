import { useApp } from "./useApp";

const C = {
  navy: "#173B64", navyDeep: "#0F2746",
  bg: "#F0F5FC", border: "#DDE6F0",
  muted: "#6B7E96", hint: "#9EB3C8",
  red: "#DC2626",
};

const NAV = [
  { id: "home",    label: "Bosh sahifa", icon: "home",    section: "main" },
  { id: "lessons", label: "Darslar",     icon: "book",    section: "main" },
  { id: "tests",   label: "Testlar",     icon: "pencil",  section: "main" },
  { id: "stats",   label: "Statistika",  icon: "chart",   section: "main" },
  { id: "chat",    label: "Chat",        icon: "chat",    section: "main" },
  { id: "rating",  label: "Reyting",     icon: "star",    section: "study" },
  { id: "profile", label: "Profil",      icon: "user",    section: "study" },
];

function NavIcon({ id, size = 15, color = "currentColor" }) {
  const paths = {
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
    book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
    pencil: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    chart: "M18 20V10M12 20V4M6 20v-6",
    chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[id]} />
    </svg>
  );
}

export default function Sidebar({ page, onNav, onLogout }) {
  const { user } = useApp();
  const initials = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "LV";
  const mainItems = NAV.filter((item) => item.section === "main");
  const studyItems = NAV.filter((item) => item.section === "study");

  return (
    <aside style={{ width: 220, flexShrink: 0, background: "#fff", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      {/* Brand */}
      <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>L</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, lineHeight: 1 }}>Lumea</div>
          <div style={{ fontSize: 9, color: C.hint, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>Student Space</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        <div style={{ fontSize: 9, color: C.hint, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, padding: "0 8px", marginBottom: 4 }}>Asosiy</div>
        {mainItems.map((item) => (
          <button key={item.id} onClick={() => onNav(item.id)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans',sans-serif", background: page === item.id ? C.navy : "transparent", color: page === item.id ? "#fff" : C.muted, transition: "all 150ms" }}>
            <span style={{ width: 16, display: "flex", alignItems: "center", flexShrink: 0 }}>
              <NavIcon id={item.icon} size={15} color={page === item.id ? "#fff" : C.muted} />
            </span>
            {item.label}
          </button>
        ))}

        <div style={{ fontSize: 9, color: C.hint, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, padding: "0 8px", marginTop: 12, marginBottom: 4 }}>O'qish</div>
        {studyItems.map((item) => (
          <button key={item.id} onClick={() => onNav(item.id)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans',sans-serif", background: page === item.id ? C.navy : "transparent", color: page === item.id ? "#fff" : C.muted, transition: "all 150ms" }}>
            <span style={{ width: 16, display: "flex", alignItems: "center", flexShrink: 0 }}>
              <NavIcon id={item.icon} size={15} color={page === item.id ? "#fff" : C.muted} />
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User area */}
      <div style={{ padding: 10, borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={() => onNav("profile")}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, background: C.bg, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans',sans-serif" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{initials}</div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.firstName} {user.lastName?.[0]}.</div>
            <div style={{ fontSize: 10, color: C.hint }}>Bepul rejim</div>
          </div>
        </button>

        {onLogout && (
          <button onClick={onLogout} style={{ width: "100%", marginTop: 4, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 12, color: C.red, fontSize: 12, fontWeight: 500, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            <NavIcon id="logout" size={13} color={C.red} />
            Chiqish
          </button>
        )}
      </div>
    </aside>
  );
}
