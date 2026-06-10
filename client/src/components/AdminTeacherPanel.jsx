import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";

// ── Design tokens ──────────────────────────────────────────────
const C = {
  navy: "#173B64", navyDeep: "#0F2746", navyDark: "#040E1C",
  blueAccent: "#2563EB", blueDim: "rgba(37,99,235,0.09)", blueBorder: "rgba(37,99,235,0.18)",
  green: "#0F9E6A", greenDim: "rgba(15,158,106,0.09)", greenBorder: "rgba(15,158,106,0.2)",
  amber: "#D97706", amberDim: "rgba(217,119,6,0.09)",
  red: "#DC2626", redDim: "rgba(220,38,38,0.09)",
  purple: "#6D28D9", purpleDim: "rgba(109,40,217,0.08)",
  yellow: "#ffde70",
  bg: "#F0F5FC", card: "#FFFFFF", card2: "#F0F5FC",
  border: "#DDE6F0", muted: "#6B7E96", hint: "#9EB3C8",
  text: "#173B64", textSub: "#4A6580",
};

const PROGRAM_LABELS = { "sat-math": "SAT Math", "sat-english": "SAT English", ielts: "IELTS" };
const PLAN_COLORS = { basic: C.hint, plus: C.blueAccent, pro: C.purple };
const PLAN_BG    = { basic: "#EEF4FB", plus: C.blueDim, pro: C.purpleDim };

