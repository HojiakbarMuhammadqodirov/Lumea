import { useState } from "react";
import { Card, Card2, SLabel, PBar, Sep, IconBox, Row, Tag, BtnPrimary, BtnGhost, ActivityBars, CountdownBoxes, Grid } from "../UI";
import { ScoreModal, DateModal } from "../Modals";
import { useApp } from "../useApp";
import { useLanguage } from "../../context/LanguageContext";
import { dashT } from "../../i18n/translations";

function RobotMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F6FAFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="8" width="10" height="9" rx="2" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2M12 17v3M8.5 20h7" />
      <circle cx="10" cy="12" r=".6" fill="#F6FAFF" />
      <circle cx="14" cy="12" r=".6" fill="#F6FAFF" />
    </svg>
  );
}

export default function HomePage({ onNav, onStartTest }) {
  const { user, examDate, courses, tests, weakTopics, activity, activityDays, todayIndex, showToast } = useApp();
  const { lang } = useLanguage();
  const t = dashT[lang].home;
  const [modal, setModal] = useState(null);
  const totalMins = activity.reduce((a, b) => a + b, 0);

  let nextLesson = null;
  outer: for (const c of courses) {
    for (const l of c.lessons || []) {
      if (!l.done) { nextLesson = { title: l.title, courseLabel: c.label, icon: c.icon, color: c.color, dur: l.dur }; break outer; }
    }
  }

  return (
    <>
      {modal === "score" && <ScoreModal onClose={() => setModal(null)} />}
      {modal === "date" && <DateModal onClose={() => setModal(null)} />}

      <div className="grid grid-cols-3 gap-4">
        <Card className="flex flex-col gap-3">
          <SLabel>{t.todayTask}</SLabel>
          <Card2 className="flex items-center gap-3 p-3!">
            {nextLesson ? (
              <>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shrink-0"
                  style={{ background: nextLesson.color + "22", color: nextLesson.color }}>
                  {nextLesson.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#173B64]">{nextLesson.title}</div>
                  <div className="text-xs text-[#9EB3C8] mt-0.5">{nextLesson.courseLabel} · {nextLesson.dur} {t.minutes}</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-bold text-base shrink-0">✓</div>
                <div className="text-sm text-[#9EB3C8]">{t.allDone}</div>
              </>
            )}
          </Card2>
          <BtnPrimary onClick={() => onNav("lessons")}>{t.startLesson}</BtnPrimary>
        </Card>

        <Card>
          <SLabel>{t.untilExam}</SLabel>
          <CountdownBoxes examDate={examDate} />
          <BtnGhost onClick={() => setModal("date")} className="text-xs mt-1">{t.changeDate}</BtnGhost>
        </Card>

        <Card>
          <SLabel>{t.targetScores}</SLabel>
          <div className="flex gap-2 mb-3">
            <TargetBox label="SAT" value={user.sat.target} current={user.sat.current} accent="#2563EB" nowLabel={t.now} />
            <TargetBox label="IELTS" value={user.ielts.target.toFixed(1)} current={user.ielts.current.toFixed(1)} accent="#0F9E6A" nowLabel={t.now} />
          </div>
          <BtnGhost onClick={() => setModal("score")} className="text-xs">{t.editGoal}</BtnGhost>
        </Card>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SLabel className="mb-0!">{t.courseProgress}</SLabel>
            <TextBtn onClick={() => onNav("lessons")}>{t.all}</TextBtn>
          </div>
          {courses.map((c, i) => {
            const isSat = c.id === "sat-math" || c.id === "sat-english";
            const level = isSat ? getSatLevel(c.pct) : null;
            return (
              <Row key={c.id} noBorder={i === courses.length - 1}>
                <IconBox icon={c.icon} color={c.color} glow={c.glow} size={34} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-[#173B64]">{c.label}</span>
                    <span className="text-xs font-bold" style={{ color: c.color }}>{c.pct}%</span>
                  </div>
                  <PBar pct={c.pct} color={c.color} />
                  <div className="text-[11px] text-[#9EB3C8] mt-1">{c.done}/{c.total} {t.lessonUnit}</div>
                </div>
                {level ? (
                  <div style={{ fontSize: 10, fontWeight: 700, color: level.color, background: level.bg, padding: "4px 9px", borderRadius: 8, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {level.label}
                  </div>
                ) : (
                  <Tag label={t.active} type={c.tag} />
                )}
              </Row>
            );
          })}
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <SLabel>{t.weeklyActivity}</SLabel>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-2xl font-bold text-[#173B64] tracking-tight">{totalMins}</span>
              <span className="text-xs text-[#9EB3C8]">{t.minutes}</span>
            </div>
            <ActivityBars data={activity} days={activityDays} todayIdx={todayIndex} />
          </Card>
          <Card className="py-3.5! px-4!">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#173B64]">Streak</div>
                <div className="text-xs text-[#9EB3C8] mt-0.5">{user.streak} {t.streakDays}</div>
              </div>
              <div className="flex gap-1 items-center">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} style={{ background: i < user.streak ? "#173B64" : "#DDE6F0" }} className="w-2 h-2 rounded-full" />
                ))}
                <span className="text-[10px] text-[#9EB3C8] ml-1">{user.streak}/7</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Grid cols={2}>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SLabel className="mb-0!">{t.recentTests}</SLabel>
            <TextBtn onClick={() => onNav("tests")}>{t.allTests}</TextBtn>
          </div>
          {tests.slice(0, 3).map((test, i) => (
            <div key={test.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1.5 ${i === 0 ? "bg-[#F0F5FC] border border-[#DDE6F0]" : ""}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0" style={{ background: test.type === "sat" ? "rgba(37,99,235,0.09)" : "rgba(15,158,106,0.09)", color: test.type === "sat" ? "#2563EB" : "#0F9E6A" }}>
                {test.score}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[#173B64] truncate">{test.name}</div>
                <div className="text-[10px] text-[#9EB3C8] mt-0.5">{test.date} · /{test.max}</div>
              </div>
              {test.change !== null ? (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+{test.change}</span>
              ) : (
                <span className="text-[10px] text-[#9EB3C8] bg-[#F0F5FC] px-2 py-0.5 rounded-full">{t.base}</span>
              )}
            </div>
          ))}
          <Sep />
          <BtnGhost onClick={onStartTest} className="text-xs">{t.startNewTest}</BtnGhost>
        </Card>

        <Card>
          <SLabel>{t.weakTopics}</SLabel>
          {weakTopics.map((w, i) => (
            <div key={w.name} className={i < weakTopics.length - 1 ? "mb-3" : ""}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-[#173B64]">{w.name}</span>
                <span className="text-xs font-bold" style={{ color: w.color }}>{w.pct}%</span>
              </div>
              <PBar pct={w.pct} color={w.color} />
            </div>
          ))}
          <Sep />
          <BtnPrimary onClick={onStartTest} className="text-xs">{t.practiceWeak}</BtnPrimary>
        </Card>
      </Grid>

      <div className="bg-[#0F2746] rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-[#173B64] rounded-xl flex items-center justify-center shrink-0">
            <RobotMark />
          </div>
          <div>
            <div className="text-white font-bold text-sm mb-1">{t.proTitle}</div>
            <div className="text-[#9EB3C8] text-xs leading-relaxed">
              {t.proDesc}
              <br /><span className="text-[#6B7E96]">{t.proPrice}</span>
            </div>
          </div>
        </div>
        <button onClick={() => showToast(t.proSoon)} className="shrink-0 bg-white text-[#173B64] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#F0F5FC] transition-colors whitespace-nowrap">
          {t.goPro}
        </button>
      </div>
    </>
  );
}

function getSatLevel(pct) {
  if (pct >= 75) return { label: "Max Score Push", color: "#7C3AED", bg: "rgba(124,58,237,0.09)" };
  if (pct >= 50) return { label: "Advanced",       color: "#059669", bg: "rgba(5,150,105,0.09)"  };
  if (pct >= 25) return { label: "Intermediate",   color: "#D97706", bg: "rgba(217,119,6,0.09)"  };
  return            { label: "Beginner",        color: "#2563EB", bg: "rgba(37,99,235,0.09)"  };
}

function TargetBox({ label, value, current, accent, nowLabel }) {
  return (
    <div className="flex-1 bg-[#F0F5FC] border border-[#DDE6F0] rounded-xl p-3 text-center">
      <div className="text-[9px] font-bold uppercase tracking-wide mb-1" style={{ color: accent }}>{label}</div>
      <div className="text-2xl font-bold leading-none tracking-tight" style={{ color: accent }}>{value}</div>
      <div className="text-[10px] text-[#9EB3C8] mt-1">{nowLabel}: {current}</div>
    </div>
  );
}

function TextBtn({ children, onClick }) {
  return (
    <button onClick={onClick} className="text-xs font-semibold text-[#2563EB] hover:text-[#173B64] bg-none border-none cursor-pointer transition-colors">
      {children}
    </button>
  );
}