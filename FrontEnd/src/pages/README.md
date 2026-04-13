# 📄 pages — Application Pages (Routes)

> **Location:** `FrontEnd/src/pages/`  
> **Purpose:** Top-level page components, each corresponding to a React Router route. Organized by user role.

---

## 📁 Folder Contents

```
pages/
├── Index.tsx          # / — Entry route (redirects to login or dashboard)
├── HomePage.tsx       # /home — Public marketing/landing page
├── LoginPage.tsx      # /login — Login and signup form
├── NotFound.tsx       # * — 404 page
│
├── student/           # All student-facing pages
├── teacher/           # All teacher-facing pages
└── admin/             # All admin-facing pages
```

---

## 📄 Root Page Files

### `Index.tsx` — `/`
The default entry route. Checks if the user is already authenticated and redirects:
- Authenticated → their role-specific dashboard
- Unauthenticated → `/login`

### `LoginPage.tsx` — `/login`
The unified authentication page for all user roles.

**What it contains:**
- Email + password login form with validation
- Handles `POST /user/login` API call
- On success: stores access token in `AuthContext`, redirects based on `role`
- Displays error messages for wrong credentials
- Responsive, glassmorphic card design

**API Call:**
```
POST http://localhost:5000/user/login
Body: { email, password }
Response: { accessToken, user: { id, name, role } }
```

### `HomePage.tsx` — `/home`
Public-facing landing page for the EduAI platform.

**What it contains:**
- Hero section with project tagline
- Feature highlights (AI feedback, progress tracking, curriculum mapping)
- Call-to-action buttons (Login / Sign Up)
- Navigation header with `ThemeToggle`

### `NotFound.tsx` — `*`
A friendly 404 error page shown when a route doesn't exist. Includes a link back to the home page.

---

## 📂 Sub-folder Documentation

- [`student/README.md`](./student/README.md) — Student pages
- [`teacher/README.md`](./teacher/README.md) — Teacher pages
- [`admin/README.md`](./admin/README.md) — Admin pages

---

## 🔗 Related Files

- `src/App.tsx` — Registers all routes using React Router `<Route>` components
- `src/contexts/AuthContext.tsx` — Provides user/role info used for redirects
