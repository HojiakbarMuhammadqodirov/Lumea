import { useState } from "react";
import { Card, Card2, SLabel, PBar, Tag, BtnPrimary, BtnGhost, IconBox, Grid, StatCard, QuestionOption } from "../UI";
import { useApp } from "../useApp";

export default function LessonsPage() {
  const { courses, questions, completeLesson } = useApp();
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [qState, setQState] = useState({ qi: 0, sel: null, answered: false, score: 0 });

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
    return <CourseDetail course={course} onBack={() => setActiveCourse(null)} onLesson={setActiveLesson} />;
  }
  return <CourseList courses={courses} onCourse={setActiveCourse} />;
}

function CourseList({ courses, onCourse }) {
  return (
    <>
      <div className="flex gap-2 mb-1">
        {courses.map(c => (
          <button key={c.id} onClick={() => onCourse(c.id)}
            style={{ borderColor: "#DDE6F0", color: "#6B7E96" }}
            className="flex items-center gap-2 bg-white border rounded-xl px-3.5 py-2 text-sm font-medium hover:border-[#173B64] hover:text-[#173B64] transition-all"
          >
            <span className="font-bold" style={{ color: c.color }}>{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      <Grid cols={3}>
        {courses.map(c => (
          <Card key={c.id} onClick={() => onCourse(c.id)}>
            <div className="flex justify-between items-start mb-3">
              <IconBox icon={c.icon} color={c.color} glow={c.glow} size={36} />
              <Tag label={`${c.pct}%`} type={c.tag} />
            </div>
            <div className="text-[15px] font-bold text-[#173B64] mb-1">{c.label}</div>
            <div className="text-xs text-[#9EB3C8] mb-3">{c.done}/{c.total} dars bajarildi</div>
            <PBar pct={c.pct} color={c.color} height={6} />
          </Card>
        ))}
      </Grid>

      <div className="bg-white border border-[#DDE6F0] rounded-2xl p-5 opacity-50 cursor-not-allowed">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F0F5FC] flex items-center justify-center text-xs font-bold text-[#9EB3C8]">AP</div>
          <div>
            <div className="text-sm font-semibold text-[#9EB3C8]">AP Courses</div>
            <div className="text-xs text-[#9EB3C8]">Tez kunda — 2025 yil</div>
          </div>
          <Tag label="Breve" type="gray" />
        </div>
      </div>
    </>
  );
}

function CourseDetail({ course, onBack, onLesson }) {
  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <BtnGhost onClick={onBack} className="!w-auto !px-3 !py-2 text-xs">← Orqaga</BtnGhost>
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
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all
                ${l.done ? "bg-green-50 border border-green-100 cursor-default" :
                  l.active ? "bg-[#EEF4FB] border border-[#173B64]/20 hover:border-[#173B64]/40 cursor-pointer" :
                  "border border-[#DDE6F0] hover:bg-[#F0F5FC] cursor-pointer"}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
                ${l.done ? "bg-green-500 text-white" : l.active ? "bg-[#173B64] text-white" : "bg-[#F0F5FC] text-[#9EB3C8]"}`}>
                {l.done ? "✓" : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold truncate ${l.done ? "text-green-700" : "text-[#173B64]"}`}>{l.title}</div>
                <div className="text-[11px] text-[#9EB3C8] mt-0.5">{l.desc} · {l.dur} daqiqa</div>
              </div>
              {l.active && <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">Faol</span>}
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
        <BtnGhost onClick={onBack} className="!w-auto !px-3 !py-1.5 text-xs">← Orqaga</BtnGhost>
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
