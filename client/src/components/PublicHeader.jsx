import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";

export default function PublicHeader({ onLoginClick, onNavClick, currentView, currentTheme = "light", onToggleTheme }) {
  const { lang, toggle } = useLanguage();
  const t = translations[lang].header;

  const navItems = [
    { label: t.nav.sat,    view: "sat" },
    { label: t.nav.ielts,  view: "ielts" },
    { label: t.nav.pricing, view: "pricing" },
    { label: t.nav.faq,    view: "faq" },
    { label: t.nav.ap,     soon: true },
  ];
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateNavbar = () => setIsScrolled(window.scrollY > 18);
    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
    return () => window.removeEventListener("scroll", updateNavbar);
  }, []);

  return (
    <nav className={isScrolled ? "landingNavbar landingNavbarScrolled" : "landingNavbar"} aria-label="Main navigation">
      {currentView && currentView !== "landing" ? (
        <button className="landingLogo" style={{ background:"none",border:"none",cursor:"pointer",padding:0 }} onClick={() => onNavClick?.("landing")} aria-label="Lumea home">
          <img src="/images/logopng.png" alt="Lumea" style={{ height: "36px", display: "block" }} />
        </button>
      ) : (
        <a className="landingLogo" href="#top" aria-label="Lumea home">
          <img src="/images/logopng.png" alt="Lumea" style={{ height: "36px", display: "block" }} />
        </a>
      )}

      <div className="landingNavLinks">
        {navItems.map((item) =>
          item.soon ? (
            <span className="landingNavLink landingNavLinkSoon" key={item.label} aria-disabled="true">
              <span>{item.label}</span>
              <span className="landingNavSoonText">{t.soon}</span>
            </span>
          ) : item.view ? (
            <button
              key={item.label}
              className={`landingNavLink landingNavLinkBtn${currentView === item.view ? " landingNavLinkActive" : ""}`}
              onClick={() => onNavClick?.(item.view)}
            >
              {item.label}
            </button>
          ) : (
            <a className="landingNavLink" key={item.label} href={item.href}>
              {item.label}
            </a>
          )
        )}
      </div>

      <div className="landingNavbarActions">
        <button
          className="landingUtilityButton"
          type="button"
          onClick={toggle}
          aria-label="Switch language"
        >
          {t.langLabel}
        </button>

        <button
          className={currentTheme === "dark" ? "landingUtilityButton landingThemeButton dark" : "landingUtilityButton landingThemeButton"}
          type="button"
          onClick={onToggleTheme}
          aria-label={currentTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="themeIconWrap" aria-hidden="true">
            <svg className="themeIcon themeIconSun" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2.2M12 19.8V22M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2 12h2.2M19.8 12H22M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56" />
            </svg>
            <svg className="themeIcon themeIconMoon" viewBox="0 0 24 24">
              <path d="M20.5 15.2A7.9 7.9 0 0 1 8.8 3.5 8.8 8.8 0 1 0 20.5 15.2Z" />
            </svg>
          </span>
        </button>

        <button className="landingLoginButton" type="button" onClick={onLoginClick}>
          {t.login}
        </button>
      </div>
    </nav>
  );
}
