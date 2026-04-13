# 📦 src — React Application Source Root

> **Location:** `FrontEnd/src/`  
> **Purpose:** The root of all React application code. Contains global files and all feature sub-folders.

---

## 📁 Folder Contents

```
src/
├── main.tsx          # React entry point — mounts <App /> into the DOM
├── App.tsx           # Root component — routing, context providers, layout
├── App.css           # Component-level styles for App
├── index.css         # Global CSS: Tailwind base + custom design tokens
├── vite-env.d.ts     # TypeScript types for Vite env variables (import.meta.env)
│
├── pages/            # Top-level page components (one per route)
├── components/       # Shared/reusable UI components and layout
├── contexts/         # React Context providers (Auth, Theme)
├── hooks/            # Custom React hooks
├── lib/              # Pure utility functions
└── test/             # Vitest test setup files
```

---

## 📄 Root Files

### `main.tsx` — Application Entry Point

The very first file executed. It:
1. Imports React and ReactDOM
2. Imports `App.tsx` and global styles (`index.css`)
3. Calls `ReactDOM.createRoot(...).render(<App />)` to mount the app

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### `App.tsx` — Root Component

Sets up the application's full structure:

1. **Context Providers** — Wraps the app in `ThemeProvider` and `AuthProvider` so all components have access to global state
2. **React Router** — Defines all routes using `<BrowserRouter>` and `<Routes>`
3. **Route Protection** — Redirects unauthenticated users to `/login`
4. **Role-based routing** — Sends users to their role-appropriate dashboard after login

```
<ThemeProvider>
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/"                → <Index />
        <Route path="/login"           → <LoginPage />
        <Route path="/student/*"       → <DashboardLayout> + student pages
        <Route path="/teacher/*"       → <DashboardLayout> + teacher pages
        <Route path="/admin/*"         → <DashboardLayout> + admin pages
        <Route path="*"                → <NotFound />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
</ThemeProvider>
```

---

### `index.css` — Global Design System

This file is the foundation of the entire visual design. It contains:

| Section | Contents |
|---------|---------|
| `@import` | Google Fonts (Inter, Outfit) |
| `@tailwind` directives | `base`, `components`, `utilities` |
| `:root {}` | CSS custom properties (design tokens) for light mode |
| `.dark {}` | CSS custom property overrides for dark mode |
| Custom utility classes | Any global classes not covered by Tailwind |

The CSS variables defined here map directly to Tailwind classes via `tailwind.config.ts`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  ...
}
```

---

### `vite-env.d.ts` — Vite Type Declarations

A tiny file that tells TypeScript about `import.meta.env` (Vite's way of accessing environment variables in the frontend):

```ts
/// <reference types="vite/client" />
```

This enables type-safe access to variables like `import.meta.env.VITE_API_URL`.

---

## 🔗 Sub-folder Documentation

- [`pages/README.md`](./pages/README.md) — Page components for all routes
- [`components/README.md`](./components/README.md) — Shared UI and layout components
- [`contexts/README.md`](./contexts/README.md) — Global state (Auth, Theme)
- [`hooks/README.md`](./hooks/README.md) — Custom React hooks
- [`lib/README.md`](./lib/README.md) — Utility functions
- [`test/README.md`](./test/README.md) — Test configuration
