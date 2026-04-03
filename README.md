# Learnova Platform

Full-stack learning platform for Learnova (SAT/IELTS):
- Programs: SAT Math, SAT English, IELTS
- Levels per program: Beginner, Intermediate, Advanced
- Practice tests with previous-exam style questions
- Roles: Student, Teacher, Admin
- Student registration, admin-managed teacher creation
- Progress tracking (completed lessons + test scores)

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Data Storage: JSON files

## Run Locally

### 1) Install dependencies
```bash
cd server
npm install
cd ../client
npm install
```

### 2) Start backend
```bash
cd server
npm run dev
```
Backend runs on `http://localhost:4000`.

### 3) Start frontend
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Demo Users
- Admin:
  - Email: `admin@learnova.com`
  - Password: `Admin123!`
- Student:
  - Create from registration form

