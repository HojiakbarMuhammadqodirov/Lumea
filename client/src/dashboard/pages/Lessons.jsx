import { useState } from "react";
import { Card, SLabel, PBar, Tag, BtnPrimary, BtnGhost, IconBox, Grid, StatCard, QuestionOption } from "../UI";
import { useApp } from "../useApp";
import { BLUEBOOK_TESTS } from "../bluebook";
import BluebookTest from "./BluebookTest";

const PROGRAM_TABS = [
  { id: "sat", label: "SAT" },
  { id: "ielts", label: "IELTS" },
];

function isSat(c)   { return c.id.startsWith("sat"); }
function isIelts(c) { return c.id.startsWith("ielts") || c.id === "ielts"; }

export default function LessonsPage() {
  const { courses, questions, completeLesson, showToast, user } = useApp();
  const [activeProgram, setActiveProgram] = useState("sat");
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [qState, setQState] = useState({ qi: 0, sel: null, answered: false, score: 0 });

  const [bluebookList, setBluebookList] = useState(false);
  const [bluebookTest, setBluebookTest] = useState(null);

  const filteredCourses = courses.filter(c => activeProgram === "sat" ? isSat(c) : isIelts(c));
  const onSoon = () => showToast("Tez kunda!", "info");

  // Full-screen bluebook test
  if (bluebookTest) {
    return (
      <BluebookTest
        test={bluebookTest}
        studentName={user?.name || "Student"}
        onExit={() => setBluebookTest(null)}
      />
    );
  }

  // Bluebook test list
  if (bluebookList) {
    return (
      <>
        <div className="flex items-center gap-3 mb-2">
          <BtnGhost onClick={() => setBluebookList(false)} className="w-auto! px-3! py-2! text-xs">← Orqaga</BtnGhost>
          <div>
            <h2 className="text-lg font-bold text-[#173B64]">Bluebook Amaliyot</h2>
            <p className="text-xs text-[#9EB3C8]">College Board rasmiy SAT practice testlari</p>
          </div>
        </div>
        <Grid cols={3}>
          {BLUEBOOK_TESTS.map(t => (
            <Card key={t.id} onClick={() => setBluebookTest(t)} style={{ cursor: "pointer" }}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(37,99,235,0.12)", color: "#2563EB" }}>
                  {t.num}
                </div>
                <Tag label="Tayyor" type="blue" />
              </div>
              <div className="text-[15px] font-bold text-[#173B64] mb-1">SAT Practice Test {t.num}</div>
              <div className="text-xs text-[#9EB3C8] mb-3">27 savol · 32 daqiqa · Reading & Writing</div>
              <PBar pct={0} color="#2563EB" height={6} />
            </Card>
          ))}
        </Grid>
      </>
    );
  }

  if (activeLesson && activeCourse) {
    const course = courses.find(c => c.id === activeCourse);
    const lesson = course?.lessons.find(l => l.id === activeLesson);
    return (
      <LessonDetail
        course={course} lesson={lesson} questions={questions}
        qState={qState} setQState={setQState}
        onComplete={() => { completeLesson(activeCourse, activeLesson); setActiveLesson(null); }}
        onBack={() => setActiveLesson(null)}
      />
    );
  }

  if (activeCourse) {
    const course = courses.find(c => c.id === activeCourse);
    return (
      <CourseDetail
        course={course}
        onBack={() => setActiveCourse(null)}
        onLesson={setActiveLesson}
      />
    );
  }

  return (
    <>
      <div className="flex gap-2 mb-1">
        {PROGRAM_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveProgram(tab.id)}
            style={activeProgram === tab.id
              ? { background: "#173B64", color: "#F6FAFF", border: "1px solid #173B64", borderRadius: 12, padding: "8px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .15s" }
              : { background: "#ffffff", color: "#6B7E96", border: "1px solid #DDE6F0", borderRadius: 12, padding: "8px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .15s" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeProgram === "sat"
        ? <SatView courses={filteredCourses} onCourse={setActiveCourse} onBluebook={() => setBluebookList(true)} onSoon={onSoon} />
        : <IeltsView courses={filteredCourses} onCourse={setActiveCourse} onSoon={onSoon} />
      }
    </>
  );
}

function CourseCard({ c, onClick }) {
  return (
    <Card onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="flex justify-between items-start mb-3">
        <IconBox icon={c.icon} color={c.color} glow={c.glow} size={36} />
        <Tag label={`${c.pct}%`} type={c.tag} />
      </div>
      <div className="text-[15px] font-bold text-[#173B64] mb-1">{c.label}</div>
      <div className="text-xs text-[#9EB3C8] mb-3">{c.done}/{c.total} dars bajarildi</div>
      <PBar pct={c.pct} color={c.color} height={6} />
    </Card>
  );
}

function ActiveCard({ title, abbr, color, glow, desc, onClick }) {
  return (
    <Card onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="flex justify-between items-start mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: glow || color + "1a", color }}>
          {abbr}
        </div>
        <Tag label="Tayyor" type="blue" />
      </div>
      <div className="text-[15px] font-bold text-[#173B64] mb-1">{title}</div>
      <div className="text-xs text-[#9EB3C8] mb-3">{desc}</div>
      <PBar pct={0} color={color} height={6} />
    </Card>
  );
}

function SoonCard({ title, abbr, color, glow, desc }) {
  return (
    <Card style={{ opacity: 0.55, cursor: "not-allowed" }}>
      <div className="flex justify-between items-start mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: glow || color + "1a", color }}>
          {abbr}
        </div>
        <Tag label="Tez kunda" type="gray" />
      </div>
      <div className="text-[15px] font-bold text-[#9EB3C8] mb-1">{title}</div>
      <div className="text-xs text-[#9EB3C8] mb-3">{desc}</div>
      <PBar pct={0} color={color} height={6} />
    </Card>
  );
}

function SectionHeading({ title, desc }) {
  return (
    <div className="mb-3">
      <div className="text-sm font-bold text-[#173B64]">{title}</div>
      <div className="text-xs text-[#9EB3C8] mt-0.5">{desc}</div>
    </div>
  );
}

function SatView({ courses, onCourse, onBluebook, onSoon }) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="SAT Darslar" desc="Algebra, Grammar va boshqalar" />
      <Grid cols={3}>
        {courses.map(c => <CourseCard key={c.id} c={c} onClick={() => onCourse(c.id)} />)}
        <ActiveCard title="Bluebook Amaliyot" abbr="BB" color="#2563EB" glow="rgba(37,99,235,0.12)" desc="College Board rasmiy testlar · 8 test" onClick={onBluebook} />
        <ActiveCard title="SAT Lug'at" abbr="LG" color="#F59E0B" glow="rgba(245,158,11,0.12)" desc="SAT so'z boyligi mashqlari" onClick={onSoon} />
        <ActiveCard title="SAT Kitoblari" abbr="KT" color="#10B981" glow="rgba(16,185,129,0.12)" desc="PrepScholar, Barron's va boshqalar" onClick={onSoon} />
      </Grid>
    </div>
  );
}

