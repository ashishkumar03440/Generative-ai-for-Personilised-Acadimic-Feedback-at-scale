const express = require("express");
const SubmittedRoutes = express.Router();
const { upload, uploadSubmission, getSubmissions, getSubmissionById, downloadSubmission, updateSubmissionStatus } = require("../Middleware/SubmittedMiddleware");

SubmittedRoutes.post("/upload", upload.single('file'), uploadSubmission);

SubmittedRoutes.get("/list", getSubmissions);

SubmittedRoutes.get("/download/:id", downloadSubmission);

SubmittedRoutes.get("/:id", getSubmissionById);

SubmittedRoutes.patch("/:id/status", updateSubmissionStatus);

module.exports = SubmittedRoutes;
