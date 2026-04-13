import { useEffect, useRef, useState } from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";
import TestCarousel from "./TestCarousel";

// ── Data ───────────────────────────────────────────────────────────────────

const IELTS_SKILLS = [
  { key: "listening", label: "Listening" },
  { key: "reading",   label: "Reading" },
  { key: "writing",   label: "Writing" },
  { key: "speaking",  label: "Speaking" },
];

const SKILL_COLORS = {
  listening: "#0EA5E9",
  reading:   "#10B981",
  writing:   "#F59E0B",
  speaking:  "#8B5CF6",
};

const IELTS_CRITERIA = [
  { label: "Task Response (TR)",              expr: "Fully address all parts · Clear position · Developed ideas", note: "Band 9: fully addresses all requirements with well-developed ideas.", color: "#0EA5E9" },
  { label: "Coherence & Cohesion (CC)",       expr: "Logical organisation · Paragraphing · Cohesive devices",   note: "Band 9: cohesion is used naturally and with sophistication.",      color: "#10B981" },
  { label: "Lexical Resource (LR)",           expr: "Range · Precision · Collocation · Word formation",          note: "Band 9: wide vocabulary range with very natural, sophisticated control.", color: "#F59E0B" },
  { label: "Grammatical Range & Accuracy (GRA)", expr: "Complex structures · Flexibility · Error-free sentences", note: "Band 9: wide range of structures; virtually error-free.",            color: "#8B5CF6" },
];

const IELTS_STEPS = [
  { n: 1, title: "Understand the Band Descriptors", desc: "Every IELTS examiner uses the same 4-criterion rubric. Know exactly what Band 7, 8, and 9 require before writing a single word.", hint: "Most students lose marks on Coherence & Cohesion, not vocabulary." },
  { n: 2, title: "Structure Your Task Response",     desc: "Task 2: Intro (paraphrase + thesis) → Body 1 → Body 2 → Conclusion. One central idea per paragraph with a developed explanation and example.", hint: "Spend 5 minutes planning. It almost always produces a higher band score." },
  { n: 3, title: "Apply Band 9 Language Patterns",   desc: "Varied complex sentences, precise vocabulary, accurate cohesive devices. Avoid memorised phrases — examiners penalise them.", hint: "Practice writing the same idea 3 ways to build real lexical range." },
];

const REG_STEPS = [
  "Choose British Council, IDP, or IELTS.org for online registration.",
  "Create an account on your chosen platform.",
  "Select Computer-delivered or Paper-based IELTS.",
  "Pick your test date and nearest test centre in Uzbekistan.",
  "Complete personal information and ID details.",
  "Pay the registration fee and confirm your booking ($210-240).",
  "Download your confirmation and prepare your ID for test day.",
];

// 50 IELTS practice tests (10 per section × 5 rounds grouped by skill)
const IELTS_PAST_TESTS = Array.from({ length: 50 }, (_, i) => {
  const n = i + 1;
  const skill = IELTS_SKILLS[i % 4];
  return {
    id: `ielts-test-${n}`,
    label: `Test ${n}`,
    skill: skill.key,
    skillLabel: skill.label,
    duration: skill.key === "listening" ? "30 min" : skill.key === "reading" ? "60 min" : skill.key === "writing" ? "60 min" : "15 min",
    // First two listening/reading link to actual files
    file: n === 1 ? "/tests/ielts-listening-1.html" : n === 2 ? "/tests/ielts-reading-1.html" : null,
  };
});

const IELTS_MOCKS = [
  { id: "mock-1", label: "Full Mock Test 1", skills: "L + R + W + S", duration: "2h 45min", description: "All four sections in sequence. Exam conditions." },
  { id: "mock-2", label: "Full Mock Test 2", skills: "L + R + W + S", duration: "2h 45min", description: "All four sections in sequence. Exam conditions." },
  { id: "mock-3", label: "Full Mock Test 3", skills: "L + R + W + S", duration: "2h 45min", description: "All four sections in sequence. Exam conditions." },
  { id: "mock-4", label: "Academic Mock 1",  skills: "Academic track", duration: "2h 45min", description: "Academic Writing Task 1 graph + Task 2 essay." },
  { id: "mock-5", label: "General Mock 1",   skills: "General Training", duration: "2h 45min", description: "General Training Writing Task 1 letter + Task 2." },
];

