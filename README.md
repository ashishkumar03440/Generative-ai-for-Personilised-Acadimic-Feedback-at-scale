# 📚 EduAI — Generative AI for Personalised Academic Feedback at Scale

> **Semester 6 Project** — Full-stack AI-powered education platform that automatically generates personalised feedback for student assignments using a multi-agent LLM pipeline.

---

## 🏗 Project Structure

```
Sem6proj/
├── Backend/          # Node.js + Express REST API + AI multi-agent pipeline
├── FrontEnd/         # React + Vite + TypeScript web application
├── project statement.docx
├── Synopsis Template.docx
├── Evaluation Format 3rd year.xlsx
├── Final Project & Mentor Details.xlsx
└── Project Development Flow.docx
```

---

## 🧠 What This Project Does

EduAI is an end-to-end academic feedback platform that:

1. **Students** upload assignment submissions (PDF)
2. A **5-stage AI pipeline** processes the submission:
   - Cleans and translates the text (Preprocessor)
   - Retrieves relevant curriculum content from a vector database (Analyzer + RAG)
   - Writes warm, teacher-like feedback (Feedback Agent)
   - Validates the feedback for safety and quality (Validator)
   - Maps weaknesses to learning paths (Curriculum Agent)
3. **Teachers** review and approve AI-generated feedback before publishing
4. **Students** see their personalised feedback, scores, and study path
5. **Admins** monitor system health, users, and AI pipeline performance

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| AI / LLM | Google Gemini API via LangChain.js |
| Vector DB | Pinecone (for RAG — Retrieval-Augmented Generation) |
| Auth | JWT (access + refresh tokens) + HttpOnly cookies |
| File Uploads | Multer |

---

## 🚀 Getting Started

### Backend
```bash
cd Backend
npm install
# Create a .env file with required secrets (see Backend/.env example)
node Index.js
# Server runs on http://localhost:5000
```

### Frontend
```bash
cd FrontEnd
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 👥 User Roles

| Role | Access |
|------|--------|
| `student` | Submit assignments, view feedback, track progress |
| `teacher` | Create assignments, review AI feedback, publish to students |
| `admin` | Manage users, monitor AI pipeline, view audit logs |

---

## 🔐 Authentication Flow

1. Login → receives short-lived **access token** (15 min) + **refresh token** (7 days, HttpOnly cookie)
2. All protected API calls use `Authorization: Bearer <accessToken>`
3. When access token expires → auto-refresh via `/user/refresh-token`
4. Logout → cookie cleared + refresh token invalidated in DB

---

## 📂 Folder Documentation

Each sub-folder contains its own `README.md` with detailed documentation:

- [`Backend/README.md`](./Backend/README.md) — API server overview
- [`FrontEnd/README.md`](./FrontEnd/README.md) — React app overview
