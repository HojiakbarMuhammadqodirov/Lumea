import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import Modal from "./Modal";

const studentPrograms = ["sat-math", "sat-english", "ielts"];
const teacherPrograms = ["sat-math", "sat-english", "ielts-listening", "ielts-reading", "ielts-speaking", "ielts-writing"];
const levels = ["beginner", "intermediate", "advanced"];
const programLabels = {
  "sat-math": "SAT Math",
  "sat-english": "SAT English",
  ielts: "IELTS"
};

const emptyProfile = {
  firstName: "",
  lastName: "",
  gender: "",
  phoneNumber: "",
  dateOfBirth: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "",
  postalCode: "",
  profilePicture: ""
};

const emptyStudent = { email: "", password: "", profile: emptyProfile };
const emptyTeacher = {
  email: "",
  password: "",
  profile: emptyProfile,
  programAccess: ["sat-math"],
  programScores: {}
};

const assignmentSummary = (assignments) => assignments.map((item) => `${item.programId} (${item.levelId})`).join(", ");

const icon = (name) => {
  const icons = {
    students: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0",
    teachers: "M12 4l8 4-8 4-8-4 8-4zm-5 9.5V10l5 2.5 5-2.5v3.5M7 20a5 5 0 0110 0",
    lessons: "M6 4h12M6 10h12M6 16h8",
    rating: "M12 3l2.8 5.7 6.2.9-4.5 4.3 1.1 6.1L12 17l-5.6 3 1.1-6.1L3 9.6l6.2-.9z",
    targets: "M5 16l5-5 3 3 6-6",
    logout: "M10 17l5-5-5-5M15 12H6M18 4h-7v4h2V6h5v12h-5v-2h-2v4h7"
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="adminOverviewIcon">
      <path d={icons[name]} />
    </svg>
  );
};

