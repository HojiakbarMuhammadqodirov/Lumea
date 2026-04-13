import { useEffect, useRef, useState } from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";
import TestCarousel from "./TestCarousel";

// ── Constants ──────────────────────────────────────────────────────────────

const SAT_DATES = [
  new Date("2025-08-23"),
  new Date("2025-10-04"),
  new Date("2025-11-01"),
  new Date("2025-12-06"),
  new Date("2026-03-08"),
  new Date("2026-05-02"),
  new Date("2026-06-06"),
];

const RW_DOMAINS = [
  { key: "infoIdeas",   label: "Information & Ideas" },
  { key: "craft",       label: "Craft & Structure" },
  { key: "expression",  label: "Expression of Ideas" },
  { key: "conventions", label: "Standard English Conventions" },
];

const MATH_DOMAINS = [
  { key: "algebra", label: "Algebra" },
  { key: "advMath", label: "Advanced Math" },
  { key: "psda",    label: "Problem-Solving & Data Analysis" },
  { key: "geo",     label: "Geometry & Trigonometry" },
];

const PERF_LEVELS  = ["Needs Work", "Approaching", "Proficient", "Mastered"];
const PERF_COLORS  = ["#bf2c55", "#d97706", "#2762C0", "#1e9b57"];

const SAT_FORMULAS = [
  {
    label: "Quadratic Formula",
    expr:  "x = (−b ± √(b²−4ac)) / 2a",
    note:  "Finds both roots when the expression can't be factored easily.",
    color: "#173B64",
  },
  {
    label: "Vertex Formula",
    expr:  "h = −b / 2a     k = f(h)",
    note:  "Axis of symmetry is x = h. The vertex (h, k) is the min or max.",
    color: "#2762C0",
  },
  {
    label: "Discriminant",
    expr:  "Δ = b² − 4ac",
    note:  "Δ > 0 → 2 real roots  ·  Δ = 0 → 1 root  ·  Δ < 0 → no real roots",
    color: "#7C3AED",
  },
];

const SAT_STEPS = [
  {
    n: 1,
    title: "Understand the Parabola",
    desc: "Every quadratic is a parabola. Opening up when a > 0, down when a < 0. The vertex is the turning point — minimum or maximum — and the axis of symmetry passes through it.",
    hint: "On the SAT, ~35 % of Math questions involve quadratics or polynomials.",
  },
  {
    n: 2,
    title: "Apply the Quadratic Formula",
    desc: "When factoring is hard or impossible, use x = (−b ± √(b²−4ac)) / 2a. Check the discriminant first: if b²−4ac < 0, there are no real roots.",
    hint: "Tip: Memorize the formula once and you can solve any quadratic in seconds.",
  },
  {
    n: 3,
    title: "Read the Graph on the SAT",
    desc: "The SAT often shows a parabola and asks for the vertex, roots, or y-intercept. Label each key point before answering — roots are where the parabola crosses the x-axis.",
    hint: "Fastest method: identify a, b, c from the equation, then apply the formulas directly.",
  },
];

// All SAT digital test dates from March 2023
const SAT_PAST_TESTS = [
  // 2023
  { id: "2023-march",   label: "2023 March",   year: 2023, section: "both" },
  { id: "2023-may",     label: "2023 May",     year: 2023, section: "both" },
  { id: "2023-june",    label: "2023 June",    year: 2023, section: "both" },
  { id: "2023-aug",     label: "2023 August",  year: 2023, section: "both", tag: "International" },
  { id: "2023-oct",     label: "2023 October", year: 2023, section: "both" },
  { id: "2023-nov",     label: "2023 November", year: 2023, section: "both" },
  { id: "2023-dec",     label: "2023 December", year: 2023, section: "both" },
  // 2024
  { id: "2024-march",   label: "2024 March",   year: 2024, section: "both" },
  { id: "2024-may",     label: "2024 May",     year: 2024, section: "both" },
  { id: "2024-june",    label: "2024 June",    year: 2024, section: "both" },
  { id: "2024-aug",     label: "2024 August",  year: 2024, section: "both", tag: "International" },
  { id: "2024-oct",     label: "2024 October", year: 2024, section: "both" },
  { id: "2024-nov",     label: "2024 November", year: 2024, section: "both" },
  { id: "2024-dec",     label: "2024 December", year: 2024, section: "both" },
  // 2025
  { id: "2025-march",   label: "2025 March",   year: 2025, section: "both" },
  { id: "2025-may",     label: "2025 May",     year: 2025, section: "both" },
  { id: "2025-june",    label: "2025 June",    year: 2025, section: "both" },
  { id: "2025-aug",     label: "2025 August",  year: 2025, section: "both", tag: "International" },
  { id: "2025-sep",     label: "2025 September", year: 2025, section: "both" },
  { id: "2025-oct",     label: "2025 October", year: 2025, section: "both" },
  { id: "2025-nov-int", label: "2025 November", year: 2025, section: "both", tag: "International" },
  { id: "2025-nov-us",  label: "2025 November", year: 2025, section: "both", tag: "US" },
  { id: "2025-dec-int", label: "2025 December", year: 2025, section: "both", tag: "International" },
  { id: "2025-dec-us",  label: "2025 December", year: 2025, section: "both", tag: "US" },
];

