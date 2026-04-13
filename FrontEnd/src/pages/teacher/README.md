# 👨‍🏫 teacher — Teacher Pages

> **Location:** `FrontEnd/src/pages/teacher/`  
> **Purpose:** All page components accessible to logged-in users with the `teacher` role.

---

## 📁 Folder Contents

```
teacher/
├── TeacherDashboard.tsx    # /teacher/dashboard — Overview and pending reviews
├── AssignmentCreator.tsx   # /teacher/create-assignment — Create and upload new assignment
├── ReviewEditor.tsx        # /teacher/review/:id — Review and edit AI feedback
└── ClassAnalytics.tsx      # /teacher/analytics — Class-wide performance analytics
```

---

## 📄 Page Descriptions

### `TeacherDashboard.tsx` — `/teacher/dashboard`

The teacher's home screen. Shows a live snapshot of their class activity.

**What it shows:**
- **Stats cards:** Total students, pending reviews, graded submissions, assignments published
- **Recent submissions** — List of latest student submissions awaiting review
- **Quick actions** — Button shortcuts to create assignment or go to review queue

**API calls:**
- `GET /submitted/list` — List all submissions (filtered to this teacher's assignments)
- `GET /assignment/list` — List assignments created by this teacher

---

### `AssignmentCreator.tsx` — `/teacher/create-assignment`

A form interface for teachers to publish new assignments for students.

**What it shows:**
- Input fields: Assignment title, subject, description/instructions, due date
- File upload: Upload reference PDF or document for students to download
- Submit button → creates the assignment and makes it visible in student `AssignmentList`

**Constraints:**
- File types: PDF, DOCX, DOC
- Max file size: 20MB

**API calls:**
- `POST /assignment/create` — `multipart/form-data` with metadata fields + file

---

### `ReviewEditor.tsx` — `/teacher/review/:id`

The most complex page in the teacher UI. Allows the teacher to review a student's submission alongside the AI-generated draft feedback, and make edits before publishing.

**What it shows:**
- **Left panel:** Student's submitted PDF (embedded viewer or download link)
- **Right panel:** AI-generated feedback fields (editable text areas)
  - Feedback summary
  - What went well
  - Areas for improvement
  - Actionable steps
  - Recommended topics
  - Encouraging closing
- **Score input:** Teacher can adjust the accuracy score if needed
- **Approve & Publish button:** Saves the final feedback (marking it as teacher-approved) and makes it visible to the student

**API calls:**
- `GET /submitted/:id` — Fetch the specific submission + file path
- `GET /feedback/student/:studentId` — Fetch the AI-generated draft feedback
- `POST /feedback/save` — Save the teacher-reviewed final feedback

---

### `ClassAnalytics.tsx` — `/teacher/analytics`

Provides class-level data visualisation to help teachers identify trends and struggling students.

**What it shows:**
- **Grade distribution chart** — Histogram of accuracy scores across all students
- **Subject performance** — Which subjects have the most errors
- **Top students** — Highest performing students
- **At-risk students** — Students with consistently low scores
- **Common error topics** — Most frequently flagged weaknesses from AI feedback

**API calls:**
- `GET /feedback/...` — Aggregate feedback data across all students

---

## 🔐 Route Protection

All teacher routes require:
1. A valid JWT access token in `AuthContext`
2. `role === "teacher"` — students and admins are redirected away

---

## 🔗 Related Files

- `src/App.tsx` — Registers these routes under `/teacher/*`
- `src/components/DashboardLayout.tsx` — Wraps all pages with sidebar navigation
- `src/components/AppSidebar.tsx` — Renders teacher-specific nav links
- `src/contexts/AuthContext.tsx` — Provides teacher's `user.id` for API calls
