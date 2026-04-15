import { useState } from "react";
import { useApp } from "./useApp";
import { BtnPrimary, BtnGhost, Sep } from "./UI";

function ModalShell({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-[#DDE6F0] shadow-xl p-6 w-full max-w-sm mx-4">
        {children}
        <div className="mt-3">
          <BtnGhost onClick={onClose}>Bekor qilish</BtnGhost>
        </div>
      </div>
    </div>
  );
}

export function ScoreModal({ onClose }) {
  const { user, updateUser, showToast } = useApp();
  const [sat, setSat] = useState(user.sat.target);
  const [ielts, setIelts] = useState(user.ielts.target);

  const save = () => {
    updateUser({ sat: { ...user.sat, target: sat }, ielts: { ...user.ielts, target: ielts } });
    showToast("Maqsad yangilandi!");
    onClose();
  };

  return (
    <ModalShell onClose={onClose}>
      <h2 className="text-[#173B64] font-bold text-lg mb-4">Maqsad balllarni o'zgartirish</h2>
      <label className="block mb-4">
        <div className="text-xs text-[#9EB3C8] uppercase tracking-widest font-bold mb-2">SAT Maqsad</div>
        <input
          type="number" min={400} max={1600} step={10} value={sat}
          onChange={e => setSat(+e.target.value)}
          className="w-full border border-[#DDE6F0] rounded-xl px-4 py-2.5 text-[#173B64] text-sm focus:outline-none focus:border-[#173B64]"
        />
      </label>
      <label className="block mb-5">
        <div className="text-xs text-[#9EB3C8] uppercase tracking-widest font-bold mb-2">IELTS Maqsad</div>
        <input
          type="number" min={1} max={9} step={0.5} value={ielts}
          onChange={e => setIelts(+e.target.value)}
          className="w-full border border-[#DDE6F0] rounded-xl px-4 py-2.5 text-[#173B64] text-sm focus:outline-none focus:border-[#173B64]"
        />
      </label>
      <BtnPrimary onClick={save}>Saqlash</BtnPrimary>
    </ModalShell>
  );
}

export function DateModal({ onClose }) {
  const { setExamDate, showToast } = useApp();
  const [val, setVal] = useState("");

  const save = () => {
    if (!val) return;
    setExamDate(new Date(val));
    showToast("Sana yangilandi!");
    onClose();
  };

  return (
    <ModalShell onClose={onClose}>
      <h2 className="text-[#173B64] font-bold text-lg mb-4">Imtihon sanasini o'zgartirish</h2>
      <label className="block mb-5">
        <div className="text-xs text-[#9EB3C8] uppercase tracking-widest font-bold mb-2">Yangi sana</div>
        <input
          type="date" value={val}
          onChange={e => setVal(e.target.value)}
          className="w-full border border-[#DDE6F0] rounded-xl px-4 py-2.5 text-[#173B64] text-sm focus:outline-none focus:border-[#173B64]"
        />
      </label>
      <BtnPrimary onClick={save}>Saqlash</BtnPrimary>
    </ModalShell>
  );
}
