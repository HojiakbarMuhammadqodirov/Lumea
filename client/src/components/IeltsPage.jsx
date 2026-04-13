import { useEffect, useRef, useState } from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";
import TestCarousel from "./TestCarousel";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";

// ── Static data (not translated) ───────────────────────────────────────────

const SKILL_COLORS = {
  listening: "#0EA5E9",
  reading:   "#10B981",
  writing:   "#F59E0B",
  speaking:  "#8B5CF6",
};

const SKILL_DURATIONS = {
  listening: "30 min",
  reading:   "60 min",
  writing:   "60 min",
  speaking:  "15 min",
};

// Generated once; skillLabel is resolved from translated skills at render time
const IELTS_PAST_TESTS = Array.from({ length: 50 }, (_, i) => {
  const n = i + 1;
  const keys = ["listening", "reading", "writing", "speaking"];
  const skill = keys[i % 4];
  return {
    id: `ielts-test-${n}`,
    label: `Test ${n}`,
    skill,
    duration: SKILL_DURATIONS[skill],
    file: n === 1 ? "/tests/ielts-listening-1.html" : n === 2 ? "/tests/ielts-reading-1.html" : null,
  };
});

const IELTS_MOCKS = [
  { id: "mock-1", label: "Full Mock Test 1", skills: "L + R + W + S", duration: "2h 45min", description: "All four sections in sequence. Exam conditions." },
  { id: "mock-2", label: "Full Mock Test 2", skills: "L + R + W + S", duration: "2h 45min", description: "All four sections in sequence. Exam conditions." },
  { id: "mock-3", label: "Full Mock Test 3", skills: "L + R + W + S", duration: "2h 45min", description: "All four sections in sequence. Exam conditions." },
  { id: "mock-4", label: "Academic Mock 1",  skills: "Academic track",   duration: "2h 45min", description: "Academic Writing Task 1 graph + Task 2 essay." },
  { id: "mock-5", label: "General Mock 1",   skills: "General Training", duration: "2h 45min", description: "General Training Writing Task 1 letter + Task 2." },
];

