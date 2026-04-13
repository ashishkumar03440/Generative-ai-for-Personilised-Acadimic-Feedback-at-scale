# 🛡 Middleware — Business Logic Handlers

> **Location:** `Backend/Middleware/`  
> **Purpose:** Contains all the actual business logic for every API endpoint. Routes are thin declarators; all real work happens here.

---

## 📁 Folder Contents

```
Middleware/
├── Auth.js                  # JWT verification + role-based access control
├── UserMiddleware.js         # Signup, login, logout, token refresh, profile
├── TeacherMiddleware.js      # Teacher-specific data operations
├── AdminMiddleware.js        # Admin dashboard, user management, audit logs
├── AssignmentMiddleware.js   # Create and list assignments (teacher file uploads)
├── SubmittedMiddleware.js    # Student submission uploads + AI feedback triggering
└── FeedbackMiddleware.js     # Store and retrieve AI-generated feedback
```

---

## 📄 `Auth.js` — Authentication Guard

The core security middleware used to protect every private API route.

### Exports

#### `verifyAccessToken` (middleware)
Reads the `Authorization: Bearer <token>` header, verifies the JWT, and attaches the decoded user payload to `req.user`.

```
Request arrives
      ↓
Authorization header present?  ──No──▶  401 "Access denied. No token provided."
      ↓ Yes
JWT valid and not expired?     ──No──▶  401 "Access token expired." / 403 "Invalid token."
      ↓ Yes
Attach req.user = { id, role }
      ↓
Call next() → proceed to handler
```

#### `requireRole(...roles)` (middleware factory)
Must be used **after** `verifyAccessToken`. Checks that `req.user.role` is in the list of allowed roles.

```js
// Protect AND restrict by role
router.get('/admin/stats', verifyAccessToken, requireRole('admin'), handler);
router.post('/submit',     verifyAccessToken, requireRole('student', 'teacher'), handler);
```

---

## 📄 `UserMiddleware.js` — User Authentication & Profile

Handles the full authentication lifecycle for all user types.

| Function | HTTP | Route | Description |
|----------|------|-------|-------------|
| `signup` | POST | `/user/signup` | Creates a new user account; hashes password with bcrypt; sends access + refresh tokens |
| `login` | POST | `/user/login` | Validates email + password; issues JWT access token in body + refresh token in HttpOnly cookie |
| `logout` | POST | `/user/logout` | Clears the refresh cookie and removes the refresh token from the DB |
| `refreshToken` | POST | `/user/refresh-token` | Reads the refresh token from the cookie, verifies it, issues a new access token |
| `getMe` | GET | `/user/me` | Returns the currently logged-in user's profile (requires valid access token) |

---

## 📄 `AdminMiddleware.js` — Admin Operations

Handles admin-level operations. All routes require `verifyAccessToken + requireRole('admin')`.

| Function | Description |
|----------|-------------|
| Dashboard stats | Aggregates counts from all DB collections (users, submissions, feedback) |
| User management | List, activate, and deactivate student/teacher accounts |
| AI monitoring | Retrieves AI pipeline run statistics and error rates |
| Audit log | Returns chronological log of system events |

---

## 📄 `AssignmentMiddleware.js` — Assignment Management

Handles teacher-created assignments with file attachments.

| Function | HTTP | Route | Description |
|----------|------|-------|-------------|
| Create assignment | POST | `/assignment/create` | Saves assignment metadata + uploaded file path to MongoDB |
| List assignments | GET | `/assignment/list` | Returns all assignments (with optional filters) |
| Download | GET | `/assignment/download/:id` | Serves the assignment file from `/uploads/` |

> Uses **Multer** middleware for handling `multipart/form-data` file uploads. Only PDF files up to 20MB are accepted.

---

## 📄 `SubmittedMiddleware.js` — Student Submissions

Handles student file submissions and triggers the AI pipeline.

| Function | HTTP | Route | Description |
|----------|------|-------|-------------|
| Upload submission | POST | `/submitted/upload` | Accepts student PDF, saves to `uploads/submissions/`, stores record in DB, triggers AI pipeline |
| List submissions | GET | `/submitted/list` | Returns all submissions (for teacher review dashboard) |
| Get by student | GET | `/submitted/student/:id` | Returns a specific student's submission history |

---

## 📄 `FeedbackMiddleware.js` — AI Feedback Records

Handles storing and retrieving AI-generated feedback.

| Function | HTTP | Route | Description |
|----------|------|-------|-------------|
| Save feedback | POST | `/feedback/save` | Stores the final AI feedback payload linked to a submission |
| Get feedback | GET | `/feedback/student/:id` | Returns all feedback records for a specific student |

---

## 📄 `TeacherMiddleware.js` — Teacher Data

Handles teacher-specific data fetching.

| Function | Description |
|----------|-------------|
| Get teacher profile | Returns teacher's profile, subjects, and assigned classes |
| Get pending reviews | Returns submissions awaiting teacher review/approval |

---

## 🔗 Related Files

- `Routes/*.js` — Thin routers that import and use these handler functions
- `Config/jwtConfig.js` — JWT secrets used in Auth.js
- `Models/*.js` — Mongoose models queried by these handlers
- `agents/index.js` — AI pipeline invoked by SubmittedMiddleware
