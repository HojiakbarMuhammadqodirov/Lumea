import { useEffect, useMemo, useState } from "react";
import CourseCatalog from "./CourseCatalog";
import LessonViewer from "./LessonViewer";
import PracticeTest from "./PracticeTest";
import TeacherDirectory from "./TeacherDirectory";
import ChatPanel from "./ChatPanel";
import ProfilePanel from "./ProfilePanel";
import GraphingCalculator from "./GraphingCalculator";

const labels = {
  "sat-math": "SAT Math",
  "sat-english": "SAT EBRW",
  ielts: "IELTS"
};


const toolCatalog = {
  "sat-math": {
    id: "desmos",
    title: "Desmos",
    description: "Open the calculator students use for SAT Math practice.",
    url: "https://www.desmos.com/calculator"
  },
  "sat-english": {
    id: "sat-dictionary",
    title: "SAT Dictionary",
    description: "Open a dictionary tool for SAT EBRW vocabulary work.",
    url: "https://dictionary.cambridge.org/"
  },
  ielts: {
    id: "ielts-dictionary",
    title: "IELTS Dictionary",
    description: "Open a dictionary tool for IELTS reading and writing support.",
    url: "https://dictionary.cambridge.org/"
  }
};

const lessonIdentity = (item) => `${item.programId}-${item.levelId}-${item.lessonId}`;
const lessonPoints = (item) =>
  (item?.videoCompleted ? 10 : 0) + (item?.learningCompleted ? 10 : 0) + (item?.taskCompleted ? 10 : 0);
const buildBluebookTests = (programId) => {
  if (programId === "sat-math") {
    return Array.from({ length: 7 }, (_, index) => ({
      id: `sat-math-bluebook-${index + 4}`,
      title: `Bluebook Practice Test ${index + 4}`,
      durationMinutes: 70,
      questionCount: 44,
      questions: []
    }));
  }

  if (programId === "sat-english") {
    return Array.from({ length: 7 }, (_, index) => ({
      id: `sat-english-bluebook-${index + 4}`,
      title: `Bluebook Practice Test ${index + 4}`,
      durationMinutes: 64,
      questionCount: 54,
      questions: []
    }));
  }

  return [];
};

const resolveLessonTitle = (courses, item) => {
  const program = courses.find((row) => row.id === item.programId);
  const level = program?.levels.find((row) => row.id === item.levelId);
  const lesson = level?.lessons.find((row) => row.id === item.lessonId);
  return lesson?.title || item.lessonId;
};


const D = {
  navy: "#173B64", navyDeep: "#0F2746",
  blue: "#2563EB", blueDim: "rgba(37,99,235,0.09)",
  green: "#0F9E6A", greenDim: "rgba(15,158,106,0.09)", greenBorder: "rgba(15,158,106,0.2)",
  purple: "#6D28D9", purpleDim: "rgba(109,40,217,0.08)",
  amber: "#D97706", amberDim: "rgba(217,119,6,0.09)",
  red: "#DC2626", redDim: "rgba(220,38,38,0.09)",
  bg: "#F0F5FC", card: "#FFFFFF", border: "#DDE6F0",
  muted: "#6B7E96", hint: "#9EB3C8",
};

function DCard({ children, style = {}, onClick }) {
  return <div onClick={onClick} style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 16, padding: 20, cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>;
}
function DCard2({ children, style = {} }) {
  return <div style={{ background: D.bg, border: `1px solid ${D.border}`, borderRadius: 12, padding: 14, ...style }}>{children}</div>;
}
function DSLabel({ children, style = {} }) {
  return <div style={{ fontSize: 10, color: D.hint, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 10, ...style }}>{children}</div>;
}
function DSep() { return <div style={{ height: 1, background: D.border, margin: "12px 0" }} />; }
function DPBar({ pct, color }) {
  return <div style={{ height: 5, background: D.border, borderRadius: 999, overflow: "hidden" }}><div style={{ width: `${Math.min(pct,100)}%`, height: 5, background: color, borderRadius: 999, transition: "width 800ms cubic-bezier(.4,0,.2,1)" }} /></div>;
}
function DTag({ label, bg, color }) {
  return <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{label}</span>;
}
function DRow({ children, noBorder = false }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: noBorder ? "none" : `1px solid ${D.border}` }}>{children}</div>;
}
function DIconBox({ icon, color, glow, size = 34 }) {
  return <div style={{ width: size, height: size, background: glow || D.blueDim, color, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.47, fontWeight: 700, flexShrink: 0 }}>{icon}</div>;
}
function DActivityBars({ data, days, todayIdx }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "end", gap: 6, height: 56 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", height: `${Math.max((v / max) * 44, 4)}px`, background: i === todayIdx ? D.navy : D.border, borderRadius: 3, transition: "height 600ms" }} />
          <div style={{ fontSize: 9, color: i === todayIdx ? D.navy : D.hint, fontWeight: i === todayIdx ? 700 : 400 }}>{days[i]}</div>
        </div>
      ))}
    </div>
  );
}

