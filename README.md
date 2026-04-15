# Learnova — Ishga tushirish qo'llanmasi

## Talab
- **Node.js 18+** → https://nodejs.org

---

## Ishga tushirish (2 ta terminal kerak)

### Terminal 1 — Backend server
```bash
cd server
npm install
npm run dev
```
✅ `Server running on port 4000` ko'rinsa tayyor.

### Terminal 2 — Frontend
```bash
cd client
npm install
npm run dev
```
✅ Brauzerda `http://localhost:5173` oching.

---

## "Failed to fetch" xatosi

**Sabab:** Server ishlamayapti.

**Hal qilish:**
1. Terminal 1 da server ishlayaptimi? (`npm run dev`)
2. `http://localhost:4000/api/health` sahifasini oching — `{"ok":true}` ko'rinishi kerak
3. Aks holda `cd server && npm install` qayta bajaring

---

## Tayyor test akkauntlar

| Role | Email | Parol |
|------|-------|-------|
| **Student** | `student@student.com` | `student123` |
| **Teacher** | `teacher@teacher.com` | `teacher123` |
| **Admin** | `admin@learnova.com` | `Admin123!` |
| **Admin 2** | `ops@learnova.com` | `OpsAdmin123!` |

---

## Loyiha tuzilmasi

```
learnova/
├── server/          ← Backend (Express + Node.js, port 4000)
│   ├── src/
│   │   ├── index.js      ← API routes
│   │   ├── auth.js       ← JWT auth
│   │   └── dataStore.js  ← JSON fayl boshqaruvi
│   └── data/
│       ├── users.json
│       ├── courses.json
│       └── ...
│
└── client/          ← Frontend (React + Vite, port 5173)
    └── src/
        ├── App.jsx            ← Asosiy routing
        ├── api.js             ← Backend bilan ulanish
        ├── components/        ← Landing + Auth sahifalar
        └── dashboard/         ← Student dashboard (dark UI)
```

## Qanday ishlaydi

```
Brauzer ochiladi
  → Landing page ko'rinadi (LandingPage)
  → "Log in" bosilsa → AuthPanel (login/register)
  → Login muvaffaqiyatli bo'lsa:
      student → Dark dashboard (Sidebar + Topbar + Pages)
      admin/teacher → Admin panel
  → "Chiqish" bosilsa → Landing page ga qaytadi
```