// ── Population Growth Graph data (matching uploaded IELTS sample chart) ────

const GRAPH_DATA = {
  title: "Population Growth",
  years: [1950, 1960, 1990, 2000, 2050],
  series: [
    { label: "0–14",    color: "#2563EB", data: [5, 5, 4, 10, 20] },
    { label: "25–37",   color: "#EA580C", data: [20, 25, 18, 10, 1] },
    { label: "38–45",   color: "#9CA3AF", data: [25, 30, 48, 40, 39] },
    { label: "over 65", color: "#CA8A04", data: [61, 64, 70, 62, 55] },
  ],
};

// ── Utilities ──────────────────────────────────────────────────────────────

function pad2(n) { return String(n).padStart(2, "0"); }

function useVisible(threshold = 0.2) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useCountdown(target) {
  const calc = () => {
    const diff = target - new Date();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return { d: Math.floor(diff / 86400000), h: Math.floor((diff / 3600000) % 24), m: Math.floor((diff / 60000) % 60), s: Math.floor((diff / 1000) % 60) };
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => { const id = setInterval(() => setLeft(calc()), 1000); return () => clearInterval(id); });
  return left;
}

function generateIeltsPlan(scores, examDate) {
  const ranked = [...IELTS_SKILLS].map((s) => ({ ...s, score: scores[s.key] ?? 5.0 })).sort((a, b) => a.score - b.score);
  const daysLeft = Math.max(7, Math.floor((examDate - new Date()) / 86400000));
  const weeks = Math.min(8, Math.floor(daysLeft / 7));
  const plan = [];
  for (let w = 0; w < weeks; w++) {
    const isLast = w === weeks - 1;
    if (isLast) {
      plan.push({ week: w + 1, focus: "Final Mock + Full Review", type: "review", tasks: ["Complete a full 4-skill IELTS mock test", "Review all Writing tasks with band criteria", "Speaking fluency recap session"] });
    } else if (w < 2) {
      plan.push({ week: w + 1, focus: `Priority: ${ranked[0].label}`, type: "intensive", tasks: [`Intensive ${ranked[0].label} training (3 sessions)`, `Drill ${ranked[1].label} strategies (2 sessions)`, "1 full timed section under exam conditions"] });
    } else {
      const idx = (w - 2) % 3;
      plan.push({ week: w + 1, focus: `Build: ${ranked[1 + idx]?.label || ranked[1].label}`, type: "build", tasks: [`${ranked[1 + idx]?.label || ranked[1].label} targeted practice (2 sessions)`, `${ranked[0].label} maintenance drill (1 session)`, "Daily vocabulary & grammar review (20 min)"] });
    }
  }
  return { plan, daysLeft, weakest: ranked.slice(0, 2), overall: (Object.values(scores).reduce((a, b) => a + b, 0) / 4).toFixed(1) };
}

// ── Real IELTS-style Population Growth Chart ───────────────────────────────

