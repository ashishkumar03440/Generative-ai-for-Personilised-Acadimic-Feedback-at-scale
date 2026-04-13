const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true
    },
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: false
    },
    facultyComment: {
        type: String,
        default: ""
    },
    score: {
        type: Number,
        required: true
    },
    maxScore: {
        type: Number,
        required: true
    },
    strengths: {
        type: [String],
        default: []
    },
    weaknesses: {
        type: [String],
        default: []
    },
    suggestions: {
        type: [{
            text: String,
            chapter: String,
            link: String
        }],
        default: []
    },
    conceptMastery: {
        type: [{
            topic: String,
            progress: Number,
            trend: String
        }],
        default: []
    },
    aiComment: {
        type: String,
        default: ""
    },
    rubric: {
        type: [{
            criteria: String,
            score: Number,
            max: Number,
            suggestion: String
        }],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
