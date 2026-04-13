# 🎓 student — Student Pages

> **Location:** `FrontEnd/src/pages/student/`  
> **Purpose:** All page components accessible to logged-in users with the `student` role.

---

## 📁 Folder Contents

```
student/
├── StudentDashboard.tsx   # /student/dashboard — Overview and stats
├── AssignmentList.tsx     # /student/assignments — Browse and download assignments
├── SubmissionPage.tsx     # /student/submit — Upload assignment submission
├── FeedbackView.tsx       # /student/feedback — View AI-generated feedback
└── ProgressDashboard.tsx  # /student/progress — Academic progress charts
```

---

## 📄 Page Descriptions

### `StudentDashboard.tsx` — `/student/dashboard`

The student's home screen after login. Provides a high-level overview of their academic activity.

**What it shows:**
- **Stats cards:** Total submissions, average grade, pending assignments, feedback received
- **Progress chart:** Line/bar chart showing grade trend over recent submissions
- **Recent activity feed:** Last few submissions and their status (`Submitted`, `Graded`, `Feedback Ready`)

**API calls:**
- `GET /submitted/student/:id` — Fetch submission history
- `GET /feedback/student/:id` — Fetch received feedback records
- `GET /assignment/list` — Fetch available assignments

---

### `AssignmentList.tsx` — `/student/assignments`

Lists all assignments published by teachers for the student to download and work on.

**What it shows:**
- Table/card list of all assignments with: title, subject, due date, status
- **Download button** for each assignment file
- Filter/sort by subject or due date

**API calls:**
- `GET /assignment/list` — Fetch all assignments
- `GET /assignment/download/:id` — Download the assignment file (PDF/doc)

---

### `SubmissionPage.tsx` — `/student/submit`

The file upload interface for submitting a completed assignment.

**What it shows:**
- Dropdown to select which assignment is being submitted
- Drag-and-drop / click-to-upload file input
- Accepted types: **PDF only**, max size: **20MB** (enforced on frontend and backend)
- Upload progress indicator
- Success/error feedback animation (shows actual network result, not a false positive)

**API calls:**
- `POST /submitted/upload` — `multipart/form-data` with the PDF file and assignment ID

---

### `FeedbackView.tsx` — `/student/feedback`

Displays the personalised AI-generated feedback for a submission.

**What it shows:**
- **Feedback summary** — 2-3 sentence overall assessment
- **What went well** — Strengths highlighted in a green card
- **Areas for improvement** — Gentle critique in an amber card
- **Actionable steps** — Ordered list of concrete next actions
- **Recommended study topics** — Topics to review
- **Encouraging closing** — Motivational note
- **Accuracy score** — Visual radial/progress chart
- **Learning path** — NCERT chapter/module mapping

**API calls:**
- `GET /feedback/student/:id` — Fetch all feedback records for the student

---

### `ProgressDashboard.tsx` — `/student/progress`

Visualizes the student's academic performance trends over time.

**What it shows:**
- **Grade trend chart** — Line chart of accuracy scores across submissions
- **Subject breakdown** — Bar chart of performance per subject
- **Submission frequency** — How often the student submits
- **Key statistics** — Best score, worst score, average, total submissions

**API calls:**
- `GET /feedback/student/:id` — All feedback data with scores and timestamps
- `GET /submitted/student/:id` — Submission timestamps for frequency chart

---

## 🔐 Route Protection

All student routes require:
1. A valid JWT access token in `AuthContext`
2. `role === "student"` — teachers and admins are redirected away

---

## 🔗 Related Files

- `src/App.tsx` — Registers these routes under `/student/*`
- `src/components/DashboardLayout.tsx` — Wraps all pages with sidebar navigation
- `src/components/AppSidebar.tsx` — Renders student-specific nav links
- `src/contexts/AuthContext.tsx` — Provides `user.id` for API calls
