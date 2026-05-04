const express = require("express");
const AssignmentRoutes = express.Router();
const { upload, createAssignment, getAssignments, downloadFile } = require("../Middleware/AssignmentMiddleware");
const { verifyAccessToken, requireRole } = require("../Middleware/Auth");

// Viewing assignments — any logged-in user can see the list
AssignmentRoutes.get("/list",          verifyAccessToken, getAssignments);
AssignmentRoutes.get("/download/:id",  verifyAccessToken, downloadFile);

// Creating assignments — teacher or admin only
AssignmentRoutes.post("/create", verifyAccessToken, requireRole("teacher", "admin"), upload.single("file"), createAssignment);

module.exports = AssignmentRoutes;
