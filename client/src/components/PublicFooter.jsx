import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";

export default function PublicFooter({ onLoginClick, onNavClick }) {
  const { lang } = useLanguage();
  const t = translations[lang].footer;

  return (
    <footer className="landingFooter">
      <div className="landingFooterShell">
        <div className="landingFooterBrand">
          <button
            className="landingLogo"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            onClick={() => onNavClick?.("landing")}
            aria-label="Lumea home"
          >
            Lumea
          </button>
          <p>{t.brand}</p>
        </div>

        <div className="landingFooterLinks">
          <button className="landingFooterNavBtn" onClick={() => onNavClick?.("landing")}>{t.home}</button>
          <button className="landingFooterNavBtn" onClick={() => onNavClick?.("sat")}>{t.sat}</button>
          <button className="landingFooterNavBtn" onClick={() => onNavClick?.("ielts")}>{t.ielts}</button>
          <button className="landingFooterNavBtn" onClick={() => onNavClick?.("pricing")}>{t.pricing}</button>
          <button className="landingFooterNavBtn" onClick={() => onNavClick?.("faq")}>{t.faq}</button>
        </div>

        <div className="landingFooterActions">
          <a href="mailto:info@lumea.uz">info@lumea.uz</a>
          <button className="landingLoginButton landingFooterButton" type="button" onClick={onLoginClick}>
            {t.login}
          </button>
        </div>
      </div>

      <div className="landingFooterBottom">
        <div className="landingFooterBottomInner">
          <span>{t.copyright}</span>
          <div className="landingFooterBottomLinks">
            <a href="#top">{t.privacy}</a>
            <a href="#top">{t.terms}</a>
            <a href="#top">{t.support}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
