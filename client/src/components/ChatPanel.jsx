import { useEffect, useState } from "react";
import { api } from "../api";

const labelMap = {
  "sat-math": "SAT Math",
  "sat-english": "SAT English",
  ielts: "IELTS"
};

export default function ChatPanel({ token, user, assignments, teachers }) {
  const [selectedProgramId, setSelectedProgramId] = useState(assignments[0]?.programId || "");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const studentId = user.role === "student" ? user.id : "";
  const currentAssignment = assignments.find((item) => item.programId === selectedProgramId);
  const currentTeacher = teachers.find((item) => item.programId === selectedProgramId);

  useEffect(() => {
    if (!selectedProgramId || !studentId) return;
    if (!currentAssignment?.teacherId) {
      setMessages([]);
      return;
    }
    api
      .getChats(token, selectedProgramId, studentId)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [token, selectedProgramId, studentId, currentAssignment?.teacherId]);

  if (!assignments.length) return null;

  return (
    <section className="card" data-aos="fade-up">
      <h2>Chat With Teacher</h2>
      <div className="inline toolbar">
        <select value={selectedProgramId} onChange={(e) => setSelectedProgramId(e.target.value)}>
          {assignments.map((assignment) => (
            <option key={assignment.programId} value={assignment.programId}>
              {labelMap[assignment.programId] || assignment.programId}
            </option>
          ))}
        </select>
        <span className="hint">{currentTeacher ? currentTeacher.name : "No teacher assigned yet"}</span>
      </div>

      <div className="chatBox">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.senderId === user.id ? "chatMessage own" : "chatMessage"}
          >
            <strong>{message.senderRole}</strong>
            <p>{message.text}</p>
          </div>
        ))}
      </div>

      {currentAssignment?.teacherId && (
        <form
          className="chatComposer"
          onSubmit={async (e) => {
            e.preventDefault();
            const message = await api.sendChatMessage(token, {
              programId: selectedProgramId,
              studentId,
              text
            });
            setMessages((prev) => [...prev, message]);
            setText("");
          }}
        >
          <label className="chatComposerLabel">Write a message</label>
          <div className="chatComposerRow">
            <input
              className="grow"
              placeholder="Type here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit">Send</button>
          </div>
        </form>
      )}
    </section>
  );
}