function IeltsLineGraph({ active }) {
  const [hovered, setHovered] = useState(null); // { seriesIdx, ptIdx }

  const W = 520, H = 290;
  const PAD = { top: 38, right: 20, bottom: 48, left: 58 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const years = GRAPH_DATA.years;
  const yMax = 80, yMin = 0;
  const ySteps = [0, 10, 20, 30, 40, 50, 60, 70, 80];

  const xOf = (i) => PAD.left + (i / (years.length - 1)) * innerW;
  const yOf = (v) => PAD.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  const makePath = (data) => data.map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(" ");

  // Each series gets its own stroke-dasharray animation via pathLength
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`ieltsRealGraph${active ? " ieltRGActive" : ""}`}
      aria-label="Population Growth IELTS sample line chart"
    >
      {/* Title */}
      <text x={W / 2} y={18} textAnchor="middle" className="ieltsRGTitle">Population Growth</text>

      {/* Y-grid + labels */}
      {ySteps.map((y) => {
        const gy = yOf(y);
        return (
          <g key={y}>
            <line x1={PAD.left} y1={gy} x2={W - PAD.right} y2={gy} className="ieltsRGGrid" />
            <text x={PAD.left - 7} y={gy + 4} textAnchor="end" className="ieltsRGTick">{y}.00%</text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {years.map((yr, i) => (
        <text key={yr} x={xOf(i)} y={PAD.top + innerH + 18} textAnchor="middle" className="ieltsRGTick">{yr}</text>
      ))}

      {/* Axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} className="ieltsRGAxis" />
      <line x1={PAD.left} y1={PAD.top + innerH} x2={W - PAD.right} y2={PAD.top + innerH} className="ieltsRGAxis" />

      {/* Series */}
      {GRAPH_DATA.series.map((s, si) => (
        <g key={s.label}>
          <path
            d={makePath(s.data)}
            fill="none"
            stroke={s.color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            className={`ieltsRGLine${active ? " ieltsRGLineActive" : ""}`}
            style={{ transitionDelay: `${si * 180}ms` }}
          />
          {/* Dots */}
          {s.data.map((v, i) => {
            const isHov = hovered?.si === si && hovered?.pi === i;
            return (
              <circle
                key={i}
                cx={xOf(i)}
                cy={yOf(v)}
                r={isHov ? 6 : 4}
                fill="#F6FAFF"
                stroke={s.color}
                strokeWidth="2"
                className={`ieltsRGDot${active ? " ieltsRGDotActive" : ""}`}
                style={{ transitionDelay: `${si * 180 + i * 60}ms` }}
                onMouseEnter={() => setHovered({ si, pi: i })}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </g>
      ))}

      {/* Hover tooltip */}
      {hovered && (() => {
        const s = GRAPH_DATA.series[hovered.si];
        const v = s.data[hovered.pi];
        const cx = xOf(hovered.pi);
        const cy = yOf(v);
        const bx = Math.min(cx - 34, W - PAD.right - 72);
        const by = Math.max(cy - 44, PAD.top);
        return (
          <g>
            <rect x={bx} y={by} width={72} height={30} rx={6} fill="rgba(23,59,100,0.9)" />
            <text x={bx + 36} y={by + 12} textAnchor="middle" fill="#F6FAFF" fontSize={9} fontWeight={700}>{s.label}</text>
            <text x={bx + 36} y={by + 24} textAnchor="middle" fill="#F6FAFF" fontSize={10} fontWeight={900}>{v}.00%</text>
          </g>
        );
      })()}

      {/* Legend */}
      {GRAPH_DATA.series.map((s, i) => {
        const lx = PAD.left + i * 120;
        const ly = H - 10;
        return (
          <g key={s.label}>
            <line x1={lx} y1={ly} x2={lx + 20} y2={ly} stroke={s.color} strokeWidth="2.2" strokeLinecap="round" />
            <circle cx={lx + 10} cy={ly} r={3.5} fill={s.color} />
            <text x={lx + 26} y={ly + 4} className="ieltsRGLegendTxt">{s.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Test Viewer Modal ──────────────────────────────────────────────────────

function TestViewerModal({ test, onClose }) {
  if (!test) return null;
  return (
    <div className="testViewerOverlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="testViewerShell">
        <div className="testViewerHeader">
          <span className="testViewerTitle">{test.skillLabel} — {test.label}</span>
          <div className="testViewerHeaderRight">
            <span className="testViewerDuration">{test.duration}</span>
            <button className="testViewerClose" onClick={onClose} aria-label="Close test">✕</button>
          </div>
        </div>
        {test.file ? (
          <iframe
            src={test.file}
            className="testViewerFrame"
            title={`${test.skillLabel} ${test.label}`}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        ) : (
          <div className="testViewerComingSoon">
            <div className="testViewerComingSoonIcon">📋</div>
            <h3>Test content coming soon</h3>
            <p>This test will be available once the content is uploaded. Check back shortly.</p>
            <button className="examAnalyzeBtn" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function IeltsPage({ onLoginClick, onNavClick }) {
  const [targetDate, setTargetDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 28); return d; });
  const [dateInput, setDateInput]   = useState(() => { const d = new Date(); d.setDate(d.getDate() + 28); return d.toISOString().slice(0, 10); });
  const countdown = useCountdown(targetDate);

  const [topicRef, topicVisible] = useVisible(0.2);
  const [graphRef, graphVisible] = useVisible(0.25);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!topicVisible) return;
    const id = setInterval(() => setActiveStep((s) => (s + 1) % IELTS_STEPS.length), 4500);
    return () => clearInterval(id);
  }, [topicVisible]);

  // Score Push
  const initScores = Object.fromEntries(IELTS_SKILLS.map((s) => [s.key, 5.0]));
  const [scores, setScores]       = useState(initScores);
  const [plan, setPlan]           = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => { setPlan(generateIeltsPlan(scores, targetDate)); setAnalyzing(false); }, 1600);
  };

  const [regStep, setRegStep] = useState(0);

  // Tests
  const [activeSkillFilter, setActiveSkillFilter] = useState("all");
  const [openTest, setOpenTest]                   = useState(null);
  const [mockTest, setMockTest]                   = useState(null);

  const filteredTests = activeSkillFilter === "all"
    ? IELTS_PAST_TESTS
    : IELTS_PAST_TESTS.filter((t) => t.skill === activeSkillFilter);

  return (
    <section className="examPage ieltsExamPage">
      <PublicHeader onLoginClick={onLoginClick} onNavClick={onNavClick} currentView="ielts" />

      {/* ── Hero ── */}
      <section className="examHero" id="top">
        <div className="examHeroInner">
          <div className="examHeroCopy" data-aos="fade-up">
            <span className="examHeroBadge ieltsBadge">IELTS Preparation</span>
            <h1 className="examHeroTitle">Hit Band 9.<br /><span className="examHeroHighlight ieltsHighlight">All four skills.</span></h1>
            <p className="examHeroDesc">Full preparation for Listening, Reading, Writing, and Speaking — structured to build real language ability and meet the exact band criteria examiners use.</p>
            <div className="examHeroActions">
              <button className="landingHeroPrimary" onClick={onLoginClick}>Start Preparing</button>
              <a className="landingHeroGhost" href="#scorePush">Analyze My Scores</a>
            </div>
          </div>
          <div className="examHeroStats" data-aos="fade-left" data-aos-delay="120">
            <div className="examHeroStat"><span className="examHeroStatNum">9.0</span><span className="examHeroStatLbl">Max Band</span></div>
            <div className="examHeroStatDiv" />
            <div className="examHeroStat"><span className="examHeroStatNum">4</span><span className="examHeroStatLbl">Skills</span></div>
            <div className="examHeroStatDiv" />
            <div className="examHeroStat"><span className="examHeroStatNum">2h 45m</span><span className="examHeroStatLbl">Test Duration</span></div>
          </div>
        </div>
      </section>

      {/* ── Topic Learning ── */}
      <section className="examTopicSection" ref={topicRef}>
        <div className="examTopicShell">
          <div className="examTopicIntro" data-aos="fade-up">
            <p className="landingSectionLabel">How We Teach</p>
            <h2 className="examTopicH2">IELTS Writing Task 1 — Reading a Line Graph</h2>
            <p className="examTopicDesc">A real IELTS Task 1 graph with annotations — exactly what you'll encounter in the exam. Learn to describe trends, compare data, and write a Band 9 overview.</p>
          </div>

          <div className="examTopicBody">
            {/* Graph + Criteria */}
            <div className="examTopicLeft" ref={graphRef} data-aos="fade-right" data-aos-duration="900">
              <div className="ieltsChartCard ieltsRealChartCard">
                <div className="satGraphCardTop">
                  <span className="satGraphCardLabel">IELTS Writing Task 1 Sample</span>
                  <span className="satGraphCardSub">Hover dots for values</span>
                </div>
                <IeltsLineGraph active={graphVisible} />

                <div className="ieltsGraphAnnotations">
                  <div className="ieltsGraphAnnotation">
                    <span className="ieltsGraphAnnotationDot" style={{ background: "#CA8A04" }} />
                    <span><strong>Over 65</strong> — peaked at <strong>70%</strong> in 1990, projected to decline to 55% by 2050</span>
                  </div>
                  <div className="ieltsGraphAnnotation">
                    <span className="ieltsGraphAnnotationDot" style={{ background: "#9CA3AF" }} />
                    <span><strong>38–45</strong> — rose sharply to 48% by 1990, then stabilised around 39–40%</span>
                  </div>
                  <div className="ieltsGraphAnnotation">
                    <span className="ieltsGraphAnnotationDot" style={{ background: "#2563EB" }} />
                    <span><strong>0–14</strong> — remained flat until 2000, then almost quadrupled to 20%</span>
                  </div>
                  <div className="ieltsGraphAnnotation">
                    <span className="ieltsGraphAnnotationDot" style={{ background: "#EA580C" }} />
                    <span><strong>25–37</strong> — fell significantly from 25% to near 1% by 2050</span>
                  </div>
                </div>
              </div>

              <div className="satFormulaList">
                {IELTS_CRITERIA.map((c, i) => (
                  <div key={c.label} className={`satFormulaItem${graphVisible ? " satFVisible" : ""}`} style={{ transitionDelay: `${i * 160 + 280}ms` }}>
                    <div className="satFormulaLabel" style={{ color: c.color }}>{c.label}</div>
                    <div className="satFormulaExpr" style={{ borderLeftColor: c.color }}>{c.expr}</div>
                    <div className="satFormulaNotes">{c.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="examTopicRight" data-aos="fade-left" data-aos-duration="900">
              <div className="examStepTrack">
                {IELTS_STEPS.map((s, i) => (
                  <div key={s.n} className={`examStepItem${i === activeStep ? " examStepActive" : i < activeStep ? " examStepDone" : ""}`} onClick={() => setActiveStep(i)}>
                    <div className="examStepBullet ieltsStepBullet">
                      {i < activeStep ? <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10.5 8.5 15 16 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg> : s.n}
                    </div>
                    <div className="examStepBody">
                      <div className="examStepTitle">{s.title}</div>
                      {i === activeStep && (
                        <>
                          <div className="examStepDesc">{s.desc}</div>
                          <div className="examStepHint ieltsStepHint"><span className="examStepHintDot ieltsHintDot" />{s.hint}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="examStepProgress ieltsStepProgress">
                <div className="examStepProgressFill ieltsStepFill" style={{ width: `${((activeStep + 1) / IELTS_STEPS.length) * 100}%` }} />
              </div>
              <p className="examStepNote">Auto-advances every 4.5 s · Click any step to jump</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Past Tests ── */}
      <section className="examTestsSection" id="past-tests">
        <div className="examTestsShell">
          <div className="examTestsIntro" data-aos="fade-up">
            <p className="landingSectionLabel">Practice Library</p>
            <h2 className="examTestsH2">50 IELTS Practice Tests</h2>
            <p className="examTestsDesc">All four skills covered — Listening, Reading, Writing, and Speaking. Structured exactly like the real exam.</p>
          </div>

          {/* Skill filter tabs */}
          <div className="examTestsFilterRow" data-aos="fade-up">
            {["all", ...IELTS_SKILLS.map((s) => s.key)].map((key) => {
              const label = key === "all" ? "All Skills" : IELTS_SKILLS.find((s) => s.key === key).label;
              return (
                <button
                  key={key}
                  className={`examTestsFilterBtn${activeSkillFilter === key ? " examTestsFilterBtnActive" : ""}`}
                  style={activeSkillFilter === key && key !== "all" ? { "--fc": SKILL_COLORS[key] } : {}}
                  onClick={() => setActiveSkillFilter(key)}
                >
                  {label}
                  {key !== "all" && <span className="examTestsFilterCount">{IELTS_PAST_TESTS.filter((t) => t.skill === key).length}</span>}
                </button>
              );
            })}
          </div>

          <TestCarousel
            items={filteredTests}
            speed={70}
            accent="#F6FAFF"
            onCardClick={(t) => setOpenTest(t)}
            renderCard={(t, onClick) => (
              <div className="tcCard tcCardIelts" style={{ "--tc": SKILL_COLORS[t.skill] }}>
                <div className="tcCardMeta">
                  <span className="tcCardSkillDot" style={{ background: SKILL_COLORS[t.skill] }} />
                  <span className="tcCardMetaLabel">{t.skillLabel}</span>
                  <span className="tcCardDur">{t.duration}</span>
                </div>
                <div className="tcCardTitle">{t.label}</div>
                <button className="tcCardBtnIelts" onClick={t.file ? onClick : onLoginClick}>
                  Start Test
                </button>
              </div>
            )}
          />
        </div>
      </section>

      {/* ── Mock Tests ── */}
      <section className="examMockSection">
        <div className="examMockShell">
          <div className="examMockIntro" data-aos="fade-up">
            <p className="landingSectionLabel">Exam Simulation</p>
            <h2 className="examMockH2">Full IELTS Mock Tests</h2>
            <p className="examMockDesc">Sit a complete IELTS exam under timed, exam-like conditions. All four skills — in sequence — just like the real test day.</p>
          </div>

          <TestCarousel
            items={IELTS_MOCKS}
            speed={50}
            accent="#F6FAFF"
            onCardClick={(m) => setMockTest(m)}
            renderCard={(m, onClick) => (
              <div className="tcCard tcCardMock">
                <div className="tcCardMeta">
                  <span className="tcCardMetaLabel">{m.skills}</span>
                  <span className="tcCardDur">{m.duration}</span>
                </div>
                <div className="tcCardTitle">{m.label}</div>
                <div className="tcCardDesc">{m.description}</div>
                <button className="tcCardBtnMock" onClick={onClick}>Start Mock →</button>
              </div>
            )}
          />
        </div>
      </section>

      {/* ── Score Push ── */}
      <section className="examScoreSection" id="scorePush">
        <div className="examScoreShell">
          <div className="examScoreIntro" data-aos="fade-up">
            <p className="landingSectionLabel">Score Rush</p>
            <h2 className="examScoreH2">Enter your band scores.<br /><span className="examScoreHighlight ieltsScoreHighlight">AI plans your path to Band 9.</span></h2>
            <p className="examScoreDesc">Input your current scores and target exam date. AI maps the exact weekly sessions to maximise your overall band.</p>
          </div>

          <div className="examScoreBody" data-aos="fade-up" data-aos-delay="60">
            {/* Countdown */}
            <div className="examTimerCard ieltsTimerCard">
              <p className="examTimerCardLabel">Your IELTS Exam (O'zbekiston vaqti)</p>
              <p className="examTimerDate">{targetDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              <div className="examTimerUnits">
                {[["d", countdown.d], ["h", countdown.h], ["m", countdown.m], ["s", countdown.s]].map(([u, v]) => (
                  <div className="examTimerUnit" key={u}>
                    <span className="examTimerNum ieltsTimerNum">{pad2(v)}</span>
                    <span className="examTimerUnitLbl">{u}</span>
                  </div>
                ))}
              </div>
              <div className="examTimerTz">UTC+5 · Asia/Tashkent</div>
              <div className="examTimerDateInput">
                <label className="examTimerDateLabel">Set exam date:</label>
                <input type="date" className="examTimerDatePicker" value={dateInput} min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => { setDateInput(e.target.value); if (e.target.value) setTargetDate(new Date(e.target.value)); }} />
              </div>
            </div>

            {/* Score inputs */}
            <div className="examScoreInputCard ieltsScoreInputCard">
              <div className="examScoreSection_">
                <div className="examScoreSectionLbl">Current Band Scores (0.0 – 9.0)</div>
                <div className="ieltsScoreGrid">
                  {IELTS_SKILLS.map((sk) => (
                    <div key={sk.key} className="ieltsScoreRow">
                      <div className="ieltsScoreRowHead">
                        <span className="examScoreDomainLbl">{sk.label}</span>
                        <span className="ieltsScoreVal" style={{ color: SKILL_COLORS[sk.key] }}>{Number(scores[sk.key]).toFixed(1)}</span>
                      </div>
                      <div className="ieltsScoreSliderWrap">
                        <input type="range" min={0} max={9} step={0.5} value={scores[sk.key]} className="ieltsScoreSlider" style={{ "--sc": SKILL_COLORS[sk.key] }}
                          onChange={(e) => setScores((s) => ({ ...s, [sk.key]: parseFloat(e.target.value) }))} />
                        <div className="ieltsSliderLabels">{[0,1,2,3,4,5,6,7,8,9].map((v) => <span key={v} className="ieltsSliderMark">{v}</span>)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="examAnalyzeBtn ieltsAnalyzeBtn" onClick={analyze} disabled={analyzing}>
                {analyzing ? <><span className="examSpinner" /> Analyzing…</> : "Generate My Study Plan →"}
              </button>
            </div>
          </div>

          {plan && (
            <div className="examPlanCard ieltsPlanCard" data-aos="fade-up">
              <div className="examPlanHead">
                <div>
                  <h3 className="examPlanTitle">Your IELTS AI Study Plan</h3>
                  <p className="examPlanSub">{plan.daysLeft} days to exam · Current Overall: <strong>{plan.overall}</strong> · Target: 9.0</p>
                </div>
                <div className="examPlanWeakBadges">
                  {plan.weakest.map((w) => (
                    <span key={w.key} className="examPlanWeakBadge ieltsPlanWeakBadge" style={{ borderColor: SKILL_COLORS[w.key], color: SKILL_COLORS[w.key] }}>{w.label} {Number(w.score).toFixed(1)}</span>
                  ))}
                </div>
              </div>
              <div className="examPlanWeeks">
                {plan.plan.map((wk) => (
                  <div key={wk.week} className={`examPlanWeek examPlanWeek--${wk.type} ieltsWeek--${wk.type}`}>
                    <div className="examPlanWeekHead">
                      <span className="examPlanWeekNum">Week {wk.week}</span>
                      <span className="examPlanWeekFocus">{wk.focus}</span>
                    </div>
                    <ul className="examPlanTasks">
                      {wk.tasks.map((t, i) => <li key={i} className="examPlanTask"><span className="examPlanTaskDot ieltsDot_" />{t}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="examPlanAction">
                <button className="landingHeroPrimary" onClick={onLoginClick}>Go to the Plan →</button>
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
            <h2 className="examRegH2">Register for IELTS — step by step.</h2>
            <p className="examRegDesc">IELTS is offered almost every week in Uzbekistan. Follow the steps, then open the official registration page.</p>
          </div>
          <div className="examRegBody">
            <div className="examRegSteps">
              {REG_STEPS.map((step, i) => (
                <div key={i} className={`examRegStep ieltsRegStep${regStep === i ? " examRegStepActive ieltsRegStepActive" : regStep > i ? " examRegStepDone" : ""}`} onClick={() => setRegStep(i)}>
                  <div className="examRegStepNum ieltsRegStepNum">
                    {regStep > i ? <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10.5 8.5 15 16 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg> : i + 1}
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
              <div className="ieltsRegLinks">
                <a className="examRegCTA ieltsRegCTA" href="https://www.britishcouncil.uz/exam/ielts/dates" target="_blank" rel="noopener noreferrer">British Council Uzbekistan ↗</a>
                <a className="examRegCTA ieltsRegCTASecond" href="https://www.idp.com/uzbekistan/ielts/" target="_blank" rel="noopener noreferrer">IDP Uzbekistan ↗</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter onLoginClick={onLoginClick} onNavClick={onNavClick} />

      {/* Test viewer modal */}
      {(openTest || mockTest) && (
        <TestViewerModal
          test={openTest || { skillLabel: "IELTS Mock", label: mockTest?.label, duration: mockTest?.duration, file: null }}
          onClose={() => { setOpenTest(null); setMockTest(null); }}
        />
      )}
    </section>
  );
}