function IeltsView({ courses, onCourse, onSoon }) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="IELTS Darslar" desc="Reading, Writing, Speaking, Listening" />
      <Grid cols={3}>
        {courses.map(c => <CourseCard key={c.id} c={c} onClick={() => onCourse(c.id)} />)}
        <ActiveCard title="IELTS Lug'at" abbr="LG" color="#F59E0B" glow="rgba(245,158,11,0.12)" desc="IELTS so'z boyligi mashqlari" onClick={onSoon} />
        <ActiveCard title="IELTS Kitoblari" abbr="KT" color="#EF4444" glow="rgba(239,68,68,0.12)" desc="Cambridge, Barron's va boshqalar" onClick={onSoon} />
      </Grid>
    </div>
  );
}

function CourseDetail({ course, onBack, onLesson }) {
  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <BtnGhost onClick={onBack} className="w-auto! px-3! py-2! text-xs">← Orqaga</BtnGhost>
        <div>
          <h2 className="text-lg font-bold text-[#173B64]">{course.label}</h2>
          <p className="text-xs text-[#9EB3C8]">{course.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-2">
        <StatCard value={`${course.pct}%`} label="Bajarildi" color={course.color} />
        <StatCard value={`${course.done}/${course.total}`} label="Darslar" color={course.color} />
      </div>

      <Card>
        <SLabel>Darslar ro'yxati</SLabel>
        <div className="flex flex-col gap-1.5">
          {course.lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => !l.done && onLesson(l.id)}
              style={l.done
                ? { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, cursor: "default", width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", textAlign: "left", transition: "all .15s" }
                : { background: "#ffffff", border: "1px solid #DDE6F0", borderRadius: 12, cursor: "pointer", width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", textAlign: "left", transition: "all .15s" }
              }
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
                ${l.done ? "bg-green-500 text-white" : l.active ? "bg-[#173B64] text-white" : "bg-[#F0F5FC] text-[#9EB3C8]"}`}>
                {l.done ? "✓" : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 14, fontWeight: 600, color: l.done ? "#15803d" : "#173B64", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</div>
                <div style={{ fontSize: 11, color: "#9EB3C8", marginTop: 2 }}>{l.desc} · {l.dur} daqiqa</div>
              </div>
              {l.active && <span className="text-[10px] font-bold text-[#173B64] bg-[#F0F5FC] px-2 py-0.5 rounded-full">Faol</span>}
              {l.done && <span className="text-[10px] font-bold text-green-600">✓</span>}
            </button>
          ))}
        </div>
      </Card>
    </>
  );
}

function LessonDetail({ course, lesson, questions, qState, setQState, onComplete, onBack }) {
  const { qi, sel, answered, score } = qState;
  const q = questions[qi];

  const optState = (i) => {
    if (!answered) return sel === i ? "selected" : "idle";
    if (i === q.ans) return "correct";
    if (i === sel) return "wrong";
    return "idle";
  };

  const check = () => { if (sel === null) return; setQState(s => ({ ...s, answered: true, score: sel === q.ans ? s.score + 1 : s.score })); };
  const next = () => {
    if (qi < questions.length - 1) setQState({ qi: qi + 1, sel: null, answered: false, score });
    else onComplete();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <BtnGhost onClick={onBack} className="w-auto! px-3! py-1.5! text-xs">← Orqaga</BtnGhost>
        <div className="text-center">
          <div className="text-sm font-bold text-[#173B64]">{lesson.title}</div>
          <div className="text-xs text-[#9EB3C8]">{course.label}</div>
        </div>
        <span className="text-sm font-bold text-[#2563EB]">Ball: {score}/{qi}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-[#9EB3C8] mb-1.5">
        <span>Savol {qi + 1} / {questions.length}</span>
        <span>{Math.round((qi / questions.length) * 100)}%</span>
      </div>
      <PBar pct={Math.round((qi / questions.length) * 100)} color="#173B64" height={4} />

      <div className="text-[15px] font-semibold text-[#173B64] my-5 leading-relaxed">{q.q}</div>

      {q.opts.map((opt, i) => (
        <QuestionOption key={i} label={String.fromCharCode(65 + i)} text={opt} state={optState(i)}
          onClick={() => { if (!answered) setQState(s => ({ ...s, sel: i })); }} />
      ))}

      {answered && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 mt-2 text-sm text-green-800">
          {q.exp}
        </div>
      )}

      <div className="mt-4">
        {!answered
          ? <BtnPrimary onClick={check} disabled={sel === null}>Tekshirish</BtnPrimary>
          : <BtnPrimary onClick={next}>{qi < questions.length - 1 ? "Keyingi →" : "Darsni tugatish ✓"}</BtnPrimary>
        }
      </div>
    </Card>
  );
}
