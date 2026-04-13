# 🛠 admin — Admin Pages

> **Location:** `FrontEnd/src/pages/admin/`  
> **Purpose:** All page components accessible to logged-in users with the `admin` role. Provides system-wide management, monitoring, and oversight.

---

## 📁 Folder Contents

```
admin/
├── AdminDashboard.tsx    # /admin/dashboard — System-wide stats and overview
├── UserManagement.tsx    # /admin/users — Manage student and teacher accounts
├── AIMonitor.tsx         # /admin/ai-monitor — Monitor the AI feedback pipeline
└── AuditLog.tsx          # /admin/audit-log — System activity and event trail
```

---

## 📄 Page Descriptions

### `AdminDashboard.tsx` — `/admin/dashboard`

The admin's command center. Aggregates real-time data from all database collections.

**What it shows:**
- **Platform stats cards:**
  - Total registered users (students + teachers)
  - Total submissions processed
  - AI feedback generated (count)
  - Active assignments
  - Pending reviews
- **User growth chart** — Line chart of new registrations over time
- **Submission volume chart** — Bar chart of daily/weekly submission counts
- **Quick navigation** — Buttons to User Management, AI Monitor, Audit Log

**API calls:**
- `GET /admin/stats` — Returns aggregated counts from all collections

---

### `UserManagement.tsx` — `/admin/users`

Full CRUD interface for managing all user accounts in the system.

**What it shows:**
- **Search and filter bar** — Search by name, email, or role
- **Data table** — All users with columns: Name, Email, Role, Institution, Status (Active/Inactive), Last Login, Actions
- **Activate / Deactivate toggle** — Admins can enable or disable any account
- **Role badge** — Colour-coded badges for `student`, `teacher`, `admin`

**API calls:**
- `GET /admin/users` — Fetch all users
- `PATCH /admin/users/:id` — Toggle `isActive` status

---

### `AIMonitor.tsx` — `/admin/ai-monitor`

Monitors the health and performance of the AI multi-agent pipeline.

**What it shows:**
- **Pipeline run stats:**
  - Total AI feedback runs
  - Success rate (%)
  - Average processing time per submission
  - Error rate
- **Recent AI runs table** — Last N pipeline runs with: student ID, timestamp, status (`success` / `failed`), processing time
- **Token usage** — Gemini API token consumption stats
- **Stage-level breakdown** — Which stage (Preprocessor, Analyzer, etc.) fails most often

**API calls:**
- `GET /admin/ai-stats` — Aggregated pipeline performance metrics

---

### `AuditLog.tsx` — `/admin/audit-log`

A chronological record of all significant system events for compliance and debugging.

**What it shows:**
- **Event timeline** — Ordered list of events with timestamp, event type, user, and description
- **Event types logged:**
  - User login / logout
  - Account created / deactivated
  - Assignment created / deleted
  - Submission uploaded
  - Feedback published
  - Admin action performed
- **Filter controls** — Filter by event type, date range, or specific user

**API calls:**
- `GET /admin/audit-log` — Returns paginated audit events

---

## 🔐 Route Protection

All admin routes require:
1. A valid JWT access token in `AuthContext`
2. `role === "admin"` — Students and teachers are redirected away
3. Backend also enforces `requireRole("admin")` on all `/admin/*` API routes

---

## 🔗 Related Files

- `src/App.tsx` — Registers these routes under `/admin/*`
- `src/components/DashboardLayout.tsx` — Wraps all pages with sidebar navigation
- `src/components/AppSidebar.tsx` — Renders admin-specific nav links
- `Backend/Middleware/AdminMiddleware.js` — API handlers for all admin endpoints