// BlueBook official practice tests (8 official SAT digital practice tests)
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
  { id: "mock-1", label: "Full SAT Mock 1", sections: "RW + Math", duration: "2h 14min", desc: "Both sections in order, adaptive difficulty, scored." },
  { id: "mock-2", label: "Full SAT Mock 2", sections: "RW + Math", duration: "2h 14min", desc: "Different question set, same full-test simulation." },
  { id: "mock-3", label: "Full SAT Mock 3", sections: "RW + Math", duration: "2h 14min", desc: "Timed, strict — best for a real test day rehearsal." },
  { id: "mock-math", label: "Math Only Mock", sections: "Math", duration: "70 min", desc: "Modules 1 & 2, adaptive difficulty, full scoring." },
  { id: "mock-rw",   label: "RW Only Mock",  sections: "Reading & Writing", duration: "64 min", desc: "Both RW modules, fully timed and scored." },
];

const REG_STEPS = [
  "Go to collegeboard.org and sign in or create a free account.",
  "Navigate to SAT → Register for the SAT.",
  "Choose your target test date and nearest test center.",
  "Complete personal information and upload your ID photo.",
  "Pay the registration fee ($111 USD for Uzbekistan residents).",
  "Download your admission ticket 2 weeks before the test.",
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

function generateSatPlan(scores, examDate) {
  const domains = [...RW_DOMAINS, ...MATH_DOMAINS];
  const ranked  = [...domains]
    .map((d) => ({ ...d, level: scores[d.key] ?? 0 }))
    .sort((a, b) => a.level - b.level);

  const daysLeft = Math.max(7, Math.floor((examDate - new Date()) / 86400000));
  const weeks    = Math.min(8, Math.floor(daysLeft / 7));

  const plan = [];
  for (let w = 0; w < weeks; w++) {
    const isLast = w === weeks - 1;
    if (isLast) {
      plan.push({ week: w + 1, focus: "Full Review + Timed Mock", type: "review",
        tasks: ["Complete 2 full-length practice tests", "Review every missed question", "Final weak-spot drill session"] });
    } else if (w < 2) {
      plan.push({ week: w + 1, focus: `Priority: ${ranked[0]?.label}`, type: "intensive",
        tasks: [`Deep dive — ${ranked[0]?.label} (3 sessions)`, `Drill — ${ranked[1]?.label} (2 sessions)`, "1 timed section practice"] });
    } else {
      const idx = (w - 2) % 3;
      plan.push({ week: w + 1, focus: `Build: ${ranked[2 + idx]?.label}`, type: "build",
        tasks: [`Master — ${ranked[2 + idx]?.label} (2 sessions)`, `Reinforce — ${ranked[0]?.label} (1 session)`, "Mixed 30-min daily question bank"] });
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
      {/* Grid */}
      {[-2,-1,0,1,2,3,4,5].map((x) => { const [gx] = sv(x,0); return <line key={`gx${x}`} x1={gx} y1={0} x2={gx} y2={H} className="satQGGrid" />; })}
      {[-8,-6,-4,-2,0,2,4,6,8].map((y) => { const [,gy] = sv(0,y); return <line key={`gy${y}`} x1={0} y1={gy} x2={W} y2={gy} className="satQGGrid" />; })}

      {/* Axes */}
      <line x1={0} y1={oy} x2={W} y2={oy} className="satQGAxis" />
      <line x1={ox} y1={0} x2={ox} y2={H} className="satQGAxis" />
      <polygon points={`${W},${oy} ${W-8},${oy-4} ${W-8},${oy+4}`} className="satQGArrow" />
      <polygon points={`${ox},0 ${ox-4},8 ${ox+4},8`} className="satQGArrow" />
      <text x={W-10} y={oy-9} className="satQGAxisLbl">x</text>
      <text x={ox+7} y={13} className="satQGAxisLbl">y</text>

      {/* Tick numbers */}
      {[-1,1,2,3,4].map((x) => { const [gx] = sv(x,0); return <text key={x} x={gx} y={oy+16} className="satQGTick" textAnchor="middle">{x}</text>; })}
      {[-6,-4,-2,2,4,6].map((y) => { const [,gy] = sv(0,y); return <text key={y} x={ox-6} y={gy+4} className="satQGTick" textAnchor="end">{y}</text>; })}

      {/* Parabola */}
      <path d={`M ${pts.join(" L ")}`} className="satQGParabola" />

      {/* Active annotations */}
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

export default function SatPage({ onLoginClick, onNavClick }) {
  const nextExam  = getNextSatDate();
  const countdown = useCountdown(nextExam);

  // Topic steps auto-advance
  const [topicRef, topicVisible] = useVisible(0.2);
  const [graphRef, graphVisible] = useVisible(0.25);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!topicVisible) return;
    const id = setInterval(() => setActiveStep((s) => (s + 1) % SAT_STEPS.length), 4500);
    return () => clearInterval(id);
  }, [topicVisible]);

  // Score Push
  const initScores = Object.fromEntries([...RW_DOMAINS, ...MATH_DOMAINS].map((d) => [d.key, 2]));
  const [scores, setScores]       = useState(initScores);
  const [plan, setPlan]           = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Past tests
  const [pastYearFilter, setPastYearFilter] = useState("all");
  const [pastSectionFilter, setPastSectionFilter] = useState("both");
  const [pastExpanded, setPastExpanded]     = useState(false);
  const [openMock, setOpenMock]             = useState(null);
  const [openBluebook, setOpenBluebook]     = useState(null);

  const filteredPast = SAT_PAST_TESTS.filter((t) =>
    (pastYearFilter === "all" || String(t.year) === pastYearFilter)
  );
  const visiblePast = pastExpanded ? filteredPast : filteredPast.slice(0, 8);

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setPlan(generateSatPlan(scores, nextExam));
      setAnalyzing(false);
    }, 1600);
  };

  // Registration
  const [regStep, setRegStep] = useState(0);

  return (
    <section className="examPage satExamPage">
      <PublicHeader onLoginClick={onLoginClick} onNavClick={onNavClick} currentView="sat" />

      {/* ── Hero ── */}
      <section className="examHero" id="top">
        <div className="examHeroInner">
          <div className="examHeroCopy" data-aos="fade-up">
            <span className="examHeroBadge satBadge">SAT Preparation</span>
            <h1 className="examHeroTitle">
              Master the SAT.<br />
              <span className="examHeroHighlight">Score 1600.</span>
            </h1>
            <p className="examHeroDesc">
              Structured topic-by-topic training, real official materials, and AI-powered
              performance analysis — everything you need to reach the top percentile.
            </p>
            <div className="examHeroActions">
              <button className="landingHeroPrimary" onClick={onLoginClick}>Start Preparing</button>
              <a className="landingHeroGhost" href="#scorePush">Analyze My Score</a>
            </div>
          </div>

          <div className="examHeroStats" data-aos="fade-left" data-aos-delay="120">
            <div className="examHeroStat"><span className="examHeroStatNum">1600</span><span className="examHeroStatLbl">Max Score</span></div>
            <div className="examHeroStatDiv" />
            <div className="examHeroStat"><span className="examHeroStatNum">2</span><span className="examHeroStatLbl">Sections</span></div>
            <div className="examHeroStatDiv" />
            <div className="examHeroStat"><span className="examHeroStatNum">98 min</span><span className="examHeroStatLbl">Total Time</span></div>
          </div>
        </div>
      </section>

      {/* ── Topic Learning ── */}
      <section className="examTopicSection" ref={topicRef}>
        <div className="examTopicShell">
          <div className="examTopicIntro" data-aos="fade-up">
            <p className="landingSectionLabel">How We Teach</p>
            <h2 className="examTopicH2">SAT Math: Quadratic Functions</h2>
            <p className="examTopicDesc">
              See how we break down a full SAT topic — from the visual graph to the formulas
              to exam technique — in three clear steps.
            </p>
          </div>

          <div className="examTopicBody">
            {/* Graph + Formulas */}
            <div className="examTopicLeft" ref={graphRef} data-aos="fade-right" data-aos-duration="900">
              <div className="satGraphCard">
                <div className="satGraphCardTop">
                  <span className="satGraphCardLabel">f(x) = x² − 3x − 4</span>
                  <span className="satGraphCardSub">Interactive annotation</span>
                </div>
                <QuadraticGraph active={graphVisible} />
              </div>

              <div className="satFormulaList">
                {SAT_FORMULAS.map((f, i) => (
                  <div
                    key={f.label}
                    className={`satFormulaItem${graphVisible ? " satFVisible" : ""}`}
                    style={{ transitionDelay: `${i * 160 + 280}ms` }}
                  >
                    <div className="satFormulaLabel" style={{ color: f.color }}>{f.label}</div>
                    <div className="satFormulaExpr" style={{ borderLeftColor: f.color }}>{f.expr}</div>
                    <div className="satFormulaNotes">{f.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="examTopicRight" data-aos="fade-left" data-aos-duration="900">
              <div className="examStepTrack">
                {SAT_STEPS.map((s, i) => (
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
                <div className="examStepProgressFill" style={{ width: `${((activeStep + 1) / SAT_STEPS.length) * 100}%` }} />
              </div>
              <p className="examStepNote">Auto-advances every 4.5 s · Click any step to jump</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Score Push ── */}
      <section className="examScoreSection" id="scorePush">
        <div className="examScoreShell">
          <div className="examScoreIntro" data-aos="fade-up">
            <p className="landingSectionLabel">Score Rush</p>
            <h2 className="examScoreH2">
              Enter your score report.<br />
              <span className="examScoreHighlight">AI builds your battle plan.</span>
            </h2>
            <p className="examScoreDesc">
              Your SAT score report shows exactly where you lost points. Select the performance
              level for each domain — AI maps the path to 1600 with a week-by-week plan.
            </p>
          </div>

          <div className="examScoreBody" data-aos="fade-up" data-aos-delay="60">
            {/* Countdown */}
            <div className="examTimerCard">
              <p className="examTimerCardLabel">Next SAT (O'zbekiston vaqti)</p>
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

            {/* Score inputs */}
            <div className="examScoreInputCard">
              {[{ label: "Reading & Writing", domains: RW_DOMAINS }, { label: "Math", domains: MATH_DOMAINS }].map((sec) => (
                <div key={sec.label} className="examScoreSection_">
                  <div className="examScoreSectionLbl">{sec.label}</div>
                  <div className="examScoreGrid">
                    {sec.domains.map((d) => (
                      <div key={d.key} className="examScoreRow">
                        <span className="examScoreDomainLbl">{d.label}</span>
                        <div className="examPerfBtns">
                          {PERF_LEVELS.map((lvl, li) => (
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
                {analyzing
                  ? <><span className="examSpinner" /> Analyzing…</>
                  : "Generate My Study Plan →"}
              </button>
            </div>
          </div>

          {/* Plan result */}
          {plan && (
            <div className="examPlanCard" data-aos="fade-up">
              <div className="examPlanHead">
                <div>
                  <h3 className="examPlanTitle">Your AI Study Plan</h3>
                  <p className="examPlanSub">{plan.daysLeft} days until SAT · {plan.weakest.length} priority areas</p>
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
                      <span className="examPlanWeekNum">Week {wk.week}</span>
                      <span className="examPlanWeekFocus">{wk.focus}</span>
                    </div>
                    <ul className="examPlanTasks">
                      {wk.tasks.map((t, i) => (
                        <li key={i} className="examPlanTask"><span className="examPlanTaskDot" />{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Registration ── */}
      <section className="examRegSection">
        <div className="examRegShell" data-aos="fade-up">
          <div className="examRegIntro">
            <p className="landingSectionLabel">Registration Help</p>
            <h2 className="examRegH2">Register for your SAT — step by step.</h2>
            <p className="examRegDesc">
              The College Board registration takes about 15 minutes.
              Follow each step below, then open the official page.
            </p>
          </div>

          <div className="examRegBody">
            <div className="examRegSteps">
              {REG_STEPS.map((step, i) => (
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
                <p className="examRegCurrentLabel">Current step</p>
                <p className="examRegCurrentText">{REG_STEPS[regStep]}</p>
              </div>
              <div className="examRegNav">
                <button className="examRegNavBtn" disabled={regStep === 0} onClick={() => setRegStep((s) => s - 1)}>← Back</button>
                <span className="examRegNavCount">{regStep + 1} / {REG_STEPS.length}</span>
                <button className="examRegNavBtn" disabled={regStep === REG_STEPS.length - 1} onClick={() => setRegStep((s) => s + 1)}>Next →</button>
              </div>
              <a
                className="examRegCTA satRegCTA"
                href="https://satsuite.collegeboard.org/sat/registration"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open College Board Registration ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Past Tests carousel ── */}
      <section className="examCarouselSection" id="past-tests">
        <div className="examCarouselShell">
          <div className="examCarouselIntro" data-aos="fade-up">
            <p className="landingSectionLabel">Official Past Papers</p>
            <h2 className="examCarouselH2">Every Digital SAT — March 2023 Onwards</h2>
            <p className="examCarouselDesc">All real SAT sessions since the digital transition. Hover to pause, drag to browse.</p>
          </div>

          {/* Year filter */}
          <div className="examCarouselFilters" data-aos="fade-up">
            {["all","2023","2024","2025"].map((yr) => (
              <button key={yr}
                className={`examTestsFilterBtn${pastYearFilter === yr ? " examTestsFilterBtnActive" : ""}`}
                onClick={() => setPastYearFilter(yr)}>
                {yr === "all" ? "All Years" : yr}
                {yr !== "all" && <span className="examTestsFilterCount">{SAT_PAST_TESTS.filter((t) => String(t.year) === yr).length}</span>}
              </button>
            ))}
          </div>
        </div>

        <TestCarousel
          items={filteredPast}
          speed={70}
          renderCard={(t) => (
            <div className="tcCard tcCardSat">
              <div className="tcCardMeta">
                <span className="tcCardMetaLabel">{t.year}</span>
                {t.tag && <span className="tcCardTag">{t.tag}</span>}
              </div>
              <div className="tcCardTitle">{t.label}</div>
              <div className="tcCardBtns">
                <button className="tcCardBtnMath">Math</button>
                <button className="tcCardBtnRw">RW</button>
              </div>
            </div>
          )}
        />
      </section>

      {/* ── BlueBook carousel ── */}
      <section className="examCarouselSection">
        <div className="examCarouselShell">
          <div className="examCarouselIntro" data-aos="fade-up">
            <p className="landingSectionLabel">Official Practice Tests</p>
            <h2 className="examCarouselH2">College Board BlueBook Tests</h2>
            <p className="examCarouselDesc">8 official full-length digital SAT practice tests — taken directly inside Lumea.</p>
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
              <button
                className="tcCardBtn"
                style={{ background: "rgba(39,98,192,0.09)", color: "#2762C0" }}
                onClick={onClick}
              >
                Start Test →
              </button>
            </div>
          )}
        />
      </section>

      {/* ── Mock Tests carousel ── */}
      <section className="examCarouselSection">
        <div className="examCarouselShell">
          <div className="examCarouselIntro" data-aos="fade-up">
            <p className="landingSectionLabel">Exam Simulation</p>
            <h2 className="examCarouselH2">Full SAT Mock Tests</h2>
            <p className="examCarouselDesc">Timed, adaptive, scored. Hover to pause · drag to browse.</p>
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
              <button className="tcCardBtn" onClick={() => setOpenMock(m)}>Start Mock →</button>
            </div>
          )}
          onCardClick={(m) => setOpenMock(m)}
        />
      </section>

      <PublicFooter onLoginClick={onLoginClick} onNavClick={onNavClick} />

      {/* Mock coming-soon modal */}
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
              <p style={{ marginTop: 8, color: "#a8b1b8", fontSize: "0.9rem" }}>This test is being integrated into Lumea. Sign up to be notified when it launches.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="examAnalyzeBtn" onClick={onLoginClick}>Sign Up Free</button>
                <button className="examRegNavBtn" onClick={() => setOpenBluebook(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <p style={{ marginTop: 8, color: "#a8b1b8", fontSize: "0.9rem" }}>Full adaptive test engine coming soon. Sign up to be notified.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="examAnalyzeBtn" onClick={onLoginClick}>Sign Up Free</button>
                <button className="examRegNavBtn" onClick={() => setOpenMock(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
