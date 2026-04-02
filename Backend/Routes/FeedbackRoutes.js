const express = require("express");
const FeedbackRoutes = express.Router();
const { submitFeedback, getStudentFeedback } = require("../Middleware/FeedbackMiddleware");

FeedbackRoutes.post("/submit", submitFeedback);
FeedbackRoutes.get("/student", getStudentFeedback);

module.exports = FeedbackRoutes;
