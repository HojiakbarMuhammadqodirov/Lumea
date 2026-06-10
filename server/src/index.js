import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { db } from "./dataStore.js";
import { authMiddleware, requireRole, signToken } from "./auth.js";

const app = express();
const PORT = 4001;

// ── Allowed programs & levels ──────────────────────────────────────────────
const studentPrograms = ["sat-math", "sat-english", "ielts"];
const teacherPrograms = ["sat-math", "sat-english", "ielts-listening", "ielts-reading", "ielts-speaking", "ielts-writing"];
const levels = ["beginner", "intermediate", "advanced"];

// ── Input sanitization helpers ────────────────────────────────────────────
const strip = (v) => (typeof v === "string" ? v.replace(/<[^>]*>/g, "").trim() : v);
const sanitizeStr = (v, max = 200) => typeof v === "string" ? strip(v).slice(0, max) : "";
const validEmail = (e) => typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim()) && e.length <= 200;
const validPassword = (p) => typeof p === "string" && p.length >= 8 && p.length <= 128;

// ── Error helper ──────────────────────────────────────────────────────────
const appError = (res, status, message) => res.status(status).json({ message });

// ── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:5178,http://localhost:5179")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server (no origin) and listed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Security headers ───────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // API only — no HTML served
    crossOriginEmbedderPolicy: false,
  })
);

// ── Body parsing (tight limit) ────────────────────────────────────────────
app.use(express.json({ limit: "64kb" }));

// ── Rate limiters ─────────────────────────────────────────────────────────

// Strict limiter for auth endpoints: 10 attempts per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  skipSuccessfulRequests: false,
});

// Moderate limiter for all other API routes: 200 req per min per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down." },
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// ── Data helpers ──────────────────────────────────────────────────────────

const buildProfile = (user = {}) => {
  const existing = user.profile || {};
  const fallbackName = user.name || "";
  const [firstName = "", ...rest] = fallbackName.split(" ");
  return {
    firstName:    sanitizeStr(existing.firstName  ?? firstName,    80),
    lastName:     sanitizeStr(existing.lastName   ?? rest.join(" "), 80),
    gender:       sanitizeStr(existing.gender     ?? "", 20),
    englishLevel: sanitizeStr(existing.englishLevel ?? "", 30),
    phoneNumber:  sanitizeStr(existing.phoneNumber  ?? "", 30),
    dateOfBirth:  sanitizeStr(existing.dateOfBirth  ?? "", 20),
    addressLine1: sanitizeStr(existing.addressLine1 ?? "", 200),
    addressLine2: sanitizeStr(existing.addressLine2 ?? "", 200),
    city:         sanitizeStr(existing.city         ?? "", 100),
    country:      sanitizeStr(existing.country      ?? "", 100),
    postalCode:   sanitizeStr(existing.postalCode   ?? "", 20),
    profilePicture: sanitizeStr(existing.profilePicture ?? "", 500),
    region:       sanitizeStr(existing.region ?? "", 100),
    grade:        sanitizeStr(existing.grade  ?? "", 10),
    goal:         sanitizeStr(existing.goal   ?? "", 50),
    examDate:     sanitizeStr(existing.examDate ?? "", 20),
  };
};