const COURSE_COLORS = {
  "sat-math":    { color: "#2563EB", glow: "rgba(37,99,235,0.09)",  icon: "∑", tag: "blue" },
  "sat-english": { color: "#6D28D9", glow: "rgba(109,40,217,0.08)", icon: "A", tag: "purple" },
  "ielts":       { color: "#0F9E6A", glow: "rgba(15,158,106,0.09)", icon: "I", tag: "green" },
};

function StudentHome({ user, courses, progress, myTeachers, onOpenTab }) {
  const lessonActivity = progress?.lessonActivity || [];
  const totalPoints = lessonActivity.reduce((sum, item) => sum + lessonPoints(item), 0);

  // Exam countdown — use 42 days from now as default
  const examDate = new Date(Date.now() + 42 * 86400000);

  // Weekly activity (last 7 days, Mon–Sun)
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // Mon=0
  const weekDays = ["Du","Se","Ch","Pa","Ju","Sh","Ya"];
  const weekActivity = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() - dayOfWeek + i);
    const dayStr = day.toISOString().slice(0, 10);
    const count = lessonActivity.filter(a => (a.updatedAt || "").startsWith(dayStr)).length;
    return count * 18;
  });

  // Course progress per program
  const courseProgress = courses.map(c => {
    const meta = COURSE_COLORS[c.id] || { color: D.blue, glow: D.blueDim, icon: "?", tag: "blue" };
    const totalLessons = c.levels?.reduce((s, l) => s + (l.lessons?.length || 0), 0) || 1;
    const done = lessonActivity.filter(a => a.programId === c.id && (a.videoCompleted || a.learningCompleted || a.taskCompleted)).length;
    const pct = Math.round((done / totalLessons) * 100);
    return { ...c, ...meta, pct, done, total: totalLessons };
  });

  // Targets
  const targets = user.targetScores || {};
  const satTarget = targets["sat-math"]?.target || targets["sat-english"]?.target || 1500;
  const satCurrent = targets["sat-math"]?.current || 0;
  const ieltsTarget = targets["ielts"]?.target || 7.5;
  const ieltsCurrent = targets["ielts"]?.current || 0;

  // Next lesson (first unfinished)
  let nextLesson = null;
  outer: for (const course of courses) {
    for (const level of (course.levels || [])) {
      for (const lesson of (level.lessons || [])) {
        const done = lessonActivity.find(a => a.programId === course.id && a.levelId === level.id && a.lessonId === lesson.id);
        if (!done || (!done.taskCompleted)) {
          nextLesson = { title: lesson.title, program: course.title, icon: COURSE_COLORS[course.id]?.icon || "?", color: COURSE_COLORS[course.id]?.color || D.blue, glow: COURSE_COLORS[course.id]?.glow };
          break outer;
        }
      }
    }
  }

  // Streak from progress or user
  const streak = user.streak || lessonActivity.filter(a => a.taskCompleted).length;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {/* Daily Task */}
        <DCard style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <DSLabel>Bugungi vazifa</DSLabel>
          <DCard2 style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {nextLesson ? (
              <>
                <DIconBox icon={nextLesson.icon} color={nextLesson.color} glow={nextLesson.glow} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: D.navy }}>{nextLesson.title}</div>
                  <div style={{ fontSize: 11, color: D.hint, marginTop: 2 }}>{nextLesson.program}</div>
                </div>
              </>
            ) : (
              <>
                <DIconBox icon="✓" color={D.green} glow={D.greenDim} />
                <div style={{ fontSize: 13, color: D.hint }}>All lessons complete!</div>
              </>
            )}
          </DCard2>
          <button onClick={() => onOpenTab("lessons")}
            style={{ width: "100%", background: D.navy, color: "#fff", border: "none", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            ▶ Darsni boshlash
          </button>
        </DCard>

        {/* Countdown */}
        <DCard>
          <DSLabel>Imtihongacha</DSLabel>
          <CountdownBoxes examDate={examDate} />
          <button onClick={() => onOpenTab("profile")}
            style={{ width: "100%", background: "transparent", color: D.muted, border: `1px solid ${D.border}`, borderRadius: 12, padding: "9px 16px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}>
            Sana o'zgartirish
          </button>
        </DCard>

        {/* Targets */}
        <DCard>
          <DSLabel>Maqsad balllar</DSLabel>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {satTarget > 0 && (
              <div style={{ flex: 1, background: D.bg, border: `1px solid ${D.border}`, borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, color: D.blue }}>SAT</div>
                <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: D.blue }}>{satTarget}</div>
                <div style={{ fontSize: 10, color: D.hint, marginTop: 4 }}>Hozir: {satCurrent || "—"}</div>
              </div>
            )}
            {ieltsTarget > 0 && (
              <div style={{ flex: 1, background: D.bg, border: `1px solid ${D.border}`, borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, color: D.green }}>IELTS</div>
                <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: D.green }}>{ieltsTarget}</div>
                <div style={{ fontSize: 10, color: D.hint, marginTop: 4 }}>Hozir: {ieltsCurrent || "—"}</div>
              </div>
            )}
            {satTarget === 0 && ieltsTarget === 0 && (
              <div style={{ flex: 1, textAlign: "center", color: D.hint, fontSize: 12 }}>Maqsad belgilanmagan</div>
            )}
          </div>
          <button onClick={() => onOpenTab("profile")}
            style={{ width: "100%", background: "transparent", color: D.muted, border: `1px solid ${D.border}`, borderRadius: 12, padding: "9px 16px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Maqsadni tahrirlash
          </button>
        </DCard>
      </div>

      {/* Row 2 */}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1.6fr 1fr" }}>
        <DCard>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <DSLabel style={{ marginBottom: 0 }}>Kurslar progressi</DSLabel>
            <button onClick={() => onOpenTab("lessons")} style={{ fontSize: 12, fontWeight: 700, color: D.blue, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Hammasi →</button>
          </div>
          {courseProgress.map((c, i) => (
            <DRow key={c.id} noBorder={i === courseProgress.length - 1}>
              <DIconBox icon={c.icon} color={c.color} glow={c.glow} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: D.navy }}>{c.title}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{c.pct}%</span>
                </div>
                <DPBar pct={c.pct} color={c.color} />
                <div style={{ fontSize: 11, color: D.hint, marginTop: 4 }}>{c.done}/{c.total} dars</div>
              </div>
              <DTag label="Faol" bg={c.glow} color={c.color} />
            </DRow>
          ))}
          {courseProgress.length === 0 && <div style={{ color: D.hint, fontSize: 13, textAlign: "center", padding: "16px 0" }}>Kurslar yuklanmagan</div>}
        </DCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <DCard>
            <DSLabel>Haftalik faollik</DSLabel>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: D.navy }}>{weekActivity.reduce((a, b) => a + b, 0)}</span>
              <span style={{ fontSize: 12, color: D.hint }}>daqiqa</span>
            </div>
            <DActivityBars data={weekActivity} days={weekDays} todayIdx={dayOfWeek} />
          </DCard>
          <DCard style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: D.navy }}>Streak</div>
                <div style={{ fontSize: 11, color: D.hint, marginTop: 2 }}>{streak} kun uzluksiz</div>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < Math.min(streak, 7) ? D.navy : D.border }} />
                ))}
                <span style={{ fontSize: 10, color: D.hint, marginLeft: 4 }}>{Math.min(streak, 7)}/7</span>
              </div>
            </div>
          </DCard>
        </div>
      </div>

      {/* Row 3 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <DCard>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <DSLabel style={{ marginBottom: 0 }}>Tezkor havolalar</DSLabel>
          </div>
          {[
            { id: "lessons",       label: "Darslar",           hint: "Kurslar va darsliklar" },
            { id: "tests",         label: "Testlar",           hint: "Avvalgi rasmiy testlar" },
            { id: "practice-tests",label: "Amaliy testlar",    hint: "Bluebook SAT testlari" },
            { id: "tools",         label: "Vositalar",         hint: "Desmos va lug'at" },
          ].map((item, i, arr) => (
            <div key={item.id} onClick={() => onOpenTab(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, marginBottom: 6, cursor: "pointer", background: D.bg, border: `1px solid ${D.border}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: D.navy }}>{item.label}</div>
                <div style={{ fontSize: 10, color: D.hint, marginTop: 1 }}>{item.hint}</div>
              </div>
              <span style={{ color: D.hint, fontSize: 12 }}>→</span>
            </div>
          ))}
        </DCard>

        <DCard>
          <DSLabel>O'qituvchilar</DSLabel>
          {myTeachers.length > 0 ? myTeachers.map((t, i) => (
            <DRow key={t.programId} noBorder={i === myTeachers.length - 1}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: D.navy, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {(t.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: D.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                <div style={{ fontSize: 11, color: D.hint }}>{labels[t.programId] || t.programId}</div>
              </div>
              <button onClick={() => onOpenTab("chat")}
                style={{ background: D.blueDim, color: D.blue, border: "none", borderRadius: 10, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Chat
              </button>
            </DRow>
          )) : (
            <div style={{ color: D.hint, fontSize: 13, textAlign: "center", padding: "20px 0" }}>O'qituvchi tayinlanmagan</div>
          )}
          {myTeachers.length > 0 && (
            <button onClick={() => onOpenTab("rating")}
              style={{ marginTop: 8, width: "100%", background: "transparent", color: D.muted, border: `1px solid ${D.border}`, borderRadius: 12, padding: "9px 16px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Reytingni ko'rish →
            </button>
          )}
        </DCard>
      </div>

      {/* Pro Banner */}
      <div style={{ background: D.navyDeep, borderRadius: 16, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.08)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9EB3C8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>AI Tushuntiruvchi — Pro rejim</div>
            <div style={{ color: "#9EB3C8", fontSize: 12, lineHeight: 1.5 }}>
              Noto'g'ri javobda AI boshqacha usulda tushuntiradi · Shaxsiy o'quv rejasi · Sertifikat
            </div>
          </div>
        </div>
        <button onClick={() => onOpenTab("profile")}
          style={{ flexShrink: 0, background: "#fff", color: D.navy, fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
          Pro ga o'tish →
        </button>
      </div>
    </div>
  );
}

function InternalToolsPanel({ assignments, activeToolId, onOpenTool, onBack }) {
  if (activeToolId === "desmos") {
    return <GraphingCalculator onBack={onBack} />;
  }

  const tools = assignments
    .map((assignment) => toolCatalog[assignment.programId])
    .filter(Boolean)
    .filter((tool, index, rows) => rows.findIndex((item) => item.id === tool.id) === index);

  return (
    <div style={{ padding: 24 }}>
      <DCard>
        <DSLabel>Vositalar</DSLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {tools.map((tool) => (
            <DCard2 key={tool.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <DIconBox icon="⚙" color={D.blue} glow={D.blueDim} size={38} />
              <div style={{ fontSize: 14, fontWeight: 600, color: D.navy }}>{tool.title}</div>
              <div style={{ fontSize: 12, color: D.hint, flex: 1 }}>{tool.description}</div>
              {tool.id === "desmos" ? (
                <button onClick={() => onOpenTool(tool.id)}
                  style={{ background: D.navy, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {tool.title}ni ochish
                </button>
              ) : (
                <button onClick={() => window.open(tool.url, "_blank", "noopener,noreferrer")}
                  style={{ background: D.navy, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {tool.title}ni ochish
                </button>
              )}
            </DCard2>
          ))}
          {tools.length === 0 && (
            <div style={{ color: D.hint, fontSize: 13, gridColumn: "1/-1" }}>Vosita yo'q</div>
          )}
        </div>
      </DCard>
    </div>
  );
}

function RatingPanel({ courses, progress }) {
  const rows = [...(progress?.lessonActivity || [])].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  return (
    <div style={{ padding: 24 }}>
      <DCard>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: D.navy, lineHeight: 1 }}>Reyting</div>
            <div style={{ fontSize: 12, color: D.hint, marginTop: 4 }}>Dars balllariga batafsil ko'rinish</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: D.blue }}>
            {rows.reduce((s, i) => s + lessonPoints(i), 0)} ball
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                {["Dars", "Video", "O'rganish", "Vazifa", "Jami"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: D.hint, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={lessonIdentity(item)} style={{ borderBottom: `1px solid ${D.border}` }}>
                  <td style={{ padding: "10px 12px", color: D.navy, fontWeight: 500 }}>{resolveLessonTitle(courses, item)}</td>
                  <td style={{ padding: "10px 12px", color: item.videoCompleted ? D.green : D.hint }}>{item.videoCompleted ? 10 : 0}</td>
                  <td style={{ padding: "10px 12px", color: item.learningCompleted ? D.green : D.hint }}>{item.learningCompleted ? 10 : 0}</td>
                  <td style={{ padding: "10px 12px", color: item.taskCompleted ? D.green : D.hint }}>{item.taskCompleted ? 10 : 0}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: D.blue }}>{lessonPoints(item)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "24px 12px", textAlign: "center", color: D.hint }}>Faollik yo'q</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </DCard>
    </div>
  );
}

export default function StudentDashboard({
  token,
  user,
  courses,
  progress,
  myTeachers,
  selectedProgramId,
  selectedProgram,
  selectedLevel,
  studentAssignments,
  practiceTests,
  onSelectProgram,
  onSelectLevel,
  onOpenPractice,
  onSubmitPracticeScore,
  onSaveProfile,
  onCompleteLesson,
  onSubmitTopicScore,
  onSaveLessonActivity,
  onLogout
}) {
  const [tab, setTab] = useState("home");
  const [lessonPageOpen, setLessonPageOpen] = useState(false);
  const [activeToolId, setActiveToolId] = useState("");

  useEffect(() => {
    if (tab !== "tests" || practiceTests.length > 0 || !selectedProgram) return;
    onOpenPractice(selectedProgram.id);
  }, [onOpenPractice, practiceTests.length, selectedProgram, tab]);

  useEffect(() => {
    if (tab !== "lessons") {
      setLessonPageOpen(false);
    }
  }, [tab]);

  useEffect(() => {
    if (tab !== "tools") {
      setActiveToolId("");
    }
  }, [tab]);

  const mainNavItems = [
    { id: "home",           label: "Bosh sahifa",    icon: "home" },
    { id: "lessons",        label: "Darslar",        icon: "book" },
    { id: "tests",          label: "Testlar",        icon: "pencil" },
    { id: "practice-tests", label: "Amaliy testlar", icon: "doc" },
    { id: "tools",          label: "Vositalar",      icon: "tool" },
  ];
  const studyNavItems = [
    { id: "rating",   label: "Reyting",       icon: "star" },
    { id: "teachers", label: "O'qituvchilar", icon: "users" },
    { id: "chat",     label: "Chat",          icon: "chat" },
    { id: "profile",  label: "Profil",        icon: "user" },
  ];
  const PAGE_TITLES_MAP = {
    home: "Bosh sahifa", lessons: "Darslar", tests: "Testlar",
    "practice-tests": "Amaliy testlar", tools: "Vositalar",
    rating: "Reyting", teachers: "O'qituvchilar", chat: "Chat", profile: "Profil",
  };
  const SIDE_ICONS = {
    home:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    book:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    pencil: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    doc:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
    tool:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
    star:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
    users:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    chat:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    user:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    logout: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  };

  const generatedPracticeTests = useMemo(() => buildBluebookTests(selectedProgram?.id), [selectedProgram?.id]);
  const initials = (user.profile?.firstName?.[0] || user.name?.[0] || "S").toUpperCase();
  const displayName = user.profile?.firstName || user.name || "Student";
  const sidebarStreak = user.streak || (progress?.lessonActivity || []).filter(a => a.taskCompleted).length;

  const sideNavBtn = (item) => (
    <button key={item.id} onClick={() => setTab(item.id)} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 10,
      padding: "9px 12px", borderRadius: 12, fontSize: 13, fontWeight: 500,
      border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
      background: tab === item.id ? "#173B64" : "transparent",
      color: tab === item.id ? "#fff" : "#6B7E96",
      transition: "all 150ms",
    }}>
      <span style={{ width: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {SIDE_ICONS[item.icon]}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
    </button>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#F0F5FC", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, background: "#fff", borderRight: "1px solid #DDE6F0", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #DDE6F0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "#173B64", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>L</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#173B64", lineHeight: 1 }}>LearnNova</div>
            <div style={{ fontSize: 9, color: "#9EB3C8", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>Student Space</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          <div style={{ fontSize: 9, color: "#9EB3C8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, padding: "0 8px", marginBottom: 4 }}>Asosiy</div>
          {mainNavItems.map(sideNavBtn)}
          <div style={{ fontSize: 9, color: "#9EB3C8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, padding: "0 8px", marginBottom: 4, marginTop: 10 }}>O'qish</div>
          {studyNavItems.map(sideNavBtn)}
        </nav>
        <div style={{ padding: "10px 10px", borderTop: "1px solid #DDE6F0" }}>
          <button onClick={() => setTab("profile")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, background: "#F0F5FC", border: "none", cursor: "pointer", textAlign: "left", transition: "background 150ms" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#173B64", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#173B64", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</div>
              <div style={{ fontSize: 10, color: "#9EB3C8" }}>Bepul rejim</div>
            </div>
          </button>
          <button onClick={onLogout} style={{ width: "100%", marginTop: 4, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 12, color: "#DC2626", fontSize: 12, fontWeight: 500, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            {SIDE_ICONS.logout} Chiqish
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", background: "#fff", borderBottom: "1px solid #DDE6F0", flexShrink: 0 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#173B64", lineHeight: 1 }}>{PAGE_TITLES_MAP[tab] || tab}</h1>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9EB3C8" }}>{user?.region || "Namangan"} · LearnNova</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid #fed7aa", borderRadius: 10, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#f97316", background: "#fff7ed" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f97316" stroke="none"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>
              {sidebarStreak} kun
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid #bfdbfe", borderRadius: 10, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#2563EB", background: "#eff6ff" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#2563EB" stroke="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
              #{user?.regionRank || "—"} {user?.region || "Namangan"}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {tab === "home" && <StudentHome user={user} courses={courses} progress={progress} myTeachers={myTeachers} onOpenTab={setTab} />}

          {tab === "lessons" && (
            <div className="stack">
              {!lessonPageOpen && (
                <CourseCatalog
                  courses={courses}
                  selectedProgramId={selectedProgramId}
                  selectedLevelId={selectedLevel?.id}
                  assignments={studentAssignments}
                  onSelectProgram={onSelectProgram}
                  onSelectLevel={(programId, levelId) => {
                    onSelectLevel(programId, levelId);
                    setLessonPageOpen(true);
                  }}
                  onOpenPractice={onOpenPractice}
                />
              )}

              {lessonPageOpen && selectedProgram && selectedLevel && (
                <>
                  <div className="inline" data-aos="fade-right">
                    <button className="ghost" onClick={() => setLessonPageOpen(false)}>
                      Back to course levels
                    </button>
                  </div>
                  <LessonViewer
                    program={selectedProgram}
                    level={selectedLevel}
                    progress={progress}
                    onCompleteLesson={onCompleteLesson}
                    onSubmitTopicScore={onSubmitTopicScore}
                    onSaveLessonActivity={onSaveLessonActivity}
                  />
                </>
              )}
            </div>
          )}

          {tab === "tests" && selectedProgram && (
            <PracticeTest
              programTitle={selectedProgram.title}
              tests={practiceTests}
              variant="previous"
              onSubmitScore={onSubmitPracticeScore}
            />
          )}

          {tab === "practice-tests" && selectedProgram && (
            <PracticeTest
              programTitle={selectedProgram.title}
              tests={generatedPracticeTests}
              variant="practice"
              onSubmitScore={onSubmitPracticeScore}
            />
          )}

          {tab === "tools" && (
            <InternalToolsPanel
              assignments={studentAssignments}
              activeToolId={activeToolId}
              onOpenTool={setActiveToolId}
              onBack={() => setActiveToolId("")}
            />
          )}
          {tab === "rating" && <RatingPanel courses={courses} progress={progress} />}
          {tab === "teachers" && <TeacherDirectory teachers={myTeachers} />}
          {tab === "chat" && <ChatPanel token={token} user={user} assignments={studentAssignments} teachers={myTeachers} />}
          {tab === "profile" && <ProfilePanel user={user} onSave={onSaveProfile} onLogout={onLogout} />}
        </div>
      </div>
    </div>
  );
}
