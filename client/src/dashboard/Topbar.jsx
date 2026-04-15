import { useApp } from "./useApp";

const PAGE_TITLES = {
  home:    "Bosh sahifa",
  lessons: "Darslar",
  tests:   "Testlar",
  stats:   "Statistika",
  rating:  "Reyting",
  profile: "Profil",
};

export default function Topbar({ page }) {
  const { user } = useApp();

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#DDE6F0] shrink-0">
      <div>
        <h1 className="text-xl font-bold text-[#173B64] tracking-tight leading-none">
          {PAGE_TITLES[page] || page}
        </h1>
        <p className="text-xs text-[#9EB3C8] mt-1">{user.region} · LearnNova</p>
      </div>
      <div className="flex items-center gap-2">
        <Chip color="text-orange-500 bg-orange-50 border-orange-100">🔥 {user.streak} kun</Chip>
        <Chip color="text-blue-600 bg-blue-50 border-blue-100">⭐ #{user.regionRank} Namangan</Chip>
      </div>
    </div>
  );
}

function Chip({ children, color }) {
  return (
    <div className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 text-xs font-semibold ${color}`}>
      {children}
    </div>
  );
}
