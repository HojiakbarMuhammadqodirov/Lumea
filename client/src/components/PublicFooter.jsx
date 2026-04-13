export default function PublicFooter({ onLoginClick, onNavClick }) {
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
          <p>Structured prep, AI-powered guidance, real materials, and support from experienced teachers that keeps moving with you.</p>
        </div>

        <div className="landingFooterLinks">
          <button className="landingFooterNavBtn" onClick={() => onNavClick?.("landing")}>Home</button>
          <button className="landingFooterNavBtn" onClick={() => onNavClick?.("sat")}>SAT</button>
          <button className="landingFooterNavBtn" onClick={() => onNavClick?.("ielts")}>IELTS</button>
          <button className="landingFooterNavBtn" onClick={() => onNavClick?.("pricing")}>Pricing</button>
          <button className="landingFooterNavBtn" onClick={() => onNavClick?.("faq")}>FAQ</button>
        </div>

        <div className="landingFooterActions">
          <a href="mailto:info@lumea.uz">info@lumea.uz</a>
          <button className="landingLoginButton landingFooterButton" type="button" onClick={onLoginClick}>
            Log in
          </button>
        </div>
      </div>

      <div className="landingFooterBottom">
        <div className="landingFooterBottomInner">
          <span>© 2026 Lumea. All rights reserved.</span>
          <div className="landingFooterBottomLinks">
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
            <a href="#top">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
