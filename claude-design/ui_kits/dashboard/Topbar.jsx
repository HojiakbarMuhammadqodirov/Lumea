// Learnova Dashboard Topbar — ui kit component
// Load with: <script type="text/babel" src="Topbar.jsx">

const PAGE_TITLES = {
  home:    "Bosh sahifa",
  lessons: "Darslar",
  tests:   "Testlar",
  stats:   "Statistika",
  rating:  "Reyting",
  profile: "Profil",
};

function DashboardTopbar({ page, user }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", background: "#fff", borderBottom: "1px solid #DDE6F0", flexShrink: 0 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#173B64", lineHeight: 1 }}>
          {PAGE_TITLES[page] || page}
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9EB3C8" }}>
          {user?.region || "Namangan"} · LearnNova
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Chip color={{ text: "#f97316", bg: "#fff7ed", border: "#fed7aa" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#f97316" stroke="none"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>
          {user?.streak || 12} kun
        </Chip>
        <Chip color={{ text: "#2563EB", bg: "#eff6ff", border: "#bfdbfe" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#2563EB" stroke="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
          #{user?.regionRank || 3} Namangan
        </Chip>
      </div>
    </div>
  );
}

function Chip({ children, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, border: `1px solid ${color.border}`, borderRadius: 10, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: color.text, background: color.bg }}>
      {children}
    </div>
  );
}

Object.assign(window, { DashboardTopbar });
