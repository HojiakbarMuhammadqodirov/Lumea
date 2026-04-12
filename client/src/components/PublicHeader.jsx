import { useEffect, useState } from "react";

const navItems = [
  { label: "SAT", href: "#sat" },
  { label: "IELTS", href: "#ielts" },
  { label: "Past tests", href: "#past-tests" },
  { label: "Question bank", href: "#question-bank" },
  { label: "AP", soon: true },
];

export default function PublicHeader({ onLoginClick }) {
  const [language, setLanguage] = useState("ENG");
  const [isDarkIcon, setIsDarkIcon] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateNavbar = () => setIsScrolled(window.scrollY > 18);
    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
    return () => window.removeEventListener("scroll", updateNavbar);
  }, []);

  return (
    <nav className={isScrolled ? "landingNavbar landingNavbarScrolled" : "landingNavbar"} aria-label="Main navigation">
      <a className="landingLogo" href="#top" aria-label="Lumea home">
        Lumea
      </a>

      <div className="landingNavLinks">
        {navItems.map((item) =>
          item.soon ? (
            <span className="landingNavLink landingNavLinkSoon" key={item.label} aria-disabled="true">
              <span>{item.label}</span>
              <span className="landingNavSoonText">Soon</span>
            </span>
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
          onClick={() => setLanguage((current) => (current === "ENG" ? "UZB" : "ENG"))}
          aria-label="Switch language"
        >
          {language}
        </button>

        <button
          className={isDarkIcon ? "landingUtilityButton landingThemeButton dark" : "landingUtilityButton landingThemeButton"}
          type="button"
          onClick={() => setIsDarkIcon((current) => !current)}
          aria-label={isDarkIcon ? "Switch to light mode" : "Switch to dark mode"}
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
          Log in
        </button>
      </div>
    </nav>
  );
}
