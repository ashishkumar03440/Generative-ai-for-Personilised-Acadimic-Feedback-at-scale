/**
 * UserMiddleware.js  ─  Secure cookie-based JWT authentication
 *
 * Auth flow:
 *  1. POST /user/signup   → creates account, returns access + sets refresh cookie
 *  2. POST /user/login    → verifies creds, returns access token + sets refresh cookie
 *  3. POST /user/refresh-token → validates refresh cookie, rotates both tokens
 *  4. POST /user/logout   → clears refresh cookie + invalidates DB token
 *  5. GET  /user/me       → protected route example (requires verifyAccessToken)
 *
 * Security features implemented:
 *  ✅ HttpOnly + Secure + SameSite cookies (refresh token)
 *  ✅ Short-lived access token (15 m) sent only in JSON body
 *  ✅ Long-lived refresh token (7 d) stored ONLY in HttpOnly cookie + hashed in DB
 *  ✅ Refresh token rotation on every use (old token invalidated immediately)
 *  ✅ Logout invalidates the refresh token server-side
 *  ✅ bcrypt password hashing (cost factor 12)
 *  ✅ lastLogin tracking
 *  ✅ Role embedded in token — no extra DB lookup for authorization
 */

require("dotenv").config();
const UsersModel = require("../Models/Users.js");
const bcrypt     = require("bcrypt");
const jwt        = require("jsonwebtoken");
const crypto     = require("crypto");

const {
    ACCESS_SECRET,
    REFRESH_SECRET,
    ACCESS_EXPIRES,
    REFRESH_EXPIRES,
    REFRESH_COOKIE_OPTIONS,
    REFRESH_COOKIE_CLEAR_OPTIONS,
} = require("../Config/jwtConfig");

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Signs both tokens and returns them.
 * @param {{ id: string, role: string }} payload
 */
function signTokens(payload) {
    const accessToken = jwt.sign(payload, ACCESS_SECRET, {
        expiresIn: ACCESS_EXPIRES,
    });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRES,
    });
    return { accessToken, refreshToken };
}

/**
 * Hashes a refresh token with SHA-256 before storing in the DB.
 * We store the hash so that even if the DB is compromised the raw token cannot be replayed.
 */
function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Attaches the refresh token as an HttpOnly cookie and returns the
 * access token in the response body.
 */
