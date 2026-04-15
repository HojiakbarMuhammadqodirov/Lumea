import { createContext, useContext, useState, useCallback } from "react";
import { DB } from "./db";

const AppContext = createContext(null);

export function AppProvider({ children, onLogout }) {
  const [user, setUser] = useState(DB.user);
  const [examDate, setExamDate] = useState(DB.exam || new Date(Date.now() + 47 * 86400000));
  const [courses, setCourses] = useState(DB.courses);
  const [tests] = useState(DB.tests);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 2400);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((u) => ({ ...u, ...patch }));
  }, []);

  const completeLesson = useCallback((courseId, lessonId) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const lessons = c.lessons.map((l) =>
          l.id === lessonId ? { ...l, done: true, active: false } : l
        );
        const done = lessons.filter((l) => l.done).length;
        const pct = Math.round((done / c.total) * 100);
        return { ...c, lessons, done, pct };
      })
    );
    showToast("Dars bajarildi! 🎉");
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      user, updateUser,
      examDate, setExamDate,
      courses, setCourses,
      tests,
      toast,
      showToast,
      completeLesson,
      onLogout,
      weakTopics: DB.weakTopics,
      activity: DB.activity,
      activityDays: DB.activityDays,
      todayIndex: DB.todayIndex,
      ranking: DB.ranking,
      questions: DB.questions,
      regions: DB.regions,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
