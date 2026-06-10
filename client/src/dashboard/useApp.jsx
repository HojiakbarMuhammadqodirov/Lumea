import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DB } from "./db";

const AppContext = createContext(null);

// ── Course meta (icons, colours) keyed by programId ─────────────
const COURSE_META = {
  "sat-math":    { label: "SAT Math",    icon: "∑",  color: "#4F8EF7", glow: "rgba(79,142,247,0.12)", tag: "blue" },
  "sat-english": { label: "SAT English", icon: "Aa", color: "#8B5CF6", glow: "rgba(139,92,246,0.12)", tag: "purple" },
  "ielts":       { label: "IELTS",       icon: "◎",  color: "#10B981", glow: "rgba(16,185,129,0.12)", tag: "green" },
};

// ── Transforms ──────────────────────────────────────────────────

function toUser(raw = {}) {
  const p = raw.profile || {};
  const t = raw.targetScores || {};
  const firstName = p.firstName || raw.name?.split(" ")[0] || "";
  const lastName  = p.lastName  || raw.name?.split(" ").slice(1).join(" ") || "";
  return {
    name:          raw.name || [firstName, lastName].filter(Boolean).join(" "),
    firstName,     lastName,
    initials:      ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || "LV",
    region:        p.region || "Namangan viloyati",
    grade:         p.grade  || "",
    goal:          p.goal   || "Ikkalasi",
    streak:        raw.streak || 0,
    regionRank:    raw.regionRank || "—",
    totalInRegion: raw.totalInRegion || 0,
    plan:          raw.plan || "free",
    sat: {
      target:  t["sat-math"]?.target  || t["sat-english"]?.target  || 0,
      current: t["sat-math"]?.current || t["sat-english"]?.current || 0,
    },
    ielts: {
      target:  t["ielts"]?.target  || 0,
      current: t["ielts"]?.current || 0,
    },
  };
}

function toCourses(apiCourses = [], lessonActivity = []) {
  return apiCourses.map(c => {
    const meta = COURSE_META[c.id] || {
      label: c.title, icon: "?", color: "#2563EB", glow: "rgba(37,99,235,0.09)", tag: "blue",
    };
    const totalLessons = c.levels?.reduce((s, l) => s + (l.lessons?.length || 0), 0) || 1;
    const done = lessonActivity.filter(a =>
      a.programId === c.id && (a.videoCompleted || a.learningCompleted || a.taskCompleted)
    ).length;
    const pct = Math.min(100, Math.round((done / totalLessons) * 100));
    const lessons = (c.levels || []).flatMap(level =>
      (level.lessons || []).map(lesson => {
        const act = lessonActivity.find(a =>
          a.programId === c.id && a.levelId === level.id && a.lessonId === lesson.id
        );
        return {
          id: lesson.id,
          title: lesson.title,
          dur: lesson.durationMinutes || 20,
          done: !!act?.taskCompleted,
          active: !act?.taskCompleted,
          desc: lesson.description || "",
        };
      })
    );
    return { ...meta, id: c.id, pct, done, total: totalLessons, lessons };
  });
}

function toActivityData(lessonActivity = []) {
  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7; // Mon = 0
  const days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
  const activity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - todayIndex + i);
    const key = d.toISOString().slice(0, 10);
    return lessonActivity.filter(a => (a.updatedAt || "").startsWith(key)).length * 18;
  });
  return { activity, activityDays: days, todayIndex };
}

