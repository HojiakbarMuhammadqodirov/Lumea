import { useApp } from "./useApp";

const NAV = [
  { id: "home",    label: "Bosh sahifa", icon: "🏠" },
  { id: "lessons", label: "Darslar",     icon: "📚", badge: 3 },
  { id: "tests",   label: "Testlar",     icon: "✏️" },
  { id: "stats",   label: "Statistika",  icon: "📊" },
  { id: "rating",  label: "Reyting",     icon: "⭐" },
  { id: "profile", label: "Profil",      icon: "👤" },
];

export default function Sidebar({ page, onNav, onLogout }) {
  const { user } = useApp();
  const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "");

  return (
    <aside className="w-[220px] shrink-0 bg-white border-r border-[#DDE6F0] flex flex-col sticky top-0 h-screen">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[#DDE6F0] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#173B64] flex items-center justify-center text-white font-bold text-sm shrink-0">
          L
        </div>
        <div>
          <div className="text-[#173B64] font-bold text-[15px] leading-none tracking-tight">LearnNova</div>
          <div className="text-[#9EB3C8] text-[10px] uppercase tracking-widest mt-0.5">Student Space</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <NavSection label="Asosiy" />
        {NAV.slice(0, 4).map(item => (
          <NavItem key={item.id} item={item} active={page === item.id} onClick={() => onNav(item.id)} />
        ))}
        <NavSection label="O'qish" className="mt-3" />
        {NAV.slice(4).map(item => (
          <NavItem key={item.id} item={item} active={page === item.id} onClick={() => onNav(item.id)} />
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-3 border-t border-[#DDE6F0] pt-3">
        <button
          onClick={() => onNav("profile")}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#F0F5FC] hover:bg-[#E4EDF8] transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-[#173B64] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <div className="text-[#173B64] text-xs font-semibold truncate">{user.firstName} {user.lastName?.[0]}.</div>
            <div className="text-[#9EB3C8] text-[10px]">Bepul rejim</div>
          </div>
        </button>
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full mt-1.5 flex items-center gap-2 px-3 py-2 rounded-xl text-[#DC2626] text-xs font-medium hover:bg-red-50 transition-colors"
          >
            <span>←</span> Chiqish
          </button>
        )}
      </div>
    </aside>
  );
}

function NavSection({ label, className = "" }) {
  return (
    <div className={`text-[9px] text-[#9EB3C8] uppercase tracking-widest font-bold px-2 mb-1 ${className}`}>
      {label}
    </div>
  );
}

function NavItem({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
        ${active
          ? "bg-[#173B64] text-white shadow-sm"
          : "text-[#6B7E96] hover:bg-[#F0F5FC] hover:text-[#173B64]"
        }`}
    >
      <span className="text-base w-4 text-center shrink-0">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </button>
  );
}
