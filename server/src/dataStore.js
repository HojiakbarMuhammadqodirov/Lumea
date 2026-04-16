import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultDataDir = path.join(__dirname, "..", "data");

const isVercel = process.env.VERCEL || process.env.NODE_ENV === "production";
const dataDir = isVercel ? os.tmpdir() : defaultDataDir;

const ensureFile = async (name) => {
  if (!isVercel) return;
  const targetPath = path.join(dataDir, name);
  const sourcePath = path.join(defaultDataDir, name);
  try {
    await fs.access(targetPath);
  } catch (err) {
    try {
      const content = await fs.readFile(sourcePath, "utf-8");
      await fs.writeFile(targetPath, content, "utf-8");
    } catch (readErr) {
      const isArray = name === "users.json" || name === "chats.json";
      await fs.writeFile(targetPath, isArray ? "[]" : "{}", "utf-8");
    }
  }
};

const readJson = async (name) => {
  await ensureFile(name);
  const file = path.join(dataDir, name);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    const isArray = name === "users.json" || name === "chats.json";
    return isArray ? [] : {};
  }
};

const writeJson = async (name, data) => {
  await ensureFile(name);
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