function toStreak(lessonActivity = []) {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (lessonActivity.some(a => (a.updatedAt || "").startsWith(key))) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function toTests(progress = {}) {
  return (progress.practiceScores || [])
    .map((s, i) => ({
      id: i + 1,
      name: s.testId || "Practice Test",
      score: s.score || 0,
      max: s.programId?.includes("ielts") ? 9 : s.programId?.includes("english") ? 400 : 800,
      date: s.date ? new Date(s.date).toLocaleDateString() : "",
      change: s.change ?? null,
      type: s.programId?.includes("ielts") ? "ielts" : "sat",
    }))
    .slice(0, 6);
}

function toWeakTopics(progress = {}) {
  return (progress.topicScores || [])
    .filter(s => (s.score || 0) < 70)
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, 4)
    .map(s => ({
      name: s.lessonId || "Mavzu",
      pct: s.score || 0,
      color: (s.score || 0) < 50 ? "#EF4444" : (s.score || 0) < 65 ? "#F97316" : "#F59E0B",
    }));
}

// ── Provider ────────────────────────────────────────────────────

export function AppProvider({ children, onLogout, apiUser, apiCourses, apiProgress, apiRanking, onSaveProfile, token, myTeachers }) {
  const la = apiProgress?.lessonActivity || [];

  const [user, setUser] = useState(() => {
    const u = toUser(apiUser);
    return { ...u, streak: u.streak || toStreak(la) };
  });

  const [examDate, setExamDate] = useState(() => {
    const d = apiUser?.profile?.examDate;
    return d ? new Date(d) : new Date(Date.now() + 47 * 86400000);
  });

  const [courses, setCourses] = useState(() => toCourses(apiCourses, la));
  const [toast, setToast] = useState(null);

  // Re-sync when parent refreshes data (after lesson completion, profile save, etc.)
  useEffect(() => {
    const activity = apiProgress?.lessonActivity || [];
    const u = toUser(apiUser);
    setUser(prev => ({ ...prev, ...u, streak: u.streak || toStreak(activity) }));
    setCourses(toCourses(apiCourses || [], activity));
    if (apiUser?.profile?.examDate) setExamDate(new Date(apiUser.profile.examDate));
  }, [apiUser, apiCourses, apiProgress]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 2400);
  }, []);

  const updateUser = useCallback(async (patch) => {
    setUser(prev => ({ ...prev, ...patch }));
    if (!onSaveProfile) return;
    try {
      const apiPayload = {};
      const profileKeys = ["firstName", "lastName", "grade", "goal", "region", "phoneNumber", "gender"];
      const profilePatch = Object.fromEntries(profileKeys.filter(k => k in patch).map(k => [k, patch[k]]));
      if (Object.keys(profilePatch).length) apiPayload.profile = profilePatch;
      // ScoreModal sends { sat: {target, current}, ielts: {target, current} }
      if (patch.sat || patch.ielts) {
        apiPayload.targetScores = {};
        if (patch.sat)   apiPayload.targetScores["sat-math"] = patch.sat;
        if (patch.ielts) apiPayload.targetScores["ielts"]    = patch.ielts;
      }
      if (Object.keys(apiPayload).length) await onSaveProfile(apiPayload);
    } catch { /* non-critical */ }
  }, [onSaveProfile]);

  const completeLesson = useCallback((courseId, lessonId) => {
    setCourses(prev =>
      prev.map(course => {
        if (course.id !== courseId) return course;
        const lessons = course.lessons.map(l =>
          l.id === lessonId ? { ...l, done: true, active: false } : l
        );
        const done = lessons.filter(l => l.done).length;
        return { ...course, lessons, done, pct: Math.round((done / course.total) * 100) };
      })
    );
    showToast("Dars bajarildi!");
  }, [showToast]);

  const actData = toActivityData(la);

  return (
    <AppContext.Provider value={{
      user, updateUser,
      examDate, setExamDate,
      courses, setCourses,
      tests:      toTests(apiProgress || {}),
      weakTopics: toWeakTopics(apiProgress || {}),
      toast, showToast,
      completeLesson, onLogout,
      activity:     actData.activity,
      activityDays: actData.activityDays,
      todayIndex:   actData.todayIndex,
      ranking:  apiRanking?.length ? apiRanking : DB.ranking,
      questions: DB.questions,
      regions:   DB.regions,
      token,
      rawUser:    apiUser,
      myTeachers: myTeachers || [],
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