// ── UI Primitives ──────────────────────────────────────────────
function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, cursor: onClick ? "pointer" : "default", transition: onClick ? "border-color 150ms" : "none", ...style }}>
      {children}
    </div>
  );
}
function Card2({ children, style = {} }) {
  return <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, ...style }}>{children}</div>;
}
function SLabel({ children, style = {} }) {
  return <div style={{ fontSize: 10, color: C.hint, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 10, ...style }}>{children}</div>;
}
function Sep({ style = {} }) {
  return <div style={{ height: 1, background: C.border, margin: "12px 0", ...style }} />;
}
function PBar({ pct, color, height = 5 }) {
  return (
    <div style={{ height, background: C.border, borderRadius: 999, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height, background: color, borderRadius: 999, transition: "width 800ms cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}
function Avatar({ name = "?", size = 32, color = C.navy }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>
      {initials}
    </div>
  );
}
function Tag({ label, bg = C.bg, color = C.muted }) {
  return <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{label}</span>;
}
function PlanTag({ plan }) {
  return <Tag label={plan} bg={PLAN_BG[plan] || C.bg} color={PLAN_COLORS[plan] || C.hint} />;
}
function Btn({ children, onClick, style = {}, variant = "primary", disabled = false, type = "button" }) {
  const base = { border: "none", borderRadius: 12, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 150ms", opacity: disabled ? 0.45 : 1, display: "inline-flex", alignItems: "center", gap: 6 };
  const variants = {
    primary: { background: C.navy, color: "#fff" },
    ghost: { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    danger: { background: C.redDim, color: C.red, border: `1px solid rgba(220,38,38,0.2)` },
    success: { background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` },
  };
  return <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}
function FieldInput({ label, value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 700, color: C.hint, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, background: C.bg, width: "100%", fontFamily: "'DM Sans',sans-serif", outline: "none", ...style }}
        onFocus={e => e.target.style.borderColor = C.navy}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}
function Modal({ title, children, onClose, width = 480 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,39,70,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, width, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 18px 50px rgba(7,49,94,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>{title}</div>
          <button onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14, color: C.muted, fontFamily: "'DM Sans',sans-serif" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function ToastMsg({ msg, onDone }) {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [msg, onDone]);
  if (!msg) return null;
  return <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 300, background: C.navy, color: "#fff", borderRadius: 14, padding: "11px 18px", fontSize: 13, fontWeight: 500, boxShadow: "0 8px 24px rgba(23,59,100,0.2)", display: "flex", alignItems: "center", gap: 8 }}>✓ {msg}</div>;
}

// ── SVG Icon helper ────────────────────────────────────────────
function Icon({ d, size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
}
const ICONS = {
  students: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  teachers: "M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
  lessons:  "M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  chat:     "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  rating:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  clock:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  targets:  "M5 16l5-5 3 3 6-6",
  logout:   "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  send:     "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  plus:     "M12 5v14M5 12h14",
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:    "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  check:    "M20 6L9 17l-5-5",
};

// ── Sidebar ────────────────────────────────────────────────────
function AdminSidebar({ role, tab, onTab, user, onLogout }) {
  const adminNav = [
    { id: "overview",  label: "Overview",     icon: "rating" },
    { id: "students",  label: "Students",     icon: "students" },
    { id: "teachers",  label: "Teachers",     icon: "teachers" },
    { id: "lessons",   label: "Lessons",      icon: "lessons" },
    { id: "bookings",  label: "Bookings",     icon: "calendar" },
    { id: "ratings",   label: "Ratings",      icon: "rating" },
  ];
  const teacherNav = [
    { id: "overview",  label: "Overview",     icon: "rating" },
    { id: "students",  label: "My Students",  icon: "students" },
    { id: "chat",      label: "Chat",         icon: "chat" },
    { id: "bookings",  label: "Bookings",     icon: "calendar" },
    { id: "lessons",   label: "Lessons",      icon: "lessons" },
  ];
  const nav = role === "admin" ? adminNav : teacherNav;

  return (
    <aside style={{ width: 220, flexShrink: 0, background: "#fff", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>L</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, lineHeight: 1 }}>Lumea</div>
          <div style={{ fontSize: 9, color: C.hint, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{role === "admin" ? "Admin Panel" : "Teacher Panel"}</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        <div style={{ fontSize: 9, color: C.hint, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, padding: "0 8px", marginBottom: 4 }}>Navigation</div>
        {nav.map(item => (
          <button key={item.id} onClick={() => onTab(item.id)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans',sans-serif", background: tab === item.id ? C.navy : "transparent", color: tab === item.id ? "#fff" : C.muted, transition: "all 150ms" }}>
            <span style={{ width: 16, display: "flex", alignItems: "center", flexShrink: 0 }}><Icon d={ICONS[item.icon]} size={15} color={tab === item.id ? "#fff" : C.muted} /></span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: "10px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, background: C.bg }}>
          <Avatar name={user.name || "U"} size={30} />
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
            <div style={{ fontSize: 10, color: C.hint, textTransform: "capitalize" }}>{user.role}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ width: "100%", marginTop: 4, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 12, color: C.red, fontSize: 12, fontWeight: 500, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          <Icon d={ICONS.logout} size={13} color={C.red} /> Log out
        </button>
      </div>
    </aside>
  );
}

// ── Topbar ─────────────────────────────────────────────────────
function AdminTopbar({ tab, role, counts, onAddStudent, onAddTeacher }) {
  const titles = { overview: "Overview", students: role === "admin" ? "Students" : "My Students", teachers: "Teachers", chat: "Chat", lessons: "Lessons", bookings: "Bookings", ratings: "Ratings", targets: "Target Scores" };
  const subtitles = { overview: "Your dashboard at a glance", students: `${counts.students} active`, teachers: `${counts.teachers} teachers`, chat: "Student messages", lessons: "Manage content", bookings: "Session bookings", ratings: "Leaderboard", targets: "Score goals" };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: "#fff", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.navy, lineHeight: 1 }}>{titles[tab] || tab}</h1>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: C.hint }}>{subtitles[tab]}</p>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.greenDim, border: `1px solid ${C.greenBorder}`, borderRadius: 10, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: C.green }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
          System Online
        </div>
        {role === "admin" && tab === "students" && (
          <Btn onClick={onAddStudent}><Icon d={ICONS.plus} size={13} color="#fff" /> Add Student</Btn>
        )}
        {role === "admin" && tab === "teachers" && (
          <Btn onClick={onAddTeacher}><Icon d={ICONS.plus} size={13} color="#fff" /> Add Teacher</Btn>
        )}
      </div>
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────
function OverviewTab({ role, students, teachers, ratingRows, onTab }) {
  const statCards = role === "admin" ? [
    { label: "Total Students", value: students.length, color: C.blueAccent, bg: C.blueDim, icon: "students", tab: "students" },
    { label: "Total Teachers", value: teachers.length, color: C.green, bg: C.greenDim, icon: "teachers", tab: "teachers" },
    { label: "Active Chats", value: 0, color: C.amber, bg: C.amberDim, icon: "chat", tab: "chat" },
    { label: "Top Points", value: ratingRows[0]?.points || 0, color: C.purple, bg: C.purpleDim, icon: "rating", tab: "ratings" },
  ] : [
    { label: "My Students", value: students.length, color: C.blueAccent, bg: C.blueDim, icon: "students", tab: "students" },
    { label: "Active Chats", value: students.length, color: C.green, bg: C.greenDim, icon: "chat", tab: "chat" },
    { label: "Top Points", value: ratingRows[0]?.points || 0, color: C.amber, bg: C.amberDim, icon: "rating", tab: "ratings" },
    { label: "Lessons", value: 0, color: C.purple, bg: C.purpleDim, icon: "lessons", tab: "lessons" },
  ];
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {statCards.map(s => (
          <Card key={s.label} onClick={() => onTab(s.tab)}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={ICONS[s.icon]} size={17} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <SLabel style={{ marginBottom: 0 }}>Recent Students</SLabel>
            <button onClick={() => onTab("students")} style={{ fontSize: 12, fontWeight: 700, color: C.blueAccent, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>View all →</button>
          </div>
          {students.slice(0, 4).map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
              <Avatar name={s.name} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.hint }}>{s.programAssignments?.map(a => PROGRAM_LABELS[a.programId] || a.programId).join(", ") || "No program"}</div>
              </div>
              <Tag label={s.plan || "basic"} bg={PLAN_BG[s.plan || "basic"] || C.bg} color={PLAN_COLORS[s.plan || "basic"] || C.hint} />
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <SLabel style={{ marginBottom: 0 }}>Top Students</SLabel>
            <button onClick={() => onTab("ratings")} style={{ fontSize: 12, fontWeight: 700, color: C.blueAccent, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Leaderboard →</button>
          </div>
          {ratingRows.slice(0, 4).map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ width: 22, textAlign: "center", fontSize: 13, fontWeight: 700, color: i < 3 ? [C.amber, C.hint, "#cd7f32"][i] : C.hint, flexShrink: 0 }}>#{i + 1}</div>
              <Avatar name={s.name} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.hint }}>{s.programs}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.blueAccent }}>{s.points}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── Students ───────────────────────────────────────────────────
function StudentsTab({ students, teachers, role, token, showToast, onSave, onDelete, onAdd, creating, setCreating }) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", plan: "basic" });

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (!planFilter || (s.plan || "basic") === planFilter)
  );

  const saveEdit = async () => {
    try {
      await onSave(editing);
      showToast("Student updated");
      setEditing(null);
    } catch { showToast("Failed to save"); }
  };

  const del = async () => {
    try {
      await onDelete(editing.id);
      showToast("Student deleted");
      setEditing(null);
    } catch { showToast("Failed to delete"); }
  };

  const create = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) { showToast("All fields required"); return; }
    try {
      await onAdd({ ...form, role: "student" });
      showToast("Student created");
      setCreating(false);
      setForm({ firstName: "", lastName: "", email: "", password: "", plan: "basic" });
    } catch { showToast("Failed to create"); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><Icon d={ICONS.search} size={14} color={C.hint} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
            style={{ width: "100%", padding: "9px 12px 9px 32px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: "#fff", color: C.navy, fontFamily: "'DM Sans',sans-serif", outline: "none" }} />
        </div>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
          style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: "#fff", color: C.navy, fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
          <option value="">All plans</option>
          <option value="basic">Basic</option>
          <option value="plus">Plus</option>
          <option value="pro">Pro</option>
        </select>
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["#", "Student", "Plan", "Program & Level", "Teacher", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.hint, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const teacher = teachers.find(t => s.programAssignments?.[0]?.teacherId === t.id);
              return (
                <tr key={s.id} onClick={() => setEditing({ ...s })} style={{ cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: C.hint, borderBottom: `1px solid ${C.border}` }}>{i + 1}</td>
                  <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={s.name} size={28} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: C.hint }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.border}` }}><PlanTag plan={s.plan || "basic"} /></td>
                  <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.textSub }}>
                    {(s.programAssignments || []).map(a => `${PROGRAM_LABELS[a.programId] || a.programId} · ${a.levelId}`).join(", ") || "—"}
                  </td>
                  <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.border}` }}>
                    {teacher ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Avatar name={teacher.name} size={22} color={C.green} />
                        <span style={{ fontSize: 12, color: C.textSub }}>{teacher.name.split(" ")[0]}</span>
                      </div>
                    ) : <span style={{ fontSize: 12, color: C.hint }}>Unassigned</span>}
                  </td>
                  <td style={{ padding: "11px 16px", borderBottom: `1px solid ${C.border}` }}>
                    <Btn variant="ghost" style={{ padding: "5px 10px", fontSize: 12 }}><Icon d={ICONS.edit} size={12} color={C.muted} /> Edit</Btn>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "40px 0", textAlign: "center", color: C.hint, fontSize: 13 }}>No students found</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {editing && (
        <Modal title={`Student — ${editing.name}`} onClose={() => setEditing(null)} width={560}>
          {/* Basic info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldInput label="First name" value={editing.profile?.firstName || ""} onChange={v => setEditing(p => ({ ...p, profile: { ...(p.profile || {}), firstName: v } }))} />
            <FieldInput label="Last name" value={editing.profile?.lastName || ""} onChange={v => setEditing(p => ({ ...p, profile: { ...(p.profile || {}), lastName: v } }))} />
            <FieldInput label="Email" value={editing.email || ""} onChange={v => setEditing(p => ({ ...p, email: v }))} />
            <FieldInput label="Phone" value={editing.profile?.phoneNumber || ""} onChange={v => setEditing(p => ({ ...p, profile: { ...(p.profile || {}), phoneNumber: v } }))} />
          </div>

          {/* Teacher assignment per program */}
          <div style={{ height: 1, background: C.border, margin: "14px 0 10px" }} />
          <SLabel>Teacher Assignment</SLabel>
          {Object.keys(PROGRAM_LABELS).map(progId => {
            const assignment = (editing.programAssignments || []).find(a => a.programId === progId);
            const currentTeacherId = assignment?.teacherId || "";
            return (
              <div key={progId} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Tag label={PROGRAM_LABELS[progId]} bg={C.blueDim} color={C.blueAccent} />
                <select
                  value={currentTeacherId}
                  onChange={e => {
                    const tid = e.target.value;
                    const existing = (editing.programAssignments || []).filter(a => a.programId !== progId);
                    const updated = tid
                      ? [...existing, { programId: progId, teacherId: tid, levelId: assignment?.levelId || "level1" }]
                      : existing;
                    setEditing(p => ({ ...p, programAssignments: updated }));
                  }}
                  style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, background: C.bg, fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
                  <option value="">— No teacher —</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            );
          })}

          {/* Password */}
          <div style={{ height: 1, background: C.border, margin: "14px 0 10px" }} />
          <SLabel>Change Password</SLabel>
          <FieldInput label="New password (leave blank to keep current)" value={editing.newPassword || ""} type="password" onChange={v => setEditing(p => ({ ...p, newPassword: v }))} placeholder="New password…" />

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn onClick={saveEdit}>Save Changes</Btn>
            <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
            {role === "admin" && <Btn variant="danger" onClick={del} style={{ marginLeft: "auto" }}><Icon d={ICONS.trash} size={13} color={C.red} /> Delete</Btn>}
          </div>
        </Modal>
      )}

      {creating && (
        <Modal title="Add Student" onClose={() => setCreating(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldInput label="First name" value={form.firstName} onChange={v => setForm(p => ({ ...p, firstName: v }))} />
            <FieldInput label="Last name" value={form.lastName} onChange={v => setForm(p => ({ ...p, lastName: v }))} />
            <FieldInput label="Email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} />
            <FieldInput label="Password" value={form.password} onChange={v => setForm(p => ({ ...p, password: v }))} type="password" />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn onClick={create}>Create Student</Btn>
            <Btn variant="ghost" onClick={() => setCreating(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Teachers ───────────────────────────────────────────────────
function TeachersTab({ teachers, students, showToast, onSave, onDelete, onAdd, onSaveStudent, creating, setCreating }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [assignForm, setAssignForm] = useState({ studentId: "", programId: "" });

  const saveEdit = async () => {
    try { await onSave(editing); showToast("Teacher updated"); setEditing(null); }
    catch { showToast("Failed to save"); }
  };
  const del = async () => {
    try { await onDelete(editing.id); showToast("Teacher deleted"); setEditing(null); }
    catch { showToast("Failed to delete"); }
  };
  const create = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) { showToast("All fields required"); return; }
    try {
      await onAdd({ ...form, role: "teacher" });
      showToast("Teacher created");
      setCreating(false);
      setForm({ firstName: "", lastName: "", email: "", password: "" });
    } catch { showToast("Failed to create"); }
  };

  const doAssign = async () => {
    if (!assignForm.studentId || !assignForm.programId) { showToast("Select student and program"); return; }
    const student = students.find(s => s.id === assignForm.studentId);
    if (!student) return;
    const existing = student.programAssignments || [];
    const updated = existing.filter(a => a.programId !== assignForm.programId);
    updated.push({ programId: assignForm.programId, teacherId: editing.id, levelId: existing.find(a => a.programId === assignForm.programId)?.levelId || "level1" });
    try {
      await onSaveStudent({ ...student, programAssignments: updated });
      showToast("Student assigned");
      setAssignForm({ studentId: "", programId: "" });
    } catch { showToast("Failed to assign"); }
  };

  const doUnassign = async (student, programId) => {
    const updated = (student.programAssignments || []).map(a =>
      a.programId === programId && a.teacherId === editing.id ? { ...a, teacherId: null } : a
    );
    try { await onSaveStudent({ ...student, programAssignments: updated }); showToast("Unassigned"); }
    catch { showToast("Failed"); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {teachers.map(t => {
          const myStudents = students.filter(s => s.programAssignments?.some(a => a.teacherId === t.id));
          return (
            <Card key={t.id} onClick={() => { setEditing({ ...t }); setAssignForm({ studentId: "", programId: "" }); }} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={t.name} size={44} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: C.hint }}>{t.email}</div>
                  </div>
                </div>
                <Tag label={`${myStudents.length} students`} bg={C.blueDim} color={C.blueAccent} />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(t.programAccess || []).map(p => <Tag key={p} label={PROGRAM_LABELS[p] || p} bg={C.blueDim} color={C.blueAccent} />)}
              </div>
              <Sep />
              <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
                {(t.programScores ? Object.entries(t.programScores).slice(0, 2) : []).map(([prog, score]) => (
                  <div key={prog} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{score}</div>
                    <div style={{ fontSize: 10, color: C.hint }}>{PROGRAM_LABELS[prog] || prog}</div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
        {teachers.length === 0 && <div style={{ padding: "40px 0", textAlign: "center", color: C.hint, fontSize: 13 }}>No teachers yet</div>}
      </div>

      {editing && (() => {
        const myStudents = students.filter(s => s.programAssignments?.some(a => a.teacherId === editing.id));
        const unassignedStudents = students.filter(s => !s.programAssignments?.some(a => a.teacherId === editing.id));
        const teacherPrograms = editing.programAccess || Object.keys(PROGRAM_LABELS);
        return (
          <Modal title={`Teacher — ${editing.name}`} onClose={() => setEditing(null)} width={580}>
            {/* Basic info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FieldInput label="First name" value={editing.profile?.firstName || ""} onChange={v => setEditing(p => ({ ...p, profile: { ...(p.profile || {}), firstName: v } }))} />
              <FieldInput label="Last name" value={editing.profile?.lastName || ""} onChange={v => setEditing(p => ({ ...p, profile: { ...(p.profile || {}), lastName: v } }))} />
              <FieldInput label="Email" value={editing.email || ""} onChange={v => setEditing(p => ({ ...p, email: v }))} style={{ gridColumn: "1 / -1" }} />
            </div>

            {/* Password */}
            <div style={{ height: 1, background: C.border, margin: "14px 0 10px" }} />
            <SLabel>Change Password</SLabel>
            <FieldInput label="New password (leave blank to keep)" value={editing.newPassword || ""} type="password" onChange={v => setEditing(p => ({ ...p, newPassword: v }))} placeholder="New password…" />

            {/* Assigned students */}
            <div style={{ height: 1, background: C.border, margin: "14px 0 10px" }} />
            <SLabel>Assigned Students ({myStudents.length})</SLabel>
            {myStudents.length === 0
              ? <div style={{ fontSize: 12, color: C.hint, marginBottom: 4 }}>No students assigned</div>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 }}>
                  {myStudents.map(s => {
                    const progs = (s.programAssignments || []).filter(a => a.teacherId === editing.id);
                    const scores = s.targetScores || {};
                    return (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
                        <Avatar name={s.name} size={28} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: C.hint }}>{progs.map(p => PROGRAM_LABELS[p.programId] || p.programId).join(", ")}</div>
                        </div>
                        <PlanTag plan={s.plan || "basic"} />
                        {scores.sat && <Tag label={`SAT ${scores.sat}`} bg={C.blueDim} color={C.blueAccent} />}
                        {scores.ielts && <Tag label={`IELTS ${scores.ielts}`} bg={C.greenDim} color={C.green} />}
                        <button onClick={e => { e.stopPropagation(); progs.forEach(p => doUnassign(s, p.programId)); }}
                          style={{ background: C.redDim, border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: C.red, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            }

            {/* Assign new student */}
            <div style={{ background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, padding: "12px 14px", marginTop: 6 }}>
              <SLabel style={{ marginBottom: 8 }}>Assign Student</SLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.hint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Student</div>
                  <select value={assignForm.studentId} onChange={e => setAssignForm(p => ({ ...p, studentId: e.target.value }))}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, background: "#fff", fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
                    <option value="">— Select —</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.hint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Program</div>
                  <select value={assignForm.programId} onChange={e => setAssignForm(p => ({ ...p, programId: e.target.value }))}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, background: "#fff", fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
                    <option value="">— Select —</option>
                    {teacherPrograms.map(p => <option key={p} value={p}>{PROGRAM_LABELS[p] || p}</option>)}
                  </select>
                </div>
                <Btn onClick={doAssign} style={{ whiteSpace: "nowrap" }}>Assign</Btn>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Btn onClick={saveEdit}>Save Changes</Btn>
              <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={del} style={{ marginLeft: "auto" }}><Icon d={ICONS.trash} size={13} color={C.red} /> Delete</Btn>
            </div>
          </Modal>
        );
      })()}

      {creating && (
        <Modal title="Add Teacher" onClose={() => setCreating(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldInput label="First name" value={form.firstName} onChange={v => setForm(p => ({ ...p, firstName: v }))} />
            <FieldInput label="Last name" value={form.lastName} onChange={v => setForm(p => ({ ...p, lastName: v }))} />
            <FieldInput label="Email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} style={{ gridColumn: "1 / -1" }} />
            <FieldInput label="Password" value={form.password} onChange={v => setForm(p => ({ ...p, password: v }))} type="password" style={{ gridColumn: "1 / -1" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn onClick={create}>Create Teacher</Btn>
            <Btn variant="ghost" onClick={() => setCreating(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Chat ───────────────────────────────────────────────────────
function ChatTab({ token, user, students }) {
  const myStudents = useMemo(() =>
    user.role === "teacher"
      ? students.filter(s => s.programAssignments?.some(a => a.teacherId === user.id))
      : students,
    [students, user]
  );
  const [selected, setSelected] = useState(myStudents[0] || null);
  const [programs, setPrograms] = useState([]);
  const [selectedProg, setSelectedProg] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => { if (myStudents[0]) setSelected(myStudents[0]); }, [myStudents.length]);

  useEffect(() => {
    if (!selected) return;
    const progs = selected.programAssignments?.filter(a => a.teacherId === user.id || user.role === "admin") || [];
    setPrograms(progs);
    if (progs[0]) setSelectedProg(progs[0].programId);
  }, [selected?.id]);

  useEffect(() => {
    if (!selected || !selectedProg) return;
    api.getChats(token, selectedProg, selected.id).then(setMessages).catch(() => setMessages([]));
  }, [token, selected?.id, selectedProg]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const sendMsg = async () => {
    if (!text.trim() || !selected || !selectedProg) return;
    try {
      const msg = await api.sendChatMessage(token, { studentId: selected.id, programId: selectedProg, text });
      setMessages(prev => [...prev, msg]);
      setText("");
    } catch { /* silent */ }
  };

  if (!myStudents.length) return <div style={{ padding: 40, textAlign: "center", color: C.hint }}>No students assigned yet.</div>;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 73px)", overflow: "hidden" }}>
      <div style={{ width: 260, borderRight: `1px solid ${C.border}`, background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 14px 10px" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><Icon d={ICONS.search} size={13} color={C.hint} /></span>
            <input placeholder="Search…" style={{ width: "100%", padding: "8px 10px 8px 30px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, background: C.bg, color: C.navy, fontFamily: "'DM Sans',sans-serif", outline: "none" }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {myStudents.map(s => {
            const isSelected = selected?.id === s.id;
            return (
              <div key={s.id} onClick={() => setSelected(s)} style={{ padding: "12px 14px", cursor: "pointer", background: isSelected ? C.bg : "transparent", borderBottom: `1px solid ${C.border}`, transition: "background 120ms" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Avatar name={s.name} size={36} />
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: C.green, border: "2px solid #fff" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: C.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: C.hint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.programAssignments?.map(a => PROGRAM_LABELS[a.programId] || a.programId).join(", ") || "No program"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 20px", background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={selected.name} size={36} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>● Active</div>
            </div>
            {programs.length > 1 && (
              <select value={selectedProg} onChange={e => setSelectedProg(e.target.value)}
                style={{ marginLeft: "auto", padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.navy, background: C.bg, fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
                {programs.map(p => <option key={p.programId} value={p.programId}>{PROGRAM_LABELS[p.programId] || p.programId}</option>)}
              </select>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12, background: C.bg }}>
            {messages.length === 0 && <div style={{ textAlign: "center", color: C.hint, fontSize: 13, marginTop: 40 }}>No messages yet. Start the conversation!</div>}
            {messages.map(msg => {
              const isMe = msg.senderId === user.id;
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                  <div>
                    <div style={{ maxWidth: 360, padding: "10px 14px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: isMe ? C.navy : "#fff", color: isMe ? "#fff" : C.navy, fontSize: 13, lineHeight: 1.5, boxShadow: "0 2px 8px rgba(23,59,100,0.08)", border: isMe ? "none" : `1px solid ${C.border}` }}>{msg.text}</div>
                    <div style={{ fontSize: 10, color: C.hint, marginTop: 3, textAlign: isMe ? "right" : "left" }}>{msg.senderRole}</div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <div style={{ padding: "12px 20px", background: "#fff", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              placeholder="Type a message… (Enter to send)"
              rows={2}
              style={{ flex: 1, padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 13, color: C.navy, resize: "none", fontFamily: "'DM Sans',sans-serif", background: C.bg, lineHeight: 1.5, outline: "none" }} />
            <button onClick={sendMsg} style={{ width: 42, height: 42, borderRadius: 12, background: C.navy, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon d={ICONS.send} size={16} color="#fff" />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.hint, fontSize: 14 }}>Select a student to start chatting</div>
      )}
    </div>
  );
}

// ── Ratings ────────────────────────────────────────────────────
function RatingsTab({ ratingRows }) {
  return (
    <div style={{ padding: 24 }}>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["Rank", "Student", "Programs", "Points"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.hint, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ratingRows.map((s, i) => (
              <tr key={s.id} style={{ background: i === 0 ? "rgba(255,222,112,0.05)" : "transparent" }}>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 16, fontWeight: 700, color: i < 3 ? [C.amber, C.hint, "#cd7f32"][i] : C.hint }}>
                  {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                </td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={s.name} size={30} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{s.name}</div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.textSub }}>{s.programs}</td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 15, fontWeight: 700, color: C.blueAccent }}>{s.points}</td>
              </tr>
            ))}
            {ratingRows.length === 0 && <tr><td colSpan={4} style={{ padding: "40px 0", textAlign: "center", color: C.hint }}>No data yet</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── Lessons ────────────────────────────────────────────────────
function LessonsTab({ courses, user, token, showToast, onAddLesson, onUpdateLesson, onDeleteLesson }) {
  const allowedPrograms = user.role === "teacher"
    ? courses.filter(c => (user.programAccess || []).some(a => a.startsWith(c.id)))
    : courses;
  const [programId, setProgramId] = useState(allowedPrograms[0]?.id || "");
  const [levelId, setLevelId] = useState(allowedPrograms[0]?.levels?.[0]?.id || "");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", videoUrl: "", pdfUrl: "", questionCount: 10 });

  const program = allowedPrograms.find(c => c.id === programId) || allowedPrograms[0];
  const level = program?.levels?.find(l => l.id === levelId) || program?.levels?.[0];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <select value={programId} onChange={e => { const next = allowedPrograms.find(c => c.id === e.target.value); setProgramId(e.target.value); setLevelId(next?.levels?.[0]?.id || ""); }}
          style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: "#fff", color: C.navy, fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
          {allowedPrograms.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={levelId} onChange={e => setLevelId(e.target.value)}
          style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: "#fff", color: C.navy, fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
          {(program?.levels || []).map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        {user.role === "admin" && <Btn onClick={() => setAddOpen(true)} style={{ marginLeft: "auto" }}><Icon d={ICONS.plus} size={13} color="#fff" /> Add Lesson</Btn>}
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: C.bg }}>{["Title","Questions",""].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.hint, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
          <tbody>
            {(level?.lessons || []).map(l => (
              <tr key={l.id}>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, color: C.navy }}>{l.title}</td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 13, color: C.textSub }}>{l.topicTest?.questionCount || 0}</td>
                <td style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn variant="ghost" onClick={() => setEditing({ ...l })} style={{ padding: "5px 10px", fontSize: 12 }}><Icon d={ICONS.edit} size={12} color={C.muted} /></Btn>
                    {user.role === "admin" && <Btn variant="danger" onClick={() => { onDeleteLesson(program.id, level.id, l.id); showToast("Lesson deleted"); }} style={{ padding: "5px 10px", fontSize: 12 }}><Icon d={ICONS.trash} size={12} color={C.red} /></Btn>}
                  </div>
                </td>
              </tr>
            ))}
            {!(level?.lessons?.length) && <tr><td colSpan={3} style={{ padding: "40px 0", textAlign: "center", color: C.hint }}>No lessons yet</td></tr>}
          </tbody>
        </table>
      </Card>

      {addOpen && (
        <Modal title="Add Lesson" onClose={() => setAddOpen(false)}>
          <div style={{ display: "grid", gap: 12 }}>
            <FieldInput label="Title" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
            <FieldInput label="Video URL" value={form.videoUrl} onChange={v => setForm(p => ({ ...p, videoUrl: v }))} />
            <FieldInput label="PDF URL" value={form.pdfUrl} onChange={v => setForm(p => ({ ...p, pdfUrl: v }))} />
            <FieldInput label="Questions" value={String(form.questionCount)} onChange={v => setForm(p => ({ ...p, questionCount: Number(v) }))} type="number" />
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={() => { onAddLesson({ programId, levelId, ...form }); showToast("Lesson added"); setAddOpen(false); setForm({ title: "", videoUrl: "", pdfUrl: "", questionCount: 10 }); }}>Add Lesson</Btn>
              <Btn variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
      {editing && (
        <Modal title="Edit Lesson" onClose={() => setEditing(null)}>
          <div style={{ display: "grid", gap: 12 }}>
            <FieldInput label="Title" value={editing.title} onChange={v => setEditing(p => ({ ...p, title: v }))} />
            <FieldInput label="Video URL" value={editing.videoUrl || ""} onChange={v => setEditing(p => ({ ...p, videoUrl: v }))} />
            <FieldInput label="PDF URL" value={editing.pdfUrl || ""} onChange={v => setEditing(p => ({ ...p, pdfUrl: v }))} />
            <FieldInput label="Questions" value={String(editing.topicTest?.questionCount || 10)} onChange={v => setEditing(p => ({ ...p, topicTest: { ...(p.topicTest || {}), questionCount: Number(v) } }))} type="number" />
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={() => { onUpdateLesson(program.id, level.id, editing.id, { title: editing.title, videoUrl: editing.videoUrl, pdfUrl: editing.pdfUrl, questionCount: editing.topicTest?.questionCount || 10 }); showToast("Saved"); setEditing(null); }}>Save</Btn>
              <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Bookings ───────────────────────────────────────────────────
function BookingsTab({ students, teachers, role, showToast }) {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newB, setNewB] = useState({ studentId: "", teacherId: "", date: "", time: "15:00", program: "SAT Math" });

  const PLAN_DURATION = { plus: 30, pro: 90 };
  const filtered = bookings.filter(b => filter === "all" || b.status === filter);

  const confirm = (id) => { setBookings(bs => bs.map(b => b.id === id ? { ...b, status: "confirmed" } : b)); showToast("Booking confirmed!"); };
  const cancel = (id) => { setBookings(bs => bs.filter(b => b.id !== id)); showToast("Booking cancelled"); };

  const addBooking = () => {
    const student = students.find(s => s.id === newB.studentId);
    if (!newB.studentId || !newB.date) { showToast("Please fill all required fields"); return; }
    const duration = PLAN_DURATION[student?.plan] || 30;
    const booking = { id: `b${Date.now()}`, ...newB, duration, plan: student?.plan || "plus", status: "pending" };
    setBookings(bs => [booking, ...bs]);
    setShowAdd(false);
    setNewB({ studentId: "", teacherId: "", date: "", time: "15:00", program: "SAT Math" });
    showToast("Booking request created!");
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Plan rules */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { plan: "plus", label: "Plus Plan — 30 min sessions", desc: "One session every 2 days · Chat access included", color: C.blueAccent, bg: C.blueDim },
          { plan: "pro",  label: "Pro Plan — 90 min sessions",  desc: "One session every 2 days · Priority support",    color: C.purple,     bg: C.purpleDim },
        ].map(r => (
          <Card2 key={r.plan} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon d={ICONS.clock} size={18} color={r.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{r.label}</div>
              <div style={{ fontSize: 12, color: C.hint }}>{r.desc}</div>
            </div>
            <Tag label={r.plan} bg={r.bg} color={r.color} />
          </Card2>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 10, padding: 4 }}>
          {["all", "confirmed", "pending"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: filter === f ? C.navy : "transparent", color: filter === f ? "#fff" : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textTransform: "capitalize", transition: "all 150ms" }}>
              {f}
            </button>
          ))}
        </div>
        <Btn onClick={() => setShowAdd(true)} style={{ marginLeft: "auto" }}><Icon d={ICONS.plus} size={13} color="#fff" /> New Booking</Btn>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(b => {
          const student = students.find(s => s.id === b.studentId);
          const teacher = teachers.find(t => t.id === b.teacherId);
          return (
            <Card key={b.id} style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 160 }}>
                  <Avatar name={student?.name || "?"} size={36} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{student?.name || "Unknown"}</div>
                    <div style={{ fontSize: 11, color: C.hint }}>Student</div>
                  </div>
                </div>
                <div style={{ color: C.hint, fontSize: 16 }}>→</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 160 }}>
                  <Avatar name={teacher?.name || "?"} size={36} color={C.green} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{teacher?.name || "Unknown"}</div>
                    <div style={{ fontSize: 11, color: C.hint }}>Teacher</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1, justifyContent: "center" }}>
                  <Tag label={b.program} bg={C.blueDim} color={C.blueAccent} />
                  <Tag label={`${b.date} · ${b.time}`} bg={C.bg} color={C.textSub} />
                  <Tag label={`${b.duration} min`} bg={b.duration === 90 ? C.purpleDim : C.blueDim} color={b.duration === 90 ? C.purple : C.blueAccent} />
                  <PlanTag plan={b.plan} />
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
                  <Tag label={b.status} bg={b.status === "confirmed" ? C.greenDim : C.amberDim} color={b.status === "confirmed" ? C.green : C.amber} />
                  {b.status === "pending" && (
                    <Btn variant="success" onClick={() => confirm(b.id)} style={{ padding: "5px 12px", fontSize: 12 }}>
                      <Icon d={ICONS.check} size={12} color={C.green} /> Confirm
                    </Btn>
                  )}
                  <Btn variant="danger" onClick={() => cancel(b.id)} style={{ padding: "5px 10px", fontSize: 12 }}>
                    <Icon d={ICONS.trash} size={12} color={C.red} />
                  </Btn>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.hint, fontSize: 14 }}>
            No bookings yet — click "New Booking" to create one
          </div>
        )}
      </div>

      {/* Add booking modal */}
      {showAdd && (
        <Modal title="New Booking Request" onClose={() => setShowAdd(false)}>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.hint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Student</div>
              <select value={newB.studentId} onChange={e => setNewB(p => ({ ...p, studentId: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, background: C.bg, fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
                <option value="">— Select student —</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.plan || "basic"})</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.hint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Teacher</div>
              <select value={newB.teacherId} onChange={e => setNewB(p => ({ ...p, teacherId: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, color: C.navy, background: C.bg, fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
                <option value="">— Select teacher —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FieldInput label="Date" value={newB.date} onChange={v => setNewB(p => ({ ...p, date: v }))} type="date" />
              <FieldInput label="Time" value={newB.time} onChange={v => setNewB(p => ({ ...p, time: v }))} type="time" />
            </div>
            {newB.studentId && (() => {
              const s = students.find(st => st.id === newB.studentId);
              const dur = PLAN_DURATION[s?.plan] || 30;
              const planColor = s?.plan === "pro" ? C.purple : C.blueAccent;
              const planBg = s?.plan === "pro" ? C.purpleDim : C.blueDim;
              return (
                <div style={{ background: planBg, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: planColor, fontWeight: 600 }}>
                  Session duration: <strong>{dur} minutes</strong> ({s?.plan || "basic"} plan · every 2 days)
                </div>
              );
            })()}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <Btn onClick={addBooking}>Create Booking</Btn>
              <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────
export default function AdminTeacherPanel({
  token,
  user,
  students,
  teachers,
  courses,
  studentProgressMap,
  onLogout,
  onAddTeacher,
  onAddStudent,
  onUpdateUser,
  onDeleteUser,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
}) {
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState("");
  const [studentCreating, setStudentCreating] = useState(false);
  const [teacherCreating, setTeacherCreating] = useState(false);
  const showToast = msg => setToast(msg);

  const role = user.role;
  const visibleStudents = role === "teacher"
    ? students.filter(s => s.programAssignments?.some(a => a.teacherId === user.id))
    : students;

  const ratingRows = useMemo(() => visibleStudents.map(s => {
    const activity = studentProgressMap[s.id]?.lessonActivity || [];
    const points = activity.reduce((sum, item) =>
      sum + (item.videoCompleted ? 10 : 0) + (item.learningCompleted ? 10 : 0) + (item.taskCompleted ? 10 : 0), 0);
    return {
      id: s.id, name: s.name, email: s.email,
      programs: (s.programAssignments || []).map(a => PROGRAM_LABELS[a.programId] || a.programId).join(", "),
      points,
    };
  }).sort((a, b) => b.points - a.points), [visibleStudents, studentProgressMap]);

  const counts = { students: visibleStudents.length, teachers: teachers.length };

  const handleSaveStudent = async (edited) => {
    await onUpdateUser(edited.id, {
      email: edited.email,
      profile: edited.profile || {},
      programAssignments: edited.programAssignments || [],
      ...(edited.newPassword ? { password: edited.newPassword } : {}),
    });
  };
  const handleSaveTeacher = async (edited) => {
    await onUpdateUser(edited.id, {
      email: edited.email,
      profile: edited.profile || {},
      programAccess: edited.programAccess || [],
      programScores: edited.programScores || {},
      ...(edited.newPassword ? { password: edited.newPassword } : {}),
    });
  };
  const handleDeleteStudent = async (id) => { await onDeleteUser(id); };
  const handleDeleteTeacher = async (id) => { await onDeleteUser(id); };
  const handleAddStudent = async (data) => { await onAddStudent(data); };
  const handleAddTeacher = async (data) => { await onAddTeacher(data); };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: C.navy, background: C.bg }}>
      <AdminSidebar role={role} tab={tab} onTab={setTab} user={user} onLogout={onLogout} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: C.bg }}>
        <AdminTopbar
          tab={tab} role={role} counts={counts}
          onAddStudent={() => { setTab("students"); setStudentCreating(true); }}
          onAddTeacher={() => { setTab("teachers"); setTeacherCreating(true); }}
        />
        <div style={{ flex: 1, overflowY: "auto" }}>
          {tab === "overview"  && <OverviewTab role={role} students={visibleStudents} teachers={teachers} ratingRows={ratingRows} onTab={setTab} />}
          {tab === "students"  && <StudentsTab students={visibleStudents} teachers={teachers} role={role} token={token} showToast={showToast} onSave={handleSaveStudent} onDelete={handleDeleteStudent} onAdd={handleAddStudent} creating={studentCreating} setCreating={setStudentCreating} />}
          {tab === "teachers"  && role === "admin" && <TeachersTab teachers={teachers} students={visibleStudents} showToast={showToast} onSave={handleSaveTeacher} onDelete={handleDeleteTeacher} onAdd={handleAddTeacher} onSaveStudent={handleSaveStudent} creating={teacherCreating} setCreating={setTeacherCreating} />}
          {tab === "chat"      && <ChatTab token={token} user={user} students={visibleStudents} />}
          {tab === "bookings"  && <BookingsTab students={visibleStudents} teachers={teachers} role={role} showToast={showToast} />}
          {tab === "lessons"   && <LessonsTab courses={courses} user={user} token={token} showToast={showToast} onAddLesson={onAddLesson} onUpdateLesson={onUpdateLesson} onDeleteLesson={onDeleteLesson} />}
          {tab === "ratings"   && <RatingsTab ratingRows={ratingRows} />}
        </div>
      </div>
      <ToastMsg msg={toast} onDone={() => setToast("")} />
    </div>
  );
}
