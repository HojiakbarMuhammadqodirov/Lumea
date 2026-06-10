// Learnova Dashboard Sidebar — ui kit component
// Load with: <script type="text/babel" src="Sidebar.jsx">

const NAV_ITEMS = [
  { id: "home",    label: "Bosh sahifa", icon: "home",    section: "main" },
  { id: "lessons", label: "Darslar",     icon: "book",    section: "main", badge: 3 },
  { id: "tests",   label: "Testlar",     icon: "pencil",  section: "main" },
  { id: "stats",   label: "Statistika",  icon: "chart",   section: "main" },
  { id: "rating",  label: "Reyting",     icon: "star",    section: "study" },
  { id: "profile", label: "Profil",      icon: "user",    section: "study" },
];

function NavIcon({ id }) {
  const icons = {
    home:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    book:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    pencil: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    chart:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    star:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
    user:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    logout: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  };
  return icons[id] || null;
}

function DashboardSidebar({ page, onNav, onLogout, user }) {
  const initials = ((user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")).toUpperCase() || "AK";
  const mainItems = NAV_ITEMS.filter(n => n.section === "main");
  const studyItems = NAV_ITEMS.filter(n => n.section === "study");

  return (
    <aside style={{ width: 220, flexShrink: 0, background: "#fff", borderRight: "1px solid #DDE6F0", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      {/* Logo */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #DDE6F0", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "#173B64", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>L</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#173B64", lineHeight: 1 }}>LearnNova</div>
          <div style={{ fontSize: 9, color: "#9EB3C8", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>Student Space</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        <NavSection label="Asosiy" />
        {mainItems.map(item => <NavItem key={item.id} item={item} active={page === item.id} onClick={() => onNav(item.id)} />)}
        <NavSection label="O'qish" style={{ marginTop: 10 }} />
        {studyItems.map(item => <NavItem key={item.id} item={item} active={page === item.id} onClick={() => onNav(item.id)} />)}
      </nav>

      {/* User area */}
      <div style={{ padding: "10px 10px", borderTop: "1px solid #DDE6F0" }}>
        <button
          onClick={() => onNav("profile")}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, background: "#F0F5FC", border: "none", cursor: "pointer", textAlign: "left", transition: "background 150ms" }}
        >
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#173B64", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#173B64", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.firstName} {user?.lastName?.[0]}.</div>
            <div style={{ fontSize: 10, color: "#9EB3C8" }}>Bepul rejim</div>
          </div>
        </button>
        <button
          onClick={onLogout}
          style={{ width: "100%", marginTop: 4, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 12, color: "#DC2626", fontSize: 12, fontWeight: 500, background: "none", border: "none", cursor: "pointer", transition: "background 150ms", fontFamily: "'DM Sans', sans-serif" }}
        >
          <NavIcon id="logout" /> Chiqish
        </button>
      </div>
    </aside>
  );
}

function NavSection({ label, style = {} }) {
  return (
    <div style={{ fontSize: 9, color: "#9EB3C8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, padding: "0 8px", marginBottom: 4, ...style }}>
      {label}
    </div>
  );
}

function NavItem({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px", borderRadius: 12, fontSize: 13, fontWeight: 500,
        border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
        background: active ? "#173B64" : "transparent",
        color: active ? "#fff" : "#6B7E96",
        transition: "all 150ms",
      }}
    >
      <span style={{ width: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><NavIcon id={item.icon} /></span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge && (
        <span style={{ background: "#DC2626", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 999 }}>{item.badge}</span>
      )}
    </button>
  );
}

Object.assign(window, { DashboardSidebar, NavIcon });
