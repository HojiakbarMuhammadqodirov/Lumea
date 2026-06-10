import { useState } from "react";
import { Card, SLabel, PBar, BtnPrimary, BtnGhost, Sep, StatCard, Grid, QuestionOption } from "../UI";
import { useApp } from "../useApp";

function TestTypeIcon({ variant }) {
  if (variant === "sat") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 4h10" />
        <path d="M7 10h10" />
        <path d="M7 16h6" />
        <rect x="4" y="3" width="16" height="18" rx="2" />
      </svg>
    );
  }

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F9E6A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4h12a2 2 0 0 1 2 2v12H8a2 2 0 0 0-2 2V4Z" />
      <path d="M8 4v16" />
      <path d="M11 8h6" />
      <path d="M11 12h6" />
    </svg>
  );
}

export default function TestsPage() {
  const { tests, questions, showToast } = useApp();
  const [testOn, setTestOn] = useState(false);
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const startTest = () => {
    setTestOn(true);
    setQi(0);
    setSel(null);
    setAnswered(false);
    setScore(0);
  };

  const check = () => {
    if (sel === null) return;
    setAnswered(true);
    if (sel === questions[qi].ans) setScore((current) => current + 1);
  };

  const next = () => {
    if (qi < questions.length - 1) {
      setQi((current) => current + 1);
      setSel(null);
      setAnswered(false);
      return;
    }

    showToast(`Test tugadi! Ball: ${score + (sel === questions[qi].ans ? 1 : 0)}/${questions.length}`);
    setTestOn(false);
  };

  const optState = (i) => {
    if (!answered) return sel === i ? "selected" : "idle";
    if (i === questions[qi].ans) return "correct";
    if (i === sel) return "wrong";
    return "idle";
  };

  if (testOn) {
    const q = questions[qi];
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-[#9EB3C8]">Savol {qi + 1} / {questions.length}</span>
          <span className="text-sm font-bold text-[#2563EB]">Ball: {score}/{qi}</span>
          <BtnGhost onClick={() => setTestOn(false)} className="!w-auto !px-3 !py-1.5 text-xs">Tugatish</BtnGhost>
        </div>
        <PBar pct={Math.round((qi / questions.length) * 100)} color="#173B64" height={4} />

        <div className="text-[15px] font-semibold text-[#173B64] my-5 leading-relaxed">{q.q}</div>

        {q.opts.map((opt, i) => (
          <QuestionOption key={i} label={String.fromCharCode(65 + i)} text={opt} state={optState(i)} onClick={() => { if (!answered) setSel(i); }} />
        ))}

        {answered && <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 mt-2 text-sm text-green-800 leading-relaxed">{q.exp}</div>}

        <div className="mt-4">
          {!answered ? (
            <BtnPrimary onClick={check} disabled={sel === null}>Tekshirish</BtnPrimary>
          ) : (
            <BtnPrimary onClick={next}>{qi < questions.length - 1 ? "Keyingi savol →" : "Natijani ko'rish"}</BtnPrimary>
          )}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Grid cols={3} gap={12}>
        <StatCard value={tests.length} label="Jami testlar" color="#2563EB" />
        <StatCard value={tests.length ? Math.max(...tests.map((t) => t.score)) : 0} label="Eng yuqori ball" color="#0F9E6A" />
        <StatCard value={`+${tests.reduce((a, t) => a + (t.change || 0), 0)}`} label="Umumiy o'sish" color="#D97706" />
      </Grid>

      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:border-blue-300 transition-all" onClick={startTest}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><TestTypeIcon variant="sat" /></div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Tayyor</span>
          </div>
          <h3 className="text-base font-bold text-[#173B64] mb-1">SAT Math Mock Test</h3>
          <p className="text-xs text-[#9EB3C8] mb-4">Algebra, advanced math, data analysis · 44 savol · 70 daqiqa</p>
          <BtnPrimary onClick={startTest}>Testni boshlash →</BtnPrimary>
        </Card>

        <Card className="cursor-pointer hover:border-green-300 transition-all" onClick={startTest}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center"><TestTypeIcon variant="ielts" /></div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Tayyor</span>
          </div>
          <h3 className="text-base font-bold text-[#173B64] mb-1">IELTS Reading Mock</h3>
          <p className="text-xs text-[#9EB3C8] mb-4">Academic reading · 3 passage · 40 savol · 60 daqiqa</p>
          <BtnPrimary onClick={startTest} className="!bg-[#0F9E6A] hover:!bg-[#0a7d55]">Testni boshlash →</BtnPrimary>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <SLabel className="!mb-0">Test tarixi</SLabel>
          <span className="text-xs text-[#9EB3C8]">So'nggi {tests.length} ta</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {tests.map((t, i) => (
            <div key={t.id} className={`flex items-center gap-3 px-3.5 py-3 rounded-xl ${i === 0 ? "bg-[#F0F5FC] border border-[#DDE6F0]" : "border border-transparent"}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${t.type === "sat" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-700"}`}>
                {t.score}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#173B64] truncate">{t.name}</div>
                <div className="text-[11px] text-[#9EB3C8] mt-0.5">{t.date} · /{t.max}</div>
              </div>
              <div className="text-right shrink-0">
                {t.change !== null ? (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+{t.change}</span>
                ) : (
                  <span className="text-[10px] text-[#9EB3C8] bg-[#F0F5FC] px-2 py-1 rounded-lg">baza</span>
                )}
                <div className="text-[10px] text-[#9EB3C8] mt-1 uppercase tracking-wide">{t.type}</div>
              </div>
            </div>
          ))}
        </div>
        <Sep />
        <BtnGhost onClick={startTest} className="text-xs">Yangi test boshlash</BtnGhost>
      </Card>
    </>
  );
}
