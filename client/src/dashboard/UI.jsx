import { useState, useEffect } from "react";
import { TAG } from "./tokens";

export function BtnPrimary({ children, onClick, className = "", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-[#173B64] hover:bg-[#0F2746] text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function BtnGhost({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full border border-[#DDE6F0] text-[#6B7E96] hover:bg-[#F0F5FC] hover:text-[#173B64] rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function BtnIcon({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`bg-[#F0F5FC] border border-[#DDE6F0] rounded-xl p-2 text-[#6B7E96] hover:bg-[#E4EDF8] transition-colors flex items-center justify-center ${className}`}
    >
      {children}
    </button>
  );
}

export function Tag({ label, type = "gray" }) {
  const s = TAG[type] || TAG.gray;
  return (
    <span style={{ background: s.background, color: s.color }} className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
      {label}
    </span>
  );
}

export function PBar({ pct, color, height = 5 }) {
  return (
    <div style={{ height }} className="bg-[#DDE6F0] rounded-full overflow-hidden">
      <div style={{ width: `${pct}%`, height, background: color, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} className="rounded-full" />
    </div>
  );
}

export function Card({ children, className = "", onClick }) {
  return (
    <div onClick={onClick} className={`bg-white border border-[#DDE6F0] rounded-2xl p-5 ${onClick ? "cursor-pointer hover:border-[#b5c8e0] transition-colors" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function Card2({ children, className = "" }) {
  return <div className={`bg-[#F0F5FC] border border-[#DDE6F0] rounded-xl p-4 ${className}`}>{children}</div>;
}

export function SLabel({ children, className = "" }) {
  return <div className={`text-[10px] text-[#9EB3C8] uppercase tracking-widest font-bold mb-2.5 ${className}`}>{children}</div>;
}

export function Sep({ className = "" }) {
  return <div className={`h-px bg-[#DDE6F0] my-3.5 ${className}`} />;
}

export function Avatar({ initials, size = 32 }) {
  return (
    <div style={{ width: size, height: size, fontSize: size * 0.35 }} className="rounded-full bg-[#173B64] flex items-center justify-center text-white font-bold shrink-0">
      {initials}
    </div>
  );
}

export function IconBox({ icon, color, glow, size = 34 }) {
  return (
    <div style={{ width: size, height: size, background: glow || "rgba(37,99,235,0.09)", color }} className="rounded-xl flex items-center justify-center text-base font-bold shrink-0">
      {icon}
    </div>
  );
}

export function Row({ children, noBorder = false, className = "" }) {
  return <div className={`flex items-center gap-3 py-3 ${!noBorder ? "border-b border-[#DDE6F0]" : ""} ${className}`}>{children}</div>;
}

export function Grid({ children, cols = 2, gap = 16 }) {
  const colClass = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }[cols] || "grid-cols-2";
  return <div className={`grid ${colClass}`} style={{ gap }}>{children}</div>;
}

export function StatCard({ value, label, color }) {
  return (
    <div className="bg-white border border-[#DDE6F0] rounded-2xl p-4 text-center">
      <div style={{ color }} className="text-2xl font-bold tracking-tight leading-none mb-1">{value}</div>
      <div className="text-[11px] text-[#9EB3C8] font-medium">{label}</div>
    </div>
  );
}

export function ActivityBars({ data, days, todayIdx }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5 h-14">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div style={{ height: `${Math.max((v / max) * 44, 4)}px`, background: i === todayIdx ? "#173B64" : "#DDE6F0" }} className="w-full rounded-sm transition-all" />
          <div className={`text-[9px] ${i === todayIdx ? "text-[#173B64] font-bold" : "text-[#9EB3C8]"}`}>{days[i]}</div>
        </div>
      ))}
    </div>
  );
}

export function CountdownBoxes({ examDate }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, examDate - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex gap-2 mb-3">
      {[{ v: days, l: "Kun" }, { v: hours, l: "Soat" }, { v: mins, l: "Daqiqa" }, { v: secs, l: "Soniya" }].map(({ v, l }) => (
        <div key={l} className="flex-1 bg-[#F0F5FC] border border-[#DDE6F0] rounded-xl py-2 text-center">
          <div className="text-xl font-bold text-[#173B64] leading-none">{String(v).padStart(2, "0")}</div>
          <div className="text-[9px] text-[#9EB3C8] uppercase tracking-wide mt-1">{l}</div>
        </div>
      ))}
    </div>
  );
}

export function QuestionOption({ label, text, state, onClick }) {
  const styles = {
    idle: "border-[#DDE6F0] text-[#173B64] hover:border-blue-300 hover:bg-blue-50 cursor-pointer",
    selected: "border-[#173B64] bg-[#EEF4FB] text-[#173B64]",
    correct: "border-green-400 bg-green-50 text-green-800",
    wrong: "border-red-400 bg-red-50 text-red-800",
  };

  return (
    <div onClick={onClick} className={`flex items-start gap-3 border rounded-xl px-4 py-3 mb-2.5 transition-all ${styles[state] || styles.idle}`}>
      <span className="font-bold text-sm shrink-0 w-5">{label}.</span>
      <span className="text-sm leading-relaxed">{text}</span>
    </div>
  );
}

function ToastIcon({ error }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {error ? (
        <>
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </>
      ) : (
        <path d="M20 6 9 17l-5-5" />
      )}
    </svg>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  const data = typeof toast === "string" ? { msg: toast, type: "success" } : toast;
  const isErr = data.type === "error";

  return (
    <div
      style={{ animation: "toastIn .25s ease" }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium ${isErr ? "bg-red-50 border border-red-200 text-red-700" : "bg-[#173B64] text-white"}`}
    >
      <ToastIcon error={isErr} />
      {data.msg}
    </div>
  );
}
