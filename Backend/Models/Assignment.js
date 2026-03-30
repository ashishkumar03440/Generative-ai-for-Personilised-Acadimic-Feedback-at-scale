const mongoose = require("mongoose");

const rubricItemSchema = new mongoose.Schema({
    id: String,
    criteria: String,
    maxScore: Number,
    description: String
});

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    course: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    rubric: {
        type: [rubricItemSchema],
        default: []
    },
    fileName: {
        type: String, // Original file name, e.g., "Homework.pdf"
        default: null
    },
    filePath: {
        type: String, // Server path, e.g., "/uploads/17012345678-Homework.pdf"
        default: null
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: false // Optional for now since we aren't fully enforcing auth tokens yet, but good practice
    }
}, { timestamps: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
