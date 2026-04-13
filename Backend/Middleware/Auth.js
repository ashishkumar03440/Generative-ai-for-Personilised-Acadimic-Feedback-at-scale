/**
 * Auth.js  ─  Reusable authentication guard middleware
 *
 * Usage:
 *   const { verifyAccessToken, requireRole } = require('./Auth');
 *
 *   // Protect any route — just attach JWT
 *   router.get('/profile', verifyAccessToken, handler);
 *
 *   // Protect AND restrict by role
 *   router.get('/admin/dashboard', verifyAccessToken, requireRole('admin'), handler);
 *   router.post('/submit',         verifyAccessToken, requireRole('student', 'teacher'), handler);
 */

const jwt = require("jsonwebtoken");
const { ACCESS_SECRET } = require("../Config/jwtConfig");

// ─────────────────────────────────────────────────────────────────────────────
//  verifyAccessToken
//  Reads the Bearer token from the Authorization header.
//  On success, attaches `req.user = { id, role }` and calls next().
//  On failure, returns 401.
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, ACCESS_SECRET);
        // Attach only the minimal payload — never the whole DB document
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Access token expired. Please refresh." });
        }
        return res.status(403).json({ message: "Invalid token." });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  requireRole(...roles)
//  Must be used AFTER verifyAccessToken (req.user must exist).
//  Accepts one or more role strings.
// ─────────────────────────────────────────────────────────────────────────────
exports.requireRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated." });
    }
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            message: `Forbidden. Required role(s): ${roles.join(", ")}. You are: ${req.user.role}.`,
        });
    }
    next();
};
