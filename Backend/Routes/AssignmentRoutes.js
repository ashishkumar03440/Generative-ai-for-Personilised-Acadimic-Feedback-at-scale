const express = require("express");
const AssignmentRoutes = express.Router();
const { upload, createAssignment, getAssignments, downloadFile } = require("../Middleware/AssignmentMiddleware");

// POST /assignment/create uses multer 'single' to parse multipart/form-data for the 'file' input field
AssignmentRoutes.post("/create", upload.single('file'), createAssignment);

// GET /assignment/list fetches all assignments
AssignmentRoutes.get("/list", getAssignments);

// GET /assignment/download/:id streams the attached file
AssignmentRoutes.get("/download/:id", downloadFile);

module.exports = AssignmentRoutes;
