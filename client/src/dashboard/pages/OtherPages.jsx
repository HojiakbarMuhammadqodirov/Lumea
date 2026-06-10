import { useState } from "react";
import { Card, SLabel, PBar, BtnPrimary, BtnGhost, Sep, StatCard, Grid, ActivityBars } from "../UI";
import { ScoreModal } from "../Modals";
import { useApp } from "../useApp";
import { DB } from "../db";

export function StatsPage() {
  const { user, tests, weakTopics, activity, activityDays, todayIndex } = useApp();

  return (
    <>
      <Grid cols={4} gap={12}>
        <StatCard value={user.sat.current} label="SAT ball" color="#2563EB" />
        <StatCard value={user.ielts.current.toFixed(1)} label="IELTS ball" color="#0F9E6A" />
        <StatCard value={`${user.streak} kun`} label="Streak" color="#D97706" />
        <StatCard value={user.regionRank !== "—" ? `#${user.regionRank}` : "—"} label="Viloyat reytingi" color="#6D28D9" />
      </Grid>

      <Grid cols={2}>
        <Card>
          <SLabel>SAT progress</SLabel>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center shrink-0">
              <div className="text-3xl font-bold text-[#2563EB] tracking-tight leading-none">{user.sat.current}</div>
              <div className="text-[11px] text-[#9EB3C8] mt-1">Hozir</div>
            </div>
            <div className="flex-1">
              <PBar pct={Math.round((user.sat.current / (user.sat.target || 1)) * 100)} color="#2563EB" height={10} />
              <div className="flex justify-between text-[11px] text-[#9EB3C8] mt-1.5">
                <span>400</span>
                <span>Maqsad: {user.sat.target}</span>
              </div>
            </div>
          </div>
          {tests.filter((t) => t.type === "sat").map((t) => (
            <div key={t.id} className="flex justify-between items-center py-2 border-b border-[#DDE6F0]">
              <span className="text-xs text-[#6B7E96]">{t.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#173B64]">{t.score}</span>
                {t.change ? <span className="text-xs text-green-600 font-semibold">+{t.change}</span> : null}
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <SLabel>IELTS progress</SLabel>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center shrink-0">
              <div className="text-3xl font-bold text-[#0F9E6A] tracking-tight leading-none">{user.ielts.current.toFixed(1)}</div>
              <div className="text-[11px] text-[#9EB3C8] mt-1">Hozir</div>
            </div>
            <div className="flex-1">
              <PBar pct={Math.round((user.ielts.current / (user.ielts.target || 1)) * 100)} color="#0F9E6A" height={10} />
              <div className="flex justify-between text-[11px] text-[#9EB3C8] mt-1.5">
                <span>1.0</span>
                <span>Maqsad: {user.ielts.target.toFixed(1)}</span>
              </div>
            </div>
          </div>
          {tests.filter((t) => t.type === "ielts").map((t) => (
            <div key={t.id} className="flex justify-between items-center py-2 border-b border-[#DDE6F0]">
              <span className="text-xs text-[#6B7E96]">{t.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#173B64]">{t.score}</span>
                {t.change ? <span className="text-xs text-green-600 font-semibold">+{t.change}</span> : null}
              </div>
            </div>
          ))}
        </Card>
      </Grid>

      <Card>
        <SLabel>Haftalik faollik</SLabel>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-[#173B64] tracking-tight">{activity.reduce((a, b) => a + b, 0)}</span>
          <span className="text-xs text-[#9EB3C8]">umumiy daqiqa bu hafta</span>
        </div>
        <ActivityBars data={activity} days={activityDays} todayIdx={todayIndex} />
      </Card>

      <Card>
        <SLabel>Zaif mavzular</SLabel>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {weakTopics.map((w) => (
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

const REGION_OPTIONS = ["Barchasi", ...DB.regions];
const GRADE_OPTIONS = ["Barchasi", "8", "9", "10", "11", "12"];
const EXAM_OPTIONS = [
  { id: "all", label: "Barchasi" },
  { id: "sat", label: "Faqat SAT" },
  { id: "ielts", label: "Faqat IELTS" },
];

function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={active
        ? { background: "#173B64", color: "#F6FAFF", border: "1px solid #173B64", borderRadius: 10, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }
        : { background: "#ffffff", color: "#6B7E96", border: "1px solid #DDE6F0", borderRadius: 10, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }
      }
    >
      {children}
    </button>
  );
}

export function RatingPage() {
  const { user, ranking } = useApp();
  const [regionFilter, setRegionFilter] = useState("Barchasi");
  const [gradeFilter, setGradeFilter] = useState("Barchasi");
  const [examFilter, setExamFilter] = useState("all");

  const filtered = ranking.filter((r) => {
    if (regionFilter !== "Barchasi" && r.region !== regionFilter) return false;
    if (gradeFilter !== "Barchasi" && r.grade !== gradeFilter) return false;
    if (examFilter === "sat" && (!r.sat || r.sat === 0)) return false;
    if (examFilter === "ielts" && (!r.ielts || r.ielts === 0)) return false;
    return true;
  }).map((r, i) => ({ ...r, rank: i + 1 }));

  const myEntry = filtered.find((r) => r.name === `${user.firstName} ${user.lastName}` || r.id === user.id);
  const myRank = myEntry?.rank;

  return (
    <>
      <Grid cols={3} gap={12}>
        <StatCard value={myRank ? `#${myRank}` : "—"} label={`${user.region || "Viloyat"} reytingi`} color="#2563EB" />
        <StatCard value={filtered.length} label="Jami o'quvchilar" color="#6D28D9" />
        <StatCard value={myRank ? `Top ${Math.max(1, Math.round((myRank / filtered.length) * 100))}%` : "—"} label="Foiz" color="#D97706" />
      </Grid>

      <Card>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <div style={{ width: "100%" }}>
            <div className="text-[10px] text-[#9EB3C8] uppercase tracking-wide mb-1.5">Viloyat</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {REGION_OPTIONS.slice(0, 5).map((r) => (
                <FilterBtn key={r} active={regionFilter === r} onClick={() => setRegionFilter(r)}>{r === "Barchasi" ? "Barchasi" : r.replace(" viloyati", "")}</FilterBtn>
              ))}
              {REGION_OPTIONS.length > 5 && (
                <select
                  value={REGION_OPTIONS.slice(5).includes(regionFilter) ? regionFilter : ""}
                  onChange={(e) => e.target.value && setRegionFilter(e.target.value)}
                  style={{ border: "1px solid #DDE6F0", borderRadius: 10, padding: "5px 10px", fontSize: 12, color: "#6B7E96", background: "white", cursor: "pointer" }}
                >
                  <option value="">Boshqalar...</option>
                  {REGION_OPTIONS.slice(5).map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              )}
            </div>
          </div>

          <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="text-[10px] text-[#9EB3C8] uppercase tracking-wide mb-1.5">Sinf</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {GRADE_OPTIONS.map((g) => (
                  <FilterBtn key={g} active={gradeFilter === g} onClick={() => setGradeFilter(g)}>{g}</FilterBtn>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#9EB3C8] uppercase tracking-wide mb-1.5">Imtihon</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {EXAM_OPTIONS.map((e) => (
                  <FilterBtn key={e.id} active={examFilter === e.id} onClick={() => setExamFilter(e.id)}>{e.label}</FilterBtn>
                ))}
              </div>
            </div>
          </div>
        </div>

        <SLabel>Reyting jadvali</SLabel>
        <div className="flex flex-col gap-1.5">
          {filtered.length === 0 ? (
            <div className="text-sm text-[#9EB3C8] text-center py-8">Hech kim topilmadi</div>
          ) : filtered.map((r) => {
            const isMe = r.name === `${user.firstName} ${user.lastName}` || r.id === user.id;
            return (
              <div key={r.id || r.rank} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isMe ? "bg-[#EEF4FB] border border-[#173B64]/20" : "border border-transparent hover:bg-[#F0F5FC]"}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${r.rank === 1 ? "bg-yellow-400 text-white" : r.rank === 2 ? "bg-gray-300 text-gray-700" : r.rank === 3 ? "bg-orange-400 text-white" : "bg-[#F0F5FC] text-[#9EB3C8]"}`}>
                  {r.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold truncate ${isMe ? "text-[#2563EB]" : "text-[#173B64]"}`}>
                    {r.name} {isMe ? <span className="text-xs font-normal">(Men)</span> : null}
                  </div>
                  <div className="text-[11px] text-[#9EB3C8]">{r.region}{r.grade ? ` · ${r.grade}-sinf` : ""}</div>
                </div>
                {examFilter !== "ielts" && (
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-[#173B64]">{r.sat || 0}</div>
                    <div className="text-[11px] text-[#9EB3C8]">SAT</div>
                  </div>
                )}
                {examFilter !== "sat" && (
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-[#0F9E6A]">{Number(r.ielts || 0).toFixed(1)}</div>
                    <div className="text-[11px] text-[#9EB3C8]">IELTS</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}

export function ProfilePage() {
  const { user, updateUser, showToast, onLogout, regions } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    grade: user.grade,
    goal: user.goal,
    region: user.region,
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

  const rankValue = user.regionRank !== "—" ? `#${user.regionRank}` : null;

  return (
    <>
      {modal ? <ScoreModal onClose={() => setModal(false)} /> : null}

      <Grid cols={2}>
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
            <input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Familiya">
            <input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Sinf">
            <select value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))} className={inputCls}>
              {["8", "9", "10", "11", "12"].map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Maqsad">
            <select value={form.goal} onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))} className={inputCls}>
              {["SAT", "IELTS", "Ikkalasi"].map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Viloyat">
            <select value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} className={inputCls}>
              {(regions || []).map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <BtnPrimary onClick={save}>Saqlash</BtnPrimary>
        </Card>

        <div className="flex flex-col gap-4">
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

          <Card>
            <SLabel>Hisob holati</SLabel>
            {[
              { label: "Rejim", value: "Bepul", cls: "bg-[#F0F5FC] text-[#9EB3C8] px-2 py-0.5 rounded-full text-[11px]" },
              { label: "Streak", value: `${user.streak} kun`, cls: "text-orange-500 font-semibold text-sm" },
              {
                label: "Reyting",
                value: rankValue || "Hali reytingda emas",
                cls: rankValue ? "text-[#2563EB] font-bold text-sm" : "text-[#9EB3C8] text-sm",
              },
            ].map((row, i, arr) => (
              <div key={row.label} className={`flex items-center justify-between py-2.5 ${i < arr.length - 1 ? "border-b border-[#DDE6F0]" : ""}`}>
                <span className="text-sm text-[#6B7E96]">{row.label}</span>
                <span className={row.cls}>{row.value}</span>
              </div>
            ))}
            <Sep />
            <BtnPrimary onClick={() => showToast("Pro rejim tez kunda!")} className="text-xs">
              Pro rejimga o'tish →
            </BtnPrimary>
          </Card>

          <Card>
            <SLabel>Xavfsizlik</SLabel>
            <div className="flex flex-col gap-2">
              <BtnGhost onClick={() => showToast("Parol o'zgartirildi!")} className="text-xs">Parolni o'zgartirish</BtnGhost>
              <button onClick={() => onLogout?.()} style={{ background: "none", border: "1px solid #fecaca", color: "#ef4444", borderRadius: 12, padding: "10px 16px", fontSize: 12, fontWeight: 500, cursor: "pointer", width: "100%", transition: "background 150ms" }}>
                Hisobdan chiqish
              </button>
            </div>
          </Card>
        </div>
      </Grid>
    </>
  );
}
