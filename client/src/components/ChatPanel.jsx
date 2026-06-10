import { useEffect, useRef, useState } from "react";
import { api } from "../api";

const C = {
  navy: "#173B64", navyDeep: "#0F2746",
  blueAccent: "#2563EB", blueDim: "rgba(37,99,235,0.09)",
  green: "#0F9E6A", greenDim: "rgba(15,158,106,0.09)", greenBorder: "rgba(15,158,106,0.2)",
  amber: "#D97706", amberDim: "rgba(217,119,6,0.09)",
  purple: "#6D28D9", purpleDim: "rgba(109,40,217,0.08)",
  red: "#DC2626", redDim: "rgba(220,38,38,0.09)",
  bg: "#F0F5FC", card: "#FFFFFF", border: "#DDE6F0",
  muted: "#6B7E96", hint: "#9EB3C8", text: "#173B64",
};

const PLAN_RULES = {
  plus:  { duration: 30, label: "30 min", color: C.blueAccent, bg: C.blueDim,   desc: "30-minute session · every 2 days" },
  pro:   { duration: 90, label: "90 min", color: C.purple,     bg: C.purpleDim, desc: "90-minute session · every 2 days" },
  basic: { duration: 0,  label: "No sessions", color: C.hint, bg: C.bg,        desc: "Upgrade to Plus or Pro to book sessions" },
};

const PROGRAM_LABELS = {
  "sat-math": "SAT Math", "sat-english": "SAT EBRW", ielts: "IELTS",
};

const SESSION_TIMES = ["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00"];

// ── Primitives ──────────────────────────────────────────────────

