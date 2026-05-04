const express = require("express");
const SubmittedRoutes = express.Router();
const { upload, uploadSubmission, getSubmissions, getSubmissionById, downloadSubmission, updateSubmissionStatus } = require("../Middleware/SubmittedMiddleware");
const { verifyAccessToken, requireRole } = require("../Middleware/Auth");

// Upload — students only
SubmittedRoutes.post("/upload", verifyAccessToken, requireRole("student"), upload.single("file"), uploadSubmission);

// View all submissions — teacher or admin (or student viewing their own — handled in middleware)
SubmittedRoutes.get("/list",          verifyAccessToken, getSubmissions);
SubmittedRoutes.get("/download/:id",  verifyAccessToken, downloadSubmission);
SubmittedRoutes.get("/:id",           verifyAccessToken, getSubmissionById);

// Update status — teacher or admin only
SubmittedRoutes.patch("/:id/status",  verifyAccessToken, requireRole("teacher", "admin"), updateSubmissionStatus);

module.exports = SubmittedRoutes;
