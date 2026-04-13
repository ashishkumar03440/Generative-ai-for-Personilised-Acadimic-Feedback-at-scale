const Feedback = require("../Models/Feedback");
const Submitted = require("../Models/Submitted");

const submitFeedback = async (req, res) => {
    try {
        const {
            studentId,
            assignmentId,
            teacherId,
            facultyComment,
            score,
            maxScore,
            strengths,
            weaknesses,
            suggestions,
            conceptMastery,
            aiComment,
            rubric
        } = req.body;

        if (!studentId || !assignmentId) {
            return res.status(400).json({ message: "studentId and assignmentId are required" });
        }

        // Find existing feedback or create new
        let feedback = await Feedback.findOne({ studentId, assignmentId });

        if (feedback) {
            // Update existing
            feedback.teacherId = teacherId || feedback.teacherId;
            feedback.facultyComment = facultyComment || feedback.facultyComment;
            feedback.score = score !== undefined ? score : feedback.score;
            feedback.maxScore = maxScore || feedback.maxScore;
            feedback.strengths = strengths || feedback.strengths;
            feedback.weaknesses = weaknesses || feedback.weaknesses;
            feedback.suggestions = suggestions || feedback.suggestions;
            feedback.conceptMastery = conceptMastery || feedback.conceptMastery;
            feedback.aiComment = aiComment || feedback.aiComment;
            feedback.rubric = rubric || feedback.rubric;

            await feedback.save();
        } else {
            // Create new
            feedback = new Feedback({
                studentId,
                assignmentId,
                teacherId,
                facultyComment,
                score,
                maxScore,
                strengths,
                weaknesses,
                suggestions,
                conceptMastery,
                aiComment,
                rubric
            });
            await feedback.save();
        }

        // Also update the submission status to 'reviewed'
        const submission = await Submitted.findOne({ studentId, assignmentId });
        if (submission) {
            submission.status = "reviewed";
            await submission.save();
        }

        return res.status(200).json({ message: "Feedback saved successfully", feedback });
    } catch (error) {
        console.error("Error saving feedback:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getStudentFeedback = async (req, res) => {
    try {
        const { studentId, assignmentId } = req.query;
        
        if (!studentId) {
            return res.status(400).json({ message: "studentId query parameter is required" });
        }

        let query = { studentId };
        if (assignmentId) {
            query.assignmentId = assignmentId;
        }

        // Populate assignment details so frontend can display assignment metadata
        const feedback = await Feedback.find(query)
            .populate("assignmentId", "title course description fileName")
            .populate("teacherId", "name email");
            
        return res.status(200).json({ feedback });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = {
    submitFeedback,
    getStudentFeedback
};