function UserTable({ rows, type, search, filter, onSearch, onFilter, onSelect }) {
  const filteredRows = rows.filter((row) => {
    const matchSearch =
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      (row.profile?.phoneNumber || "").toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (!filter) return true;
    if (type === "students") {
      return row.programAssignments.some((item) => item.programId === filter || item.levelId === filter);
    }
    return row.programAccess.some((item) => item === filter);
  });

  return (
    <div
      className="cardSection"
      data-aos="fade-up"
      style={{
        background: "none",
        border: "0",
        boxShadow: "none",
        backdropFilter: "none",
        WebkitBackdropFilter: "none"
      }}
    >
      <div className="inline toolbar">
        <input placeholder={`Search ${type}`} value={search} onChange={(e) => onSearch(e.target.value)} />
        <select value={filter} onChange={(e) => onFilter(e.target.value)}>
          <option value="">All</option>
          {type === "students" &&
            [...studentPrograms, ...levels].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          {type === "teachers" &&
            teacherPrograms.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
        </select>
      </div>
      <div className="tableWrap">
        <table className="dataTable">
          <thead>
            <tr>
              <th>No</th>
              <th>Full Name</th>
              <th>Date of Birth</th>
              <th>{type === "students" ? "Level" : "Access"}</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, index) => (
              <tr key={row.id} onClick={() => onSelect(row)}>
                <td>{index + 1}</td>
                <td>{row.name}</td>
                <td>{row.profile?.dateOfBirth || "-"}</td>
                <td>{type === "students" ? assignmentSummary(row.programAssignments) : row.programAccess.join(", ")}</td>
                <td>{row.profile?.phoneNumber || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserEditorModal({ type, selected, teachers, canDelete, canEditAccess, onClose, onSave, onDelete }) {
  const [profile, setProfile] = useState(selected?.profile || emptyProfile);
  const [email, setEmail] = useState(selected?.email || "");
  const [password, setPassword] = useState("");
  const [assignments, setAssignments] = useState(selected?.programAssignments || []);
  const [programAccess, setProgramAccess] = useState(selected?.programAccess || []);
  const [programScores, setProgramScores] = useState(selected?.programScores || {});
  const [targetScores, setTargetScores] = useState(selected?.targetScores || {});
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    setProfile(selected?.profile || emptyProfile);
    setEmail(selected?.email || "");
    setAssignments(selected?.programAssignments || []);
    setProgramAccess(selected?.programAccess || []);
    setProgramScores(selected?.programScores || {});
    setTargetScores(selected?.targetScores || {});
    setPassword("");
    setFileName("");
  }, [selected]);

  const updatePicture = (file) => {
    if (!file) return;
    setFileName(file.name || "");
    const reader = new FileReader();
    reader.onload = () => setProfile((prev) => ({ ...prev, profilePicture: reader.result }));
    reader.readAsDataURL(file);
  };

  const toggleStudentProgram = (programId) => {
    setAssignments((prev) => {
      const exists = prev.find((item) => item.programId === programId);
      if (exists) return prev.filter((item) => item.programId !== programId);
      return [...prev, { programId, levelId: "beginner", teacherId: "" }];
    });
  };

  const toggleTeacherAccess = (programId) => {
    setProgramAccess((prev) =>
      prev.includes(programId) ? prev.filter((item) => item !== programId) : [...prev, programId]
    );
  };

  return (
    <Modal title={`Edit ${type === "students" ? "Student" : "Teacher"}`} onClose={onClose} wide>
      <div className="formGrid profileGrid profileEditShell adminEditorGrid">
        <div className="profileEditIntro adminEditorIntro">
          <p className="eyebrow">Profile details</p>
          <p className="hint">Update the student details, access, target scores, and assigned teacher here.</p>
        </div>
        <input placeholder="First name" value={profile.firstName || ""} onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))} />
        <input placeholder="Last name" value={profile.lastName || ""} onChange={(e) => setProfile((prev) => ({ ...prev, lastName: e.target.value }))} />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <select value={profile.gender || ""} onChange={(e) => setProfile((prev) => ({ ...prev, gender: e.target.value }))}>
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select
          value={profile.englishLevel || ""}
          onChange={(e) => setProfile((prev) => ({ ...prev, englishLevel: e.target.value }))}
        >
          <option value="">English level</option>
          <option value="beginner">Beginner</option>
          <option value="elementary">Elementary</option>
          <option value="pre-intermediate">Pre-Intermediate</option>
          <option value="intermediate">Intermediate</option>
          <option value="upper-intermediate">Upper-Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <input placeholder="Phone number" value={profile.phoneNumber || ""} onChange={(e) => setProfile((prev) => ({ ...prev, phoneNumber: e.target.value }))} />
        <input type="date" value={profile.dateOfBirth || ""} onChange={(e) => setProfile((prev) => ({ ...prev, dateOfBirth: e.target.value }))} />
        <input placeholder="Address line 1" value={profile.addressLine1 || ""} onChange={(e) => setProfile((prev) => ({ ...prev, addressLine1: e.target.value }))} />
        <input placeholder="Address line 2" value={profile.addressLine2 || ""} onChange={(e) => setProfile((prev) => ({ ...prev, addressLine2: e.target.value }))} />
        <input placeholder="City" value={profile.city || ""} onChange={(e) => setProfile((prev) => ({ ...prev, city: e.target.value }))} />
        <input placeholder="Country" value={profile.country || ""} onChange={(e) => setProfile((prev) => ({ ...prev, country: e.target.value }))} />
        <input placeholder="Postal code" value={profile.postalCode || ""} onChange={(e) => setProfile((prev) => ({ ...prev, postalCode: e.target.value }))} />
        <label className="fileUploadField adminFileUploadField">
          <span className="fileUploadButton">Choose photo</span>
          <span className="fileUploadName">{fileName || "No file selected"}</span>
          <input type="file" accept="image/*" onChange={(e) => updatePicture(e.target.files?.[0])} />
        </label>
      </div>

      {type === "students" && (
        <div className="modalSection adminModalSection">
          <h4>Programs and Levels</h4>
          <div className="assignmentList">
            {studentPrograms.map((programId) => {
            const row = assignments.find((item) => item.programId === programId);
            return (
                <div className="assignmentRow" key={programId}>
                  <label className={row ? "assignmentToggle active" : "assignmentToggle"}>
                    <input type="checkbox" checked={Boolean(row)} onChange={() => toggleStudentProgram(programId)} />
                    <span className="assignmentToggleMark" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M5 12.5l4.2 4.2L19 7.5" />
                      </svg>
                    </span>
                    <span className="assignmentToggleText">{programLabels[programId] || programId}</span>
                  </label>
                  {row && (
                    <div className="assignmentControls">
                      <select
                        value={row.levelId}
                        onChange={(e) =>
                          setAssignments((prev) =>
                            prev.map((item) => (item.programId === programId ? { ...item, levelId: e.target.value } : item))
                          )
                        }
                      >
                        {levels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                      <select
                        value={row.teacherId}
                        onChange={(e) =>
                          setAssignments((prev) =>
                            prev.map((item) => (item.programId === programId ? { ...item, teacherId: e.target.value } : item))
                          )
                        }
                      >
                        <option value="">No teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="modalSection adminInnerSection">
            <h4>Target Scores</h4>
            <div className="formGrid adminTargetGrid">
              {assignments.map((assignment) => (
                <input
                  key={assignment.programId}
                  placeholder={`${programLabels[assignment.programId] || assignment.programId} target score`}
                  value={targetScores[assignment.programId] || ""}
                  onChange={(e) => setTargetScores((prev) => ({ ...prev, [assignment.programId]: e.target.value }))}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {type === "teachers" && (
        <div className="modalSection adminModalSection">
          <h4>Program Access and Scores</h4>
          <div className="assignmentList">
            {teacherPrograms.map((programId) => (
              <div className="assignmentRow assignmentRowTeacher" key={programId}>
                <label className={programAccess.includes(programId) ? "assignmentToggle active" : "assignmentToggle"}>
                  <input
                    type="checkbox"
                    checked={programAccess.includes(programId)}
                    disabled={!canEditAccess}
                    onChange={() => toggleTeacherAccess(programId)}
                  />
                  <span className="assignmentToggleMark" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 12.5l4.2 4.2L19 7.5" />
                    </svg>
                  </span>
                  <span className="assignmentToggleText">{programLabels[programId] || programId}</span>
                </label>
                {programAccess.includes(programId) && (
                  <input
                    placeholder="Score"
                    value={programScores[programId] || ""}
                    onChange={(e) => setProgramScores((prev) => ({ ...prev, [programId]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="inline modalActions">
        <button
          onClick={async () => {
            await onSave(selected.id, {
              email,
              password,
              profile,
              programAssignments: assignments,
              targetScores,
              programAccess,
              programScores
            });
            onClose();
          }}
        >
          Save Changes
        </button>
        {canDelete && (
          <button
            className="danger"
            onClick={async () => {
              await onDelete(selected.id);
              onClose();
            }}
          >
            Delete
          </button>
        )}
      </div>
    </Modal>
  );
}

function CreateUserModal({ type, onClose, onSubmit }) {
  const [form, setForm] = useState(type === "student" ? emptyStudent : emptyTeacher);

  return (
    <Modal title={`Add ${type === "student" ? "Student" : "Teacher"}`} onClose={onClose}>
      <form
        className="formGrid"
        onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit(form);
          onClose();
        }}
      >
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />
        <input
          placeholder="Name"
          value={form.profile.firstName}
          onChange={(e) => setForm((prev) => ({ ...prev, profile: { ...prev.profile, firstName: e.target.value } }))}
        />
        <input
          placeholder="Surname"
          value={form.profile.lastName}
          onChange={(e) => setForm((prev) => ({ ...prev, profile: { ...prev.profile, lastName: e.target.value } }))}
        />
        <input
          placeholder="Address line 1"
          value={form.profile.addressLine1}
          onChange={(e) => setForm((prev) => ({ ...prev, profile: { ...prev.profile, addressLine1: e.target.value } }))}
        />
        <div className="inline modalActions">
          <button type="submit">Create</button>
        </div>
      </form>
    </Modal>
  );
}

function LessonManager({ isAdmin, allowedPrograms, onAddLesson, onUpdateLesson, onDeleteLesson }) {
  const [programId, setProgramId] = useState(allowedPrograms[0]?.id || "");
  const [levelId, setLevelId] = useState(allowedPrograms[0]?.levels[0]?.id || "");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", videoUrl: "", pdfUrl: "", questionCount: 10 });

  useEffect(() => {
    if (!allowedPrograms.length) return;
    setProgramId((current) => current || allowedPrograms[0].id);
    setLevelId((current) => current || allowedPrograms[0].levels[0].id);
  }, [allowedPrograms]);

  const program = allowedPrograms.find((item) => item.id === programId) || allowedPrograms[0];
  const level = program?.levels.find((item) => item.id === levelId) || program?.levels[0];

  return (
    <>
      <div
        className="cardSection"
        data-aos="fade-up"
        style={{
          background: "none",
          border: "0",
          boxShadow: "none",
          backdropFilter: "none",
          WebkitBackdropFilter: "none"
        }}
      >
        <div className="inline toolbar">
          <select
            value={programId}
            onChange={(e) => {
              const next = allowedPrograms.find((item) => item.id === e.target.value);
              setProgramId(e.target.value);
              setLevelId(next?.levels[0]?.id || "");
            }}
          >
            {allowedPrograms.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <select value={levelId} onChange={(e) => setLevelId(e.target.value)}>
            {(program?.levels || []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          {isAdmin && <button onClick={() => setAddOpen(true)}>Add Lesson</button>}
        </div>

        <div className="manageList">
          {(level?.lessons || []).map((lesson) => (
            <div className="manageItem" key={lesson.id}>
              <div className="lessonMeta">
                <strong>{lesson.title}</strong>
                <span>{lesson.topicTest.questionCount} questions</span>
              </div>
              <div className="inline">
                <button onClick={() => setEditing(lesson)}>Edit Lesson</button>
                {isAdmin && (
                  <button className="danger" onClick={() => onDeleteLesson(program.id, level.id, lesson.id)}>
                    Delete Lesson
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {addOpen && (
        <Modal title="Add Lesson" onClose={() => setAddOpen(false)}>
          <form
            className="formGrid"
            onSubmit={async (e) => {
              e.preventDefault();
              await onAddLesson({ programId, levelId, ...form, questionCount: Number(form.questionCount) });
              setForm({ title: "", videoUrl: "", pdfUrl: "", questionCount: 10 });
              setAddOpen(false);
            }}
          >
            <input value={form.title} placeholder="Lesson title" onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
            <input value={form.videoUrl} placeholder="Video URL" onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))} />
            <input value={form.pdfUrl} placeholder="PDF URL" onChange={(e) => setForm((prev) => ({ ...prev, pdfUrl: e.target.value }))} />
            <input type="number" min="1" value={form.questionCount} onChange={(e) => setForm((prev) => ({ ...prev, questionCount: e.target.value }))} />
            <div className="inline modalActions">
              <button type="submit">Create Lesson</button>
            </div>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Lesson" onClose={() => setEditing(null)}>
          <form
            className="formGrid"
            onSubmit={async (e) => {
              e.preventDefault();
              await onUpdateLesson(program.id, level.id, editing.id, {
                title: editing.title,
                videoUrl: editing.videoUrl,
                pdfUrl: editing.pdfUrl,
                questionCount: Number(editing.topicTest?.questionCount || 10)
              });
              setEditing(null);
            }}
          >
            <input value={editing.title} onChange={(e) => setEditing((prev) => ({ ...prev, title: e.target.value }))} />
            <input value={editing.videoUrl} onChange={(e) => setEditing((prev) => ({ ...prev, videoUrl: e.target.value }))} />
            <input value={editing.pdfUrl} onChange={(e) => setEditing((prev) => ({ ...prev, pdfUrl: e.target.value }))} />
            <input
              type="number"
              min="1"
              value={editing.topicTest?.questionCount || 10}
              onChange={(e) =>
                setEditing((prev) => ({
                  ...prev,
                  topicTest: { ...(prev.topicTest || {}), questionCount: e.target.value }
                }))
              }
            />
            <div className="inline modalActions">
              <button type="submit">Save Lesson</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function TeacherChat({ token, user, students }) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const teacherStudents = useMemo(
    () => students.filter((student) => student.programAssignments.some((item) => item.teacherId === user.id)),
    [students, user.id]
  );
  const currentStudent = teacherStudents.find((student) => student.id === selectedStudentId) || teacherStudents[0];
  const currentPrograms = currentStudent?.programAssignments.filter((item) => item.teacherId === user.id) || [];

  useEffect(() => {
    if (!currentStudent) return;
    setSelectedStudentId(currentStudent.id);
    setSelectedProgramId(currentPrograms[0]?.programId || "");
  }, [currentStudent?.id, currentPrograms.length]);

  useEffect(() => {
    if (!selectedStudentId || !selectedProgramId) return;
    api.getChats(token, selectedProgramId, selectedStudentId).then(setMessages).catch(() => setMessages([]));
  }, [token, selectedProgramId, selectedStudentId]);

  if (user.role !== "teacher" || !teacherStudents.length) return null;

  return (
    <div className="cardSection">
      <div className="inline toolbar">
        <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
          {teacherStudents.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
        <select value={selectedProgramId} onChange={(e) => setSelectedProgramId(e.target.value)}>
          {currentPrograms.map((item) => (
            <option key={item.programId} value={item.programId}>
              {item.programId}
            </option>
          ))}
        </select>
      </div>
      <div className="chatBox">
        {messages.map((message) => (
          <div key={message.id} className={message.senderId === user.id ? "chatMessage own" : "chatMessage"}>
            <strong>{message.senderRole}</strong>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <form
        className="inline"
        onSubmit={async (e) => {
          e.preventDefault();
          const message = await api.sendChatMessage(token, {
            studentId: selectedStudentId,
            programId: selectedProgramId,
            text
          });
          setMessages((prev) => [...prev, message]);
          setText("");
        }}
      >
        <input className="grow" value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply to student" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default function AdminTeacherPanel({
  token,
  user,
  students,
  teachers,
  courses,
  studentProgressMap,
  onLogout,
  onAddTeacher,
  onAddStudent,
  onUpdateUser,
  onDeleteUser,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson
}) {
  const [tab, setTab] = useState("students");
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [createStudentOpen, setCreateStudentOpen] = useState(false);
  const [createTeacherOpen, setCreateTeacherOpen] = useState(false);

  const visibleStudents =
    user.role === "teacher"
      ? students.filter((student) => student.programAssignments.some((item) => item.teacherId === user.id))
      : students;

  const allowedPrograms =
    user.role === "teacher"
      ? courses.filter((course) => user.programAccess.some((access) => access.startsWith(course.id)))
      : courses;

  const ratingRows = visibleStudents
    .map((student) => {
      const lessonActivity = studentProgressMap[student.id]?.lessonActivity || [];
      const points = lessonActivity.reduce(
        (sum, item) =>
          sum + (item.videoCompleted ? 10 : 0) + (item.learningCompleted ? 10 : 0) + (item.taskCompleted ? 10 : 0),
        0
      );

      return {
        id: student.id,
        name: student.name,
        programs: assignmentSummary(student.programAssignments),
        points
      };
    })
    .sort((a, b) => b.points - a.points);

  const adminCards = [
    { id: "students", label: "Students", iconName: "students", value: visibleStudents.length },
    ...(user.role === "admin" ? [{ id: "teachers", label: "Teachers", iconName: "teachers", value: teachers.length }] : []),
    {
      id: "lessons",
      label: "Lessons",
      iconName: "lessons",
      value: courses.reduce((sum, course) => sum + course.levels.reduce((inner, level) => inner + level.lessons.length, 0), 0)
    },
    { id: "targets", label: "Target Scores", iconName: "targets", value: visibleStudents.length },
    { id: "ratings", label: "Ratings", iconName: "rating", value: ratingRows[0]?.points || 0 },
    ...(user.role === "teacher" ? [{ id: "chat", label: "Chat", iconName: "lessons", value: visibleStudents.length }] : [])
  ];

  return (
    <section className="card" data-aos="fade-up">
      <div className="inline cardHeaderLine" data-aos="fade-down">
        <div>
          <h2>{user.role === "admin" ? "Admin Dashboard" : "Teacher Dashboard"}</h2>
          <p className="hint">Students, teachers, lessons, target scores, and rating in one place.</p>
        </div>
        <div className="adminTopbarActions">
          <div className="adminLogoutPanel">
            <div>
              <strong>{user.name}</strong>
              <p className="hint">{user.role}</p>
            </div>
            <button className="danger" onClick={onLogout}>
              {icon("logout")}
              <span>Logout</span>
            </button>
          </div>
          <div className="inline">
          {user.role === "admin" && tab === "students" && <button onClick={() => setCreateStudentOpen(true)}>{icon("students")}<span>Add Student</span></button>}
          {user.role === "admin" && tab === "teachers" && <button onClick={() => setCreateTeacherOpen(true)}>{icon("teachers")}<span>Add Teacher</span></button>}
          </div>
        </div>
      </div>

      <div
        className="cardSection cardSectionPlain"
        data-aos="fade-up"
        style={{
          background: "none",
          border: "0",
          boxShadow: "none",
          backdropFilter: "none",
          WebkitBackdropFilter: "none"
        }}
      >
        <div className="adminOverviewGrid">
          {adminCards.map((card, index) => (
            <button
              key={card.id}
              className={tab === card.id ? "adminOverviewCard active" : "adminOverviewCard"}
              data-aos="zoom-in"
              data-aos-delay={40 * (index + 1)}
              onClick={() => setTab(card.id)}
            >
              {icon(card.iconName)}
              <strong>{card.value}</strong>
              <span>{card.label}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === "students" && (
        <UserTable
          rows={visibleStudents}
          type="students"
          search={studentSearch}
          filter={studentFilter}
          onSearch={setStudentSearch}
          onFilter={setStudentFilter}
          onSelect={setEditingStudent}
        />
      )}

      {tab === "teachers" && user.role === "admin" && (
        <UserTable
          rows={teachers}
          type="teachers"
          search={teacherSearch}
          filter={teacherFilter}
          onSearch={setTeacherSearch}
          onFilter={setTeacherFilter}
          onSelect={setEditingTeacher}
        />
      )}

      {tab === "lessons" && (
        <LessonManager
          isAdmin={user.role === "admin"}
          allowedPrograms={allowedPrograms}
          onAddLesson={onAddLesson}
          onUpdateLesson={onUpdateLesson}
          onDeleteLesson={onDeleteLesson}
        />
      )}

      {tab === "targets" && (
        <div
          className="cardSection cardSectionPlain"
          data-aos="fade-up"
          style={{
            background: "none",
            border: "0",
            boxShadow: "none",
            backdropFilter: "none",
            WebkitBackdropFilter: "none"
          }}
        >
          <h3>Student Target Scores</h3>
          <div className="tableWrap">
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Programs</th>
                  <th>Target Scores</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((student) => (
                  <tr key={student.id} onClick={() => setEditingStudent(student)}>
                    <td>{student.name}</td>
                    <td>{assignmentSummary(student.programAssignments)}</td>
                    <td>
                      {student.programAssignments
                        .map((assignment) => {
                          const score = student.targetScores?.[assignment.programId] || "Didn't mention";
                          return `${programLabels[assignment.programId] || assignment.programId}: ${score}`;
                        })
                        .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "ratings" && (
        <div
          className="cardSection cardSectionPlain"
          data-aos="fade-up"
          style={{
            background: "none",
            border: "0",
            boxShadow: "none",
            backdropFilter: "none",
            WebkitBackdropFilter: "none"
          }}
        >
          <h3>Student Ratings</h3>
          <p className="hint">Each lesson can give 30 points total.</p>
          <div className="tableWrap">
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Programs</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {ratingRows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.name}</td>
                    <td>{row.programs}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "chat" && user.role === "teacher" && <TeacherChat token={token} user={user} students={students} />}

      {createStudentOpen && <CreateUserModal type="student" onClose={() => setCreateStudentOpen(false)} onSubmit={onAddStudent} />}
      {createTeacherOpen && <CreateUserModal type="teacher" onClose={() => setCreateTeacherOpen(false)} onSubmit={onAddTeacher} />}

      {editingStudent && (
        <UserEditorModal
          type="students"
          selected={editingStudent}
          teachers={teachers}
          canDelete={user.role === "admin"}
          canEditAccess={false}
          onClose={() => setEditingStudent(null)}
          onSave={onUpdateUser}
          onDelete={onDeleteUser}
        />
      )}

      {editingTeacher && (
        <UserEditorModal
          type="teachers"
          selected={editingTeacher}
          teachers={teachers}
          canDelete={true}
          canEditAccess={true}
          onClose={() => setEditingTeacher(null)}
          onSave={onUpdateUser}
          onDelete={onDeleteUser}
        />
      )}
    </section>
  );
}
