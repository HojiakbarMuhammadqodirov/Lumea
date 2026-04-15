import { useState } from "react";
import { C } from "../tokens";
import { Card, Card2, SLabel, PBar, Sep, IconBox, Row, Tag, BtnPrimary, BtnGhost, ActivityBars, CountdownBoxes, StatCard, Grid } from "../UI";
import { ScoreModal, DateModal } from "../Modals";
import { useApp } from "../useApp";

export default function HomePage({ onNav, onStartTest }) {
  const { user, examDate, courses, tests, weakTopics, activity, activityDays, todayIndex, showToast } = useApp();
  const [modal, setModal] = useState(null);
  const totalMins = activity.reduce((a, b) => a + b, 0);

  return (
    <>
      {modal === "score" && <ScoreModal onClose={() => setModal(null)} />}
      {modal === "date"  && <DateModal  onClose={() => setModal(null)} />}

      {/* Row 1 */}
      <div className="grid grid-cols-3 gap-4">
        {/* Daily Task */}
        <Card className="flex flex-col gap-3">
          <SLabel>Bugungi vazifa</SLabel>
          <Card2 className="flex items-center gap-3 !p-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-base shrink-0">∑</div>
            <div>
              <div className="text-sm font-semibold text-[#173B64]">Algebra — Lesson 4</div>
              <div className="text-xs text-[#9EB3C8] mt-0.5">SAT Math · 18 daqiqa</div>
            </div>
          </Card2>
          <BtnPrimary onClick={() => onNav("lessons")}>▶  Darsni boshlash</BtnPrimary>
        </Card>

        {/* Countdown */}
        <Card>
          <SLabel>Imtihongacha</SLabel>
          <CountdownBoxes examDate={examDate} />
          <BtnGhost onClick={() => setModal("date")} className="text-xs mt-1">Sana o'zgartirish</BtnGhost>
        </Card>

        {/* Targets */}
        <Card>
          <SLabel>Maqsad balllar</SLabel>
          <div className="flex gap-2 mb-3">
            <TargetBox label="SAT" value={user.sat.target} current={user.sat.current} accent="#2563EB" />
            <TargetBox label="IELTS" value={user.ielts.target.toFixed(1)} current={user.ielts.current.toFixed(1)} accent="#0F9E6A" />
          </div>
          <BtnGhost onClick={() => setModal("score")} className="text-xs">Maqsadni tahrirlash</BtnGhost>
        </Card>
      </div>

      {/* Row 2 — Courses + Activity */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SLabel className="!mb-0">Kurslar progressi</SLabel>
            <TextBtn onClick={() => onNav("lessons")}>Hammasi →</TextBtn>
          </div>
          {courses.map((c, i) => (
            <Row key={c.id} noBorder={i === courses.length - 1}>
              <IconBox icon={c.icon} color={c.color} glow={c.glow} size={34} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-[#173B64]">{c.label}</span>
                  <span className="text-xs font-bold" style={{ color: c.color }}>{c.pct}%</span>
                </div>
                <PBar pct={c.pct} color={c.color} />
                <div className="text-[11px] text-[#9EB3C8] mt-1">{c.done}/{c.total} dars</div>
              </div>
              <Tag label="Faol" type={c.tag} />
            </Row>
          ))}
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <SLabel>Haftalik faollik</SLabel>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-2xl font-bold text-[#173B64] tracking-tight">{totalMins}</span>
              <span className="text-xs text-[#9EB3C8]">daqiqa</span>
            </div>
            <ActivityBars data={activity} days={activityDays} todayIdx={todayIndex} />
          </Card>
          <Card className="!py-3.5 !px-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#173B64]">Streak</div>
                <div className="text-xs text-[#9EB3C8] mt-0.5">{user.streak} kun uzluksiz</div>
              </div>
              <div className="flex gap-1 items-center">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    style={{ background: i < user.streak ? "#173B64" : "#DDE6F0" }}
                    className="w-2 h-2 rounded-full"
                  />
                ))}
                <span className="text-[10px] text-[#9EB3C8] ml-1">{user.streak}/7</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3 — Tests + Weak Topics */}
      <Grid cols={2}>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SLabel className="!mb-0">So'nggi testlar</SLabel>
            <TextBtn onClick={() => onNav("tests")}>Barchasi →</TextBtn>
          </div>
          {tests.slice(0, 3).map((t, i) => (
            <div
              key={t.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1.5 ${i === 0 ? "bg-[#F0F5FC] border border-[#DDE6F0]" : ""}`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: t.type === "sat" ? "rgba(37,99,235,0.09)" : "rgba(15,158,106,0.09)",
                  color:      t.type === "sat" ? "#2563EB" : "#0F9E6A",
                }}
              >
                {t.score}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[#173B64] truncate">{t.name}</div>
                <div className="text-[10px] text-[#9EB3C8] mt-0.5">{t.date} · /{t.max}</div>
              </div>
              {t.change !== null
                ? <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+{t.change}</span>
                : <span className="text-[10px] text-[#9EB3C8] bg-[#F0F5FC] px-2 py-0.5 rounded-full">baza</span>
              }
            </div>
          ))}
          <Sep />
          <BtnGhost onClick={onStartTest} className="text-xs">Yangi test boshlash</BtnGhost>
        </Card>

        <Card>
          <SLabel>Zaif mavzular</SLabel>
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
          <BtnPrimary onClick={onStartTest} className="text-xs">Zaif mavzularni mashq qilish →</BtnPrimary>
        </Card>
      </Grid>

      {/* Pro Banner */}
      <div className="bg-[#0F2746] rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-[#173B64] rounded-xl flex items-center justify-center text-xl shrink-0">🤖</div>
          <div>
            <div className="text-white font-bold text-sm mb-1">AI Tushuntiruvchi — Pro rejim</div>
            <div className="text-[#9EB3C8] text-xs leading-relaxed">
              Noto'g'ri javobda AI boshqacha usulda tushuntiradi · Shaxsiy o'quv rejasi · Sertifikat
              <br /><span className="text-[#6B7E96]">Oyiga 59,000 so'm</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => showToast("Pro rejim tez kunda! 🚀")}
          className="shrink-0 bg-white text-[#173B64] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#F0F5FC] transition-colors whitespace-nowrap"
        >
          Pro ga o'tish →
        </button>
      </div>
    </>
  );
}

function TargetBox({ label, value, current, accent }) {
  return (
    <div className="flex-1 bg-[#F0F5FC] border border-[#DDE6F0] rounded-xl p-3 text-center">
      <div className="text-[9px] font-bold uppercase tracking-wide mb-1" style={{ color: accent }}>{label}</div>
      <div className="text-2xl font-bold leading-none tracking-tight" style={{ color: accent }}>{value}</div>
      <div className="text-[10px] text-[#9EB3C8] mt-1">Hozir: {current}</div>
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
