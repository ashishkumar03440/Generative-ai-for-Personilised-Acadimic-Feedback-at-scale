# 🌐 Routes — API Route Declarations

> **Location:** `Backend/Routes/`  
> **Purpose:** Thin Express Router files that map HTTP verbs + URL paths to handler functions in `Middleware/`. Routes contain no business logic.

---

## 📁 Folder Contents

```
Routes/
├── UserRoutes.js        # Auth: signup, login, logout, token refresh, profile
├── TeacherRoutes.js     # Teacher-specific API endpoints
├── AdminRoutes.js       # Admin dashboard and user management endpoints
├── AssignmentRoutes.js  # Assignment creation, listing, and download
├── SubmittedRoutes.js   # Student submission upload and retrieval
└── FeedbackRoutes.js    # AI feedback save and retrieval
```

---

## 🗺 Complete API Route Map

### `/user` — User Authentication (`UserRoutes.js`)

| Method | Path | Auth Required | Description |
|--------|------|:---:|-------------|
| POST | `/user/signup` | ❌ | Register a new user account |
| POST | `/user/login` | ❌ | Authenticate and receive tokens |
| POST | `/user/logout` | ❌ | Clear refresh cookie and invalidate token |
| POST | `/user/refresh-token` | 🍪 Cookie | Exchange refresh token for a new access token |
| GET | `/user/me` | ✅ JWT | Get currently logged-in user's profile |

---

### `/teacher` — Teacher APIs (`TeacherRoutes.js`)

| Method | Path | Auth Required | Description |
|--------|------|:---:|-------------|
| GET | `/teacher/...` | ✅ JWT + role:teacher | Teacher profile and pending review data |

---

### `/admin` — Admin APIs (`AdminRoutes.js`)

| Method | Path | Auth Required | Description |
|--------|------|:---:|-------------|
| GET | `/admin/stats` | ✅ JWT + role:admin | Aggregated platform statistics |
| GET | `/admin/users` | ✅ JWT + role:admin | List all users |
| PATCH | `/admin/users/:id` | ✅ JWT + role:admin | Activate/deactivate a user account |

---

### `/assignment` — Assignment APIs (`AssignmentRoutes.js`)

| Method | Path | Auth Required | Description |
|--------|------|:---:|-------------|
| POST | `/assignment/create` | ✅ JWT + role:teacher | Create new assignment with file upload |
| GET | `/assignment/list` | ✅ JWT | List all available assignments |
| GET | `/assignment/download/:id` | ✅ JWT | Download the assignment file |

---

### `/submitted` — Submission APIs (`SubmittedRoutes.js`)

| Method | Path | Auth Required | Description |
|--------|------|:---:|-------------|
| POST | `/submitted/upload` | ✅ JWT + role:student | Upload a submission PDF |
| GET | `/submitted/list` | ✅ JWT + role:teacher | List all submissions for review |
| GET | `/submitted/student/:id` | ✅ JWT | Get a student's submission history |

---

### `/feedback` — Feedback APIs (`FeedbackRoutes.js`)

| Method | Path | Auth Required | Description |
|--------|------|:---:|-------------|
| POST | `/feedback/save` | ✅ JWT + role:teacher | Save AI feedback after teacher review |
| GET | `/feedback/student/:id` | ✅ JWT | Retrieve all feedback for a student |

---

## 🔄 How Routes Work

Each route file follows this pattern:

```js
const express = require("express");
const router = express.Router();
const { handlerFunction } = require("../Middleware/SomeMiddleware");
const { verifyAccessToken, requireRole } = require("../Middleware/Auth");

// Public route
router.post("/login", handlerFunction);

// Protected route (JWT only)
router.get("/profile", verifyAccessToken, handlerFunction);

// Protected + role-restricted route
router.post("/create", verifyAccessToken, requireRole("teacher"), handlerFunction);

module.exports = router;
```

The router is then mounted in `Index.js`:
```js
app.use("/assignment", AssignmentRoutes);
// Result: POST /assignment/create, GET /assignment/list, etc.
```

---

## 🔗 Related Files

- `Middleware/*.js` — Contains the actual handler functions imported by these routers
- `Middleware/Auth.js` — `verifyAccessToken` and `requireRole` used on protected routes
- `Backend/Index.js` — Where these routers are mounted with `app.use()`
