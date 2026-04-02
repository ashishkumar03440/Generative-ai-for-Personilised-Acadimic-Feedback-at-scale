const mongoose = require("mongoose");

const submittedSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },
    studentId: {
        type: String, // String or ObjectId, we map from useAuth().user.id
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "reviewed", "rejected"]
    },
    confidence: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Submitted", submittedSchema);
