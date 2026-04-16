const BASE_URL = import.meta.env.PROD ? "/api" : "http://localhost:4000/api";

const withAuth = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
});

const parse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, options);
  return parse(response);
};

export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),

  getMyProfile: (token) =>
    request("/profile/me", {
      headers: withAuth(token)
    }),

  updateMyProfile: (token, payload) =>
    request("/profile/me", {
      method: "PUT",
      headers: withAuth(token),
      body: JSON.stringify(payload)
    }),

  getCourses: (token) =>
    request("/courses", {
      headers: withAuth(token)
    }),

  getPracticeTests: (token, programId) =>
    request(`/practice-tests/${programId}`, {
      headers: withAuth(token)
    }),

  getProgress: (token, studentId) =>
    request(`/progress/${studentId}`, {
      headers: withAuth(token)
    }),

  completeLesson: (token, studentId, payload) =>
    request(`/progress/${studentId}/lesson-complete`, {
      method: "POST",
      headers: withAuth(token),
      body: JSON.stringify(payload)
    }),

  saveLessonActivity: (token, studentId, payload) =>
    request(`/progress/${studentId}/lesson-activity`, {
      method: "POST",
      headers: withAuth(token),
      body: JSON.stringify(payload)
    }),

  submitTopicScore: (token, studentId, payload) =>
    request(`/progress/${studentId}/topic-score`, {
      method: "POST",
      headers: withAuth(token),
      body: JSON.stringify(payload)
    }),

  submitPracticeScore: (token, studentId, payload) =>
    request(`/progress/${studentId}/practice-score`, {
      method: "POST",
      headers: withAuth(token),
      body: JSON.stringify(payload)
    }),

  listUsers: (token, role) =>
    request(`/users?role=${role}`, {
      headers: withAuth(token)
    }),

  addStudent: (token, payload) =>
    request("/users/students", {
      method: "POST",
      headers: withAuth(token),
      body: JSON.stringify(payload)
    }),

  addTeacher: (token, payload) =>
    request("/users/teachers", {
      method: "POST",
      headers: withAuth(token),
      body: JSON.stringify(payload)
    }),

  updateUser: (token, userId, payload) =>
    request(`/users/${userId}`, {
      method: "PUT",
      headers: withAuth(token),
      body: JSON.stringify(payload)
    }),

  deleteUser: (token, userId) =>
    request(`/users/${userId}`, {
      method: "DELETE",
      headers: withAuth(token)
    }),

  getMyTeachers: (token) =>
    request("/teachers/mine", {
      headers: withAuth(token)
    }),

  getChats: (token, programId, studentId) =>
    request(`/chats?programId=${programId}&studentId=${studentId}`, {
      headers: withAuth(token)
    }),

  sendChatMessage: (token, payload) =>
    request("/chats", {
      method: "POST",
      headers: withAuth(token),
      body: JSON.stringify(payload)
    }),

  addLesson: (token, payload) =>
    request("/lessons", {
      method: "POST",
      headers: withAuth(token),
      body: JSON.stringify(payload)
    }),

  updateLesson: (token, programId, levelId, lessonId, payload) =>
    request(`/lessons/${programId}/${levelId}/${lessonId}`, {
      method: "PUT",
      headers: withAuth(token),
      body: JSON.stringify(payload)
    }),

  deleteLesson: (token, programId, levelId, lessonId) =>
    request(`/lessons/${programId}/${levelId}/${lessonId}`, {
      method: "DELETE",
      headers: withAuth(token)
    })
};
