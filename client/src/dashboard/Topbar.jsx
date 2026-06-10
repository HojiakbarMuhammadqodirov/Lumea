import { useApp } from "./useApp";
import { useLanguage } from "../context/LanguageContext";
import { dashT } from "../i18n/translations";

const C = {
  navy: "#173B64",
  border: "#DDE6F0",
  hint: "#9EB3C8",
};

const LANG_LABELS = { uz: "UZ", en: "EN", ru: "RU" };

export default function Topbar({ page }) {
  const { user } = useApp();
  const { lang, cycle } = useLanguage();
  const t = dashT[lang].topbar;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: "#fff", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.navy, lineHeight: 1 }}>{t.pages[page] || page}</h1>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: C.hint }}>{t.subtitles[page] || `${user.region || "Namangan"} · Lumea`}</p>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {/* Streak */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid #fed7aa", borderRadius: 10, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#f97316", background: "#fff7ed" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#f97316" stroke="none">
            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/>
          </svg>
          {user.streak} {t.streakUnit}
        </div>

        {/* Region rank */}
        {user.regionRank !== "—" && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid #bfdbfe", borderRadius: 10, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#2563EB", background: "#eff6ff" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#2563EB" stroke="none">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
            #{user.regionRank} {user.region?.split(" ")[0]}
          </div>
        )}

        {/* Language switcher */}
        <button
          onClick={cycle}
          style={{ border: "1px solid #DDE6F0", borderRadius: 10, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: C.navy, background: "#F0F5FC", cursor: "pointer", letterSpacing: "0.05em", transition: "background 150ms" }}
          title="Switch language"
        >
          {LANG_LABELS[lang]}
        </button>
      </div>
    </div>
  );
}