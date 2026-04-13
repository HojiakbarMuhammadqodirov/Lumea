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
import StudentDashboard from "./components/StudentDashboard";

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
    return courses.filter((course) => studentAssignments.some((item) => item.programId === course.id));
  }, [courses, user, studentAssignments]);

  const selectedProgram = visibleCourses.find((course) => course.id === selectedProgramId) || visibleCourses[0];
  const selectedAssignment = studentAssignments.find((item) => item.programId === selectedProgram?.id);
  const selectedLevel =
    selectedProgram?.levels.find((level) => level.id === (selectedLevelId || selectedAssignment?.levelId)) ||
    selectedProgram?.levels[0];

  const persistUser = (nextUser, nextToken = token) => {
    setUser(nextUser);
    localStorage.setItem("learnova_user", JSON.stringify(nextUser));
    if (nextToken) {
      localStorage.setItem("learnova_token", nextToken);
    }
  };

  const showToast = (message) => {
    setError(message);
    setToast(message);
  };

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => {
      setToast("");
      setError("");
    }, 7000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const clearSession = () => {
    setToken("");
    setUser(null);
    setCourses([]);
    setPracticeTests([]);
    setProgress(null);
    setStudents([]);
    setTeachers([]);
    setStudentProgressMap({});
    setMyTeachers([]);
    setSelectedProgramId("");
    setSelectedLevelId("");
    localStorage.removeItem("learnova_token");
    localStorage.removeItem("learnova_user");
  };

  const refreshCourses = async (activeToken = token) => {
    const data = await api.getCourses(activeToken);
    setCourses(data);
    return data;
  };

  const refreshUsers = async (activeToken = token, activeRole = user?.role) => {
    if (activeRole !== "admin" && activeRole !== "teacher") return;
    const [studentRows, teacherRows] = await Promise.all([
      api.listUsers(activeToken, "student"),
      api.listUsers(activeToken, "teacher")
    ]);
    setStudents(studentRows);
    setTeachers(teacherRows);
    const progressRows = await Promise.all(
      studentRows.map(async (student) => [student.id, await api.getProgress(activeToken, student.id)])
    );
    setStudentProgressMap(Object.fromEntries(progressRows));
  };

  const refreshMe = async (activeToken = token) => {
    const profile = await api.getMyProfile(activeToken);
    persistUser(profile, activeToken);
    return profile;
  };

  const loadDashboard = async (activeToken, activeUser) => {
    const me = await api.getMyProfile(activeToken);
    persistUser(me, activeToken);
    const data = await refreshCourses(activeToken);

    if (me.role === "student") {
      const firstAssignment = me.programAssignments[0];
      setSelectedProgramId(firstAssignment?.programId || data[0]?.id || "");
      setSelectedLevelId(firstAssignment?.levelId || "");
      setProgress(await api.getProgress(activeToken, me.id));
      setMyTeachers(await api.getMyTeachers(activeToken));
    }

    if (activeUser.role === "teacher" || activeUser.role === "admin") {
      await refreshUsers(activeToken, activeUser.role);
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      once: false,
      mirror: false,
      offset: 18
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [user, error, courses.length, practiceTests.length, students.length, teachers.length, selectedProgramId, selectedLevelId]);

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
    try {
      setError("");
      setToast("");
      handleAuth(await api.login(payload));
    } catch (e) {
      showToast(e.message);
    }
  };

  const register = async (payload) => {
    try {
      setError("");
      setToast("");
      handleAuth(await api.register(payload));
      setNeedsPlan(true);
    } catch (e) {
      showToast(e.message);
    }
  };

  const updateMyProfile = async (payload) => {
    try {
      setError("");
      const result = await api.updateMyProfile(token, payload);
      persistUser(result.user);
      if (result.user.role === "student") {
        setMyTeachers(await api.getMyTeachers(token));
      }
      if (result.user.role === "teacher" || result.user.role === "admin") {
        await refreshUsers();
      }
    } catch (e) {
      showToast(e.message);
    }
  };

  const completeLesson = async (programId, levelId, lessonId) => {
    try {
      setProgress(await api.completeLesson(token, user.id, { programId, levelId, lessonId }));
    } catch (e) {
      showToast(e.message);
    }
  };

  const submitTopicScore = async (programId, levelId, lessonId, score) => {
    try {
      setProgress(await api.submitTopicScore(token, user.id, { programId, levelId, lessonId, score }));
    } catch (e) {
      showToast(e.message);
    }
  };

  const saveLessonActivity = async (programId, levelId, lessonId, step, value, taskScore = 0) => {
    try {
      setProgress(
        await api.saveLessonActivity(token, user.id, {
          programId,
          levelId,
          lessonId,
          step,
          value,
          taskScore
        })
      );
    } catch (e) {
      showToast(e.message);
    }
  };

  const openPractice = async (programId) => {
    try {
      setSelectedProgramId(programId);
      setPracticeTests(await api.getPracticeTests(token, programId));
    } catch (e) {
      showToast(e.message);
    }
  };

  const submitPracticeScore = async (testId, score) => {
    try {
      setProgress(await api.submitPracticeScore(token, user.id, { programId: selectedProgram.id, testId, score }));
    } catch (e) {
      showToast(e.message);
    }
  };

  const addStudent = async (payload) => {
    try {
      await api.addStudent(token, payload);
      await refreshUsers();
    } catch (e) {
      showToast(e.message);
    }
  };

  const addTeacher = async (payload) => {
    try {
      await api.addTeacher(token, payload);
      await refreshUsers();
    } catch (e) {
      showToast(e.message);
    }
  };

  const updateManagedUser = async (userId, payload) => {
    try {
      await api.updateUser(token, userId, payload);
      await refreshUsers();
      if (user?.role === "teacher") {
        await refreshMe();
      }
    } catch (e) {
      showToast(e.message);
    }
  };

  const deleteManagedUser = async (userId) => {
    try {
      await api.deleteUser(token, userId);
      await refreshUsers();
    } catch (e) {
      showToast(e.message);
    }
  };

  const addLesson = async (payload) => {
    try {
      await api.addLesson(token, payload);
      await refreshCourses();
    } catch (e) {
      showToast(e.message);
    }
  };

  const updateLesson = async (programId, levelId, lessonId, payload) => {
    try {
      await api.updateLesson(token, programId, levelId, lessonId, payload);
      await refreshCourses();
    } catch (e) {
      showToast(e.message);
    }
  };

  const deleteLesson = async (programId, levelId, lessonId) => {
    try {
      await api.deleteLesson(token, programId, levelId, lessonId);
      await refreshCourses();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <main className={user ? "container" : "publicContainer"}>
      {toast && <div className="toastAlert">{toast}</div>}
      {!user && publicView === "landing" && (
        <LandingPage
          onLoginClick={() => setPublicView("login")}
          onNavClick={(view) => { setPublicView(view); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      )}
      {!user && publicView === "sat" && (
        <SatPage
          onLoginClick={() => setPublicView("login")}
          onNavClick={(view) => { setPublicView(view); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      )}
      {!user && publicView === "ielts" && (
        <IeltsPage
          onLoginClick={() => setPublicView("login")}
          onNavClick={(view) => { setPublicView(view); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      )}
      {!user && publicView === "pricing" && (
        <PricingPage
          onLoginClick={() => setPublicView("login")}
          onNavClick={(view) => { setPublicView(view); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      )}
      {!user && publicView === "faq" && (
        <FaqPage
          onLoginClick={() => setPublicView("login")}
          onNavClick={(view) => { setPublicView(view); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      )}

      {!user && publicView === "login" && (
        <section className="publicAuthPage">
          <nav className="authPageNavbar" aria-label="Login navigation">
            <button className="landingLogo authPageLogo" type="button" onClick={() => setPublicView("landing")}>
              Lumea
            </button>
            <button className="landingUtilityButton authBackButton" type="button" onClick={() => setPublicView("landing")}>
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

      {user && needsPlan && (
        <PricingPage
          onLoginClick={() => {}}
          onNavClick={() => {}}
          onSelectPlan={() => setNeedsPlan(false)}
        />
      )}

      {user && !needsPlan && (
        <>
          {user.role === "student" && (
            <StudentDashboard
              token={token}
              user={user}
              courses={visibleCourses}
              progress={progress}
              myTeachers={myTeachers}
              selectedProgramId={selectedProgramId}
              selectedProgram={selectedProgram}
              selectedLevel={selectedLevel}
              studentAssignments={studentAssignments}
              practiceTests={practiceTests}
              onSelectProgram={(id) => {
                setSelectedProgramId(id);
                setPracticeTests([]);
              }}
              onSelectLevel={(programId, levelId) => {
                setSelectedProgramId(programId);
                setSelectedLevelId(levelId);
                setPracticeTests([]);
              }}
              onOpenPractice={openPractice}
              onSubmitPracticeScore={submitPracticeScore}
              onSaveProfile={updateMyProfile}
              onCompleteLesson={completeLesson}
              onSubmitTopicScore={submitTopicScore}
              onSaveLessonActivity={saveLessonActivity}
              onLogout={clearSession}
            />
          )}

          {(user.role === "admin" || user.role === "teacher") && (
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
        </>
      )}
    </main>
  );
}
