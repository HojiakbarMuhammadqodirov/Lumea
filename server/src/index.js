import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { db } from "./dataStore.js";
import { authMiddleware, requireRole, signToken } from "./auth.js";

const app = express();
const PORT = 4000;

const studentPrograms = ["sat-math", "sat-english", "ielts"];
const teacherPrograms = ["sat-math", "sat-english", "ielts-listening", "ielts-reading", "ielts-speaking", "ielts-writing"];
const levels = ["beginner", "intermediate", "advanced"];

const appError = (res, status, message) => res.status(status).json({ message });

const buildProfile = (user = {}) => {
  const existing = user.profile || {};
  const fallbackName = user.name || "";
  const [firstName = "", ...rest] = fallbackName.split(" ");
  return {
    firstName: existing.firstName ?? firstName,
    lastName: existing.lastName ?? rest.join(" "),
    gender: existing.gender ?? "",
    englishLevel: existing.englishLevel ?? "",
    phoneNumber: existing.phoneNumber ?? "",
    dateOfBirth: existing.dateOfBirth ?? "",
    addressLine1: existing.addressLine1 ?? "",
    addressLine2: existing.addressLine2 ?? "",
    city: existing.city ?? "",
    country: existing.country ?? "",
    postalCode: existing.postalCode ?? "",
    profilePicture: existing.profilePicture ?? ""
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
  {
    id: `${lesson.id}-slide-1`,
    title: "What we learn first",
    content: `${program.title} ${level.title}: ${lesson.title} starts with the key idea and the main rule students should remember.`
  },
  {
    id: `${lesson.id}-slide-2`,
    title: "How to use it",
    content: `This part explains how the concept is used in real exam questions and what steps the student should follow.`
  },
  {
    id: `${lesson.id}-slide-3`,
    title: "Common mistakes",
    content: `Students review the usual mistakes, quick checks, and a short reminder before moving to the task.`
  }
];

const normalizeLesson = (program, level, lesson) => ({
  ...lesson,
  videoUrl: lesson.videoUrl ?? "",
  pdfUrl: lesson.pdfUrl ?? "",
  learningSlides:
    Array.isArray(lesson.learningSlides) && lesson.learningSlides.length
      ? lesson.learningSlides.map((slide, index) => ({
          id: slide.id || `${lesson.id}-slide-${index + 1}`,
          title: slide.title || `Learning Step ${index + 1}`,
          content: slide.content || ""
        }))
      : defaultLearningSlides(program, level, lesson),
  topicTest: {
    id: lesson.topicTest?.id || `topic-test-${lesson.id}`,
    format: lesson.topicTest?.format || "JSON",
    questionCount: Number(lesson.topicTest?.questionCount) || 10
  }
});

const normalizeProgressRecord = (record = {}) => ({
  completedLessons: Array.isArray(record.completedLessons) ? record.completedLessons : [],
  topicTestScores: Array.isArray(record.topicTestScores) ? record.topicTestScores : [],
  practiceTestScores: Array.isArray(record.practiceTestScores) ? record.practiceTestScores : [],
  lessonActivity: Array.isArray(record.lessonActivity) ? record.lessonActivity : []
});

const getLessonActivityEntry = (record, programId, levelId, lessonId) => {
  let entry = record.lessonActivity.find(
    (item) => item.programId === programId && item.levelId === levelId && item.lessonId === lessonId
  );

  if (!entry) {
    entry = {
      programId,
      levelId,
      lessonId,
      videoCompleted: false,
      learningCompleted: false,
      taskCompleted: false,
      taskScore: 0,
      updatedAt: new Date().toISOString()
    };
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
  const changed = JSON.stringify(users) !== JSON.stringify(normalized);
  if (changed) {
    await db.saveUsers(normalized);
  }
  return normalized;
};

const ensureCoursesShape = async () => {
  const courses = await db.getCourses();
  let changed = false;

  if (Array.isArray(courses.lessonTemplates) && Array.isArray(courses.programs)) {
    const normalizedPrograms = courses.programs.map((program) => ({
      ...program,
      levels: program.levels.map((level) => {
        if (Array.isArray(level.lessons)) {
          return level;
        }

        changed = true;
        return {
          ...level,
          lessons: courses.lessonTemplates.map((tpl) =>
            normalizeLesson(program, level, {
              id: `${level.id}-lesson-${tpl.index}`,
              title: `${program.title} ${level.title} Lesson ${tpl.index}: ${tpl.topic}`,
              videoUrl: `https://example.com/videos/${program.id}/${level.id}/lesson-${tpl.index}`,
              pdfUrl: `https://example.com/docs/${program.id}/${level.id}/lesson-${tpl.index}.pdf`,
              topicTest: {
                id: `topic-test-${level.id}-${tpl.index}`,
                format: "JSON",
                questionCount: 10
              }
            })
          )
        };
      })
    }));

    const normalized = { programs: normalizedPrograms };
    if (changed) {
      await db.saveCourses(normalized);
    }
    return normalized;
  }

  const normalizedPrograms = courses.programs.map((program) => ({
    ...program,
    levels: program.levels.map((level) => ({
      ...level,
      lessons: (level.lessons || []).map((lesson) => {
        const normalizedLesson = normalizeLesson(program, level, lesson);
        if (JSON.stringify(normalizedLesson) !== JSON.stringify(lesson)) {
          changed = true;
        }
        return normalizedLesson;
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
    Object.entries(progress).map(([studentId, record]) => [studentId, normalizeProgressRecord(record)])
  );
  const changed = JSON.stringify(progress) !== JSON.stringify(normalized);
  if (changed) {
    await db.saveProgress(normalized);
  }
  return normalized;
};

const publicUser = (user) => {
  const normalized = normalizeUser(user);
  return {
    id: normalized.id,
    name: normalized.name,
    email: normalized.email,
    role: normalized.role,
    profile: normalized.profile,
    phoneNumber: normalized.phoneNumber,
    dateOfBirth: normalized.dateOfBirth,
    programAssignments: normalized.programAssignments || [],
    targetScores: normalized.targetScores || {},
    programAccess: normalized.programAccess || [],
    programScores: normalized.programScores || {}
  };
};

const sanitizeUpdatePayload = async (target, payload, actorRole, isSelf = false) => {
  const next = { ...target };

  if (payload.email) {
    next.email = payload.email;
  }

  if (payload.password) {
    next.passwordHash = await bcrypt.hash(payload.password, 10);
    delete next.password;
  }

  const incomingProfile = payload.profile || {};
  const mergedProfile = {
    ...buildProfile(target),
    ...incomingProfile
  };
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
        {
          ...normalizeStudentTargets(target.targetScores, target.programAssignments || []),
          ...payload.targetScores
        },
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

const findProgram = (courses, programId) => courses.programs.find((program) => program.id === programId);
const findLevel = (program, levelId) => program?.levels.find((level) => level.id === levelId);

const teacherVisibleScores = (teacher, studentProgramId) => {
  if (studentProgramId === "sat-math") {
    return { "sat-math": teacher.programScores["sat-math"] };
  }

  if (studentProgramId === "sat-english") {
    return { "sat-english": teacher.programScores["sat-english"] };
  }

  return {
    "ielts-listening": teacher.programScores["ielts-listening"],
    "ielts-reading": teacher.programScores["ielts-reading"],
    "ielts-speaking": teacher.programScores["ielts-speaking"],
    "ielts-writing": teacher.programScores["ielts-writing"]
  };
};

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, profile } = req.body;
  const incomingProfile = buildProfile({ name, profile });
  const resolvedName = fullNameFromProfile(incomingProfile) || name;

  if (!resolvedName || !email || !password) {
    return appError(res, 400, "Name, email and password are required.");
  }

  const users = await ensureUsersShape();
  if (users.find((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return appError(res, 409, "Email already exists.");
  }

  const user = normalizeUser({
    id: `u_${Date.now()}`,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: "student",
    profile: incomingProfile
  });

  users.push(user);
  await db.saveUsers(users);

  const token = signToken(user);
  return res.status(201).json({ token, user: publicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return appError(res, 400, "Email and password are required.");
  }

  const users = await ensureUsersShape();
  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return appError(res, 401, "Invalid credentials.");
  }

  const valid = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : user.password === password;
  if (!valid) {
    return appError(res, 401, "Invalid credentials.");
  }

  const token = signToken(user);
  return res.json({ token, user: publicUser(user) });
});

app.get("/api/profile/me", authMiddleware, async (req, res) => {
  const users = await ensureUsersShape();
  const user = users.find((item) => item.id === req.user.id);
  return res.json(publicUser(user));
});

app.put("/api/profile/me", authMiddleware, async (req, res) => {
  const users = await ensureUsersShape();
  const index = users.findIndex((item) => item.id === req.user.id);
  if (index === -1) {
    return appError(res, 404, "User not found.");
  }

  users[index] = await sanitizeUpdatePayload(users[index], req.body, users[index].role, true);
  await db.saveUsers(users);
  return res.json({ user: publicUser(users[index]) });
});

app.get("/api/courses", authMiddleware, async (_req, res) => {
  const courses = await ensureCoursesShape();
  res.json(courses.programs);
});

app.get("/api/practice-tests/:programId", authMiddleware, async (req, res) => {
  const tests = await db.getPracticeTests();
  const row = tests[req.params.programId];
  if (!row) {
    return appError(res, 404, "Practice tests not found.");
  }
  return res.json(row);
});

app.get("/api/users", authMiddleware, requireRole("admin", "teacher"), async (req, res) => {
  const users = await ensureUsersShape();
  const role = req.query.role;
  const filtered = role ? users.filter((item) => item.role === role) : users;
  res.json(filtered.map(publicUser));
});

app.post("/api/users/students", authMiddleware, requireRole("admin"), async (req, res) => {
  const { email, password, profile } = req.body;
  if (!email || !password) {
    return appError(res, 400, "Email and password are required.");
  }

  const users = await ensureUsersShape();
  if (users.find((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return appError(res, 409, "Email already exists.");
  }

  const user = normalizeUser({
    id: `u_${Date.now()}`,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: "student",
    profile: buildProfile({ profile })
  });

  users.push(user);
  await db.saveUsers(users);
  return res.status(201).json({ user: publicUser(user) });
});

app.post("/api/users/teachers", authMiddleware, requireRole("admin"), async (req, res) => {
  const { email, password, profile, programAccess, programScores } = req.body;
  if (!email || !password) {
    return appError(res, 400, "Email and password are required.");
  }

  const users = await ensureUsersShape();
  if (users.find((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return appError(res, 409, "Email already exists.");
  }

  const user = normalizeUser({
    id: `t_${Date.now()}`,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: "teacher",
    profile: buildProfile({ profile }),
    programAccess,
    programScores
  });

  users.push(user);
  await db.saveUsers(users);
  return res.status(201).json({ user: publicUser(user) });
});

app.put("/api/users/:userId", authMiddleware, requireRole("admin", "teacher"), async (req, res) => {
  const users = await ensureUsersShape();
  const index = users.findIndex((user) => user.id === req.params.userId);
  if (index === -1) {
    return appError(res, 404, "User not found.");
  }

  const target = users[index];
  if (req.user.role === "teacher" && target.role !== "student") {
    return appError(res, 403, "Teachers can only change students.");
  }

  if (req.body.email && users.some((user) => user.id !== target.id && user.email.toLowerCase() === req.body.email.toLowerCase())) {
    return appError(res, 409, "Email already exists.");
  }

  users[index] = await sanitizeUpdatePayload(target, req.body, req.user.role, false);
  await db.saveUsers(users);
  return res.json({ user: publicUser(users[index]) });
});

app.delete("/api/users/:userId", authMiddleware, requireRole("admin"), async (req, res) => {
  const users = await ensureUsersShape();
  const target = users.find((user) => user.id === req.params.userId);
  if (!target) {
    return appError(res, 404, "User not found.");
  }
  if (target.role === "admin") {
    return appError(res, 400, "Admin accounts cannot be deleted here.");
  }

  await db.saveUsers(users.filter((user) => user.id !== target.id));

  const progress = await db.getProgress();
  if (progress[target.id]) {
    delete progress[target.id];
    await db.saveProgress(progress);
  }

  const chats = await db.getChats();
  await db.saveChats(chats.filter((chat) => chat.studentId !== target.id && chat.teacherId !== target.id));

  return res.json({ success: true });
});

app.get("/api/teachers/mine", authMiddleware, requireRole("student"), async (req, res) => {
  const users = await ensureUsersShape();
  const student = users.find((user) => user.id === req.user.id);
  const teachers = student.programAssignments
    .map((assignment) => {
      const teacher = users.find((user) => user.id === assignment.teacherId && user.role === "teacher");
      if (!teacher) return null;
      return {
        id: teacher.id,
        name: teacher.name,
        profilePicture: teacher.profile.profilePicture,
        programId: assignment.programId,
        scores: teacherVisibleScores(teacher, assignment.programId)
      };
    })
    .filter(Boolean);

  res.json(teachers);
});

app.get("/api/chats", authMiddleware, async (req, res) => {
  const { programId, studentId } = req.query;
  if (!programId || !studentId) {
    return appError(res, 400, "programId and studentId are required.");
  }

  const users = await ensureUsersShape();
  const student = users.find((user) => user.id === studentId && user.role === "student");
  if (!student) {
    return appError(res, 404, "Student not found.");
  }

  const assignment = student.programAssignments.find((item) => item.programId === programId);
  if (!assignment || !assignment.teacherId) {
    return appError(res, 404, "Teacher not assigned for this program.");
  }

  const allowed =
    req.user.role === "admin" ||
    req.user.id === studentId ||
    req.user.id === assignment.teacherId;

  if (!allowed) {
    return appError(res, 403, "Forbidden");
  }

  const chats = await db.getChats();
  const messages = chats.filter((chat) => chat.programId === programId && chat.studentId === studentId);
  return res.json(messages);
});

app.post("/api/chats", authMiddleware, requireRole("student", "teacher"), async (req, res) => {
  const { programId, studentId, text } = req.body;
  if (!programId || !studentId || !text) {
    return appError(res, 400, "programId, studentId and text are required.");
  }

  const users = await ensureUsersShape();
  const student = users.find((user) => user.id === studentId && user.role === "student");
  if (!student) {
    return appError(res, 404, "Student not found.");
  }

  const assignment = student.programAssignments.find((item) => item.programId === programId);
  if (!assignment || !assignment.teacherId) {
    return appError(res, 404, "Teacher not assigned for this program.");
  }

  const senderAllowed =
    (req.user.role === "student" && req.user.id === studentId) ||
    (req.user.role === "teacher" && req.user.id === assignment.teacherId);

  if (!senderAllowed) {
    return appError(res, 403, "Forbidden");
  }

  const chats = await db.getChats();
  const message = {
    id: `m_${Date.now()}`,
    programId,
    studentId,
    teacherId: assignment.teacherId,
    senderId: req.user.id,
    senderRole: req.user.role,
    text,
    sentAt: new Date().toISOString()
  };

  chats.push(message);
  await db.saveChats(chats);
  return res.status(201).json(message);
});

app.post("/api/lessons", authMiddleware, requireRole("admin"), async (req, res) => {
  const { programId, levelId, title, videoUrl, pdfUrl, questionCount } = req.body;
  if (!programId || !levelId || !title) {
    return appError(res, 400, "programId, levelId and title are required.");
  }

  const courses = await ensureCoursesShape();
  const level = findLevel(findProgram(courses, programId), levelId);
  if (!level) {
    return appError(res, 404, "Program or level not found.");
  }

  const lessonId = `lesson_${Date.now()}`;
  const lesson = {
    id: lessonId,
    title,
    videoUrl: videoUrl || "",
    pdfUrl: pdfUrl || "",
    learningSlides: defaultLearningSlides(
      findProgram(courses, programId),
      level,
      { id: lessonId, title }
    ),
    topicTest: {
      id: `topic-test-${Date.now()}`,
      format: "JSON",
      questionCount: Number(questionCount) || 10
    }
  };

  level.lessons.push(lesson);
  await db.saveCourses(courses);
  return res.status(201).json({ lesson });
});

app.put("/api/lessons/:programId/:levelId/:lessonId", authMiddleware, requireRole("admin", "teacher"), async (req, res) => {
  const { programId, levelId, lessonId } = req.params;
  const courses = await ensureCoursesShape();
  const level = findLevel(findProgram(courses, programId), levelId);
  const lesson = level?.lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    return appError(res, 404, "Lesson not found.");
  }

  lesson.title = req.body.title || lesson.title;
  lesson.videoUrl = req.body.videoUrl ?? lesson.videoUrl;
  lesson.pdfUrl = req.body.pdfUrl ?? lesson.pdfUrl;
  if (Array.isArray(req.body.learningSlides) && req.body.learningSlides.length) {
    lesson.learningSlides = req.body.learningSlides.map((slide, index) => ({
      id: slide.id || `${lesson.id}-slide-${index + 1}`,
      title: slide.title || `Learning Step ${index + 1}`,
      content: slide.content || ""
    }));
  }
  lesson.topicTest.questionCount = Number(req.body.questionCount) || lesson.topicTest.questionCount;

  await db.saveCourses(courses);
  return res.json({ lesson });
});

app.delete("/api/lessons/:programId/:levelId/:lessonId", authMiddleware, requireRole("admin"), async (req, res) => {
  const { programId, levelId, lessonId } = req.params;
  const courses = await ensureCoursesShape();
  const level = findLevel(findProgram(courses, programId), levelId);
  if (!level) {
    return appError(res, 404, "Level not found.");
  }

  const nextLessons = level.lessons.filter((item) => item.id !== lessonId);
  if (nextLessons.length === level.lessons.length) {
    return appError(res, 404, "Lesson not found.");
  }

  level.lessons = nextLessons;
  await db.saveCourses(courses);
  return res.json({ success: true });
});

app.get("/api/progress/:studentId", authMiddleware, async (req, res) => {
  const isSelf = req.user.id === req.params.studentId;
  const allowed = isSelf || req.user.role === "teacher" || req.user.role === "admin";
  if (!allowed) {
    return appError(res, 403, "Forbidden");
  }

  const progress = await ensureProgressShape();
  res.json(progress[req.params.studentId] || normalizeProgressRecord());
});

app.post("/api/progress/:studentId/lesson-complete", authMiddleware, requireRole("student"), async (req, res) => {
  if (req.user.id !== req.params.studentId) {
    return appError(res, 403, "Forbidden");
  }

  const { programId, levelId, lessonId } = req.body;
  if (!programId || !levelId || !lessonId) {
    return appError(res, 400, "programId, levelId and lessonId are required.");
  }

  const progress = await ensureProgressShape();
  const current = progress[req.params.studentId] || normalizeProgressRecord();
  const exists = current.completedLessons.find(
    (item) => item.programId === programId && item.levelId === levelId && item.lessonId === lessonId
  );

  if (!exists) {
    current.completedLessons.push({ programId, levelId, lessonId, completedAt: new Date().toISOString() });
  }

  const activity = getLessonActivityEntry(current, programId, levelId, lessonId);
  activity.videoCompleted = true;
  activity.updatedAt = new Date().toISOString();

  progress[req.params.studentId] = current;
  await db.saveProgress(progress);
  res.json(current);
});

app.post("/api/progress/:studentId/lesson-activity", authMiddleware, requireRole("student"), async (req, res) => {
  if (req.user.id !== req.params.studentId) {
    return appError(res, 403, "Forbidden");
  }

  const { programId, levelId, lessonId, step, value, taskScore } = req.body;
  if (!programId || !levelId || !lessonId || !step) {
    return appError(res, 400, "programId, levelId, lessonId and step are required.");
  }

  const progress = await ensureProgressShape();
  const current = progress[req.params.studentId] || normalizeProgressRecord();
  const activity = getLessonActivityEntry(current, programId, levelId, lessonId);

  if (step === "videoCompleted") {
    activity.videoCompleted = Boolean(value);
  }

  if (step === "learningCompleted") {
    activity.learningCompleted = Boolean(value);
  }

  if (step === "taskCompleted") {
    activity.taskCompleted = Boolean(value);
    activity.taskScore = Number(taskScore) || 0;
  }

  activity.updatedAt = new Date().toISOString();
  progress[req.params.studentId] = current;
  await db.saveProgress(progress);
  res.json(current);
});

app.post("/api/progress/:studentId/topic-score", authMiddleware, requireRole("student"), async (req, res) => {
  if (req.user.id !== req.params.studentId) {
    return appError(res, 403, "Forbidden");
  }

  const { programId, levelId, lessonId, score } = req.body;
  if (!programId || !levelId || !lessonId || typeof score !== "number") {
    return appError(res, 400, "programId, levelId, lessonId and numeric score are required.");
  }

  const progress = await ensureProgressShape();
  const current = progress[req.params.studentId] || normalizeProgressRecord();
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
  if (req.user.id !== req.params.studentId) {
    return appError(res, 403, "Forbidden");
  }

  const { programId, testId, score } = req.body;
  if (!programId || !testId || typeof score !== "number") {
    return appError(res, 400, "programId, testId and numeric score are required.");
  }

  const progress = await ensureProgressShape();
  const current = progress[req.params.studentId] || normalizeProgressRecord();
  current.practiceTestScores.push({ programId, testId, score, submittedAt: new Date().toISOString() });
  progress[req.params.studentId] = current;
  await db.saveProgress(progress);
  res.json(current);
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Learnova server running on http://localhost:${PORT}`);
  });
}

export default app;
