/**
 * jwtConfig.js
 * Central source of truth for all JWT and cookie configuration.
 * Every middleware / handler imports from here — no magic strings elsewhere.
 */

const isProduction = process.env.NODE_ENV === "production";

// ── Token expiry helpers ──────────────────────────────────────────────────────

/**
 * Converts a JWT expiry string like "15m" / "7d" into milliseconds
 * so we can set a matching cookie maxAge.
 */
function parseDurationMs(str = "15m") {
    const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    const match = str.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid duration string: ${str}`);
    return parseInt(match[1], 10) * units[match[2]];
}

// ── Secrets ───────────────────────────────────────────────────────────────────

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw new Error(
        "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in .env"
    );
}

// ── Durations ─────────────────────────────────────────────────────────────────

const ACCESS_EXPIRES  = process.env.JWT_ACCESS_EXPIRES  || "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";

// ── Cookie options ────────────────────────────────────────────────────────────

/**
 * Refresh token cookie — HttpOnly, Secure in prod, SameSite=Strict.
 * Never readable by client-side JS, never sent cross-site.
 */
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure  : isProduction,          // HTTPS-only in production
    sameSite: isProduction ? "Strict" : "Lax",
    maxAge  : parseDurationMs(REFRESH_EXPIRES),
    path    : "/",                   // send on every request so logout works too
};

/**
 * Options used when *clearing* the refresh cookie on logout.
 * Must match name + path used when setting it.
 */
const REFRESH_COOKIE_CLEAR_OPTIONS = {
    httpOnly: true,
    secure  : isProduction,
    sameSite: isProduction ? "Strict" : "Lax",
    path    : "/",                   // must match the path used when setting
};

module.exports = {
    ACCESS_SECRET,
    REFRESH_SECRET,
    ACCESS_EXPIRES,
    REFRESH_EXPIRES,
    REFRESH_COOKIE_OPTIONS,
    REFRESH_COOKIE_CLEAR_OPTIONS,
};
