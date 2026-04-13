# 🔧 Backend — EduAI REST API Server

> **Technology:** Node.js + Express.js  
> **Entry Point:** `Index.js`  
> **Default Port:** `5000`

---

## 📁 Folder Contents

```
Backend/
├── Index.js              # 🚀 Main server entry point
├── .env                  # Environment variables (secrets, DB URL, API keys)
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies and npm scripts
│
├── Config/               # JWT & auth configuration
├── Connection/           # MongoDB database connection
├── Middleware/           # Business logic handlers for all routes
├── Models/               # Mongoose database schemas
├── Routes/               # Express API route declarations
├── agents/               # AI multi-agent feedback pipeline
└── uploads/              # Uploaded assignment and submission files
```

---

## 🚀 Entry Point — `Index.js`

The main server file bootstraps and wires everything together:

| Step | What happens |
|------|-------------|
| 1 | `dotenv.config()` loads environment variables from `.env` |
| 2 | MongoDB connection is established (`Connection/Conn.js`) |
| 3 | CORS, body parsers, cookie parser, and static file middleware are registered |
| 4 | Lightweight security headers are set (`X-Content-Type-Options`, `X-Frame-Options`, etc.) |
| 5 | All route modules are mounted at their URL prefixes |
| 6 | 404 and global error handlers are registered |
| 7 | Server starts listening on the configured port |

---

## 🌐 API Route Map

| Prefix | Router File | Description |
|--------|------------|-------------|
| `GET /` | inline | Health check — returns `{ status: "OK" }` |
| `/user` | `Routes/UserRoutes.js` | Auth: signup, login, logout, token refresh, profile |
| `/teacher` | `Routes/TeacherRoutes.js` | Teacher-specific data endpoints |
| `/admin` | `Routes/AdminRoutes.js` | Admin dashboard stats and user management |
| `/assignment` | `Routes/AssignmentRoutes.js` | Create and list assignments with file upload |
| `/submitted` | `Routes/SubmittedRoutes.js` | Student submission upload and retrieval |
| `/feedback` | `Routes/FeedbackRoutes.js` | AI feedback storage and retrieval |
| `/uploads/*` | static | Serve uploaded files publicly |

---

## ⚙ Required Environment Variables (`.env`)

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/myDatabase

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
COOKIE_SECRET=your_cookie_secret_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Pinecone Vector DB (for RAG)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
```

---

## 🔄 Request Lifecycle

```
Incoming HTTP Request
        │
        ▼
  CORS middleware  (validates origin)
        │
        ▼
  Body parser  (JSON / URL-encoded)
        │
        ▼
  Cookie parser  (reads signed cookies)
        │
        ▼
  Security headers  (X-Frame-Options, etc.)
        │
        ▼
  Route matching  (UserRoutes, AssignmentRoutes, etc.)
        │
        ▼
  Auth middleware  (verifyAccessToken, requireRole)
        │
        ▼
  Handler function  (in Middleware/*.js)
        │
        ├──▶ MongoDB query  (via Mongoose Models)
        └──▶ AI Pipeline    (via agents/)
        │
        ▼
  JSON Response  →  Client
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT signing/verification |
| `bcryptjs` | Password hashing |
| `multer` | File upload handling |
| `cors` | Cross-Origin Resource Sharing |
| `cookie-parser` | Cookie reading/writing |
| `dotenv` | Environment variable loading |

---

## 📂 Sub-folder Documentation

- [`Config/README.md`](./Config/README.md) — JWT configuration
- [`Connection/README.md`](./Connection/README.md) — Database connection
- [`Middleware/README.md`](./Middleware/README.md) — Business logic handlers
- [`Models/README.md`](./Models/README.md) — MongoDB schemas
- [`Routes/README.md`](./Routes/README.md) — API route declarations
- [`agents/README.md`](./agents/README.md) — AI multi-agent pipeline
- [`uploads/README.md`](./uploads/README.md) — File storage