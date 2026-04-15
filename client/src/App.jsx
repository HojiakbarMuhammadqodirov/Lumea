import { useEffect, useMemo, useState } from "react";
import AOS from "aos";
import { api } from "./api";
import AuthPanel from "./components/AuthPanel";
import LandingPage from "./components/LandingPage";
import SatPage from "./components/SatPage";
import IeltsPage from "./components/IeltsPage";
import PricingPage from "./components/PricingPage";
import FaqPage from "./components/FaqPage";
import AdminTeacherPanel from "./components/AdminTeacherPanel";

// ── Dashboard shell ──────────────────────────────────────────
import { AppProvider, useApp } from "./dashboard/useApp";
import Sidebar from "./dashboard/Sidebar";
import Topbar from "./dashboard/Topbar";
import { Toast } from "./dashboard/UI";
import HomePage from "./dashboard/pages/Home";
import LessonsPage from "./dashboard/pages/Lessons";
import TestsPage from "./dashboard/pages/Tests";
import { StatsPage, RatingPage, ProfilePage } from "./dashboard/pages/OtherPages";

// ── Dashboard inner wrapper (needs AppProvider context) ──────
function StudentDashboardShell({ onLogout }) {
  const { toast } = useApp();
  const [page, setPage] = useState("home");
  const goTests = () => setPage("tests");

  const pageComponent = {
    home:    <HomePage    onNav={setPage} onStartTest={goTests} />,
    lessons: <LessonsPage />,
    tests:   <TestsPage  />,
    stats:   <StatsPage  />,
    rating:  <RatingPage />,
    profile: <ProfilePage />,
  };

  return (
    <div className="flex min-h-screen bg-[#F0F5FC] font-sans text-[#173B64]">
      <Sidebar page={page} onNav={setPage} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar page={page} />
        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
          {pageComponent[page] || pageComponent.home}
        </div>
      </div>
      <Toast toast={toast} />
      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDE6F0; border-radius: 99px; }
      `}</style>
    </div>
  );
}

// ── Root App ─────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("learnova_token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("learnova_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [practiceTests, setPracticeTests] = useState([]);
  const [progress, setProgress] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [studentProgressMap, setStudentProgressMap] = useState({});
  const [myTeachers, setMyTeachers] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [publicView, setPublicView] = useState("landing");
  const [needsPlan, setNeedsPlan] = useState(false);
  const [toast, setToast] = useState("");

  const studentAssignments = user?.programAssignments || [];
  const visibleCourses = useMemo(() => {
    if (user?.role !== "student") return courses;
    return courses.filter((c) => studentAssignments.some((a) => a.programId === c.id));
  }, [courses, user, studentAssignments]);

  const selectedProgram = visibleCourses.find((c) => c.id === selectedProgramId) || visibleCourses[0];
  const selectedAssignment = studentAssignments.find((a) => a.programId === selectedProgram?.id);
  const selectedLevel =
    selectedProgram?.levels.find((l) => l.id === (selectedLevelId || selectedAssignment?.levelId)) ||
    selectedProgram?.levels[0];

  const persistUser = (nextUser, nextToken = token) => {
    setUser(nextUser);
    localStorage.setItem("learnova_user", JSON.stringify(nextUser));
    if (nextToken) localStorage.setItem("learnova_token", nextToken);
  };

  const showToast = (message) => {
    setError(message);
    setToast(message);
  };

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => { setToast(""); setError(""); }, 7000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const clearSession = () => {
    setToken(""); setUser(null); setCourses([]); setPracticeTests([]);
    setProgress(null); setStudents([]); setTeachers([]);
    setStudentProgressMap({}); setMyTeachers([]);
    setSelectedProgramId(""); setSelectedLevelId("");
    localStorage.removeItem("learnova_token");
    localStorage.removeItem("learnova_user");
  };

  const refreshCourses = async (t = token) => { const d = await api.getCourses(t); setCourses(d); return d; };

  const refreshUsers = async (t = token, role = user?.role) => {
    if (role !== "admin" && role !== "teacher") return;
    const [sr, tr] = await Promise.all([api.listUsers(t, "student"), api.listUsers(t, "teacher")]);
    setStudents(sr); setTeachers(tr);
    const rows = await Promise.all(sr.map(async (s) => [s.id, await api.getProgress(t, s.id)]));
    setStudentProgressMap(Object.fromEntries(rows));
  };

  const refreshMe = async (t = token) => { const p = await api.getMyProfile(t); persistUser(p, t); return p; };

  const loadDashboard = async (t, u) => {
    const me = await api.getMyProfile(t);
    persistUser(me, t);
    const data = await refreshCourses(t);
    if (me.role === "student") {
      const first = me.programAssignments[0];
      setSelectedProgramId(first?.programId || data[0]?.id || "");
      setSelectedLevelId(first?.levelId || "");
      setProgress(await api.getProgress(t, me.id));
      setMyTeachers(await api.getMyTeachers(t));
    }
    if (u.role === "teacher" || u.role === "admin") await refreshUsers(t, u.role);
  };

  useEffect(() => {
    AOS.init({ duration: 650, easing: "ease-out-cubic", once: false, mirror: false, offset: 18 });
  }, []);

  useEffect(() => { AOS.refresh(); },
    [user, error, courses.length, practiceTests.length, students.length, teachers.length, selectedProgramId, selectedLevelId]);

  useEffect(() => {
    if (!token || !user) return;
    loadDashboard(token, user).catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    if (user?.role !== "student" || !selectedAssignment) return;
    setSelectedLevelId(selectedAssignment.levelId);
  }, [user?.programAssignments, selectedProgramId]);

  const handleAuth = (payload) => {
    setToken(payload.token);
    localStorage.setItem("learnova_token", payload.token);
    persistUser(payload.user, payload.token);
  };

  const login = async (payload) => {
    try { setError(""); setToast(""); handleAuth(await api.login(payload)); }
    catch (e) { showToast(e.message); }
  };

  const register = async (payload) => {
    try { setError(""); setToast(""); handleAuth(await api.register(payload)); setNeedsPlan(true); }
    catch (e) { showToast(e.message); }
  };

  const updateMyProfile = async (payload) => {
    try {
      setError("");
      const result = await api.updateMyProfile(token, payload);
      persistUser(result.user);
      if (result.user.role === "student") setMyTeachers(await api.getMyTeachers(token));
      if (result.user.role === "teacher" || result.user.role === "admin") await refreshUsers();
    } catch (e) { showToast(e.message); }
  };

  const completeLesson = async (programId, levelId, lessonId) => {
    try { setProgress(await api.completeLesson(token, user.id, { programId, levelId, lessonId })); }
    catch (e) { showToast(e.message); }
  };

  const submitTopicScore = async (programId, levelId, lessonId, score) => {
    try { setProgress(await api.submitTopicScore(token, user.id, { programId, levelId, lessonId, score })); }
    catch (e) { showToast(e.message); }
  };

  const saveLessonActivity = async (programId, levelId, lessonId, step, value, taskScore = 0) => {
    try { setProgress(await api.saveLessonActivity(token, user.id, { programId, levelId, lessonId, step, value, taskScore })); }
    catch (e) { showToast(e.message); }
  };

  const openPractice = async (programId) => {
    try { setSelectedProgramId(programId); setPracticeTests(await api.getPracticeTests(token, programId)); }
    catch (e) { showToast(e.message); }
  };

  const submitPracticeScore = async (testId, score) => {
    try { setProgress(await api.submitPracticeScore(token, user.id, { programId: selectedProgram.id, testId, score })); }
    catch (e) { showToast(e.message); }
  };

  const addStudent = async (p) => { try { await api.addStudent(token, p); await refreshUsers(); } catch (e) { showToast(e.message); } };
  const addTeacher = async (p) => { try { await api.addTeacher(token, p); await refreshUsers(); } catch (e) { showToast(e.message); } };

  const updateManagedUser = async (userId, payload) => {
    try {
      await api.updateUser(token, userId, payload);
      await refreshUsers();
      if (user?.role === "teacher") await refreshMe();
    } catch (e) { showToast(e.message); }
  };

  const deleteManagedUser = async (userId) => {
    try { await api.deleteUser(token, userId); await refreshUsers(); }
    catch (e) { showToast(e.message); }
  };

  const addLesson = async (p) => { try { await api.addLesson(token, p); await refreshCourses(); } catch (e) { showToast(e.message); } };

  const updateLesson = async (programId, levelId, lessonId, payload) => {
    try { await api.updateLesson(token, programId, levelId, lessonId, payload); await refreshCourses(); }
    catch (e) { showToast(e.message); }
  };

  const deleteLesson = async (programId, levelId, lessonId) => {
    try { await api.deleteLesson(token, programId, levelId, lessonId); await refreshCourses(); }
    catch (e) { setError(e.message); }
  };

  // ── nav helper passed to all public pages ───────────────────
  const navTo = (view) => { setPublicView(view); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const publicProps = { onLoginClick: () => navTo("login"), onNavClick: navTo };

  return (
    <main className={user ? "" : "publicContainer"} style={user ? {minHeight:"100vh"} : {}}>
      {toast && <div className="toastAlert">{toast}</div>}

      {/* ── PUBLIC VIEWS ── */}
      {!user && publicView === "landing"  && <LandingPage  {...publicProps} />}
      {!user && publicView === "sat"      && <SatPage      {...publicProps} />}
      {!user && publicView === "ielts"    && <IeltsPage    {...publicProps} />}
      {!user && publicView === "pricing"  && <PricingPage  {...publicProps} />}
      {!user && publicView === "faq"      && <FaqPage      {...publicProps} />}

      {/* ── LOGIN / REGISTER ── */}
      {!user && publicView === "login" && (
        <section className="publicAuthPage">
          <nav className="authPageNavbar" aria-label="Login navigation">
            <button className="landingLogo authPageLogo" type="button" onClick={() => navTo("landing")}>
              Lumea
            </button>
            <button className="landingUtilityButton authBackButton" type="button" onClick={() => navTo("landing")}>
              Back
            </button>
          </nav>
          <div className="publicAuthIntro">
            <h1>Welcome back to Lumea.</h1>
            <p>Log in or create your profile to continue your study path.</p>
          </div>
          <div className="publicAuthWrap">
            <AuthPanel onLogin={login} onRegister={register} onAlert={showToast} defaultRegister />
          </div>
        </section>
      )}

      {/* ── AFTER REGISTER: choose plan ── */}
      {user && needsPlan && (
        <PricingPage {...publicProps} onSelectPlan={() => setNeedsPlan(false)} />
      )}

      {/* ── STUDENT DASHBOARD (new UI) ── */}
      {user && !needsPlan && user.role === "student" && (
        <AppProvider onLogout={clearSession}>
            <StudentDashboardShell onLogout={clearSession} />
        </AppProvider>
      )}

      {/* ── ADMIN / TEACHER PANEL (existing) ── */}
      {user && !needsPlan && (user.role === "admin" || user.role === "teacher") && (
        <AdminTeacherPanel
          token={token}
          user={user}
          students={students}
          teachers={teachers}
          courses={courses}
          studentProgressMap={studentProgressMap}
          onLogout={clearSession}
          onAddTeacher={addTeacher}
          onAddStudent={addStudent}
          onUpdateUser={updateManagedUser}
          onDeleteUser={deleteManagedUser}
          onAddLesson={addLesson}
          onUpdateLesson={updateLesson}
          onDeleteLesson={deleteLesson}
        />
      )}
    </main>
  );
}
