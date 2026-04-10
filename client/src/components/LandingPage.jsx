import { useEffect, useRef, useState } from "react";
import FloatingBackgroundPhotos from "./FloatingBackgroundPhotos";

const navItems = ["SAT", "IELTS", "Past tests", "Question bank"];

function LumeaAccentMark({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 72 72" aria-hidden="true">
      <path
        d="M36 6c10.4 0 20.8 3 28 8.8v19.4c0 15.4-10.4 25.5-28 31.8C18.4 59.7 8 49.6 8 34.2V14.8C15.2 9 25.6 6 36 6Z"
        fill="#ffde70"
        stroke="#173B64"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M26 23.5v20.5h18.5"
        fill="none"
        stroke="#173B64"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26 44 48 22"
        fill="none"
        stroke="#173B64"
        strokeWidth="4.5"
        strokeLinecap="round"
        opacity="0.24"
      />
      <circle cx="49.5" cy="22.5" r="4.5" fill="#F6FAFF" stroke="#173B64" strokeWidth="3" />
    </svg>
  );
}

function AnimatedCounter({ start, end, duration = 1800, suffix = "", className = "", decimals = 0, step = null }) {
  const [value, setValue] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isCounting, setIsCounting] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || hasAnimated) return;

    let frameId = 0;
    let startTime = 0;
    setIsCounting(true);

    const tick = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const rawValue = start + (end - start) * eased;
      const steppedValue = step ? Math.round(rawValue / step) * step : rawValue;
      const nextValue = decimals > 0 ? Number(steppedValue.toFixed(decimals)) : Math.round(steppedValue);
      setValue(nextValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        setIsCounting(false);
        setHasAnimated(true);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      setIsCounting(false);
      window.cancelAnimationFrame(frameId);
    };
  }, [duration, end, hasAnimated, isVisible, start]);

  return (
    <span ref={elementRef} className={isCounting ? `${className} isCounting` : className}>
      {decimals > 0 ? Number(value).toFixed(decimals) : value}
      {suffix}
    </span>
  );
}

export default function LandingPage({ onLoginClick }) {
  const [language, setLanguage] = useState("ENG");
  const [isDarkIcon, setIsDarkIcon] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [chatFrontIndex, setChatFrontIndex] = useState(0);

  useEffect(() => {
    const updateNavbar = () => setIsScrolled(window.scrollY > 18);
    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
    return () => window.removeEventListener("scroll", updateNavbar);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setChatFrontIndex((current) => (current === 0 ? 1 : 0));
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="landingPage">
      <FloatingBackgroundPhotos />

      <nav className={isScrolled ? "landingNavbar landingNavbarScrolled" : "landingNavbar"} aria-label="Main navigation">
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

      <section className="landingHero" id="top">
        <div className="landingHeroCopy" data-aos="fade-up">
          <h1>
            Everything you need to secure
            <span className="landingHeroHighlight">
              next chapter
              <svg className="landingGraduateCap" viewBox="0 0 64 42" aria-hidden="true">
                <path d="M32 2 4 15.5 32 29 60 15.5 32 2Z" />
                <path d="M18 22.5v8.2c3.7 4.4 8.4 6.6 14 6.6s10.3-2.2 14-6.6v-8.2L32 29 18 22.5Z" />
                <path d="M52 19.5v10" />
                <circle cx="52" cy="33" r="3" />
              </svg>
            </span>{" "}
            of your life.
          </h1>
          <p className="landingHeroSubtitle">
            Prepare for IELTS, SAT, and AP with structured courses, AI-powered insights, and expert guidance designed
            to maximize your scores and admission success.
          </p>
        </div>
      </section>

      <section className="landingStatsSection">
        <div className="landingStatsShell">
          <div className="landingStatsCopy" data-aos="fade-up">
            <p className="landingSectionLabel">Target Performance</p>
            <LumeaAccentMark className="landingSectionAccent landingSectionAccentStats" />
            <h2>For minds that aim beyond the crowd.</h2>
          </div>

          <div className="landingStatsPanel" data-aos="fade-left">
            <div className="landingStatCard landingSatStatCard">
              <div className="landingSatScoreLine">
                <AnimatedCounter className="landingStatValue" start={400} end={1600} step={10} duration={1900} />
                <span className="landingStatLabel">SAT</span>
              </div>
              <div className="landingSatPercentile">
                <AnimatedCounter className="landingSatPercentileValue" start={0} end={99} />
                <span className="landingSatPercentileLabel">th Percentile</span>
              </div>
            </div>

            <div className="landingStatCard landingIeltsStatCard">
              <div className="landingIeltsScoreLine">
                <AnimatedCounter className="landingStatValue" start={0} end={9} duration={1800} decimals={1} step={0.5} />
                <span className="landingStatLabel">IELTS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landingTeachersSection" data-aos="fade-up">
        <div className="landingTeachersShell">
          <div className="landingChatShotStack" aria-hidden="true">
            <img
              className={chatFrontIndex === 0 ? "landingChatShot front" : "landingChatShot back"}
              src="/images/screenshots/chat.png"
              alt=""
            />
            <img
              className={chatFrontIndex === 1 ? "landingChatShot front landingChatShotOffset" : "landingChatShot back landingChatShotOffset"}
              src="/images/screenshots/chat2.png"
              alt=""
            />
          </div>

          <div className="landingChatProofText">
            <p className="landingSectionLabel">Always Around</p>
            <LumeaAccentMark className="landingSectionAccent landingSectionAccentTeachers" />
            <h2>Experienced SAT 1510+, IELTS 7.5</h2>
            <p>24/7 reading to answer you on chat.</p>
          </div>
        </div>
      </section>
    </section>
  );
}
