import { useEffect, useRef, useState } from "react";
import FloatingBackgroundPhotos from "./FloatingBackgroundPhotos";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

const books = [
  { src: "/images/books/ebrwpanda.png", alt: "Erica Meltzer EBRW practice book" },
  { src: "/images/books/ielts.png", alt: "IELTS preparation book" },
  { src: "/images/books/mathpanda.png", alt: "Panda SAT Math book" },
  { src: "/images/books/satguide.png", alt: "Official SAT study guide" },
];

function LumeaAccentMark({ className = "", variant = "growth" }) {
  return (
    <svg className={className} viewBox="0 0 72 72" aria-hidden="true">
      <path
        d="M36 6c10.4 0 20.8 3 28 8.8v19.4c0 15.4-10.4 25.5-28 31.8C18.4 59.7 8 49.6 8 34.2V14.8C15.2 9 25.6 6 36 6Z"
        fill="#ffde70"
        stroke="#173B64"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {variant === "chat" ? (
        <>
          <path
            d="M22 20.5h28c3.3 0 6 2.7 6 6v13c0 3.3-2.7 6-6 6H36l-8.8 7.2c-1.4 1.1-3.5.1-3.5-1.7v-5.5H22c-3.3 0-6-2.7-6-6v-13c0-3.3 2.7-6 6-6Z"
            fill="#F6FAFF"
            stroke="#173B64"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M24.5 31h23" stroke="#173B64" strokeWidth="4" strokeLinecap="round" />
          <path d="M24.5 39h15" stroke="#173B64" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : variant === "tick" ? (
        <path
          d="M22 37.5 31 46.5 49.5 25.5"
          fill="none"
          stroke="#173B64"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <path d="M20 47.5h31" fill="none" stroke="#173B64" strokeWidth="4" strokeLinecap="round" />
          <path
            d="M22 41.5 30.5 34l7 4.5 13-15"
            fill="none"
            stroke="#173B64"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M45 23.5h5.5V29"
            fill="none"
            stroke="#173B64"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
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
  }, [duration, end, hasAnimated, isVisible, start, step, decimals]);

  return (
    <span
      ref={elementRef}
      className={isCounting ? `${className} isCounting` : className}
      style={{ "--count-duration": `${duration}ms` }}
    >
      {decimals > 0 ? Number(value).toFixed(decimals) : value}
      {suffix}
    </span>
  );
}

export default function LandingPage({ onLoginClick, onNavClick }) {
  const [chatFrontIndex, setChatFrontIndex] = useState(0);
  const [activeBookIndex, setActiveBookIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setChatFrontIndex((current) => (current === 0 ? 1 : 0));
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveBookIndex((current) => (current + 1) % books.length);
    }, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="landingPage">
      <FloatingBackgroundPhotos />
      <PublicHeader onLoginClick={onLoginClick} onNavClick={onNavClick} currentView="landing" />

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
            <LumeaAccentMark className="landingSectionAccent landingSectionAccentStats" variant="growth" />
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

      <section className="landingTeachersSection">
        <div className="landingTeachersShell">
          <div className="landingChatShotStack" aria-hidden="true" data-aos="fade-right" data-aos-duration="900">
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

          <div className="landingChatProofText" data-aos="fade-left" data-aos-duration="900">
            <p className="landingSectionLabel">Always Around</p>
            <LumeaAccentMark className="landingSectionAccent landingSectionAccentTeachers" variant="chat" />
            <h2>Experienced SAT 1510+, IELTS 7.5</h2>
            <p>24/7 reading to answer you on chat.</p>
          </div>
        </div>
      </section>

      <section className="landingBooksSection">
        <div className="landingBooksShell">
          <div className="landingBooksCopy" data-aos="fade-up" data-aos-duration="900">
            <p className="landingSectionLabel">Official Sources</p>
            <LumeaAccentMark className="landingSectionAccent landingSectionAccentBooks" variant="tick" />
            <h2>Real materials from official books and past papers.</h2>
            <p>Study with the same sources serious test takers use when they want reliable practice and cleaner score jumps.</p>
          </div>

          <div className="landingBooksStage" data-aos="zoom-in-left" data-aos-duration="1000" aria-hidden="true">
            {books.map((book, index) => {
              const distance = (index - activeBookIndex + books.length) % books.length;
              const positionClass =
                distance === 0
                  ? "isCenter"
                  : distance === 1
                    ? "isRight"
                    : distance === books.length - 1
                      ? "isLeft"
                      : "isBack";

              return (
                <div className={`landingBookCard ${positionClass}`} key={book.src}>
                  <img className="landingBookImage" src={book.src} alt={book.alt} />
                  <span className="landingBookShadow" />
                </div>
              );
            })}
          </div>
        </div>
      </section>


      <section className="landingMilestonesSection" data-aos="fade-up" data-aos-duration="900">
        <div className="landingMilestonesShell">
          <div className="landingMilestoneCard">
            <div className="landingResultNumberLine">
              <AnimatedCounter className="landingResultValue" start={0} end={1000} duration={1700} />
              <span className="landingResultPlus">+</span>
            </div>
            <span className="landingResultLabel">SAT-Math Questions</span>
          </div>

          <div className="landingMilestoneCard">
            <div className="landingResultNumberLine">
              <AnimatedCounter className="landingResultValue" start={0} end={1000} duration={1700} />
              <span className="landingResultPlus">+</span>
            </div>
            <span className="landingResultLabel">SAT-EBRW Questions</span>
          </div>

          <div className="landingMilestoneCard">
            <div className="landingResultNumberLine">
              <AnimatedCounter className="landingResultValue" start={0} end={200} duration={1600} />
              <span className="landingResultPlus">+</span>
            </div>
            <span className="landingResultLabel">IELTS Questions</span>
          </div>
        </div>
      </section>

      <section className="landingResultsSection" data-aos="fade-up" data-aos-duration="900">
        <div className="landingResultsShell">
          <div className="landingResultsIntro">
            <p className="landingSectionLabel">Score Pushshing</p>
            <LumeaAccentMark className="landingSectionAccent landingSectionAccentResults" variant="growth" />
            <h2>
              Improve your next score unimaginavely with <span className="landingResultsHighlight">Score Rush</span>.
            </h2>
            <p>Put your score report to work.</p>
          </div>

          <div className="landingResultsCards">
            <div className="landingResultsCard">
              <span className="landingResultExamLabel">SAT</span>
              <div className="landingResultScoreRow">
                <div className="landingResultScoreBlock">
                  <div className="landingResultNumberLine">
                    <AnimatedCounter className="landingResultValue landingResultValuePrevious" start={0} end={1100} duration={1700} step={10} />
                  </div>
                  <span className="landingScoreMeta">Previous score</span>
                </div>
                <div className="landingResultScoreBlock">
                  <div className="landingResultNumberLine">
                    <AnimatedCounter className="landingResultValue" start={0} end={1500} duration={1700} step={10} />
                  </div>
                  <span className="landingScoreMeta landingScoreMetaNext">Next score</span>
                </div>
              </div>
            </div>

            <div className="landingResultsCard">
              <span className="landingResultExamLabel">IELTS</span>
              <div className="landingResultScoreRow">
                <div className="landingResultScoreBlock">
                  <div className="landingResultNumberLine">
                    <AnimatedCounter className="landingResultValue landingResultValuePrevious" start={0} end={5.5} duration={1600} decimals={1} step={0.5} />
                  </div>
                  <span className="landingScoreMeta">Previous score</span>
                </div>
                <div className="landingResultScoreBlock">
                  <div className="landingResultNumberLine">
                    <AnimatedCounter className="landingResultValue" start={0} end={8.0} duration={1600} decimals={1} step={0.5} />
                  </div>
                  <span className="landingScoreMeta landingScoreMetaNext">Next score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter onLoginClick={onLoginClick} onNavClick={onNavClick} />
    </section>
  );
}
