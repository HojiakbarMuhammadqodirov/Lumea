export default function PublicFooter({ onLoginClick }) {
  return (
    <footer className="landingFooter">
      <div className="landingFooterShell">
        <div className="landingFooterBrand">
          <a className="landingLogo" href="#top" aria-label="Lumea home">
            Lumea
          </a>
          <p>Structured prep, AI-powered guidance, real materials, and support from experienced teachers that keeps moving with you.</p>
        </div>

        <div className="landingFooterLinks">
          <a href="#top">Home</a>
          <a href="#sat">SAT</a>
          <a href="#ielts">IELTS</a>
          <a href="#past-tests">Past tests</a>
          <a href="#question-bank">Question bank</a>
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
