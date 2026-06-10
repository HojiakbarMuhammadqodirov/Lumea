import { useState, useEffect, useRef } from "react";

const NAVY = "#1b2a5e";
const BLUE_BTN = "#2B6FE6";
const DASHED = "repeating-linear-gradient(90deg,#444 0,#444 15px,transparent 15px,transparent 16px)";
const SERIF = "Georgia, 'Source Serif 4', 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const HL_COLORS = [
  { bg: "#FFE45C", ring: "#c9a800" },
  { bg: "#89D4DF", ring: "#4ab5c4" },
  { bg: "#F0AADA", ring: "#d07ab8" },
];

function PinIcon({ size = 14, color = NAVY }) {
  return (
    <svg width={size} height={size + 2} viewBox="0 0 14 18" fill={color}>
      <path d="M7 0C4.24 0 2 2.24 2 5c0 3.75 5 11 5 11s5-7.25 5-11C12 2.24 9.76 0 7 0zm0 7.5c-1.38 0-2.5-1.12-2.5-2.5S5.62 2.5 7 2.5 9.5 3.62 9.5 5 8.38 7.5 7 7.5z"/>
    </svg>
  );
}

export default function BluebookTest({ test, studentName = "Student", onExit }) {
  const sec = test.sections[0];
  const [qIdx, setQIdx] = useState(0);
  const q = sec.questions[qIdx];

  const [timerSec, setTimerSec] = useState(sec.time);
  const [timerVisible, setTimerVisible] = useState(true);
  const [abcOn, setAbcOn] = useState(false);
  const [lrOn, setLrOn] = useState(false);
  const [lrY, setLrY] = useState(200);
  const [navOpen, setNavOpen] = useState(false);
  const [dirOpen, setDirOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const [qStates, setQStates] = useState(() =>
    Object.fromEntries(sec.questions.map(q => [q.id, { ans: null, mark: false, elim: [] }]))
  );

  const [passageHTMLs, setPassageHTMLs] = useState({});
  const [hlBar, setHlBar] = useState(null);
  const savedRange = useRef(null);

  const passageRef = useRef(null);
  const mainRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startW: 0 });

  const qs = qStates[q.id] || { ans: null, mark: false, elim: [] };

  // Inject Source Serif 4 font
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch {} };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTimerSec(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!lrOn) return;
    const h = (e) => setLrY(e.clientY - 20);
    document.addEventListener("mousemove", h);
    return () => document.removeEventListener("mousemove", h);
  }, [lrOn]);

  useEffect(() => {
    if (!hlBar) return;
    const h = (e) => {
      if (passageRef.current?.contains(e.target)) return;
      setHlBar(null); savedRange.current = null;
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [hlBar]);

  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const cur = qStates[q.id] || { ans: null, mark: false, elim: [] };
      switch (e.key) {
        case "ArrowRight": case "ArrowDown":
          e.preventDefault(); setQIdx(i => Math.min(i + 1, sec.questions.length - 1)); break;
        case "ArrowLeft": case "ArrowUp":
          e.preventDefault(); setQIdx(i => Math.max(i - 1, 0)); break;
        case "a": case "A": case "1": if (!cur.elim.includes("A")) upd(q.id, s => ({ ...s, ans: s.ans === "A" ? null : "A" })); break;
        case "b": case "B": case "2": if (!cur.elim.includes("B")) upd(q.id, s => ({ ...s, ans: s.ans === "B" ? null : "B" })); break;
        case "c": case "C": case "3": if (!cur.elim.includes("C")) upd(q.id, s => ({ ...s, ans: s.ans === "C" ? null : "C" })); break;
        case "d": case "D": case "4": if (!cur.elim.includes("D")) upd(q.id, s => ({ ...s, ans: s.ans === "D" ? null : "D" })); break;
        case "m": case "M": upd(q.id, s => ({ ...s, mark: !s.mark })); break;
        case "Escape":
          setNavOpen(false); setDirOpen(false); setMoreOpen(false);
          setHlBar(null); savedRange.current = null; break;
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  });

  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d.active || !passageRef.current || !mainRef.current) return;
      const w = Math.max(200, Math.min(d.startW + e.clientX - d.startX, mainRef.current.offsetWidth - 200));
      passageRef.current.style.width = w + "px";
      passageRef.current.style.flex = "none";
    };
    const onUp = () => { dragRef.current.active = false; };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, []);

  const upd = (id, fn) =>
    setQStates(prev => ({ ...prev, [id]: fn(prev[id] || { ans: null, mark: false, elim: [] }) }));

  const pick = (cid) => { if (!qs.elim.includes(cid)) upd(q.id, s => ({ ...s, ans: s.ans === cid ? null : cid })); };
  const doElim = (cid) => upd(q.id, s => ({ ...s, elim: [...s.elim, cid], ans: s.ans === cid ? null : s.ans }));
  const undoElim = (cid) => upd(q.id, s => ({ ...s, elim: s.elim.filter(x => x !== cid) }));
  const toggleMark = () => upd(q.id, s => ({ ...s, mark: !s.mark }));

  const onPassageMouseUp = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (!passageRef.current?.contains(range.commonAncestorContainer)) return;
    const rect = range.getBoundingClientRect();
    if (rect.width < 1) return;
    savedRange.current = range.cloneRange();
    setHlBar({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const savePassage = () => {
    if (passageRef.current)
      setPassageHTMLs(prev => ({ ...prev, [q.id]: passageRef.current.innerHTML }));
    window.getSelection()?.removeAllRanges();
    savedRange.current = null;
    setHlBar(null);
  };

  const applyHL = (bg) => {
    if (!savedRange.current || !passageRef.current) return;
    const mark = document.createElement("mark");
    mark.style.cssText = `background:${bg};border-radius:2px;padding:0 1px`;
    try { savedRange.current.surroundContents(mark); }
    catch { const f = savedRange.current.extractContents(); mark.appendChild(f); savedRange.current.insertNode(mark); }
    savePassage();
  };

  const applyUL = () => {
    if (!savedRange.current || !passageRef.current) return;
    const span = document.createElement("span");
    span.style.textDecoration = "underline";
    try { savedRange.current.surroundContents(span); }
    catch { const f = savedRange.current.extractContents(); span.appendChild(f); savedRange.current.insertNode(span); }
    savePassage();
  };

  const removeHL = () => {
    if (!savedRange.current || !passageRef.current) return;
    const node = savedRange.current.commonAncestorContainer;
    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    const mark = el?.closest("mark");
    if (mark) {
      const p = mark.parentNode;
      while (mark.firstChild) p.insertBefore(mark.firstChild, mark);
      p.removeChild(mark);
    }
    savePassage();
  };

  const mins = String(Math.floor(timerSec / 60)).padStart(2, "0");
  const secs = String(timerSec % 60).padStart(2, "0");

  const moreItems = [
    ["Help", () => { alert("Help"); setMoreOpen(false); }],
    ["Shortcuts", () => { alert("Keyboard shortcuts:\n\n→ / ↓  Next question\n← / ↑  Previous question\nA B C D  Select answer\nM  Mark for Review\nEsc  Close panels"); setMoreOpen(false); }],
    ["Assistive Technology", () => { alert("Assistive Technology"); setMoreOpen(false); }],
    ["Line Reader", () => { setLrOn(v => !v); setMoreOpen(false); }],
    ["Save and Exit", () => { if (window.confirm("Save progress and exit?")) onExit(); }],
  ];

  // Inactive ABC: cream bg + blue text | Active: blue bg + white text
  const abcStyle = abcOn
    ? { background: "#1f6eb5", border: "1.5px solid #1f6eb5", color: "#fff", slashBg: "#fff" }
    : { background: "#FFF6D9", border: "1.5px solid #c5b900", color: "#1765cc", slashBg: "#1765cc" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, fontFamily: SANS, fontSize: 15, color: "#1a1a1a", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── HEADER (~80px) ── */}
      <div style={{ display: "flex", alignItems: "center", height: 80, padding: "0 24px", backgroundColor: "#e6edf8", flexShrink: 0, position: "relative", zIndex: 30, backgroundImage: DASHED, backgroundSize: "100% 2px", backgroundPosition: "bottom", backgroundRepeat: "no-repeat" }}>

        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: SANS }}>{sec.name}</div>
          <button onClick={() => setDirOpen(true)}
            onMouseEnter={e => { e.currentTarget.style.textDecoration = "underline"; e.currentTarget.style.color = "#000"; }}
            onMouseLeave={e => { e.currentTarget.style.textDecoration = "none"; e.currentTarget.style.color = "#333"; }}
            style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 16, fontWeight: 400, color: "#333", padding: 0 }}>
            Directions
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* Center */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#000", letterSpacing: "1px", minWidth: 90, textAlign: "center", visibility: timerVisible ? "visible" : "hidden", fontVariantNumeric: "tabular-nums", fontFamily: SANS, lineHeight: "1.1" }}>{mins}:{secs}</div>
          <button onClick={() => setTimerVisible(v => !v)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.background = "#f0f0f0"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#999"; e.currentTarget.style.background = "#fff"; }}
            style={{ background: "#fff", border: "1.5px solid #999", borderRadius: 14, padding: "2px 16px", fontSize: 13, fontFamily: SANS, color: "#000", cursor: "pointer", fontWeight: 400, lineHeight: "1.4" }}>
            {timerVisible ? "Hide" : "Show"}
          </button>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "flex-end" }}>
          {/* Highlights & Notes */}
          <button onClick={() => alert("Highlights & Notes — select text in the passage to highlight")}
            style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontFamily: SANS, padding: "5px 8px", borderRadius: 5, lineHeight: 1 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>
              </svg>
            </span>
            <span style={{ fontSize: 13, fontWeight: 400, color: "#5C5C5C" }}>Highlights &amp; Notes</span>
          </button>

          {/* More */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setMoreOpen(v => !v)}
              style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontFamily: SANS, padding: "5px 8px", borderRadius: 5, lineHeight: 1 }}>
              <svg width="5" height="17" viewBox="0 0 5 21" fill="#5C5C5C">
                <circle cx="2.5" cy="2.5" r="2.5"/><circle cx="2.5" cy="10.5" r="2.5"/><circle cx="2.5" cy="18.5" r="2.5"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 400, color: "#5C5C5C" }}>More</span>
            </button>
            {moreOpen && (
              <>
                <div onClick={() => setMoreOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 79 }} />
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", border: "1px solid #dde0e6", borderRadius: 6, boxShadow: "0 4px 18px rgba(0,0,0,.13)", zIndex: 80, minWidth: 215, overflow: "hidden" }}>
                  {moreItems.map(([label, fn]) => (
                    <div key={label} onClick={fn}
                      onMouseEnter={e => e.currentTarget.style.background = "#f5f7fc"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                      style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 18px", fontSize: 14, cursor: "pointer", borderBottom: "1px solid #f2f3f5", color: "#1a1a1a" }}>
                      {label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── BANNER (~40px) ── */}
      <div style={{ background: NAVY, color: "#fff", textAlign: "center", fontSize: 14, fontWeight: 600, letterSpacing: "2.5px", padding: "13px 0", flexShrink: 0, fontFamily: SANS }}>
        THIS IS A PRACTICE TEST
      </div>

      {/* ── MAIN SPLIT ── */}
      <div ref={mainRef} style={{ flex: 1, display: "flex", overflow: "hidden", background: "#f0f0f0" }}>

        {/* Passage panel */}
        <div ref={passageRef} onMouseUp={onPassageMouseUp}
          style={{ width: "50%", overflowY: "auto", padding: "32px 60px 40px 80px", fontSize: 18, lineHeight: 1.6, color: "#1a1a1a", background: "#fff", userSelect: "text", fontFamily: SERIF }}>
          <div dangerouslySetInnerHTML={{ __html: passageHTMLs[q.id] || q.passage }} />
        </div>

        {/* Resizer */}
        <div onMouseDown={e => { dragRef.current = { active: true, startX: e.clientX, startW: passageRef.current?.offsetWidth || 0 }; e.preventDefault(); }}
          style={{ width: 9, cursor: "col-resize", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#f0f0f0", borderLeft: "1px solid #C9C9C9" }}>
          <div style={{ width: 16, height: 36, background: "#fff", border: "1.5px solid #aaa", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", boxShadow: "0 1px 4px rgba(0,0,0,.12)" }}>
            <svg width="12" height="8" viewBox="0 0 14 10" fill="#333"><polygon points="0,5 5,0 5,10"/><polygon points="14,5 9,0 9,10"/></svg>
          </div>
        </div>

        {/* Question panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 28px 24px", background: "#fff", minWidth: 0 }}>

          {/* Q-header row */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, backgroundColor: "#f0f0f0", backgroundImage: DASHED, backgroundSize: "100% 2px", backgroundPosition: "bottom", backgroundRepeat: "no-repeat", margin: "-20px -28px 18px -24px", padding: "12px 28px 14px 24px" }}>
            {/* Number box */}
            <div style={{ width: 36, height: 36, background: "#000", color: "#fff", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, flexShrink: 0, fontFamily: SANS }}>
              {qIdx + 1}
            </div>

            {/* Mark for Review */}
            <button onClick={toggleMark}
              onMouseEnter={e => { if (!qs.mark) e.currentTarget.style.color = NAVY; }}
              onMouseLeave={e => { if (!qs.mark) e.currentTarget.style.color = "#1a1a1a"; }}
              style={{ flex: 1, display: "inline-flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 16, fontWeight: 400, color: qs.mark ? "#dc2626" : "#1a1a1a", padding: "0 0 0 12px", textAlign: "left" }}>
              <svg width="16" height="20" viewBox="0 0 14 18">
                <path d="M2 1h10a1 1 0 011 1v14l-6-4-6 4V2a1 1 0 011-1z"
                  fill={qs.mark ? "#dc2626" : "none"}
                  stroke={qs.mark ? "#dc2626" : "#888"}
                  strokeWidth="1.5"/>
              </svg>
              Mark for Review
            </button>

            {/* ABC button */}
            <button onClick={() => setAbcOn(v => !v)}
              style={{ background: abcStyle.background, border: abcStyle.border, borderRadius: 4, padding: 0, width: 36, height: 28, fontSize: 11, fontWeight: 700, letterSpacing: "0.3px", cursor: "pointer", fontFamily: SANS, color: abcStyle.color, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .12s, border-color .12s, color .12s" }}>
              <span style={{ position: "relative", zIndex: 1 }}>ABC</span>
              <span style={{ position: "absolute", left: -6, right: -6, top: "50%", height: "2px", background: abcStyle.slashBg, transform: "rotate(-28deg)", transformOrigin: "center", pointerEvents: "none" }} />
            </button>
          </div>

          {/* Question text */}
          <div style={{ fontSize: 17, lineHeight: 1.55, marginBottom: 20, color: "#1a1a1a", fontFamily: SERIF }}>{q.question}</div>

          {/* Choices */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {q.choices.map(ch => {
              const sel = qs.ans === ch.id;
              const elim = qs.elim.includes(ch.id);
              return (
                <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => !elim && pick(ch.id)}
                    onMouseEnter={e => { if (!sel && !elim) { e.currentTarget.style.borderColor = NAVY; e.currentTarget.style.background = "#f5f7fe"; } }}
                    onMouseLeave={e => { if (!sel && !elim) { e.currentTarget.style.borderColor = "#B0B0B0"; e.currentTarget.style.background = "#fff"; } }}
                    style={{ flex: 1, display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", minHeight: 64, border: sel ? `2px solid ${NAVY}` : elim ? "1.5px solid #d0d3d8" : "1.5px solid #B0B0B0", borderRadius: 10, background: sel ? "#edf0fb" : elim ? "#fafafa" : "#fff", cursor: elim ? "default" : "pointer", fontFamily: SANS, fontSize: 14, textAlign: "left", color: "#1a1a1a", position: "relative", transition: "border-color .1s, background .1s" }}>
                    {/* Circle */}
                    <span style={{ width: 32, height: 32, border: `1.5px ${elim ? "dashed" : "solid"} ${sel ? NAVY : elim ? "#aaa" : "#5a5f6e"}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, flexShrink: 0, background: sel ? NAVY : "transparent", color: sel ? "#fff" : elim ? "#aaa" : "#333", fontFamily: SANS, transition: "background .1s, border-color .1s, color .1s" }}>{ch.id}</span>
                    {/* Text */}
                    <span style={{ flex: 1, lineHeight: 1.45, color: elim ? "#888" : "inherit", fontSize: 20, fontFamily: SERIF }}>{ch.text}</span>
                    {elim && <span style={{ position: "absolute", left: 12, right: 12, top: "50%", height: "1.8px", background: "#888", pointerEvents: "none", zIndex: 2 }} />}
                  </button>

                  {elim ? (
                    <button onClick={() => undoElim(ch.id)}
                      onMouseEnter={e => e.currentTarget.style.color = "#1054a0"}
                      onMouseLeave={e => e.currentTarget.style.color = NAVY}
                      style={{ fontSize: 14, fontWeight: 600, color: NAVY, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", whiteSpace: "nowrap", fontFamily: SANS, flexShrink: 0, padding: 0 }}>
                      Undo
                    </button>
                  ) : (
                    <button onClick={() => doElim(ch.id)}
                      onMouseEnter={e => { if (abcOn) { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#222"; } }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#9ea3ae"; e.currentTarget.style.color = "#666"; }}
                      style={{ visibility: abcOn ? "visible" : "hidden", width: 30, height: 30, border: "1.5px solid #9ea3ae", borderRadius: "50%", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#666", padding: 0, fontFamily: SANS, transition: "border-color .1s" }}>
                      <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <circle cx="6" cy="6" r="5.2"/><line x1="6" y1="3" x2="6" y2="9"/><line x1="3" y1="6" x2="9" y2="6"/>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR (~60px) ── */}
      <div style={{ background: "#fff", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0, borderTop: "1px solid #E5E5E5" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#000", fontFamily: SANS }}>{studentName}</div>
        <button onClick={() => setNavOpen(v => !v)}
          onMouseEnter={e => e.currentTarget.style.background = "#222"}
          onMouseLeave={e => e.currentTarget.style.background = "#000"}
          style={{ background: "#000", border: "none", color: "#fff", cursor: "pointer", fontFamily: SANS, fontSize: 16, fontWeight: 400, display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 999, minWidth: 220, justifyContent: "center", transition: "background .12s" }}>
          <span>Question {qIdx + 1} of {sec.questions.length}</span>
          <svg width="11" height="7" viewBox="0 0 11 7" fill="none">
            <path d={navOpen ? "M1 6l4.5-4.5L10 6" : "M1 1l4.5 4.5L10 1"} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onMouseEnter={e => e.currentTarget.style.background = "#1a5ed4"}
          onMouseLeave={e => e.currentTarget.style.background = BLUE_BTN}
          onClick={() => { if (qIdx < sec.questions.length - 1) setQIdx(i => i + 1); else if (window.confirm("End test and submit?")) onExit(); }}
          style={{ background: BLUE_BTN, color: "#fff", border: "none", padding: "10px 32px", borderRadius: 999, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: SANS, transition: "background .12s" }}>
          {qIdx < sec.questions.length - 1 ? "Next" : "Submit"}
        </button>
      </div>

      {/* ── NAVIGATOR POPUP (above center button, with triangle tail) ── */}
      {navOpen && (
        <>
          <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 50 }} />
          <div style={{ position: "fixed", bottom: 72, left: "50%", transform: "translateX(-50%)", width: 620, maxWidth: "96vw", background: "#fff", borderRadius: 10, padding: "24px 24px 26px", zIndex: 60, boxShadow: "0 -4px 24px rgba(0,0,0,.18), 0 4px 24px rgba(0,0,0,.12)" }}>
            {/* Triangle tail pointing down */}
            <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)" }}>
              <div style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "11px solid transparent", borderRight: "11px solid transparent", borderTop: "11px solid rgba(0,0,0,.08)" }} />
              <div style={{ width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "10px solid #fff" }} />
            </div>

            <button onClick={() => setNavOpen(false)} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#666", lineHeight: 1, padding: "2px 4px" }}>&#10005;</button>

            <div style={{ textAlign: "center", fontSize: 20, fontWeight: 700, marginBottom: 4, fontFamily: SANS }}>{sec.name} Questions</div>
            <div style={{ width: "100%", height: 1, background: "#e5e5e5", margin: "10px 0 14px" }} />

            {/* Legend */}
            <div style={{ display: "flex", gap: 28, justifyContent: "center", marginBottom: 18, fontSize: 14, color: "#1a1a1a", alignItems: "center", fontFamily: SANS }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <PinIcon size={14} color={NAVY} />
                Current
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 17, height: 17, borderRadius: 3, border: "1.5px dashed #888", display: "inline-block", flexShrink: 0 }} />
                Unanswered
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="12" height="15" viewBox="0 0 14 18">
                  <path d="M2 1h10a1 1 0 011 1v14l-6-4-6 4V2a1 1 0 011-1z" fill="#D32F2F"/>
                </svg>
                For Review
              </span>
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 8, marginBottom: 20 }}>
              {sec.questions.map((qq, i) => {
                const s = qStates[qq.id] || {};
                const isCur = i === qIdx;
                const isAns = !!s.ans;
                return (
                  <button key={qq.id} onClick={() => { setQIdx(i); setNavOpen(false); }}
                    onMouseEnter={e => { if (!isCur) e.currentTarget.style.background = "#f0f3fb"; }}
                    onMouseLeave={e => { if (!isCur) e.currentTarget.style.background = "#fff"; }}
                    style={{ aspectRatio: "1/1", border: `1.5px ${isCur || isAns ? "solid" : "dashed"} ${isCur ? NAVY : "#9fa8c7"}`, background: isCur ? NAVY : "#fff", borderRadius: 5, cursor: "pointer", fontSize: 18, fontWeight: 600, color: isCur ? "#fff" : NAVY, fontFamily: SANS, position: "relative", transition: "background .1s", padding: 0 }}>
                    {isCur && (
                      <span style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)" }}>
                        <PinIcon size={13} color={NAVY} />
                      </span>
                    )}
                    {s.mark && (
                      <span style={{ position: "absolute", top: -7, right: -5, lineHeight: 1 }}>
                        <svg width="10" height="12" viewBox="0 0 14 18">
                          <path d="M2 1h10a1 1 0 011 1v14l-6-4-6 4V2a1 1 0 011-1z" fill="#D32F2F"/>
                        </svg>
                      </span>
                    )}
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <button
              onMouseEnter={e => e.currentTarget.style.background = "#f0f3fb"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              onClick={() => {
                setNavOpen(false);
                const idx = sec.questions.findIndex(qq => { const s = qStates[qq.id] || {}; return s.mark || !s.ans; });
                if (idx >= 0) setQIdx(idx);
              }}
              style={{ display: "block", margin: "0 auto", background: "#fff", border: `1.5px solid ${NAVY}`, color: NAVY, padding: "10px 32px", borderRadius: 999, fontSize: 15, cursor: "pointer", fontFamily: SANS, fontWeight: 400 }}>
              Go to Review Page
            </button>
          </div>
        </>
      )}

      {/* ── DIRECTIONS MODAL ── */}
      {dirOpen && (
        <div onClick={() => setDirOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 8, padding: 30, maxWidth: 490, width: "94%", maxHeight: "82vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => setDirOpen(false)} style={{ position: "absolute", top: 13, right: 15, background: "none", border: "none", cursor: "pointer", fontSize: 21, color: "#666" }}>&#10005;</button>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px", fontFamily: SANS }}>Directions</h3>
            <p style={{ fontSize: 15, lineHeight: 1.68, color: "#333", fontFamily: SERIF, margin: 0 }}>{sec.directions}</p>
          </div>
        </div>
      )}

      {/* ── LINE READER ── */}
      {lrOn && (
        <div style={{ position: "fixed", left: 0, right: 0, height: 40, top: lrY, background: "rgba(0,20,100,.06)", pointerEvents: "none", zIndex: 70, borderTop: "2px solid rgba(20,50,200,.2)", borderBottom: "2px solid rgba(20,50,200,.2)" }} />
      )}

      {/* ── HIGHLIGHT TOOLBAR ── */}
      {hlBar && (
        <div onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
          style={{ position: "fixed", left: Math.max(8, Math.min(hlBar.x - 120, window.innerWidth - 248)), top: Math.max(8, hlBar.y - 56), zIndex: 9998, background: "#fff", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,.22)", padding: "6px 10px", display: "flex", alignItems: "center", gap: 5, border: "1px solid #ddd" }}>
          {HL_COLORS.map(({ bg, ring }) => (
            <button key={bg} onClick={() => applyHL(bg)}
              style={{ width: 24, height: 24, borderRadius: "50%", background: bg, border: `2px solid ${ring}`, cursor: "pointer", padding: 0, flexShrink: 0 }} />
          ))}
          <span style={{ width: 1, height: 20, background: "#e0e0e0", margin: "0 2px" }} />
          <button onClick={applyUL}
            style={{ width: 30, height: 30, borderRadius: 5, background: "#fff", border: "1.5px solid #ccc", cursor: "pointer", display: "flex", alignItems: "flex-end", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 14, padding: "0 0 2px", color: "#333", textDecoration: "underline" }}>U</button>
          <button onClick={removeHL}
            style={{ width: 30, height: 30, borderRadius: 5, background: "#fff", border: "1.5px solid #ccc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: "#555" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
          <button onClick={() => { setHlBar(null); savedRange.current = null; }}
            style={{ width: 30, height: 30, borderRadius: 5, background: "#fff", border: "1.5px solid #ccc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: "#555" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="9" y2="9" strokeWidth="3"/><path d="M12 12h.01" strokeWidth="3"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