function Avatar({ name, size = 36, color = C.navy }) {
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Chip({ label, bg, color }) {
  return (
    <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", style = {}, disabled = false, type = "button" }) {
  const base = { borderRadius: 12, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 150ms", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 6, border: "none" };
  const variants = {
    primary: { background: C.navy, color: "#fff" },
    ghost:   { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    green:   { background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` },
    danger:  { background: C.redDim, color: C.red },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Modal({ title, children, onClose, width = 440 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,39,70,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, width, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(7,49,94,0.22)", animation: "slideUp 220ms ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>{title}</div>
          <button onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14, color: C.muted }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Icon({ d, size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  chat:     "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  send:     "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  clock:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  check:    "M20 6L9 17l-5-5",
  upgrade:  "M5 12h14M12 5l7 7-7 7",
};

// ── Booking Modal ───────────────────────────────────────────────

function BookingModal({ teacher, plan, onClose }) {
  const rule = PLAN_RULES[plan] || PLAN_RULES.plus;
  const [date, setDate] = useState("");
  const [time, setTime] = useState("15:00");
  const [done, setDone] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  if (done) return (
    <Modal title="Session Booked! 🎉" onClose={onClose} width={400}>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.greenDim, border: `2px solid ${C.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Icon d={ICONS.check} size={28} color={C.green} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Booking Confirmed!</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          Your <strong>{rule.label}</strong> session with <strong>{teacher.name}</strong><br />
          on <strong>{date} at {time}</strong> is confirmed.
        </div>
        <div style={{ marginTop: 20, padding: 14, background: C.bg, borderRadius: 12, fontSize: 12, color: C.muted }}>
          Next available booking: in 2 days
        </div>
        <Btn onClick={onClose} style={{ marginTop: 16, width: "100%", justifyContent: "center" }}>Done</Btn>
      </div>
    </Modal>
  );

  return (
    <Modal title="Book a Session" onClose={onClose} width={420}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.bg, borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
        <Avatar name={teacher.name} size={40} color={C.navy} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{teacher.name}</div>
          <div style={{ fontSize: 12, color: C.muted }}>{teacher.subject}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, background: rule.bg, borderRadius: 12, padding: "12px 14px", marginBottom: 20, border: `1px solid ${plan === "pro" ? "rgba(109,40,217,0.2)" : C.border}` }}>
        <Icon d={ICONS.clock} size={18} color={rule.color} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: rule.color }}>{rule.label} session ({plan} plan)</div>
          <div style={{ fontSize: 11, color: C.muted }}>{rule.desc}</div>
        </div>
      </div>

      {plan === "basic" ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: 16 }}>Upgrade your plan to book sessions with teachers.</div>
          <Btn onClick={onClose} style={{ justifyContent: "center" }}>
            <Icon d={ICONS.upgrade} size={13} color="#fff" /> Upgrade to Plus
          </Btn>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.hint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Date</div>
            <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, color: C.navy, background: C.bg, fontFamily: "inherit" }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.hint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Time Slot</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {SESSION_TIMES.map(t => (
                <button key={t} onClick={() => setTime(t)}
                  style={{ padding: "8px 0", borderRadius: 10, border: `1px solid ${time === t ? C.navy : C.border}`, background: time === t ? C.navy : "#fff", color: time === t ? "#fff" : C.navy, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={() => { if (date) setDone(true); }} disabled={!date} style={{ flex: 1, justifyContent: "center" }}>
              <Icon d={ICONS.check} size={13} color="#fff" /> Confirm Booking
            </Btn>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          </div>
        </>
      )}
    </Modal>
  );
}

// ── Teachers Tab ────────────────────────────────────────────────

function TeachersTab({ teachers, onChat, onBook }) {
  if (!teachers.length) return (
    <div style={{ padding: 40, textAlign: "center", color: C.hint }}>
      <Icon d={ICONS.star} size={40} color={C.border} />
      <div style={{ marginTop: 12, fontSize: 14 }}>No teachers assigned yet</div>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: C.navy }}>Your Teachers</h2>
        <p style={{ margin: 0, fontSize: 13, color: C.hint }}>Choose a teacher to chat or book a session</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {teachers.map(t => (
          <div key={t.programId} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <Avatar name={t.name} size={52} color={C.navy} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{t.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{t.subject || PROGRAM_LABELS[t.programId] || t.programId}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  <Chip label={PROGRAM_LABELS[t.programId] || t.programId} bg={C.blueDim} color={C.blueAccent} />
                  {t.rating && <Chip label={`⭐ ${t.rating}`} bg={C.amberDim} color={C.amber} />}
                </div>
              </div>
            </div>

            {t.bio && <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{t.bio}</p>}

            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={() => onChat(t)} variant="ghost" style={{ flex: 1, justifyContent: "center" }}>
                <Icon d={ICONS.chat} size={13} color={C.muted} /> Chat
              </Btn>
              <Btn onClick={() => onBook(t)} style={{ flex: 1, justifyContent: "center" }}>
                <Icon d={ICONS.calendar} size={13} color="#fff" /> Book Session
              </Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Chat Tab ────────────────────────────────────────────────────

function ChatTab({ teachers, token, user, assignments, selectedTeacher, onSelectTeacher, onBook }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const studentId = user.id;
  const assignment = assignments.find(a => a.programId === selectedTeacher?.programId);

  useEffect(() => {
    if (!selectedTeacher || !assignment?.teacherId) { setMessages([]); return; }
    api.getChats(token, selectedTeacher.programId, studentId)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [token, selectedTeacher?.programId, studentId, assignment?.teacherId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length, selectedTeacher?.programId]);

  const send = async () => {
    if (!text.trim() || !selectedTeacher || !assignment?.teacherId || sending) return;
    setSending(true);
    try {
      const msg = await api.sendChatMessage(token, { programId: selectedTeacher.programId, studentId, text: text.trim() });
      setMessages(prev => [...prev, msg]);
      setText("");
    } catch { /* silent */ } finally { setSending(false); }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>
      {/* Teacher list */}
      <div style={{ width: 260, borderRight: `1px solid ${C.border}`, background: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>Messages</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {teachers.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: C.hint, fontSize: 12 }}>No teachers assigned</div>
          )}
          {teachers.map(t => {
            const isSelected = selectedTeacher?.programId === t.programId;
            return (
              <div key={t.programId} onClick={() => onSelectTeacher(t)}
                style={{ padding: "12px 14px", cursor: "pointer", background: isSelected ? C.bg : "transparent", borderBottom: `1px solid ${C.border}`, transition: "background 120ms" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={t.name} size={36} color={C.navy} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.name.split(" ")[0]}
                    </div>
                    <div style={{ fontSize: 11, color: C.hint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {PROGRAM_LABELS[t.programId] || t.programId}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat window */}
      {selectedTeacher ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: "12px 20px", background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <Avatar name={selectedTeacher.name} size={38} color={C.navy} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{selectedTeacher.name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>
                {PROGRAM_LABELS[selectedTeacher.programId] || selectedTeacher.programId}
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Btn onClick={() => onBook(selectedTeacher)} style={{ fontSize: 12, padding: "7px 14px" }}>
                <Icon d={ICONS.calendar} size={13} color="#fff" /> Book Session
              </Btn>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12, background: C.bg }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 11, color: C.hint, background: C.border, padding: "3px 10px", borderRadius: 999 }}>Today</span>
            </div>

            {messages.length === 0 && assignment?.teacherId && (
              <div style={{ textAlign: "center", color: C.hint, fontSize: 13, paddingTop: 40 }}>No messages yet. Say hello! 👋</div>
            )}
            {!assignment?.teacherId && (
              <div style={{ textAlign: "center", color: C.hint, fontSize: 13, paddingTop: 40 }}>No teacher assigned for this program yet.</div>
            )}

            {messages.map(msg => {
              const isMe = msg.senderId === user.id;
              const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
                  {!isMe && <Avatar name={selectedTeacher.name} size={28} color={C.navy} />}
                  <div>
                    <div style={{ maxWidth: 340, padding: "10px 14px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: isMe ? C.navy : "#fff", color: isMe ? "#fff" : C.navy, fontSize: 13, lineHeight: 1.5, boxShadow: "0 2px 8px rgba(23,59,100,0.07)", border: isMe ? "none" : `1px solid ${C.border}` }}>
                      {msg.text}
                    </div>
                    {time && <div style={{ fontSize: 10, color: C.hint, marginTop: 3, textAlign: isMe ? "right" : "left" }}>{time}</div>}
                  </div>
                  {isMe && <Avatar name={user.name || "Me"} size={28} color={C.blueAccent} />}
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Input */}
          {assignment?.teacherId && (
            <div style={{ padding: "12px 20px", background: "#fff", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "flex-end", flexShrink: 0 }}>
              <textarea value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Type a message… (Enter to send)"
                rows={2}
                style={{ flex: 1, padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 13, color: C.navy, resize: "none", fontFamily: "inherit", background: C.bg, lineHeight: 1.5 }} />
              <button onClick={send} disabled={sending || !text.trim()}
                style={{ width: 42, height: 42, borderRadius: 12, background: C.navy, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: (sending || !text.trim()) ? 0.5 : 1 }}>
                <Icon d={ICONS.send} size={16} color="#fff" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: C.hint }}>
          <Icon d={ICONS.chat} size={40} color={C.border} />
          <div style={{ fontSize: 14 }}>Select a teacher to start chatting</div>
        </div>
      )}
    </div>
  );
}

// ── Bookings Tab ────────────────────────────────────────────────

function BookingsTab({ teachers, plan, onBook }) {
  const [bookings, setBookings] = useState([]);

  const cancel = id => setBookings(bs => bs.filter(b => b.id !== id));

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: C.navy }}>My Bookings</h2>
          <p style={{ margin: 0, fontSize: 13, color: C.hint }}>Upcoming sessions with your teachers</p>
        </div>
        {teachers[0] && (
          <Btn onClick={() => onBook(teachers[0])}>
            <Icon d={ICONS.calendar} size={13} color="#fff" /> Book New Session
          </Btn>
        )}
      </div>

      {/* Plan rules */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {(["plus", "pro"]).map(p => {
          const r = PLAN_RULES[p];
          const isActive = plan === p;
          return (
            <div key={p} style={{ background: r.bg, borderRadius: 12, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center", border: `1px solid ${isActive ? r.color : C.border}`, outline: isActive ? `2px solid ${r.color}` : "none", outlineOffset: -1 }}>
              <Icon d={ICONS.clock} size={18} color={r.color} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.label}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{r.desc}</div>
              </div>
              <Chip label={p} bg={r.bg} color={r.color} />
            </div>
          );
        })}
      </div>

      {bookings.length === 0 ? (
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: "60px 20px", textAlign: "center", color: C.hint }}>
          <Icon d={ICONS.calendar} size={40} color={C.border} />
          <div style={{ marginTop: 12, fontSize: 14 }}>No upcoming sessions</div>
          {teachers[0] && (
            <Btn onClick={() => onBook(teachers[0])} style={{ marginTop: 16, justifyContent: "center" }}>
              Book your first session
            </Btn>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bookings.map(b => {
            const teacher = teachers.find(t => t.programId === b.programId) || {};
            const rule = PLAN_RULES[b.plan] || PLAN_RULES.plus;
            return (
              <div key={b.id} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar name={teacher.name || "?"} size={44} color={C.navy} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{teacher.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{PROGRAM_LABELS[b.programId] || b.programId}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: C.navy, fontWeight: 600 }}>
                      <Icon d={ICONS.calendar} size={14} color={C.muted} /> {b.date}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: C.navy, fontWeight: 600 }}>
                      <Icon d={ICONS.clock} size={14} color={C.muted} /> {b.time}
                    </div>
                    <Chip label={`${b.duration} min`} bg={rule.bg} color={rule.color} />
                    <Chip label={b.status} bg={b.status === "confirmed" ? C.greenDim : C.amberDim} color={b.status === "confirmed" ? C.green : C.amber} />
                  </div>
                  <Btn variant="danger" onClick={() => cancel(b.id)} style={{ fontSize: 12, padding: "7px 14px" }}>
                    Cancel
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Root Component ──────────────────────────────────────────────

export default function ChatPanel({ token, user, assignments, teachers: rawTeachers, tab = "teachers", onTabChange }) {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [bookTeacher, setBookTeacher] = useState(null);

  const plan = user.plan || "plus";

  const teachers = assignments
    .filter(a => a.teacherId)
    .map(a => {
      const t = rawTeachers?.find(r => r.programId === a.programId) || {};
      return { programId: a.programId, teacherId: a.teacherId, name: t.name || "Teacher", ...t };
    });

  const handleChat = (teacher) => {
    setSelectedTeacher(teacher);
    onTabChange?.("chat");
  };

  const handleBook = (teacher) => {
    setBookTeacher(teacher);
  };

  if (!assignments.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, background: C.bg }}>
      {/* Main content — no rounded edges, fills the space */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "auto" }}>
        {tab === "teachers" && (
          <TeachersTab teachers={teachers} onChat={handleChat} onBook={handleBook} />
        )}
        {tab === "chat" && (
          <ChatTab
            teachers={teachers}
            token={token}
            user={user}
            assignments={assignments}
            selectedTeacher={selectedTeacher}
            onSelectTeacher={setSelectedTeacher}
            onBook={handleBook}
          />
        )}
        {tab === "bookings" && (
          <BookingsTab teachers={teachers} plan={plan} onBook={handleBook} />
        )}
      </div>

      {bookTeacher && (
        <BookingModal teacher={bookTeacher} plan={plan} onClose={() => setBookTeacher(null)} />
      )}
    </div>
  );
}
