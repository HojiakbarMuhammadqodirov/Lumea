import { useEffect, useRef, useState } from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";
import TestCarousel from "./TestCarousel";
import PublicAtmosphere from "./PublicAtmosphere";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";

// ── Static data (not translated) ───────────────────────────────────────────

const SAT_DATES = [
  new Date("2025-08-23"),
  new Date("2025-10-04"),
  new Date("2025-11-01"),
  new Date("2025-12-06"),
  new Date("2026-03-08"),
  new Date("2026-05-02"),
  new Date("2026-06-06"),
];

const PERF_COLORS = ["#bf2c55", "#d97706", "#2762C0", "#1e9b57"];

const SAT_FORMULA_COLORS = ["#173B64", "#2762C0", "#7C3AED"];

const SAT_PAST_TESTS = [
  { id: "2023-march",   label: "2023 March",    year: 2023 },
  { id: "2023-may",     label: "2023 May",      year: 2023 },
  { id: "2023-june",    label: "2023 June",      year: 2023 },
  { id: "2023-aug",     label: "2023 August",    year: 2023, tag: "International" },
  { id: "2023-oct",     label: "2023 October",   year: 2023 },
  { id: "2023-nov",     label: "2023 November",  year: 2023 },
  { id: "2023-dec",     label: "2023 December",  year: 2023 },
  { id: "2024-march",   label: "2024 March",    year: 2024 },
  { id: "2024-may",     label: "2024 May",      year: 2024 },
  { id: "2024-june",    label: "2024 June",      year: 2024 },
  { id: "2024-aug",     label: "2024 August",    year: 2024, tag: "International" },
  { id: "2024-oct",     label: "2024 October",   year: 2024 },
  { id: "2024-nov",     label: "2024 November",  year: 2024 },
  { id: "2024-dec",     label: "2024 December",  year: 2024 },
  { id: "2025-march",   label: "2025 March",    year: 2025 },
  { id: "2025-may",     label: "2025 May",      year: 2025 },
  { id: "2025-june",    label: "2025 June",      year: 2025 },
  { id: "2025-aug",     label: "2025 August",    year: 2025, tag: "International" },
  { id: "2025-sep",     label: "2025 September", year: 2025 },
  { id: "2025-oct",     label: "2025 October",   year: 2025 },
  { id: "2025-nov-int", label: "2025 November",  year: 2025, tag: "International" },
  { id: "2025-nov-us",  label: "2025 November",  year: 2025, tag: "US" },
  { id: "2025-dec-int", label: "2025 December",  year: 2025, tag: "International" },
  { id: "2025-dec-us",  label: "2025 December",  year: 2025, tag: "US" },
];

const BLUEBOOK_TESTS = [
  { id: "bb-1", label: "Practice Test 1", year: "2023", mathTime: "70 min", rwTime: "64 min", desc: "First official digital SAT practice test." },
  { id: "bb-2", label: "Practice Test 2", year: "2023", mathTime: "70 min", rwTime: "64 min", desc: "Full-length test with adaptive module 2." },
  { id: "bb-3", label: "Practice Test 3", year: "2023", mathTime: "70 min", rwTime: "64 min", desc: "Focus on Information & Ideas and Algebra." },
  { id: "bb-4", label: "Practice Test 4", year: "2024", mathTime: "70 min", rwTime: "64 min", desc: "Advanced Math and Craft & Structure emphasis." },
  { id: "bb-5", label: "Practice Test 5", year: "2024", mathTime: "70 min", rwTime: "64 min", desc: "Problem-Solving & Data Analysis section." },
  { id: "bb-6", label: "Practice Test 6", year: "2024", mathTime: "70 min", rwTime: "64 min", desc: "Expression of Ideas and Geometry focus." },
  { id: "bb-7", label: "Practice Test 7", year: "2024", mathTime: "70 min", rwTime: "64 min", desc: "Conventions & Standard English emphasis." },
  { id: "bb-8", label: "Practice Test 8", year: "2025", mathTime: "70 min", rwTime: "64 min", desc: "Most recent official practice test." },
];

