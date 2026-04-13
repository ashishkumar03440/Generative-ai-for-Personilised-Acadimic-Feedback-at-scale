# 🌍 contexts — Global State Providers

> **Location:** `FrontEnd/src/contexts/`  
> **Purpose:** React Context providers that hold and share global application state — eliminating the need for prop drilling across deeply nested component trees.

---

## 📁 Folder Contents

```
contexts/
├── AuthContext.tsx    # Authentication state: current user, tokens, login/logout
└── ThemeContext.tsx   # UI theme state: dark/light mode toggle
```

---

## 📄 `AuthContext.tsx` — Authentication Context

**Context Name:** `AuthContext`  
**Provider:** `AuthProvider`

Manages everything related to the currently logged-in user.

### State it holds:

| Property | Type | Description |
|----------|------|-------------|
| `user` | `object \| null` | `{ id, name, email, role }` of the logged-in user |
| `token` | `string \| null` | JWT access token (stored in memory, NOT localStorage) |
| `isAuthenticated` | `boolean` | Whether a valid session exists |
| `isLoading` | `boolean` | True while checking session on app load |

### Functions it provides:

| Function | Description |
|----------|-------------|
| `login(email, password)` | Calls `POST /user/login`, stores token and user data, redirects to role dashboard |
| `logout()` | Calls `POST /user/logout`, clears token and user state |
| `refreshAccessToken()` | Calls `POST /user/refresh-token` using the HttpOnly cookie; updates the token |

### How it works:

```tsx
// 1. Wrap the app in AuthProvider (done in main.tsx or App.tsx)
<AuthProvider>
  <App />
</AuthProvider>

// 2. Use in any component
const { user, token, login, logout } = useContext(AuthContext);

// 3. Make authenticated API calls
fetch('/api/data', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### On app load:
`AuthProvider` calls `GET /user/me` using the HttpOnly refresh cookie to restore the session. If valid, it sets `user` and `isAuthenticated = true`. If not, the user is shown the login page.

### Security notes:
- Access tokens are stored in **React state (memory only)** — never in `localStorage` (which is vulnerable to XSS)
- Refresh tokens are in an **HttpOnly cookie** — unreadable by any JS code
- Token refresh happens automatically and transparently

---

## 📄 `ThemeContext.tsx` — Theme Context

**Context Name:** `ThemeContext`  
**Provider:** `ThemeProvider`

Manages the application-wide dark/light mode preference.

### State it holds:

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `"light" \| "dark"` | Current active theme |

### Functions it provides:

| Function | Description |
|----------|-------------|
| `toggleTheme()` | Switches between `"light"` and `"dark"` |
| `setTheme(theme)` | Explicitly set a theme |

### How it works:

```tsx
// 1. Wrap the app
<ThemeProvider>
  <App />
</ThemeProvider>

// 2. Use in any component
const { theme, toggleTheme } = useContext(ThemeContext);
```

### Persistence & DOM manipulation:

```
User clicks ThemeToggle
        │
        ▼
toggleTheme() called
        │
        ├── Updates React state: theme = "dark"
        ├── Saves to localStorage: localStorage.setItem("theme", "dark")
        └── Applies class to HTML element: document.documentElement.classList.add("dark")
                                           (or removes "dark" for light mode)
```

On initial load, `ThemeProvider` reads `localStorage` to restore the last preference.

### Why `document.documentElement.classList`:
Tailwind CSS is configured to use the `class` strategy for dark mode (`darkMode: 'class'` in `tailwind.config.ts`). All `dark:` variant styles are activated when the `dark` class is on the `<html>` element.

---

## 🔗 Related Files

- `src/main.tsx` — Where providers are applied to the component tree
- `src/App.tsx` — May also wrap providers or consume auth for route protection
- `src/components/ThemeToggle.tsx` — UI button that calls `toggleTheme()`
- `tailwind.config.ts` — `darkMode: 'class'` configuration
