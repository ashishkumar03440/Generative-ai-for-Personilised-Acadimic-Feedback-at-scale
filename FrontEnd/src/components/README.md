# 🧩 components — Shared UI Components

> **Location:** `FrontEnd/src/components/`  
> **Purpose:** Reusable UI components shared across multiple pages — includes the main layout shell, navigation, and shadcn/ui primitive components.

---

## 📁 Folder Contents

```
components/
├── DashboardLayout.tsx   # Main layout wrapper for all authenticated pages
├── AppSidebar.tsx        # Left navigation sidebar
├── NavLink.tsx           # Individual sidebar navigation item
├── ThemeToggle.tsx       # Dark / Light mode toggle button
└── ui/                   # shadcn/ui primitive component library (49 components)
```

---

## 📄 Layout Components

### `DashboardLayout.tsx`

The main layout shell used by **all authenticated pages** (student, teacher, and admin). Wraps page content with the sidebar and header.

**What it renders:**
```
┌─────────────────────────────────────────────┐
│  AppSidebar (left)  │  Page Content (right)  │
│                     │                        │
│  [Logo]             │  <Outlet /> or         │
│  [Nav Links]        │  {children}            │
│  [User Info]        │                        │
│  [Logout]           │                        │
└─────────────────────────────────────────────┘
```

**How to use:**
```tsx
// In App.tsx, wrap role-specific routes:
<Route element={<DashboardLayout />}>
  <Route path="/student/dashboard" element={<StudentDashboard />} />
  ...
</Route>
```

---

### `AppSidebar.tsx`

The left navigation sidebar. Reads the user's `role` from `AuthContext` and renders the appropriate set of navigation links.

**Role-based navigation:**

| Role | Links shown |
|------|------------|
| `student` | Dashboard, Assignments, Submit, Feedback, Progress |
| `teacher` | Dashboard, Create Assignment, Review Queue, Analytics |
| `admin` | Dashboard, Users, AI Monitor, Audit Log |

Also displays:
- Application logo/name at the top
- Logged-in user's name and role at the bottom
- Logout button

---

### `NavLink.tsx`

A single navigation item in the sidebar. Wraps React Router's `<Link>` with:
- **Active state styling** — highlights the current route
- **Icon + label** layout
- Hover and focus animations

**Props:**
```tsx
interface NavLinkProps {
  to: string;        // Route path
  icon: ReactNode;   // Lucide icon component
  label: string;     // Display text
}
```

---

### `ThemeToggle.tsx`

A toggle button that switches between dark and light mode.

**How it works:**
1. Reads `theme` from `ThemeContext`
2. On click, calls `toggleTheme()` from `ThemeContext`
3. `ThemeContext` applies/removes the `dark` class on `<html>` and saves to `localStorage`
4. Tailwind's `dark:` variants apply the correct styles

**Visual:** Renders a sun icon (light mode) or moon icon (dark mode) from `lucide-react`.

---

## 📂 `ui/` Sub-folder

The `ui/` folder contains the complete **shadcn/ui** component library — 49 accessible, themeable primitive components built on Radix UI.

See [`ui/README.md`](./ui/README.md) for full documentation.

---

## 🔗 Related Files

- `src/contexts/AuthContext.tsx` — Provides user role for conditional sidebar rendering
- `src/contexts/ThemeContext.tsx` — Provides theme state for `ThemeToggle`
- `src/App.tsx` — Wraps routes with `DashboardLayout`
