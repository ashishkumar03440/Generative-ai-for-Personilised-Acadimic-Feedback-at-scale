# 🗄 Models — MongoDB Database Schemas

> **Location:** `Backend/Models/`  
> **Purpose:** Defines the data structure (schema) for every collection in MongoDB. Each file exports a compiled Mongoose Model.

---

## 📁 Folder Contents

```
Models/
├── Users.js        # Students, teachers, and admins — unified user model
├── Teachers.js     # Teacher-specific extended data
├── Admin.js        # Admin account data
├── Assignment.js   # Assignments created by teachers
├── Submitted.js    # Student submission records
└── Feedback.js     # AI-generated feedback results
```

---

## 📄 `Users.js` — Unified User Model

**MongoDB Collection:** `users`

The primary model for all user types in the system. Role differentiation is done via the `role` field, with optional role-specific sub-documents.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userName` | String | ✅ | Full name of the user |
| `phoneNumber` | String | ✅ | Contact number |
| `email` | String | ✅ | Unique, lowercase email (validated with regex) |
| `password` | String | ✅ | Bcrypt-hashed password (min 5 chars) |
| `role` | String (enum) | ✅ | One of: `"student"`, `"teacher"`, `"admin"` |
| `institution` | ObjectId → Institution | ✅ | Reference to the institution |
| `studentProfile` | Object | ❌ | Only for students: `gradeLevel`, `board`, `rollNumber`, `section`, `parentEmail` |
| `teacherProfile` | Object | ❌ | Only for teachers: `subjects[]`, `designation`, `employeeId` |
| `avatar` | String | ❌ | URL/path to profile image |
| `isActive` | Boolean | — | Default `true`; admins can deactivate accounts |
| `lastLogin` | Date | ❌ | Timestamp of last successful login |
| `refreshToken` | String | ❌ | Current valid refresh token (cleared on logout) |
| `passwordResetToken` | String | ❌ | Temporary token for password reset flow |
| `passwordResetExpires` | Date | ❌ | Expiry for the password reset token |
| `createdAt` / `updatedAt` | Date | — | Auto-managed by Mongoose `timestamps: true` |

---

## 📄 `Teachers.js` — Teacher Model

**MongoDB Collection:** `teachers`

Stores teacher-specific data, potentially separate or linked to the main `Users` collection.

---

## 📄 `Admin.js` — Admin Model

**MongoDB Collection:** `admins`

Stores admin account information and permissions.

---

## 📄 `Assignment.js` — Assignment Model

**MongoDB Collection:** `assignments`

Represents an assignment created by a teacher.

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Assignment title |
| `description` | String | Assignment instructions |
| `subject` | String | Subject/topic area |
| `dueDate` | Date | Submission deadline |
| `filePath` | String | Path to the uploaded assignment file in `/uploads/` |
| `createdBy` | ObjectId → User | Reference to the teacher who created it |
| `createdAt` | Date | Auto-managed timestamp |

---

## 📄 `Submitted.js` — Submission Model

**MongoDB Collection:** `submitteds`

Tracks each student's submission for an assignment.

| Field | Type | Description |
|-------|------|-------------|
| `assignment` | ObjectId → Assignment | Which assignment this submission is for |
| `student` | ObjectId → User | Which student submitted |
| `filePath` | String | Path to the uploaded PDF in `uploads/submissions/` |
| `status` | String | Processing status: `"pending"`, `"processing"`, `"completed"`, `"failed"` |
| `submittedAt` | Date | Timestamp of submission |

---

## 📄 `Feedback.js` — Feedback Model

**MongoDB Collection:** `feedbacks`

Stores the final AI-generated (and optionally teacher-reviewed) feedback for a submission.

| Field | Type | Description |
|-------|------|-------------|
| `submission` | ObjectId → Submitted | Linked submission |
| `student` | ObjectId → User | Student who receives the feedback |
| `teacher` | ObjectId → User | Teacher who approved/modified the feedback |
| `feedbackSummary` | String | 2-3 sentence overall summary |
| `whatWentWell` | String | Strengths identified |
| `areasForImprovement` | String | Weaknesses explained gently |
| `actionableSteps` | [String] | Ordered list of improvement actions |
| `recommendedStudyTopics` | [String] | Topics for the student to review |
| `encouragingClosing` | String | Motivational closing statement |
| `accuracyScore` | Number | Numeric score (0–100) from the Analyzer |
| `isTeacherApproved` | Boolean | Whether feedback has been reviewed/approved by a teacher |
| `createdAt` | Date | Auto-managed timestamp |

---

## 🔄 How Models Work

```js
// 1. Define a schema
const assignmentSchema = new mongoose.Schema({ title: String, ... });

// 2. Compile into a Model
module.exports = mongoose.model("Assignment", assignmentSchema);

// 3. Use in middleware/handlers
const Assignment = require('../Models/Assignment');
const all = await Assignment.find({});
await new Assignment({ title: "Maths HW" }).save();
```

Mongoose automatically:
- Creates the MongoDB collection if it doesn't exist
- Enforces schema validation on write
- Provides `.find()`, `.findById()`, `.create()`, `.updateOne()`, `.deleteOne()` etc.

---

## 🔗 Related Files

- `Connection/Conn.js` — Must be established before models can query
- `Middleware/*.js` — All handlers import and query these models