function sendAuthResponse(res, statusCode, message, user, accessToken, refreshToken) {
    // Store refresh token in HttpOnly cookie — JS cannot read this
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(statusCode).json({
        message,
        accessToken,           // Short-lived — client stores in memory (NOT localStorage)
        user: {
            id   : user._id,
            name : user.userName,
            email: user.email,
            role : user.role,
        },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SIGNUP
// ─────────────────────────────────────────────────────────────────────────────
exports.signup = async (req, res) => {
    let {
        userName,
        phoneNumber,
        email,
        Email,
        password,
        role,
        institution,
        studentProfile,
        teacherProfile,
    } = req.body;

    email = (email || Email || "").toLowerCase().trim();

    if (!userName || !phoneNumber || !email || !password || !role || !institution) {
        return res.status(400).json({ message: "All required fields must be provided." });
    }

    // Basic password strength check
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    try {
        const existingUser = await UsersModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        // Cost factor 12 — good balance between security and speed
        const hashedPassword = await bcrypt.hash(password, 12);

        const userData = {
            userName,
            phoneNumber,
            email,
            password: hashedPassword,
            role,
            institution,
        };

        if (role === "student" && studentProfile) {
            userData.studentProfile = studentProfile;
        }
        if (role === "teacher" && teacherProfile) {
            userData.teacherProfile = teacherProfile;
        }

        const newUser = await UsersModel.create(userData);

        const { accessToken, refreshToken } = signTokens({
            id  : newUser._id.toString(),
            role: newUser.role,
        });

        // Store hash of refresh token in DB
        newUser.refreshToken = hashToken(refreshToken);
        newUser.lastLogin    = new Date();
        await newUser.save();

        return sendAuthResponse(res, 201, "Account created successfully.", newUser, accessToken, refreshToken);

    } catch (error) {
        console.error("[signup]", error);
        return res.status(500).json({ message: "Server error during signup.", error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
    const { password } = req.body;
    const email        = (req.body.email || "").toLowerCase().trim();

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await UsersModel.findOne({ email });
        if (!user) {
            // Use vague message to prevent user enumeration
            return res.status(401).json({ message: "Invalid credentials." });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account is deactivated. Contact support." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const { accessToken, refreshToken } = signTokens({
            id  : user._id.toString(),
            role: user.role,
        });

        // Rotate: overwrite the old refresh token hash in DB
        user.refreshToken = hashToken(refreshToken);
        user.lastLogin    = new Date();
        await user.save();

        return sendAuthResponse(res, 200, "Login successful.", user, accessToken, refreshToken);

    } catch (error) {
        console.error("[login]", error);
        return res.status(500).json({ message: "Server error during login.", error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  REFRESH TOKEN  (Token Rotation)
//
//  Client calls this when the access token expires.
//  The refresh cookie is automatically sent by the browser.
//  We verify it, issue a brand-new pair, and invalidate the old refresh token.
// ─────────────────────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        return res.status(401).json({ message: "No refresh token. Please log in." });
    }

    try {
        // 1. Verify the refresh token cryptographically
        const decoded = jwt.verify(incomingRefreshToken, REFRESH_SECRET);

        // 2. Look up the user and compare the stored hash
        const user = await UsersModel.findById(decoded.id);
        if (!user || !user.refreshToken) {
            return res.status(403).json({ message: "Refresh token reuse detected or user not found. Please log in again." });
        }

        const storedHash   = user.refreshToken;
        const incomingHash = hashToken(incomingRefreshToken);

        if (storedHash !== incomingHash) {
            // Token reuse attack — clear the stored token to force re-login
            user.refreshToken = null;
            await user.save();
            res.clearCookie("refreshToken", REFRESH_COOKIE_CLEAR_OPTIONS);
            return res.status(403).json({ message: "Refresh token reuse detected. Session terminated." });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account deactivated." });
        }

        // 3. Issue a new pair (rotation)
        const { accessToken, refreshToken: newRefreshToken } = signTokens({
            id  : user._id.toString(),
            role: user.role,
        });

        // 4. Overwrite the stored hash
        user.refreshToken = hashToken(newRefreshToken);
        await user.save();

        // 5. Replace cookie and return new access token
        return sendAuthResponse(res, 200, "Token refreshed.", user, accessToken, newRefreshToken);

    } catch (err) {
        if (err.name === "TokenExpiredError") {
            res.clearCookie("refreshToken", REFRESH_COOKIE_CLEAR_OPTIONS);
            return res.status(401).json({ message: "Refresh token expired. Please log in again." });
        }
        console.error("[refreshToken]", err);
        return res.status(403).json({ message: "Invalid refresh token." });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  LOGOUT
//  Clears the HttpOnly cookie AND nullifies the DB token so the refresh
//  token cannot be replayed even if the attacker somehow had it.
// ─────────────────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    // Even if cookie is missing (already expired/cleared) still return 200
    if (incomingRefreshToken) {
        try {
            const decoded = jwt.verify(incomingRefreshToken, REFRESH_SECRET);
            // Invalidate server-side
            await UsersModel.findByIdAndUpdate(decoded.id, { refreshToken: null });
        } catch (_) {
            // Token verification failure on logout is non-fatal — still clear
        }
    }

    res.clearCookie("refreshToken", REFRESH_COOKIE_CLEAR_OPTIONS);
    return res.status(200).json({ message: "Logged out successfully." });
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /user/me  —  protected route example
//  Must be called with:  Authorization: Bearer <accessToken>
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
    // req.user is injected by verifyAccessToken middleware
    try {
        const user = await UsersModel.findById(req.user.id)
            .select("-password -refreshToken -passwordResetToken -passwordResetExpires");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("[getMe]", error);
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
};