const SAT_MOCKS = [
  { id: "mock-1",    label: "Full SAT Mock 1", sections: "RW + Math",        duration: "2h 14min", desc: "Both sections in order, adaptive difficulty, scored." },
  { id: "mock-2",    label: "Full SAT Mock 2", sections: "RW + Math",        duration: "2h 14min", desc: "Different question set, same full-test simulation." },
  { id: "mock-3",    label: "Full SAT Mock 3", sections: "RW + Math",        duration: "2h 14min", desc: "Timed, strict — best for a real test day rehearsal." },
  { id: "mock-math", label: "Math Only Mock",  sections: "Math",             duration: "70 min",   desc: "Modules 1 & 2, adaptive difficulty, full scoring." },
  { id: "mock-rw",   label: "RW Only Mock",    sections: "Reading & Writing", duration: "64 min",   desc: "Both RW modules, fully timed and scored." },
];

// ── Utilities ─────────────────────────────────────────────────────────────

function pad2(n) { return String(n).padStart(2, "0"); }

function getNextSatDate() {
  const now = new Date();
  return SAT_DATES.find((d) => d > now) ?? SAT_DATES[SAT_DATES.length - 1];
}

function useVisible(threshold = 0.2) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useCountdown(target) {
  const calc = () => {
    const diff = target - new Date();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff / 3600000) % 24),
      m: Math.floor((diff / 60000) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(id);
  });
  return left;
}

function generateSatPlan(scores, examDate, rwDomains, mathDomains, planStrings) {
  const domains = [...rwDomains, ...mathDomains];
  const ranked  = [...domains]
    .map((d) => ({ ...d, level: scores[d.key] ?? 0 }))
    .sort((a, b) => a.level - b.level);

  const daysLeft = Math.max(7, Math.floor((examDate - new Date()) / 86400000));
  const weeks    = Math.min(8, Math.floor(daysLeft / 7));

  const plan = [];
  for (let w = 0; w < weeks; w++) {
    const isLast = w === weeks - 1;
    if (isLast) {
      plan.push({ week: w + 1, focus: planStrings.finalFocus, type: "review", tasks: planStrings.finalTasks });
    } else if (w < 2) {
      plan.push({ week: w + 1, focus: planStrings.intensiveFocus(ranked[0]?.label), type: "intensive",
        tasks: planStrings.intensiveTasks(ranked[0]?.label, ranked[1]?.label) });
    } else {
      const idx = (w - 2) % 3;
      plan.push({ week: w + 1, focus: planStrings.buildFocus(ranked[2 + idx]?.label), type: "build",
        tasks: planStrings.buildTasks(ranked[2 + idx]?.label, ranked[0]?.label) });
    }
  }
  return { plan, daysLeft, weakest: ranked.slice(0, 3) };
}

// ── Quadratic Graph ───────────────────────────────────────────────────────

