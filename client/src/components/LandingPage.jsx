const navItems = ["SAT", "IELTS", "Past tests", "Question bank"];

export default function LandingPage({ onLoginClick }) {
  return (
    <section className="landingPage">
      <nav className="landingNavbar" aria-label="Main navigation">
        <a className="landingLogo" href="#top" aria-label="Lumea home">
          Lumea
        </a>

        <div className="landingNavLinks">
          {navItems.map((item) => (
            <a className="landingNavLink" key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}>
              {item}
            </a>
          ))}
        </div>

        <button className="landingLoginButton" type="button" onClick={onLoginClick}>
          Log in
        </button>
      </nav>

      <section className="landingHero" id="top">
        <div className="landingHeroCopy" data-aos="fade-up">
          <p className="landingEyebrow">SAT and IELTS preparation</p>
          <h1>Study with a calmer rhythm and a sharper target.</h1>
          <p>
            Practice real exam skills, review past tests, and build confidence with question sets that keep your next
            step clear.
          </p>
          <div className="landingHeroActions">
            <button className="landingHeroPrimary" type="button" onClick={onLoginClick}>
              Start learning
            </button>
            <a className="landingHeroGhost" href="#question-bank">
              Explore bank
            </a>
          </div>
        </div>

        <div className="landingHeroPanel" data-aos="fade-left">
          <div className="landingScoreCard">
            <span>Today</span>
            <strong>Focused practice</strong>
            <p>Two reading passages, one writing drill, and a review set before the next lesson.</p>
          </div>
          <div className="landingHeroGrid" aria-label="Study sections">
            {navItems.map((item) => (
              <a className="landingFeatureTile" id={item.toLowerCase().replace(/\s+/g, "-")} key={item} href="#login">
                <span>{item}</span>
                <strong>{item === "Question bank" ? "480+" : item === "Past tests" ? "24" : "Ready"}</strong>
              </a>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