const GRAPH_DATA = {
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

function generateIeltsPlan(scores, examDate, skills, planStrings) {
  const ranked = [...skills].map((s) => ({ ...s, score: scores[s.key] ?? 5.0 })).sort((a, b) => a.score - b.score);
  const daysLeft = Math.max(7, Math.floor((examDate - new Date()) / 86400000));
  const weeks = Math.min(8, Math.floor(daysLeft / 7));
  const plan = [];
  for (let w = 0; w < weeks; w++) {
    const isLast = w === weeks - 1;
    if (isLast) {
      plan.push({ week: w + 1, focus: planStrings.finalFocus, type: "review", tasks: planStrings.finalTasks });
    } else if (w < 2) {
      plan.push({ week: w + 1, focus: planStrings.intensiveFocus(ranked[0].label), type: "intensive",
        tasks: planStrings.intensiveTasks(ranked[0].label, ranked[1].label) });
    } else {
      const idx = (w - 2) % 3;
      const a = ranked[1 + idx]?.label || ranked[1].label;
      plan.push({ week: w + 1, focus: planStrings.buildFocus(a), type: "build",
        tasks: planStrings.buildTasks(a, ranked[0].label) });
    }
  }
  return { plan, daysLeft, weakest: ranked.slice(0, 2), overall: (Object.values(scores).reduce((a, b) => a + b, 0) / 4).toFixed(1) };
}

// ── IELTS Line Graph ───────────────────────────────────────────────────────

function IeltsLineGraph({ active }) {
  const [hovered, setHovered] = useState(null);
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

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`ieltsRealGraph${active ? " ieltRGActive" : ""}`} aria-label="Population Growth IELTS sample line chart">
      <text x={W / 2} y={18} textAnchor="middle" className="ieltsRGTitle">Population Growth</text>
      {ySteps.map((y) => {
        const gy = yOf(y);
        return (
          <g key={y}>
            <line x1={PAD.left} y1={gy} x2={W - PAD.right} y2={gy} className="ieltsRGGrid" />
            <text x={PAD.left - 7} y={gy + 4} textAnchor="end" className="ieltsRGTick">{y}.00%</text>
          </g>
        );
      })}
      {years.map((yr, i) => (
        <text key={yr} x={xOf(i)} y={PAD.top + innerH + 18} textAnchor="middle" className="ieltsRGTick">{yr}</text>
      ))}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} className="ieltsRGAxis" />
      <line x1={PAD.left} y1={PAD.top + innerH} x2={W - PAD.right} y2={PAD.top + innerH} className="ieltsRGAxis" />
      {GRAPH_DATA.series.map((s, si) => (
        <g key={s.label}>
          <path d={makePath(s.data)} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            pathLength="1" className={`ieltsRGLine${active ? " ieltsRGLineActive" : ""}`} style={{ transitionDelay: `${si * 180}ms` }} />
          {s.data.map((v, i) => {
            const isHov = hovered?.si === si && hovered?.pi === i;
            return (
              <circle key={i} cx={xOf(i)} cy={yOf(v)} r={isHov ? 6 : 4} fill="#F6FAFF" stroke={s.color} strokeWidth="2"
                className={`ieltsRGDot${active ? " ieltsRGDotActive" : ""}`} style={{ transitionDelay: `${si * 180 + i * 60}ms` }}
                onMouseEnter={() => setHovered({ si, pi: i })} onMouseLeave={() => setHovered(null)} />
            );
          })}
        </g>
      ))}
      {hovered && (() => {
        const s = GRAPH_DATA.series[hovered.si];
        const v = s.data[hovered.pi];
        const cx = xOf(hovered.pi); const cy = yOf(v);
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
      {GRAPH_DATA.series.map((s, i) => {
        const lx = PAD.left + i * 120; const ly = H - 10;
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

function TestViewerModal({ test, onClose, tMocks }) {
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
          <iframe src={test.file} className="testViewerFrame" title={`${test.skillLabel} ${test.label}`} sandbox="allow-scripts allow-same-origin allow-forms" />
        ) : (
          <div className="testViewerComingSoon">
            <div className="testViewerComingSoonIcon">📋</div>
            <h3>{tMocks.comingSoonTitle}</h3>
            <p>{tMocks.comingSoonDesc}</p>
            <button className="examAnalyzeBtn" onClick={onClose}>{tMocks.close}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function IeltsPage({ onLoginClick, onNavClick }) {
  const { lang } = useLanguage();
  const t = translations[lang].ielts;

  const [targetDate, setTargetDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 28); return d; });
  const [dateInput, setDateInput]   = useState(() => { const d = new Date(); d.setDate(d.getDate() + 28); return d.toISOString().slice(0, 10); });
  const countdown = useCountdown(targetDate);

  const [topicRef, topicVisible] = useVisible(0.2);
  const [graphRef, graphVisible] = useVisible(0.25);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!topicVisible) return;
    const id = setInterval(() => setActiveStep((s) => (s + 1) % t.steps.length), 4500);
    return () => clearInterval(id);
  }, [topicVisible, t.steps.length]);

  const initScores = Object.fromEntries(t.skills.map((s) => [s.key, 5.0]));
  const [scores, setScores]       = useState(initScores);
  const [plan, setPlan]           = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => { setPlan(generateIeltsPlan(scores, targetDate, t.skills, t.plan)); setAnalyzing(false); }, 1600);
  };

  const [regStep, setRegStep] = useState(0);
  const [activeSkillFilter, setActiveSkillFilter] = useState("all");
  const [openTest, setOpenTest] = useState(null);
  const [mockTest, setMockTest] = useState(null);

  const filteredTests = activeSkillFilter === "all"
    ? IELTS_PAST_TESTS
    : IELTS_PAST_TESTS.filter((t_) => t_.skill === activeSkillFilter);

  // Resolve translated skill label by key
  const skillLabel = (key) => t.skills.find((s) => s.key === key)?.label ?? key;

  return (
    <section className="examPage ieltsExamPage">
      <PublicHeader onLoginClick={onLoginClick} onNavClick={onNavClick} currentView="ielts" />

      {/* ── Hero ── */}
      <section className="examHero" id="top">
        <div className="examHeroInner">
          <div className="examHeroCopy" data-aos="fade-up">
            <span className="examHeroBadge ieltsBadge">{t.badge}</span>
            <h1 className="examHeroTitle">{t.hero.title1}<br /><span className="examHeroHighlight ieltsHighlight">{t.hero.title2}</span></h1>
            <p className="examHeroDesc">{t.hero.desc}</p>
            <div className="examHeroActions">
              <button className="landingHeroPrimary" onClick={onLoginClick}>{t.hero.cta}</button>
              <a className="landingHeroGhost" href="#scorePush">{t.hero.ctaSecondary}</a>
            </div>
          </div>
          <div className="examHeroStats" data-aos="fade-left" data-aos-delay="120">
            <div className="examHeroStat"><span className="examHeroStatNum">9.0</span><span className="examHeroStatLbl">{t.hero.maxBand}</span></div>
            <div className="examHeroStatDiv" />
            <div className="examHeroStat"><span className="examHeroStatNum">4</span><span className="examHeroStatLbl">{t.hero.skills}</span></div>
            <div className="examHeroStatDiv" />
            <div className="examHeroStat"><span className="examHeroStatNum">2h 45m</span><span className="examHeroStatLbl">{t.hero.testDuration}</span></div>
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
              <div className="ieltsChartCard ieltsRealChartCard">
                <div className="satGraphCardTop">
                  <span className="satGraphCardLabel">{t.topic.graphLabel}</span>
                  <span className="satGraphCardSub">{t.topic.graphSub}</span>
                </div>
                <IeltsLineGraph active={graphVisible} />
                <div className="ieltsGraphAnnotations">
                  {t.annotations.map((ann) => (
                    <div key={ann.colorKey} className="ieltsGraphAnnotation">
                      <span className="ieltsGraphAnnotationDot" style={{ background: ann.colorKey }} />
                      <span><strong>{ann.bold}</strong>{ann.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="satFormulaList">
                {t.criteria.map((c, i) => (
                  <div key={c.label} className={`satFormulaItem${graphVisible ? " satFVisible" : ""}`} style={{ transitionDelay: `${i * 160 + 280}ms` }}>
                    <div className="satFormulaLabel" style={{ color: c.color }}>{c.label}</div>
                    <div className="satFormulaExpr" style={{ borderLeftColor: c.color }}>{c.expr}</div>
                    <div className="satFormulaNotes">{c.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="examTopicRight" data-aos="fade-left" data-aos-duration="900">
              <div className="examStepTrack">
                {t.steps.map((s, i) => (
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
                <div className="examStepProgressFill ieltsStepFill" style={{ width: `${((activeStep + 1) / t.steps.length) * 100}%` }} />
              </div>
              <p className="examStepNote">{t.topic.autoNote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Past Tests ── */}
      <section className="examTestsSection" id="past-tests">
        <div className="examTestsShell">
          <div className="examTestsIntro" data-aos="fade-up">
            <p className="landingSectionLabel">{t.pastTests.label}</p>
            <h2 className="examTestsH2">{t.pastTests.heading}</h2>
            <p className="examTestsDesc">{t.pastTests.desc}</p>
          </div>

          <div className="examTestsFilterRow" data-aos="fade-up">
            {["all", ...t.skills.map((s) => s.key)].map((key) => {
              const label = key === "all" ? t.pastTests.allSkills : skillLabel(key);
              return (
                <button
                  key={key}
                  className={`examTestsFilterBtn${activeSkillFilter === key ? " examTestsFilterBtnActive" : ""}`}
                  style={activeSkillFilter === key && key !== "all" ? { "--fc": SKILL_COLORS[key] } : {}}
                  onClick={() => setActiveSkillFilter(key)}
                >
                  {label}
                  {key !== "all" && <span className="examTestsFilterCount">{IELTS_PAST_TESTS.filter((p) => p.skill === key).length}</span>}
                </button>
              );
            })}
          </div>

          <TestCarousel
            items={filteredTests}
            speed={70}
            accent="#F6FAFF"
            onCardClick={(item) => setOpenTest(item)}
            renderCard={(item, onClick) => (
              <div className="tcCard tcCardIelts" style={{ "--tc": SKILL_COLORS[item.skill] }}>
                <div className="tcCardMeta">
                  <span className="tcCardSkillDot" style={{ background: SKILL_COLORS[item.skill] }} />
                  <span className="tcCardMetaLabel">{skillLabel(item.skill)}</span>
                  <span className="tcCardDur">{item.duration}</span>
                </div>
                <div className="tcCardTitle">{item.label}</div>
                <button className="tcCardBtnIelts" onClick={item.file ? onClick : onLoginClick}>
                  {t.pastTests.startTest}
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
            <p className="landingSectionLabel">{t.mocks.label}</p>
            <h2 className="examMockH2">{t.mocks.heading}</h2>
            <p className="examMockDesc">{t.mocks.desc}</p>
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
                <button className="tcCardBtnMock" onClick={onClick}>{t.mocks.start}</button>
              </div>
            )}
          />
        </div>
      </section>

      {/* ── Score Push ── */}
      <section className="examScoreSection" id="scorePush">
        <div className="examScoreShell">
          <div className="examScoreIntro" data-aos="fade-up">
            <p className="landingSectionLabel">{t.score.label}</p>
            <h2 className="examScoreH2">{t.score.heading1}<br /><span className="examScoreHighlight ieltsScoreHighlight">{t.score.heading2}</span></h2>
            <p className="examScoreDesc">{t.score.desc}</p>
          </div>

          <div className="examScoreBody" data-aos="fade-up" data-aos-delay="60">
            <div className="examTimerCard ieltsTimerCard">
              <p className="examTimerCardLabel">{t.score.timerLabel}</p>
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
                <label className="examTimerDateLabel">{t.score.setDate}</label>
                <input type="date" className="examTimerDatePicker" value={dateInput} min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => { setDateInput(e.target.value); if (e.target.value) setTargetDate(new Date(e.target.value)); }} />
              </div>
            </div>

            <div className="examScoreInputCard ieltsScoreInputCard">
              <div className="examScoreSection_">
                <div className="examScoreSectionLbl">{t.score.bandScores}</div>
                <div className="ieltsScoreGrid">
                  {t.skills.map((sk) => (
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
                {analyzing ? <><span className="examSpinner" /> {t.score.analyzing}</> : t.score.analyze}
              </button>
            </div>
          </div>

          {plan && (
            <div className="examPlanCard ieltsPlanCard" data-aos="fade-up">
              <div className="examPlanHead">
                <div>
                  <h3 className="examPlanTitle">{t.score.planTitle}</h3>
                  <p className="examPlanSub">{plan.daysLeft} {t.score.daysToExam} · {t.score.currentOverall} <strong>{plan.overall}</strong> · {t.score.target}</p>
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
                      <span className="examPlanWeekNum">{t.score.weekLabel} {wk.week}</span>
                      <span className="examPlanWeekFocus">{wk.focus}</span>
                    </div>
                    <ul className="examPlanTasks">
                      {wk.tasks.map((task, i) => <li key={i} className="examPlanTask"><span className="examPlanTaskDot ieltsDot_" />{task}</li>)}
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
                <p className="examRegCurrentLabel">{t.registration.currentStep}</p>
                <p className="examRegCurrentText">{t.registration.steps[regStep]}</p>
              </div>
              <div className="examRegNav">
                <button className="examRegNavBtn" disabled={regStep === 0} onClick={() => setRegStep((s) => s - 1)}>{t.registration.back}</button>
                <span className="examRegNavCount">{regStep + 1} / {t.registration.steps.length}</span>
                <button className="examRegNavBtn" disabled={regStep === t.registration.steps.length - 1} onClick={() => setRegStep((s) => s + 1)}>{t.registration.next}</button>
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
          test={openTest
            ? { ...openTest, skillLabel: skillLabel(openTest.skill) }
            : { skillLabel: "IELTS Mock", label: mockTest?.label, duration: mockTest?.duration, file: null }}
          onClose={() => { setOpenTest(null); setMockTest(null); }}
          tMocks={t.mocks}
        />
      )}
    </section>
  );
}
