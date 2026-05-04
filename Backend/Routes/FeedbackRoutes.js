const express = require("express");
const FeedbackRoutes = express.Router();
const { submitFeedback, getStudentFeedback } = require("../Middleware/FeedbackMiddleware");
const { verifyAccessToken, requireRole } = require("../Middleware/Auth");

// Submit feedback — teacher or admin only
FeedbackRoutes.post("/submit",  verifyAccessToken, requireRole("teacher", "admin"), submitFeedback);

// View own feedback — any logged-in user (student sees their own, teacher sees all)
FeedbackRoutes.get("/student",  verifyAccessToken, getStudentFeedback);

module.exports = FeedbackRoutes;
