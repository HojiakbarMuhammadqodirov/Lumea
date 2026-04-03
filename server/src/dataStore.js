import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");

const readJson = async (name) => {
  const file = path.join(dataDir, name);
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw);
};

const writeJson = async (name, data) => {
  const file = path.join(dataDir, name);
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
};

export const db = {
  getUsers: () => readJson("users.json"),
  saveUsers: (users) => writeJson("users.json", users),
  getCourses: () => readJson("courses.json"),
  saveCourses: (courses) => writeJson("courses.json", courses),
  getPracticeTests: () => readJson("practiceTests.json"),
  getChats: () => readJson("chats.json"),
  saveChats: (chats) => writeJson("chats.json", chats),
  getProgress: () => readJson("progress.json"),
  saveProgress: (progress) => writeJson("progress.json", progress)
};
