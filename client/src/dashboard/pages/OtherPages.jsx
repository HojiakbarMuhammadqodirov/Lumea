import { useState } from "react";
import { Card, Card2, SLabel, PBar, BtnPrimary, BtnGhost, Sep, StatCard, Grid, ActivityBars, Avatar } from "../UI";
import { ScoreModal } from "../Modals";
import { useApp } from "../useApp";

// ─── Stats ────────────────────────────────────────────────────────────────────
export function StatsPage() {
  const { user, tests, weakTopics, activity, activityDays, todayIndex } = useApp();

  return (
    <>
      <Grid cols={4} gap={12}>
        <StatCard value={user.sat.current}            label="SAT ball"       color="#2563EB" />
        <StatCard value={user.ielts.current.toFixed(1)} label="IELTS ball"   color="#0F9E6A" />
        <StatCard value={`${user.streak} kun`}        label="Streak"         color="#D97706" />
        <StatCard value={`#${user.regionRank}`}       label="Viloyat reytingi" color="#6D28D9" />
      </Grid>

      <Grid cols={2}>
        {/* SAT */}
        <Card>
          <SLabel>SAT progress</SLabel>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center shrink-0">
              <div className="text-3xl font-bold text-[#2563EB] tracking-tight leading-none">{user.sat.current}</div>
              <div className="text-[11px] text-[#9EB3C8] mt-1">Hozir</div>
            </div>
            <div className="flex-1">
              <PBar pct={Math.round((user.sat.current / user.sat.target) * 100)} color="#2563EB" height={10} />
              <div className="flex justify-between text-[11px] text-[#9EB3C8] mt-1.5">
                <span>400</span><span>Maqsad: {user.sat.target}</span>
              </div>
            </div>
          </div>
          {tests.filter(t => t.type === "sat").map(t => (
            <div key={t.id} className="flex justify-between items-center py-2 border-b border-[#DDE6F0]">
              <span className="text-xs text-[#6B7E96]">{t.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#173B64]">{t.score}</span>
                {t.change && <span className="text-xs text-green-600 font-semibold">+{t.change}</span>}
              </div>
            </div>
          ))}
        </Card>

        {/* IELTS */}
        <Card>
          <SLabel>IELTS progress</SLabel>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center shrink-0">
              <div className="text-3xl font-bold text-[#0F9E6A] tracking-tight leading-none">{user.ielts.current.toFixed(1)}</div>
              <div className="text-[11px] text-[#9EB3C8] mt-1">Hozir</div>
            </div>
            <div className="flex-1">
              <PBar pct={Math.round((user.ielts.current / user.ielts.target) * 100)} color="#0F9E6A" height={10} />
              <div className="flex justify-between text-[11px] text-[#9EB3C8] mt-1.5">
                <span>1.0</span><span>Maqsad: {user.ielts.target.toFixed(1)}</span>
              </div>
            </div>
          </div>
          {tests.filter(t => t.type === "ielts").map(t => (
            <div key={t.id} className="flex justify-between items-center py-2 border-b border-[#DDE6F0]">
              <span className="text-xs text-[#6B7E96]">{t.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#173B64]">{t.score}</span>
                {t.change && <span className="text-xs text-green-600 font-semibold">+{t.change}</span>}
              </div>
            </div>
          ))}
        </Card>
      </Grid>

      {/* Activity */}
      <Card>
        <SLabel>Haftalik faollik</SLabel>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-[#173B64] tracking-tight">
            {activity.reduce((a, b) => a + b, 0)}
          </span>
          <span className="text-xs text-[#9EB3C8]">umumiy daqiqa bu hafta</span>
        </div>
        <ActivityBars data={activity} days={activityDays} todayIdx={todayIndex} />
      </Card>

      {/* Weak topics */}
      <Card>
        <SLabel>Zaif mavzular</SLabel>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {weakTopics.map(w => (
            <div key={w.name}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-[#173B64]">{w.name}</span>
                <span className="text-xs font-bold" style={{ color: w.color }}>{w.pct}%</span>
              </div>
              <PBar pct={w.pct} color={w.color} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

// ─── Rating ───────────────────────────────────────────────────────────────────
export function RatingPage() {
  const { user, ranking } = useApp();

  return (
    <>
      <Grid cols={3} gap={12}>
        <StatCard value={`#${user.regionRank}`}     label={`${user.region} reytingi`} color="#2563EB" />
        <StatCard value={user.totalInRegion}         label="Viloyatdagi o'quvchilar"   color="#6D28D9" />
        <StatCard value={`Top ${Math.round((user.regionRank / user.totalInRegion) * 100)}%`} label="Foiz" color="#D97706" />
      </Grid>

      <Card>
        <SLabel>Viloyat reytingi</SLabel>
        <div className="flex flex-col gap-1.5">
          {ranking.map((r, i) => {
            const isMe = r.name === `${user.firstName} ${user.lastName}`;
            return (
              <div key={r.rank}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isMe ? "bg-[#EEF4FB] border border-[#173B64]/20" : "border border-transparent hover:bg-[#F0F5FC]"}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0
                  ${r.rank === 1 ? "bg-yellow-400 text-white" :
                    r.rank === 2 ? "bg-gray-300 text-gray-700" :
                    r.rank === 3 ? "bg-orange-400 text-white" :
                    "bg-[#F0F5FC] text-[#9EB3C8]"}`}>
                  {r.rank <= 3 ? ["🥇","🥈","🥉"][r.rank-1] : r.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold truncate ${isMe ? "text-[#2563EB]" : "text-[#173B64]"}`}>
                    {r.name} {isMe && <span className="text-xs font-normal">(Men)</span>}
                  </div>
                  <div className="text-[11px] text-[#9EB3C8]">{r.region}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[#173B64]">{r.sat}</div>
                  <div className="text-[11px] text-[#9EB3C8]">SAT</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[#0F9E6A]">{r.ielts.toFixed(1)}</div>
                  <div className="text-[11px] text-[#9EB3C8]">IELTS</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user, updateUser, showToast, onLogout, regions } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName:  user.lastName,
    grade:     user.grade,
    goal:      user.goal,
    region:    user.region,
  });

  const save = () => {
    updateUser(form);
    showToast("Profil yangilandi!");
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-[10px] text-[#9EB3C8] uppercase tracking-widest font-bold mb-1.5">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full border border-[#DDE6F0] rounded-xl px-3.5 py-2.5 text-sm text-[#173B64] bg-white focus:outline-none focus:border-[#173B64] transition-colors";

  return (
    <>
      {modal && <ScoreModal onClose={() => setModal(false)} />}

      <Grid cols={2}>
        {/* Personal info */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-4 pb-4 border-b border-[#DDE6F0]">
            <div className="w-14 h-14 rounded-2xl bg-[#173B64] flex items-center justify-center text-white text-xl font-bold">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div>
              <div className="text-lg font-bold text-[#173B64]">{user.firstName} {user.lastName}</div>
              <div className="text-xs text-[#9EB3C8]">{user.region} · {user.grade}-sinf</div>
            </div>
          </div>

          <Field label="Ism">
            <input value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} className={inputCls} />
          </Field>
          <Field label="Familiya">
            <input value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} className={inputCls} />
          </Field>
          <Field label="Sinf">
            <select value={form.grade} onChange={e => setForm(f => ({...f, grade: e.target.value}))} className={inputCls}>
              {["8","9","10","11","12"].map(g => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Maqsad">
            <select value={form.goal} onChange={e => setForm(f => ({...f, goal: e.target.value}))} className={inputCls}>
              {["SAT","IELTS","Ikkalasi"].map(g => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Viloyat">
            <select value={form.region} onChange={e => setForm(f => ({...f, region: e.target.value}))} className={inputCls}>
              {(regions || []).map(r => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <BtnPrimary onClick={save}>Saqlash</BtnPrimary>
        </Card>

        <div className="flex flex-col gap-4">
          {/* Scores */}
          <Card>
            <SLabel>Joriy balllar</SLabel>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <div className="text-[9px] text-blue-400 font-bold uppercase tracking-wide mb-1">SAT</div>
                <div className="text-2xl font-bold text-[#2563EB] leading-none">{user.sat.target}</div>
                <div className="text-[10px] text-[#9EB3C8] mt-1">Hozir: {user.sat.current}</div>
              </div>
              <div className="flex-1 bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <div className="text-[9px] text-green-600 font-bold uppercase tracking-wide mb-1">IELTS</div>
                <div className="text-2xl font-bold text-[#0F9E6A] leading-none">{user.ielts.target.toFixed(1)}</div>
                <div className="text-[10px] text-[#9EB3C8] mt-1">Hozir: {user.ielts.current.toFixed(1)}</div>
              </div>
            </div>
            <BtnGhost onClick={() => setModal(true)} className="text-xs">Maqsadni tahrirlash</BtnGhost>
          </Card>

          {/* Account */}
          <Card>
            <SLabel>Hisob holati</SLabel>
            {[
              { label: "Rejim",   value: "Bepul",              cls: "bg-[#F0F5FC] text-[#9EB3C8] px-2 py-0.5 rounded-full text-[11px]" },
              { label: "Streak",  value: `${user.streak} kun 🔥`, cls: "text-orange-500 font-semibold text-sm" },
              { label: "Reyting", value: `#${user.regionRank}`,   cls: "text-[#2563EB] font-bold text-sm" },
            ].map((row, i, arr) => (
              <div key={row.label} className={`flex items-center justify-between py-2.5 ${i < arr.length-1 ? "border-b border-[#DDE6F0]" : ""}`}>
                <span className="text-sm text-[#6B7E96]">{row.label}</span>
                <span className={row.cls}>{row.value}</span>
              </div>
            ))}
            <Sep />
            <BtnPrimary onClick={() => showToast("Pro rejim tez kunda! 🚀")} className="text-xs">
              Pro rejimga o'tish →
            </BtnPrimary>
          </Card>

          {/* Security */}
          <Card>
            <SLabel>Xavfsizlik</SLabel>
            <div className="flex flex-col gap-2">
              <BtnGhost onClick={() => showToast("Parol o'zgartirildi!")} className="text-xs">Parolni o'zgartirish</BtnGhost>
              <button
                onClick={() => onLogout?.()}
                className="w-full border border-red-200 text-red-500 hover:bg-red-50 rounded-xl px-4 py-2.5 text-xs font-medium transition-colors"
              >
                Hisobdan chiqish
              </button>
            </div>
          </Card>
        </div>
      </Grid>
    </>
  );
}