function QuadraticGraph({ active }) {
  const W = 400, H = 280;
  const xMin = -2.2, xMax = 5.8, yMin = -8.5, yMax = 9;

  const sv = (mx, my) => [
    ((mx - xMin) / (xMax - xMin)) * W,
    H - ((my - yMin) / (yMax - yMin)) * H,
  ];

  const pts = [];
  for (let x = -1.6; x <= 5.6; x += 0.06) {
    const y = x * x - 3 * x - 4;
    if (y >= yMin - 0.5 && y <= yMax + 0.5) {
      const [sx, sy] = sv(x, y);
      pts.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
  }

  const [ox, oy]   = sv(0, 0);
  const [r1x, r1y] = sv(-1, 0);
  const [r2x, r2y] = sv(4, 0);
  const [vx, vy]   = sv(1.5, -6.25);
  const [yix, yiy] = sv(0, -4);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`satQuadGraph${active ? " satQGActive" : ""}`} aria-label="Quadratic graph f(x)=x²−3x−4">
      {[-2,-1,0,1,2,3,4,5].map((x) => { const [gx] = sv(x,0); return <line key={`gx${x}`} x1={gx} y1={0} x2={gx} y2={H} className="satQGGrid" />; })}
      {[-8,-6,-4,-2,0,2,4,6,8].map((y) => { const [,gy] = sv(0,y); return <line key={`gy${y}`} x1={0} y1={gy} x2={W} y2={gy} className="satQGGrid" />; })}
      <line x1={0} y1={oy} x2={W} y2={oy} className="satQGAxis" />
      <line x1={ox} y1={0} x2={ox} y2={H} className="satQGAxis" />
      <polygon points={`${W},${oy} ${W-8},${oy-4} ${W-8},${oy+4}`} className="satQGArrow" />
      <polygon points={`${ox},0 ${ox-4},8 ${ox+4},8`} className="satQGArrow" />
      <text x={W-10} y={oy-9} className="satQGAxisLbl">x</text>
      <text x={ox+7} y={13} className="satQGAxisLbl">y</text>
      {[-1,1,2,3,4].map((x) => { const [gx] = sv(x,0); return <text key={x} x={gx} y={oy+16} className="satQGTick" textAnchor="middle">{x}</text>; })}
      {[-6,-4,-2,2,4,6].map((y) => { const [,gy] = sv(0,y); return <text key={y} x={ox-6} y={gy+4} className="satQGTick" textAnchor="end">{y}</text>; })}
      <path d={`M ${pts.join(" L ")}`} className="satQGParabola" />
      {active && (
        <>
          <line x1={vx} y1={vy} x2={vx} y2={oy} className="satQGDash" />
          <line x1={ox} y1={vy} x2={vx} y2={vy} className="satQGDash" />
          <circle cx={r1x} cy={r1y} r={5.5} className="satQGDotRoot" />
          <circle cx={r2x} cy={r2y} r={5.5} className="satQGDotRoot" />
          <circle cx={vx}  cy={vy}  r={6.5} className="satQGDotVertex" />
          <circle cx={yix} cy={yiy} r={5}   className="satQGDotYInt" />
          <text x={r1x-2} y={r1y-11} className="satQGPtLbl" textAnchor="middle">x₁=−1</text>
          <text x={r2x+2} y={r2y-11} className="satQGPtLbl" textAnchor="middle">x₂=4</text>
          <text x={vx+8}  y={vy+5}   className="satQGPtLbl">V(1.5, −6.25)</text>
          <text x={yix-6} y={yiy-11} className="satQGPtLbl" textAnchor="middle">y=−4</text>
        </>
      )}
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function SatPage({ onLoginClick, onNavClick, currentTheme, onToggleTheme }) {
  const { lang } = useLanguage();
  const t = translations[lang].sat;

  const nextExam  = getNextSatDate();
  const countdown = useCountdown(nextExam);

  const [topicRef, topicVisible] = useVisible(0.2);
  const [graphRef, graphVisible] = useVisible(0.25);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!topicVisible) return;
    const id = setInterval(() => setActiveStep((s) => (s + 1) % t.steps.length), 4500);
    return () => clearInterval(id);
  }, [topicVisible, t.steps.length]);

  const initScores = Object.fromEntries([...t.rwDomains, ...t.mathDomains].map((d) => [d.key, 2]));
  const [scores, setScores]       = useState(initScores);
  const [plan, setPlan]           = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [pastYearFilter, setPastYearFilter] = useState("all");
  const [openMock, setOpenMock]             = useState(null);
  const [openBluebook, setOpenBluebook]     = useState(null);

  const filteredPast = SAT_PAST_TESTS.filter((t_) =>
    pastYearFilter === "all" || String(t_.year) === pastYearFilter
  );

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setPlan(generateSatPlan(scores, nextExam, t.rwDomains, t.mathDomains, t.plan));
      setAnalyzing(false);
    }, 1600);
  };

  const [regStep, setRegStep] = useState(0);

  return (
    <section className="examPage satExamPage">
      <PublicAtmosphere variant="sat" />
      <PublicHeader onLoginClick={onLoginClick} onNavClick={onNavClick} currentView="sat" currentTheme={currentTheme} onToggleTheme={onToggleTheme} />

      {/* ── Hero ── */}
      <section className="examHero" id="top">
        <div className="examHeroInner">
          <div className="examHeroCopy" data-aos="fade-up">
            <span className="examHeroBadge satBadge">{t.badge}</span>
            <h1 className="examHeroTitle">
              {t.hero.title1}<br />
              <span className="examHeroHighlight">{t.hero.title2}</span>
            </h1>
            <p className="examHeroDesc">{t.hero.desc}</p>
            <div className="examHeroActions">
              <button className="landingHeroPrimary" onClick={onLoginClick}>{t.hero.cta}</button>
              <a className="landingHeroGhost" href="#scorePush">{t.hero.ctaSecondary}</a>
            </div>
          </div>

          <div className="examHeroStats" data-aos="fade-left" data-aos-delay="120">
            <div className="examHeroStat"><span className="examHeroStatNum">1600</span><span className="examHeroStatLbl">{t.hero.maxScore}</span></div>
            <div className="examHeroStatDiv" />
            <div className="examHeroStat"><span className="examHeroStatNum">2</span><span className="examHeroStatLbl">{t.hero.sections}</span></div>
            <div className="examHeroStatDiv" />
            <div className="examHeroStat"><span className="examHeroStatNum">98 min</span><span className="examHeroStatLbl">{t.hero.totalTime}</span></div>
          </div>
        </div>
      </section>

      {/* ── Topic Learning ── */}
      <section className="examTopicSection" ref={topicRef}>
        <div className="examTopicShell">
          <div className="examTopicIntro" data-aos="fade-up">
            <p className="landingSectionLabel">{t.topic.label}</p>
            <h2 className="examTopicH2">{t.topic.heading}</h2>
            <p className="examTopicDesc">{t.topic.desc}</p>
          </div>

          <div className="examTopicBody">
            <div className="examTopicLeft" ref={graphRef} data-aos="fade-right" data-aos-duration="900">
              <div className="satGraphCard">
                <div className="satGraphCardTop">
                  <span className="satGraphCardLabel">{t.topic.graphLabel}</span>
                  <span className="satGraphCardSub">{t.topic.graphSub}</span>
                </div>
                <QuadraticGraph active={graphVisible} />
              </div>

              <div className="satFormulaList">
                {t.formulas.map((f, i) => (
                  <div
                    key={f.label}
                    className={`satFormulaItem${graphVisible ? " satFVisible" : ""}`}
                    style={{ transitionDelay: `${i * 160 + 280}ms` }}
                  >
                    <div className="satFormulaLabel" style={{ color: SAT_FORMULA_COLORS[i] }}>{f.label}</div>
                    <div className="satFormulaExpr" style={{ borderLeftColor: SAT_FORMULA_COLORS[i] }}>{f.expr}</div>
                    <div className="satFormulaNotes">{f.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="examTopicRight" data-aos="fade-left" data-aos-duration="900">
              <div className="examStepTrack">
                {t.steps.map((s, i) => (
                  <div
                    key={s.n}
                    className={`examStepItem${i === activeStep ? " examStepActive" : i < activeStep ? " examStepDone" : ""}`}
                    onClick={() => setActiveStep(i)}
                  >
                    <div className="examStepBullet">
                      {i < activeStep ? (
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="M4 10.5 8.5 15 16 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : s.n}
                    </div>
                    <div className="examStepBody">
                      <div className="examStepTitle">{s.title}</div>
                      {i === activeStep && (
                        <>
                          <div className="examStepDesc">{s.desc}</div>
                          <div className="examStepHint">
                            <span className="examStepHintDot" />
                            {s.hint}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="examStepProgress">
                <div className="examStepProgressFill" style={{ width: `${((activeStep + 1) / t.steps.length) * 100}%` }} />
              </div>
              <p className="examStepNote">{t.topic.autoNote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Score Push ── */}
      <section className="examScoreSection" id="scorePush">
        <div className="examScoreShell">
          <div className="examScoreIntro" data-aos="fade-up">
            <p className="landingSectionLabel">{t.score.label}</p>
            <h2 className="examScoreH2">
              {t.score.heading1}<br />
              <span className="examScoreHighlight">{t.score.heading2}</span>
            </h2>
            <p className="examScoreDesc">{t.score.desc}</p>
          </div>

          <div className="examScoreBody" data-aos="fade-up" data-aos-delay="60">
            <div className="examTimerCard">
              <p className="examTimerCardLabel">{t.score.timerLabel}</p>
              <p className="examTimerDate">
                {nextExam.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
              <div className="examTimerUnits">
                {[["d", countdown.d], ["h", countdown.h], ["m", countdown.m], ["s", countdown.s]].map(([u, v]) => (
                  <div className="examTimerUnit" key={u}>
                    <span className="examTimerNum">{pad2(v)}</span>
                    <span className="examTimerUnitLbl">{u}</span>
                  </div>
                ))}
              </div>
              <div className="examTimerTz">UTC+5 · Asia/Tashkent</div>
            </div>

            <div className="examScoreInputCard">
              {[{ label: t.score.rwLabel, domains: t.rwDomains }, { label: t.score.mathLabel, domains: t.mathDomains }].map((sec) => (
                <div key={sec.label} className="examScoreSection_">
                  <div className="examScoreSectionLbl">{sec.label}</div>
                  <div className="examScoreGrid">
                    {sec.domains.map((d) => (
                      <div key={d.key} className="examScoreRow">
                        <span className="examScoreDomainLbl">{d.label}</span>
                        <div className="examPerfBtns">
                          {t.score.perfLevels.map((lvl, li) => (
                            <button
                              key={lvl}
                              className={`examPerfBtn${scores[d.key] === li ? " examPerfBtnSel" : ""}`}
                              style={{ "--pc": PERF_COLORS[li] }}
                              onClick={() => setScores((s) => ({ ...s, [d.key]: li }))}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button className="examAnalyzeBtn satAnalyzeBtn" onClick={analyze} disabled={analyzing}>
                {analyzing ? <><span className="examSpinner" /> {t.score.analyzing}</> : t.score.analyze}
              </button>
            </div>
          </div>

          {plan && (
            <div className="examPlanCard" data-aos="fade-up">
              <div className="examPlanHead">
                <div>
                  <h3 className="examPlanTitle">{t.score.planTitle}</h3>
                  <p className="examPlanSub">{plan.daysLeft} {t.score.daysUntil} · {plan.weakest.length} {t.score.priorityAreas}</p>
                </div>
                <div className="examPlanWeakBadges">
                  {plan.weakest.map((w) => (
                    <span key={w.key} className="examPlanWeakBadge">{w.label}</span>
                  ))}
                </div>
              </div>
              <div className="examPlanWeeks">
                {plan.plan.map((wk) => (
                  <div key={wk.week} className={`examPlanWeek examPlanWeek--${wk.type}`}>
                    <div className="examPlanWeekHead">
                      <span className="examPlanWeekNum">{t.score.weekLabel} {wk.week}</span>
                      <span className="examPlanWeekFocus">{wk.focus}</span>
                    </div>
                    <ul className="examPlanTasks">
                      {wk.tasks.map((task, i) => (
                        <li key={i} className="examPlanTask"><span className="examPlanTaskDot" />{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="examPlanAction">
                <button className="landingHeroPrimary" onClick={onLoginClick}>{t.score.goToPlan}</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Registration ── */}
      <section className="examRegSection">
        <div className="examRegShell" data-aos="fade-up">
          <div className="examRegIntro">
            <p className="landingSectionLabel">{t.registration.label}</p>
            <h2 className="examRegH2">{t.registration.heading}</h2>
            <p className="examRegDesc">{t.registration.desc}</p>
          </div>

          <div className="examRegBody">
            <div className="examRegSteps">
              {t.registration.steps.map((step, i) => (
                <div
                  key={i}
                  className={`examRegStep${regStep === i ? " examRegStepActive" : regStep > i ? " examRegStepDone" : ""}`}
                  onClick={() => setRegStep(i)}
                >
                  <div className="examRegStepNum">
                    {regStep > i ? (
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M4 10.5 8.5 15 16 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className="examRegStepText">{step}</span>
                </div>
              ))}
            </div>

            <div className="examRegPanel">
              <div className="examRegCurrentStep">
                <p className="examRegCurrentLabel">{t.registration.currentStep}</p>
                <p className="examRegCurrentText">{t.registration.steps[regStep]}</p>
              </div>
              <div className="examRegNav">
                <button className="examRegNavBtn" disabled={regStep === 0} onClick={() => setRegStep((s) => s - 1)}>{t.registration.back}</button>
                <span className="examRegNavCount">{regStep + 1} / {t.registration.steps.length}</span>
                <button className="examRegNavBtn" disabled={regStep === t.registration.steps.length - 1} onClick={() => setRegStep((s) => s + 1)}>{t.registration.next}</button>
              </div>
              <a className="examRegCTA satRegCTA" href="https://satsuite.collegeboard.org/sat/registration" target="_blank" rel="noopener noreferrer">
                {t.registration.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Past Tests ── */}
      <section className="examCarouselSection" id="past-tests">
        <div className="examCarouselShell">
          <div className="examCarouselIntro" data-aos="fade-up">
            <p className="landingSectionLabel">{t.pastTests.label}</p>
            <h2 className="examCarouselH2">{t.pastTests.heading}</h2>
            <p className="examCarouselDesc">{t.pastTests.desc}</p>
          </div>

          <div className="examCarouselFilters" data-aos="fade-up">
            {["all","2023","2024","2025"].map((yr) => (
              <button key={yr}
                className={`examTestsFilterBtn${pastYearFilter === yr ? " examTestsFilterBtnActive" : ""}`}
                onClick={() => setPastYearFilter(yr)}>
                {yr === "all" ? t.pastTests.allYears : yr}
                {yr !== "all" && <span className="examTestsFilterCount">{SAT_PAST_TESTS.filter((t_) => String(t_.year) === yr).length}</span>}
              </button>
            ))}
          </div>
        </div>

        <TestCarousel
          items={filteredPast}
          speed={70}
          renderCard={(item) => (
            <div className="tcCard tcCardSat">
              <div className="tcCardMeta">
                <span className="tcCardMetaLabel">{item.year}</span>
                {item.tag && <span className="tcCardTag">{item.tag}</span>}
              </div>
              <div className="tcCardTitle">{item.label}</div>
              <div className="tcCardBtns">
                <button className="tcCardBtnMath" onClick={onLoginClick}>{t.pastTests.math}</button>
                <button className="tcCardBtnRw" onClick={onLoginClick}>{t.pastTests.rw}</button>
              </div>
            </div>
          )}
        />
      </section>

      {/* ── BlueBook ── */}
      <section className="examCarouselSection">
        <div className="examCarouselShell">
          <div className="examCarouselIntro" data-aos="fade-up">
            <p className="landingSectionLabel">{t.bluebook.label}</p>
            <h2 className="examCarouselH2">{t.bluebook.heading}</h2>
            <p className="examCarouselDesc">{t.bluebook.desc}</p>
          </div>
        </div>

        <TestCarousel
          items={BLUEBOOK_TESTS}
          speed={50}
          onCardClick={(b) => setOpenBluebook(b)}
          renderCard={(b, onClick) => (
            <div className="tcCard tcCardSat" style={{ "--cc": "#2762C0" }}>
              <div className="tcCardMeta">
                <span className="tcCardMetaLabel">BlueBook · {b.year}</span>
              </div>
              <div className="tcCardTitle">{b.label}</div>
              <div className="tcCardDur">{b.mathTime} + {b.rwTime}</div>
              <button className="tcCardBtn" style={{ background: "rgba(39,98,192,0.09)", color: "#2762C0" }} onClick={onClick}>
                {t.bluebook.startTest}
              </button>
            </div>
          )}
        />
      </section>

      {/* ── Mock Tests ── */}
      <section className="examCarouselSection">
        <div className="examCarouselShell">
          <div className="examCarouselIntro" data-aos="fade-up">
            <p className="landingSectionLabel">{t.mocks.label}</p>
            <h2 className="examCarouselH2">{t.mocks.heading}</h2>
            <p className="examCarouselDesc">{t.mocks.desc}</p>
          </div>
        </div>

        <TestCarousel
          items={SAT_MOCKS}
          speed={40}
          renderCard={(m) => (
            <div className="tcCard tcCardSat">
              <div className="tcCardMeta">
                <span className="tcCardMetaLabel">{m.sections}</span>
                <span className="tcCardDur">{m.duration}</span>
              </div>
              <div className="tcCardTitle">{m.label}</div>
              <div className="tcCardDur" style={{ fontSize: "0.78rem" }}>{m.desc}</div>
              <button className="tcCardBtn" onClick={() => setOpenMock(m)}>{t.mocks.start}</button>
            </div>
          )}
          onCardClick={(m) => setOpenMock(m)}
        />
      </section>

      <PublicFooter onLoginClick={onLoginClick} onNavClick={onNavClick} />

      {/* BlueBook modal */}
      {openBluebook && (
        <div className="testViewerOverlay" onClick={(e) => e.target === e.currentTarget && setOpenBluebook(null)}>
          <div className="testViewerShell testViewerShellSmall">
            <div className="testViewerHeader">
              <span className="testViewerTitle">BlueBook — {openBluebook.label}</span>
              <div className="testViewerHeaderRight">
                <span className="testViewerDuration">{openBluebook.mathTime} + {openBluebook.rwTime}</span>
                <button className="testViewerClose" onClick={() => setOpenBluebook(null)}>✕</button>
              </div>
            </div>
            <div className="testViewerComingSoon">
              <div className="testViewerComingSoonIcon">📘</div>
              <h3>{openBluebook.label}</h3>
              <p>{openBluebook.desc}</p>
              <p style={{ marginTop: 8, color: "#a8b1b8", fontSize: "0.9rem" }}>{t.bluebook.comingSoonMsg}</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="examAnalyzeBtn" onClick={onLoginClick}>{t.bluebook.signUp}</button>
                <button className="examRegNavBtn" onClick={() => setOpenBluebook(null)}>{t.bluebook.close}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mock modal */}
      {openMock && (
        <div className="testViewerOverlay" onClick={(e) => e.target === e.currentTarget && setOpenMock(null)}>
          <div className="testViewerShell testViewerShellSmall">
            <div className="testViewerHeader">
              <span className="testViewerTitle">{openMock.label}</span>
              <button className="testViewerClose" onClick={() => setOpenMock(null)}>✕</button>
            </div>
            <div className="testViewerComingSoon">
              <div className="testViewerComingSoonIcon">📝</div>
              <h3>{openMock.label}</h3>
              <p>{openMock.desc}</p>
              <p style={{ marginTop: 8, color: "#a8b1b8", fontSize: "0.9rem" }}>{t.mocks.comingSoonMsg}</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="examAnalyzeBtn" onClick={onLoginClick}>{t.mocks.signUp}</button>
                <button className="examRegNavBtn" onClick={() => setOpenMock(null)}>{t.mocks.close}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
