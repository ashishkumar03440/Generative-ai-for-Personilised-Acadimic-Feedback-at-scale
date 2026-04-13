const Submitted = require("../Models/Submitted");
const Assignment = require("../Models/Assignment");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the submissions directory exists
const uploadDir = path.join(__dirname, "../uploads/submissions");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/submissions/'); // Store securely isolated from assignment briefs
    },
    filename: function (req, file, cb) {
        // Append a timestamp to make the filename unique and prevent overwrites
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// PDF-only file filter
const pdfFilter = (req, file, cb) => {
    console.log("[PdfFilter] Incoming file:", file.originalname, "| Mimetype:", file.mimetype);
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        console.error("[PdfFilter] Rejected:", file.mimetype);
        cb(new Error(`Rejected file. Expected application/pdf, but received: ${file.mimetype}`), false);
    }
};

// Initialize upload using multer — PDF only, max 20MB
exports.upload = multer({ 
    storage: storage,
    fileFilter: pdfFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// Create a new Submission
exports.uploadSubmission = async (req, res) => {
    try {
        const { assignmentId, studentId, studentName } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const newSubmissionData = {
            assignmentId,
            studentId,
            studentName,
            fileName: req.file.originalname,
            filePath: req.file.path.replace(/\\/g, "/"),
            confidence: Math.round(Math.random() * (98 - 75) + 75) // Mock AI confidence score between 75 and 98 just for the dashboard preview
        };

        const newSubmission = await Submitted.create(newSubmissionData);

        // --- NEW: Asynchronous AI Feedback Generation ---
        // Run completely independently so the user experiences zero lag upon upload
        (async () => {
            try {
                const pdfParse = require("pdf-parse");
                // Dynamically import ESM agent bundle within this CJS file
                const { generateAcademicFeedback } = await import("../agents/index.js");
                const Feedback = require("../Models/Feedback");

                // Safely extract text based on extension
                let extractedText = "";
                const ext = path.extname(req.file.originalname).toLowerCase();
                
                if (ext === '.pdf') {
                    const dataBuffer = fs.readFileSync(req.file.path);
                    const pdfData = await pdfParse(dataBuffer);
                    extractedText = pdfData.text;
                } else if (ext === '.txt' || ext === '.md' || ext === '.js') {
                    extractedText = fs.readFileSync(req.file.path, 'utf8');
                } else {
                    extractedText = `(Warning: Unsupported format ${ext} for raw text extraction. Please evaluate this submission broadly based on general context. File name: ${req.file.originalname})`;
                }

                if (!extractedText.trim()) {
                    extractedText = "(Empty submission or unparseable text)";
                }

                console.log(`[AI Triggered] Generating feedback for ${req.file.originalname}...`);
                const aiResult = await generateAcademicFeedback(extractedText);

                if (aiResult && aiResult.status === "success") {
                    const metrics = aiResult.data.metrics;
                    const feedbackData = aiResult.data.feedback;
                    const learningPath = aiResult.data.learningPath;

                    // Map the LangChain JSON directly into the Mongoose Schema expected by Frontend
                    const newFeedback = new Feedback({
                        studentId: studentId,
                        assignmentId: assignmentId,
                        score: metrics.accuracyScore || 0,
                        maxScore: 100,
                        strengths: feedbackData.whatWentWell ? [feedbackData.whatWentWell] : [],
                        weaknesses: feedbackData.areasForImprovement ? [feedbackData.areasForImprovement] : [],
                        suggestions: learningPath.personalizedLearningPath 
                            ? learningPath.personalizedLearningPath.map(p => ({
                                text: p.objective,
                                chapter: p.action,
                                link: ""
                            }))
                            : [],
                        conceptMastery: [], 
                        aiComment: (feedbackData.feedbackSummary || "") + "\n\n" + (feedbackData.actionableSteps ? feedbackData.actionableSteps.join("\\n") : "") + "\n\n" + (feedbackData.encouragingClosing || ""),
                        rubric: []
                    });
                    
                    await newFeedback.save();

                    // Instantly update submission status to reviewed
                    await Submitted.findByIdAndUpdate(newSubmission._id, { status: "reviewed" });
                    console.log(`[AI Complete] Feedback saved to DB for ${req.file.originalname}. Status updated to reviewed.`);
                }
            } catch (aiErr) {
                console.error("[AI Generation Error] Processing failed in background:", aiErr);
            }
        })();

        return res.status(201).json({
            message: "Submission uploaded successfully. AI is currently analyzing your work in the background.",
            submission: newSubmission
        });
        
    } catch (error) {
        console.error("Error creating submission:", error);
        return res.status(500).json({ message: "Failed to create submission", error: error.message });
    }
};

// Get all Submissions
exports.getSubmissions = async (req, res) => {
    try {
        // Fetch all, populate the assignment title for easy front-end display
        const submissions = await Submitted.find().populate("assignmentId", "title course").sort({ createdAt: -1 });
        return res.status(200).json({ submissions });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return res.status(500).json({ message: "Failed to fetch submissions", error: error.message });
    }
};

// Download Submission File
exports.downloadSubmission = async (req, res) => {
    try {
        const submission = await Submitted.findById(req.params.id);
        
        if (!submission || !submission.filePath) {
            return res.status(404).json({ message: "File not found" });
        }

        const fileLocation = path.join(__dirname, "../", submission.filePath);
        
        if (fs.existsSync(fileLocation)) {
            return res.download(fileLocation, submission.fileName); 
        } else {
            return res.status(404).json({ message: "File missing on server" });
        }
    } catch (error) {
        console.error("Error downloading file:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get a single submission by ID
exports.getSubmissionById = async (req, res) => {
    try {
        const submission = await Submitted.findById(req.params.id).populate("assignmentId", "title course description rubric");
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }
        return res.status(200).json({ submission });
    } catch (error) {
        console.error("Error fetching submission:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update submission status (reviewed / rejected)
exports.updateSubmissionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["pending", "reviewed", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }
        const submission = await Submitted.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }
        return res.status(200).json({ message: "Status updated", submission });
    } catch (error) {
        console.error("Error updating status:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
