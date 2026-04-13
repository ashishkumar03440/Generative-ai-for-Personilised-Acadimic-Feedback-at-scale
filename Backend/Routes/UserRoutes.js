const app        = require("express");
const UserRoutes  = app.Router();

const {
    login,
    signup,
    refreshToken,
    logout,
    getMe,
} = require("../Middleware/UserMiddleware");

const { verifyAccessToken, requireRole } = require("../Middleware/Auth");

// ── Public routes ─────────────────────────────────────────────────────────────
UserRoutes.post("/signup",        signup);
UserRoutes.post("/login",         login);
UserRoutes.post("/logout",        logout);          // clears cookie; no auth required

// ── Token refresh ─────────────────────────────────────────────────────────────
// The browser auto-sends the HttpOnly refreshToken cookie to this specific path.
UserRoutes.post("/refresh-token", refreshToken);

// ── Protected routes ──────────────────────────────────────────────────────────
// Any route below this line requires a valid access token.
UserRoutes.get("/me", verifyAccessToken, getMe);

// Example: only students can access this route
// UserRoutes.get("/student-only", verifyAccessToken, requireRole("student"), handler);

module.exports = UserRoutes;
