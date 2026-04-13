require("dotenv").config();           // ← MUST be first line

const express = require("express");
const cors    = require("cors");
const cookieParser = require("cookie-parser");

const app  = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// ─── DB ───────────────────────────────────────────────────────────────────────
require("./Connection/Conn");

// ─── Routes ───────────────────────────────────────────────────────────────────
const UserRoutes       = require("./Routes/UserRoutes.js");
const TeacherRoutes    = require("./Routes/TeacherRoutes.js");
const AdminRoutes      = require("./Routes/AdminRoutes.js");
const AssignmentRoutes = require("./Routes/AssignmentRoutes.js");
const SubmittedRoutes  = require("./Routes/SubmittedRoutes.js");
const FeedbackRoutes   = require("./Routes/FeedbackRoutes.js");

// ─── CORS ─────────────────────────────────────────────────────────────────────
// `credentials: true` is required so the browser sends/receives cookies.
const corsOptions = {
    origin: true, // Allow all origins for dev proxying

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,   // ← critical for cookies
};
app.use(cors(corsOptions));

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Cookie parser ────────────────────────────────────────────────────────────
// COOKIE_SECRET signs cookies so the server can detect tampering.
app.use(cookieParser(process.env.COOKIE_SECRET));

// ─── Static files ─────────────────────────────────────────────────────────────
app.use("/uploads", express.static("uploads"));

// ─── Security headers (lightweight, no helmet dep required) ───────────────────
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    if (isProduction) {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "OK", env: process.env.NODE_ENV }));

app.use("/user",       UserRoutes);
app.use("/teacher",    TeacherRoutes);
app.use("/admin",      AdminRoutes);
app.use("/assignment", AssignmentRoutes);
app.use("/submitted",  SubmittedRoutes);
app.use("/feedback",   FeedbackRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: "Route not found." });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("[Unhandled Error]", err);
    res.status(500).json({ message: "Internal server error.", error: err.message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅  Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});