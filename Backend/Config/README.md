# ⚙ Config — JWT & Authentication Configuration

> **Location:** `Backend/Config/`  
> **Purpose:** Centralized source of truth for all JWT token and cookie settings.

---

## 📁 Folder Contents

```
Config/
└── jwtConfig.js    # JWT secrets, expiry durations, and cookie options
```

---

## 📄 `jwtConfig.js`

This file is imported by every piece of middleware that deals with authentication tokens. It prevents "magic strings" from being scattered across the codebase.

### What it exports:

| Export | Type | Description |
|--------|------|-------------|
| `ACCESS_SECRET` | `string` | Secret key used to sign access tokens (from `JWT_ACCESS_SECRET` env var) |
| `REFRESH_SECRET` | `string` | Secret key used to sign refresh tokens (from `JWT_REFRESH_SECRET` env var) |
| `ACCESS_EXPIRES` | `string` | Access token lifetime (default: `"15m"`) |
| `REFRESH_EXPIRES` | `string` | Refresh token lifetime (default: `"7d"`) |
| `REFRESH_COOKIE_OPTIONS` | `object` | Cookie options for setting the refresh token cookie |
| `REFRESH_COOKIE_CLEAR_OPTIONS` | `object` | Cookie options for clearing the refresh token cookie on logout |

---

### Cookie Options Explained

```js
// REFRESH_COOKIE_OPTIONS
{
  httpOnly: true,        // Cookie is NOT accessible via document.cookie (JS can't read it)
  secure: isProduction,  // Only sent over HTTPS in production
  sameSite: "Strict",    // Never sent cross-site (prevents CSRF)
  maxAge: 604800000,     // 7 days in milliseconds
  path: "/"              // Sent on all routes (needed so /user/logout can receive it)
}
```

---

### `parseDurationMs()` — Internal Helper

Converts duration strings like `"15m"` or `"7d"` into milliseconds so the cookie `maxAge` always matches the JWT expiry.

```
"15m"  →  900000  ms
"1h"   →  3600000 ms
"7d"   →  604800000 ms
```

---

### How it's used

```js
// In UserMiddleware.js (login handler)
const { REFRESH_COOKIE_OPTIONS, ACCESS_EXPIRES, ... } = require('../Config/jwtConfig');

// Sign access token
const accessToken = jwt.sign({ id, role }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

// Set refresh token as HttpOnly cookie
res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
```

---

### ⚠ Startup Validation

If `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` are missing from `.env`, the server **will throw immediately on startup** rather than fail silently at runtime:

```
Error: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in .env
```

---

## 🔗 Related Files

- `Middleware/Auth.js` — Uses `ACCESS_SECRET` to verify tokens
- `Middleware/UserMiddleware.js` — Uses all exports during login/logout/refresh