const fullNameFromProfile = (profile) => [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();

const normalizeStudentAssignments = (user) => {
  const assignments = Array.isArray(user.programAssignments) ? user.programAssignments : [];
  if (assignments.length > 0) {
    return assignments
      .filter((item) => studentPrograms.includes(item.programId))
      .map((item) => ({
        programId: item.programId,
        levelId: levels.includes(item.levelId) ? item.levelId : "beginner",
        teacherId: item.teacherId || ""
      }));
  }
  return [{ programId: "sat-math", levelId: "beginner", teacherId: "" }];
};

const normalizeTeacherScores = (scores = {}) =>
  teacherPrograms.reduce((acc, key) => {
    acc[key] = scores[key] ?? "";
    return acc;
  }, {});

const normalizeStudentTargets = (targets = {}, assignments = []) => {
  const allowedPrograms = new Set([
    ...studentPrograms,
    ...assignments.map((item) => item.programId).filter(Boolean)
  ]);
  return Array.from(allowedPrograms).reduce((acc, key) => {
    acc[key] = targets[key] ?? "";
    return acc;
  }, {});
};

const defaultLearningSlides = (program, level, lesson) => [
  { id: `${lesson.id}-slide-1`, title: "What we learn first", content: `${program.title} ${level.title}: ${lesson.title} starts with the key idea and the main rule students should remember.` },
  { id: `${lesson.id}-slide-2`, title: "How to use it",       content: `This part explains how the concept is used in real exam questions and what steps the student should follow.` },
  { id: `${lesson.id}-slide-3`, title: "Common mistakes",     content: `Students review the usual mistakes, quick checks, and a short reminder before moving to the task.` }
];

const normalizeLesson = (program, level, lesson) => ({
  ...lesson,
  videoUrl: sanitizeStr(lesson.videoUrl ?? "", 500),
  pdfUrl:   sanitizeStr(lesson.pdfUrl   ?? "", 500),
  learningSlides:
    Array.isArray(lesson.learningSlides) && lesson.learningSlides.length
      ? lesson.learningSlides.map((slide, index) => ({
          id:      slide.id      || `${lesson.id}-slide-${index + 1}`,
          title:   sanitizeStr(slide.title   || `Learning Step ${index + 1}`, 200),
          content: sanitizeStr(slide.content || "", 5000),
        }))
      : defaultLearningSlides(program, level, lesson),
  topicTest: {
    id:            lesson.topicTest?.id || `topic-test-${lesson.id}`,
    format:        lesson.topicTest?.format || "JSON",
    questionCount: Number(lesson.topicTest?.questionCount) || 10
  }
});

const normalizeProgressRecord = (record = {}) => ({
  completedLessons:   Array.isArray(record.completedLessons)   ? record.completedLessons   : [],
  topicTestScores:    Array.isArray(record.topicTestScores)    ? record.topicTestScores    : [],
  practiceTestScores: Array.isArray(record.practiceTestScores) ? record.practiceTestScores : [],
  lessonActivity:     Array.isArray(record.lessonActivity)     ? record.lessonActivity     : []
});

const getLessonActivityEntry = (record, programId, levelId, lessonId) => {
  let entry = record.lessonActivity.find(
    (item) => item.programId === programId && item.levelId === levelId && item.lessonId === lessonId
  );
  if (!entry) {
    entry = { programId, levelId, lessonId, videoCompleted: false, learningCompleted: false, taskCompleted: false, taskScore: 0, updatedAt: new Date().toISOString() };
    record.lessonActivity.push(entry);
  }
  return entry;
};

const normalizeUser = (user) => {
  const profile = buildProfile(user);
  const normalized = {
    ...user,
    profile,
    name: fullNameFromProfile(profile) || user.name || "",
    phoneNumber: profile.phoneNumber || "",
    dateOfBirth: profile.dateOfBirth || ""
  };
  if (normalized.role === "student") {
    normalized.programAssignments = normalizeStudentAssignments(normalized);
    normalized.targetScores = normalizeStudentTargets(normalized.targetScores, normalized.programAssignments);
  }
  if (normalized.role === "teacher") {
    normalized.programAccess = Array.isArray(normalized.programAccess) && normalized.programAccess.length
      ? normalized.programAccess.filter((item) => teacherPrograms.includes(item))
      : ["sat-math"];
    normalized.programScores = normalizeTeacherScores(normalized.programScores);
  }
  return normalized;
};

const ensureUsersShape = async () => {
  const users = await db.getUsers();
  const normalized = users.map(normalizeUser);
  if (JSON.stringify(users) !== JSON.stringify(normalized)) await db.saveUsers(normalized);
  return normalized;
};

const ensureCoursesShape = async () => {
  const courses = await db.getCourses();
  let changed = false;

  if (Array.isArray(courses.lessonTemplates) && Array.isArray(courses.programs)) {
    const normalizedPrograms = courses.programs.map((program) => ({
      ...program,
      levels: program.levels.map((level) => {
        if (Array.isArray(level.lessons)) return level;
        changed = true;
        return {
          ...level,
          lessons: courses.lessonTemplates.map((tpl) =>
            normalizeLesson(program, level, {
              id: `${level.id}-lesson-${tpl.index}`,
              title: `${program.title} ${level.title} Lesson ${tpl.index}: ${tpl.topic}`,
              videoUrl: `https://example.com/videos/${program.id}/${level.id}/lesson-${tpl.index}`,
              pdfUrl: `https://example.com/docs/${program.id}/${level.id}/lesson-${tpl.index}.pdf`,
              topicTest: { id: `topic-test-${level.id}-${tpl.index}`, format: "JSON", questionCount: 10 }
            })
          )
        };
      })
    }));
    const normalized = { programs: normalizedPrograms };
    if (changed) await db.saveCourses(normalized);
    return normalized;
  }

  const normalizedPrograms = courses.programs.map((program) => ({
    ...program,
    levels: program.levels.map((level) => ({
      ...level,
      lessons: (level.lessons || []).map((lesson) => {
        const n = normalizeLesson(program, level, lesson);
        if (JSON.stringify(n) !== JSON.stringify(lesson)) changed = true;
        return n;
      })
    }))
  }));

  if (changed) {
    const normalized = { ...courses, programs: normalizedPrograms };
    await db.saveCourses(normalized);
    return normalized;
  }
  return { ...courses, programs: normalizedPrograms };
};

const ensureProgressShape = async () => {
  const progress = await db.getProgress();
  const normalized = Object.fromEntries(
    Object.entries(progress).map(([id, rec]) => [id, normalizeProgressRecord(rec)])
  );
  if (JSON.stringify(progress) !== JSON.stringify(normalized)) await db.saveProgress(normalized);
  return normalized;
};

// Strip sensitive fields before sending to clients
const publicUser = (user) => {
  const n = normalizeUser(user);
  return {
    id:                 n.id,
    name:               n.name,
    email:              n.email,
    role:               n.role,
    profile:            n.profile,
    phoneNumber:        n.phoneNumber,
    dateOfBirth:        n.dateOfBirth,
    programAssignments: n.programAssignments || [],
    targetScores:       n.targetScores       || {},
    programAccess:      n.programAccess      || [],
    programScores:      n.programScores      || {}
  };
  // passwordHash is intentionally NOT included
};

const sanitizeUpdatePayload = async (target, payload, actorRole, isSelf = false) => {
  const next = { ...target };

  // Email update: validate format, check uniqueness done at call site
  if (payload.email) {
    const email = payload.email.trim().toLowerCase();
    if (!validEmail(email)) throw new Error("Invalid email format.");
    next.email = email;
  }

  // Password update: bcrypt always, minimum 8 chars
  if (payload.password) {
    if (!validPassword(payload.password)) throw new Error("Password must be 8–128 characters.");
    next.passwordHash = await bcrypt.hash(payload.password, 12);
    delete next.password;
  }

  const incomingProfile = payload.profile || {};
  const mergedProfile = { ...buildProfile(target), ...incomingProfile };
  next.profile = mergedProfile;
  next.name = fullNameFromProfile(mergedProfile) || target.name;
  next.phoneNumber = mergedProfile.phoneNumber;
  next.dateOfBirth = mergedProfile.dateOfBirth;

  if (target.role === "student" && (actorRole === "admin" || actorRole === "teacher")) {
    if (Array.isArray(payload.programAssignments)) {
      next.programAssignments = payload.programAssignments
        .filter((item) => studentPrograms.includes(item.programId))
        .map((item) => ({
          programId: item.programId,
          levelId: levels.includes(item.levelId) ? item.levelId : "beginner",
          teacherId: item.teacherId || ""
        }));
    }
  }

  if (target.role === "student" && (actorRole === "admin" || actorRole === "teacher" || isSelf)) {
    if (payload.targetScores) {
      next.targetScores = normalizeStudentTargets(
        { ...normalizeStudentTargets(target.targetScores, target.programAssignments || []), ...payload.targetScores },
        next.programAssignments || target.programAssignments || []
      );
    }
  }

  if (target.role === "teacher") {
    if ((actorRole === "admin" || isSelf) && payload.programScores) {
      next.programScores = normalizeTeacherScores({
        ...normalizeTeacherScores(target.programScores),
        ...payload.programScores
      });
    }
    if (actorRole === "admin" && Array.isArray(payload.programAccess)) {
      next.programAccess = payload.programAccess.filter((item) => teacherPrograms.includes(item));
    }
  }

  return normalizeUser(next);
};

const findProgram = (courses, programId) => courses.programs.find((p) => p.id === programId);
const findLevel   = (program, levelId)  => program?.levels.find((l) => l.id === levelId);

const teacherVisibleScores = (teacher, studentProgramId) => {
  if (studentProgramId === "sat-math")    return { "sat-math":       teacher.programScores["sat-math"] };
  if (studentProgramId === "sat-english") return { "sat-english":    teacher.programScores["sat-english"] };
  return {
    "ielts-listening": teacher.programScores["ielts-listening"],
    "ielts-reading":   teacher.programScores["ielts-reading"],
    "ielts-speaking":  teacher.programScores["ielts-speaking"],
    "ielts-writing":   teacher.programScores["ielts-writing"]
  };
};

// ── Routes ─────────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ── Auth ────────────────────────────────────────────────────────────────────

app.post("/api/auth/register", async (req, res) => {
  const rawEmail    = (req.body.email    || "").trim().toLowerCase();
  const rawPassword = req.body.password  || "";
  const profile     = req.body.profile   || {};
  const name        = sanitizeStr(req.body.name || "", 160);
  const incomingProfile = buildProfile({ name, profile });
  const resolvedName    = fullNameFromProfile(incomingProfile) || name;

  if (!resolvedName)              return appError(res, 400, "Name is required.");
  if (!validEmail(rawEmail))      return appError(res, 400, "Valid email is required.");
  if (!validPassword(rawPassword)) return appError(res, 400, "Password must be 8–128 characters.");

  const users = await ensureUsersShape();
  if (users.find((u) => u.email.toLowerCase() === rawEmail)) {
    return appError(res, 409, "Email already exists.");
  }

  const user = normalizeUser({
    id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email: rawEmail,
    passwordHash: await bcrypt.hash(rawPassword, 12),
    role: "student",
    profile: incomingProfile
  });

  users.push(user);
  await db.saveUsers(users);
  return res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const rawEmail    = (req.body.email    || "").trim().toLowerCase();
  const rawPassword = req.body.password  || "";

  if (!rawEmail || !rawPassword) return appError(res, 400, "Email and password are required.");

  const users = await ensureUsersShape();
  const user  = users.find((u) => u.email.toLowerCase() === rawEmail);

  // Always run bcrypt.compare to prevent timing-based user enumeration
  const hash = user?.passwordHash || "$2a$12$invalidhashpaddingtomimicbcrypttiming";
  const valid = await bcrypt.compare(rawPassword, hash);

  if (!user || !valid) return appError(res, 401, "Invalid credentials.");

  // Reject accounts that still have a plaintext password field
  if (!user.passwordHash) return appError(res, 401, "Invalid credentials.");

  return res.json({ token: signToken(user), user: publicUser(user) });
});

// ── Profile ─────────────────────────────────────────────────────────────────

app.get("/api/profile/me", authMiddleware, async (req, res) => {
  const users = await ensureUsersShape();
  const user  = users.find((u) => u.id === req.user.id);
  if (!user) return appError(res, 404, "User not found.");
  return res.json(publicUser(user));
});

app.put("/api/profile/me", authMiddleware, async (req, res) => {
  const users = await ensureUsersShape();
  const index = users.findIndex((u) => u.id === req.user.id);
  if (index === -1) return appError(res, 404, "User not found.");

  try {
    users[index] = await sanitizeUpdatePayload(users[index], req.body, users[index].role, true);
  } catch (e) {
    return appError(res, 400, e.message);
  }
  await db.saveUsers(users);
  return res.json({ user: publicUser(users[index]) });
});

// ── Courses ──────────────────────────────────────────────────────────────────

app.get("/api/courses", authMiddleware, async (_req, res) => {
  const courses = await ensureCoursesShape();
  res.json(courses.programs);
});

app.get("/api/practice-tests/:programId", authMiddleware, async (req, res) => {
  const { programId } = req.params;
  if (!studentPrograms.includes(programId)) return appError(res, 400, "Invalid program.");
  const tests = await db.getPracticeTests();
  const row = tests[programId];
  if (!row) return appError(res, 404, "Practice tests not found.");
  return res.json(row);
});

// ── User management (admin + teacher) ────────────────────────────────────────

app.get("/api/users", authMiddleware, requireRole("admin", "teacher"), async (req, res) => {
  const users = await ensureUsersShape();
  const role  = req.query.role;

  // Validate role query param
  if (role && !["student", "teacher", "admin"].includes(role)) {
    return appError(res, 400, "Invalid role filter.");
  }

  let filtered = role ? users.filter((u) => u.role === role) : users;

  // Teachers only see students assigned to them
  if (req.user.role === "teacher") {
    filtered = filtered.filter(
      (u) => u.role !== "admin" && (
        u.role === "teacher" ? u.id === req.user.id :
        u.programAssignments?.some((a) => a.teacherId === req.user.id)
      )
    );
  }

  res.json(filtered.map(publicUser));
});

app.post("/api/users/students", authMiddleware, requireRole("admin"), async (req, res) => {
  const rawEmail    = (req.body.email || "").trim().toLowerCase();
  const rawPassword = req.body.password || "";

  if (!validEmail(rawEmail))       return appError(res, 400, "Valid email is required.");
  if (!validPassword(rawPassword)) return appError(res, 400, "Password must be 8–128 characters.");

  const users = await ensureUsersShape();
  if (users.find((u) => u.email.toLowerCase() === rawEmail)) {
    return appError(res, 409, "Email already exists.");
  }

  const user = normalizeUser({
    id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email: rawEmail,
    passwordHash: await bcrypt.hash(rawPassword, 12),
    role: "student",
    profile: buildProfile({ profile: req.body.profile })
  });

  users.push(user);
  await db.saveUsers(users);
  return res.status(201).json({ user: publicUser(user) });
});

app.post("/api/users/teachers", authMiddleware, requireRole("admin"), async (req, res) => {
  const rawEmail    = (req.body.email || "").trim().toLowerCase();
  const rawPassword = req.body.password || "";

  if (!validEmail(rawEmail))       return appError(res, 400, "Valid email is required.");
  if (!validPassword(rawPassword)) return appError(res, 400, "Password must be 8–128 characters.");

  const users = await ensureUsersShape();
  if (users.find((u) => u.email.toLowerCase() === rawEmail)) {
    return appError(res, 409, "Email already exists.");
  }

  const user = normalizeUser({
    id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email: rawEmail,
    passwordHash: await bcrypt.hash(rawPassword, 12),
    role: "teacher",
    profile: buildProfile({ profile: req.body.profile }),
    programAccess: req.body.programAccess,
    programScores: req.body.programScores
  });

  users.push(user);
  await db.saveUsers(users);
  return res.status(201).json({ user: publicUser(user) });
});

app.put("/api/users/:userId", authMiddleware, requireRole("admin", "teacher"), async (req, res) => {
  const users  = await ensureUsersShape();
  const index  = users.findIndex((u) => u.id === req.params.userId);
  if (index === -1) return appError(res, 404, "User not found.");

  const target = users[index];

  // Teachers can only modify students that are assigned to them
  if (req.user.role === "teacher") {
    if (target.role !== "student") return appError(res, 403, "Teachers can only update students.");
    const isMyStudent = target.programAssignments?.some((a) => a.teacherId === req.user.id);
    if (!isMyStudent) return appError(res, 403, "This student is not assigned to you.");
  }

  // Prevent privilege escalation: nobody can change role via this endpoint
  if (req.body.role && req.body.role !== target.role) {
    return appError(res, 403, "Role changes are not allowed.");
  }

  if (req.body.email) {
    const newEmail = req.body.email.trim().toLowerCase();
    if (!validEmail(newEmail)) return appError(res, 400, "Invalid email format.");
    if (users.some((u) => u.id !== target.id && u.email.toLowerCase() === newEmail)) {
      return appError(res, 409, "Email already exists.");
    }
  }

  try {
    users[index] = await sanitizeUpdatePayload(target, req.body, req.user.role, false);
  } catch (e) {
    return appError(res, 400, e.message);
  }
  await db.saveUsers(users);
  return res.json({ user: publicUser(users[index]) });
});

app.delete("/api/users/:userId", authMiddleware, requireRole("admin"), async (req, res) => {
  const users  = await ensureUsersShape();
  const target = users.find((u) => u.id === req.params.userId);
  if (!target) return appError(res, 404, "User not found.");

  // Protect admin accounts
  if (target.role === "admin") return appError(res, 400, "Admin accounts cannot be deleted.");

  // Prevent self-delete
  if (target.id === req.user.id) return appError(res, 400, "Cannot delete your own account.");

  await db.saveUsers(users.filter((u) => u.id !== target.id));

  const progress = await db.getProgress();
  if (progress[target.id]) {
    delete progress[target.id];
    await db.saveProgress(progress);
  }

  const chats = await db.getChats();
  await db.saveChats(chats.filter((c) => c.studentId !== target.id && c.teacherId !== target.id));

  return res.json({ success: true });
});

// ── Teacher list (for student) ────────────────────────────────────────────────

app.get("/api/teachers/mine", authMiddleware, requireRole("student"), async (req, res) => {
  const users   = await ensureUsersShape();
  const student = users.find((u) => u.id === req.user.id);
  if (!student) return appError(res, 404, "Student not found.");

  const teachers = student.programAssignments
    .map((assignment) => {
      const teacher = users.find((u) => u.id === assignment.teacherId && u.role === "teacher");
      if (!teacher) return null;
      return {
        id:             teacher.id,
        name:           teacher.name,
        profilePicture: teacher.profile.profilePicture,
        programId:      assignment.programId,
        scores:         teacherVisibleScores(teacher, assignment.programId)
      };
    })
    .filter(Boolean);

  res.json(teachers);
});

// ── Chat ──────────────────────────────────────────────────────────────────────

app.get("/api/chats", authMiddleware, async (req, res) => {
  const { programId, studentId } = req.query;
  if (!programId || !studentId) return appError(res, 400, "programId and studentId are required.");
  if (!studentPrograms.includes(programId)) return appError(res, 400, "Invalid program.");

  const users   = await ensureUsersShape();
  const student = users.find((u) => u.id === studentId && u.role === "student");
  if (!student) return appError(res, 404, "Student not found.");

  const assignment = student.programAssignments.find((a) => a.programId === programId);
  if (!assignment || !assignment.teacherId) return appError(res, 404, "Teacher not assigned for this program.");

  const allowed =
    req.user.role === "admin" ||
    req.user.id   === studentId ||
    req.user.id   === assignment.teacherId;

  if (!allowed) return appError(res, 403, "Forbidden");

  const chats = await db.getChats();
  return res.json(chats.filter((c) => c.programId === programId && c.studentId === studentId));
});

app.post("/api/chats", authMiddleware, requireRole("student", "teacher"), async (req, res) => {
  const { programId, studentId } = req.body;
  const text = sanitizeStr(req.body.text || "", 2000);

  if (!programId || !studentId || !text) return appError(res, 400, "programId, studentId and text are required.");
  if (!studentPrograms.includes(programId)) return appError(res, 400, "Invalid program.");

  const users   = await ensureUsersShape();
  const student = users.find((u) => u.id === studentId && u.role === "student");
  if (!student) return appError(res, 404, "Student not found.");

  const assignment = student.programAssignments.find((a) => a.programId === programId);
  if (!assignment || !assignment.teacherId) return appError(res, 404, "Teacher not assigned for this program.");

  const senderAllowed =
    (req.user.role === "student" && req.user.id === studentId) ||
    (req.user.role === "teacher" && req.user.id === assignment.teacherId);

  if (!senderAllowed) return appError(res, 403, "Forbidden");

  const chats = await db.getChats();
  const message = {
    id:         `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    programId,
    studentId,
    teacherId:  assignment.teacherId,
    senderId:   req.user.id,
    senderRole: req.user.role,
    text,
    sentAt: new Date().toISOString()
  };

  chats.push(message);
  await db.saveChats(chats);
  return res.status(201).json(message);
});

// ── Lessons ────────────────────────────────────────────────────────────────────

app.post("/api/lessons", authMiddleware, requireRole("admin"), async (req, res) => {
  const { programId, levelId, questionCount } = req.body;
  const title    = sanitizeStr(req.body.title    || "", 200);
  const videoUrl = sanitizeStr(req.body.videoUrl || "", 500);
  const pdfUrl   = sanitizeStr(req.body.pdfUrl   || "", 500);

  if (!programId || !levelId || !title) return appError(res, 400, "programId, levelId and title are required.");

  const courses = await ensureCoursesShape();
  const level   = findLevel(findProgram(courses, programId), levelId);
  if (!level) return appError(res, 404, "Program or level not found.");

  const lessonId = `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const lesson = {
    id: lessonId,
    title,
    videoUrl,
    pdfUrl,
    learningSlides: defaultLearningSlides(findProgram(courses, programId), level, { id: lessonId, title }),
    topicTest: {
      id:            `topic-test-${Date.now()}`,
      format:        "JSON",
      questionCount: Number(questionCount) || 10
    }
  };

  level.lessons.push(lesson);
  await db.saveCourses(courses);
  return res.status(201).json({ lesson });
});

app.put("/api/lessons/:programId/:levelId/:lessonId", authMiddleware, requireRole("admin", "teacher"), async (req, res) => {
  const { programId, levelId, lessonId } = req.params;

  // Teachers can only edit lessons in programs they have access to
  if (req.user.role === "teacher") {
    const users   = await ensureUsersShape();
    const teacher = users.find((u) => u.id === req.user.id);
    if (!teacher?.programAccess?.includes(programId)) {
      return appError(res, 403, "You do not have access to this program.");
    }
  }

  const courses = await ensureCoursesShape();
  const level   = findLevel(findProgram(courses, programId), levelId);
  const lesson  = level?.lessons.find((l) => l.id === lessonId);
  if (!lesson) return appError(res, 404, "Lesson not found.");

  lesson.title    = sanitizeStr(req.body.title || lesson.title, 200);
  lesson.videoUrl = sanitizeStr(req.body.videoUrl ?? lesson.videoUrl, 500);
  lesson.pdfUrl   = sanitizeStr(req.body.pdfUrl   ?? lesson.pdfUrl,   500);

  if (Array.isArray(req.body.learningSlides) && req.body.learningSlides.length) {
    lesson.learningSlides = req.body.learningSlides.map((slide, i) => ({
      id:      slide.id    || `${lesson.id}-slide-${i + 1}`,
      title:   sanitizeStr(slide.title   || `Learning Step ${i + 1}`, 200),
      content: sanitizeStr(slide.content || "", 5000),
    }));
  }
  lesson.topicTest.questionCount = Number(req.body.questionCount) || lesson.topicTest.questionCount;

  await db.saveCourses(courses);
  return res.json({ lesson });
});

app.delete("/api/lessons/:programId/:levelId/:lessonId", authMiddleware, requireRole("admin"), async (req, res) => {
  const { programId, levelId, lessonId } = req.params;
  const courses = await ensureCoursesShape();
  const level   = findLevel(findProgram(courses, programId), levelId);
  if (!level) return appError(res, 404, "Level not found.");

  const nextLessons = level.lessons.filter((l) => l.id !== lessonId);
  if (nextLessons.length === level.lessons.length) return appError(res, 404, "Lesson not found.");

  level.lessons = nextLessons;
  await db.saveCourses(courses);
  return res.json({ success: true });
});

// ── Progress ───────────────────────────────────────────────────────────────────

app.get("/api/progress/:studentId", authMiddleware, async (req, res) => {
  const { studentId } = req.params;
  const isSelf = req.user.id === studentId;

  if (req.user.role === "student" && !isSelf) return appError(res, 403, "Forbidden");

  // Teachers can only read progress of their own students
  if (req.user.role === "teacher" && !isSelf) {
    const users   = await ensureUsersShape();
    const student = users.find((u) => u.id === studentId && u.role === "student");
    if (!student) return appError(res, 404, "Student not found.");
    const isMyStudent = student.programAssignments?.some((a) => a.teacherId === req.user.id);
    if (!isMyStudent) return appError(res, 403, "This student is not assigned to you.");
  }

  const progress = await ensureProgressShape();
  res.json(progress[studentId] || normalizeProgressRecord());
});

app.post("/api/progress/:studentId/lesson-complete", authMiddleware, requireRole("student"), async (req, res) => {
  if (req.user.id !== req.params.studentId) return appError(res, 403, "Forbidden");

  const { programId, levelId, lessonId } = req.body;
  if (!programId || !levelId || !lessonId) return appError(res, 400, "programId, levelId and lessonId are required.");
  if (!studentPrograms.includes(programId)) return appError(res, 400, "Invalid program.");

  const progress = await ensureProgressShape();
  const current  = progress[req.params.studentId] || normalizeProgressRecord();
  const exists   = current.completedLessons.find(
    (l) => l.programId === programId && l.levelId === levelId && l.lessonId === lessonId
  );

  if (!exists) current.completedLessons.push({ programId, levelId, lessonId, completedAt: new Date().toISOString() });

  const activity = getLessonActivityEntry(current, programId, levelId, lessonId);
  activity.videoCompleted = true;
  activity.updatedAt = new Date().toISOString();

  progress[req.params.studentId] = current;
  await db.saveProgress(progress);
  res.json(current);
});

app.post("/api/progress/:studentId/lesson-activity", authMiddleware, requireRole("student"), async (req, res) => {
  if (req.user.id !== req.params.studentId) return appError(res, 403, "Forbidden");

  const { programId, levelId, lessonId, step, value, taskScore } = req.body;
  if (!programId || !levelId || !lessonId || !step) return appError(res, 400, "programId, levelId, lessonId and step are required.");
  if (!studentPrograms.includes(programId)) return appError(res, 400, "Invalid program.");
  if (!["videoCompleted", "learningCompleted", "taskCompleted"].includes(step)) {
    return appError(res, 400, "Invalid step value.");
  }

  const progress = await ensureProgressShape();
  const current  = progress[req.params.studentId] || normalizeProgressRecord();
  const activity = getLessonActivityEntry(current, programId, levelId, lessonId);

  if (step === "videoCompleted")   activity.videoCompleted   = Boolean(value);
  if (step === "learningCompleted") activity.learningCompleted = Boolean(value);
  if (step === "taskCompleted") {
    activity.taskCompleted = Boolean(value);
    activity.taskScore = Math.min(100, Math.max(0, Number(taskScore) || 0));
  }

  activity.updatedAt = new Date().toISOString();
  progress[req.params.studentId] = current;
  await db.saveProgress(progress);
  res.json(current);
});

app.post("/api/progress/:studentId/topic-score", authMiddleware, requireRole("student"), async (req, res) => {
  if (req.user.id !== req.params.studentId) return appError(res, 403, "Forbidden");

  const { programId, levelId, lessonId, score } = req.body;
  if (!programId || !levelId || !lessonId || typeof score !== "number") {
    return appError(res, 400, "programId, levelId, lessonId and numeric score are required.");
  }
  if (!studentPrograms.includes(programId)) return appError(res, 400, "Invalid program.");
  if (score < 0 || score > 100) return appError(res, 400, "Score must be 0–100.");

  const progress = await ensureProgressShape();
  const current  = progress[req.params.studentId] || normalizeProgressRecord();
  current.topicTestScores.push({ programId, levelId, lessonId, score, submittedAt: new Date().toISOString() });
  const activity = getLessonActivityEntry(current, programId, levelId, lessonId);
  activity.taskCompleted = true;
  activity.taskScore = score;
  activity.updatedAt = new Date().toISOString();
  progress[req.params.studentId] = current;
  await db.saveProgress(progress);
  res.json(current);
});

app.post("/api/progress/:studentId/practice-score", authMiddleware, requireRole("student"), async (req, res) => {
  if (req.user.id !== req.params.studentId) return appError(res, 403, "Forbidden");

  const { programId, testId, score } = req.body;
  if (!programId || !testId || typeof score !== "number") {
    return appError(res, 400, "programId, testId and numeric score are required.");
  }
  if (!studentPrograms.includes(programId)) return appError(res, 400, "Invalid program.");

  const maxScore = programId.includes("ielts") ? 9 : 1600;
  if (score < 0 || score > maxScore) return appError(res, 400, `Score must be 0–${maxScore}.`);

  const progress = await ensureProgressShape();
  const current  = progress[req.params.studentId] || normalizeProgressRecord();
  current.practiceTestScores.push({ programId, testId: sanitizeStr(testId, 100), score, submittedAt: new Date().toISOString() });
  progress[req.params.studentId] = current;
  await db.saveProgress(progress);
  res.json(current);
});

// ── Ranking ────────────────────────────────────────────────────────────────────

app.get("/api/ranking", authMiddleware, async (_req, res) => {
  const users    = await ensureUsersShape();
  const progress = await ensureProgressShape();
  const students = users.filter((u) => u.role === "student");

  const rows = students.map((u) => {
    const rec        = progress[u.id] || normalizeProgressRecord();
    const satScores  = rec.practiceTestScores.filter((s) => s.programId?.includes("sat"));
    const ieltsScores = rec.practiceTestScores.filter((s) => s.programId?.includes("ielts"));
    const satBest    = satScores.length  ? Math.max(...satScores.map((s) => s.score))  : 0;
    const ieltsBest  = ieltsScores.length ? Math.max(...ieltsScores.map((s) => s.score)) : 0;
    const ts = u.targetScores || {};
    return {
      id:     u.id,
      name:   u.name || [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(" ") || u.email,
      region: u.profile?.region || "",
      grade:  u.profile?.grade  || "",
      goal:   u.profile?.goal   || "Ikkalasi",
      sat:    satBest   || Number(ts["sat-math"]?.current) || 0,
      ielts:  ieltsBest || Number(ts["ielts"]?.current)    || 0,
    };
  });

  const scored = rows
    .sort((a, b) => (b.sat + b.ielts * 100) - (a.sat + a.ielts * 100))
    .map((r, i) => ({ ...r, rank: i + 1 }));

  res.json(scored);
});

// ── 404 catch-all ──────────────────────────────────────────────────────────────

app.use((_req, res) => res.status(404).json({ message: "Not found" }));

// ── Start (local dev only) ──────────────────────────────────────────────────────

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Lumea server running on http://localhost:${PORT}`));
}

export default app;
