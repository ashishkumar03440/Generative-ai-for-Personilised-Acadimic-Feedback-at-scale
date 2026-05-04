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

        // ── Async AI Feedback Generation ──────────────────────────────────────
        // Run completely independently so the user experiences zero lag upon upload.
        // Retries the full pipeline up to 3 times with a 5-second delay between
        // attempts to handle transient Gemini API errors (rate limits, timeouts, etc.).
        (async () => {
            const MAX_PIPELINE_ATTEMPTS = 3;
            const RETRY_DELAY_MS = 5000;
            const PIPELINE_TIMEOUT_MS = 5 * 60 * 1000; // 5-minute hard timeout

            for (let pipelineAttempt = 1; pipelineAttempt <= MAX_PIPELINE_ATTEMPTS; pipelineAttempt++) {
                try {
                    console.log(`[AI Pipeline] 🔄 Attempt ${pipelineAttempt}/${MAX_PIPELINE_ATTEMPTS} for: ${req.file.originalname}`);

                    // Wrap the entire pipeline in a timeout promise
                    await Promise.race([
                        runPipeline(),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error(`Pipeline timed out after ${PIPELINE_TIMEOUT_MS / 1000}s`)), PIPELINE_TIMEOUT_MS)
                        )
                    ]);

                    console.log(`[AI Pipeline] ✅ Pipeline completed successfully on attempt ${pipelineAttempt} for: ${req.file.originalname}`);
                    break; // Success — stop retrying

                } catch (pipelineErr) {
                    console.error(`[AI Pipeline] ❌ Attempt ${pipelineAttempt}/${MAX_PIPELINE_ATTEMPTS} failed for "${req.file.originalname}": ${pipelineErr.message}`);

                    if (pipelineAttempt < MAX_PIPELINE_ATTEMPTS) {
                        console.warn(`[AI Pipeline] ⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                    } else {
                        console.error(`[AI Pipeline] 💀 All ${MAX_PIPELINE_ATTEMPTS} attempts exhausted for "${req.file.originalname}". Feedback could not be generated.`);
                        // Mark submission with a failed status so it's visible in admin dashboard
                        await Submitted.findByIdAndUpdate(newSubmission._id, { status: "pending" }).catch(() => {});
                    }
                }
            }

            // ── Inner pipeline logic (extracted for clean retry wrapping) ──────
            async function runPipeline() {
                // Dynamically import ESM modules within this CJS file
                const { extractTextFromPDF } = await import("../agents/ocr.js");
                const { generateAcademicFeedback } = await import("../agents/index.js");
                const Feedback = require("../Models/Feedback");

                // ── Step 1: Extract student submission text via smart OCR ─────────
                // extractTextFromPDF tries pdf-parse first (fast for digital PDFs),
                // then escalates to Gemini vision for handwritten/scanned PDFs.
                console.log(`[AI Pipeline] 📄 Extracting text from student PDF: ${req.file.originalname}`);
                let extractedText = "";

                const ext = path.extname(req.file.originalname).toLowerCase();

                if (ext === ".pdf") {
                    extractedText = await extractTextFromPDF(req.file.path, "student");
                } else if (ext === ".txt" || ext === ".md" || ext === ".js") {
                    extractedText = fs.readFileSync(req.file.path, "utf8");
                } else {
                    extractedText = `(Warning: Unsupported format ${ext}. File name: ${req.file.originalname})`;
                }

                if (!extractedText || !extractedText.trim()) {
                    extractedText = "(Empty submission or unparseable content — please evaluate generically)";
                }

                // ── Step 2: Fetch teacher context (OCR text from assignment PDF) ──
                // This allows the AI to compare student answers to the actual questions.
                let teacherContext = "";
                if (assignmentId) {
                    try {
                        const assignment = await Assignment.findById(assignmentId).select("teacherOcrText title description");
                        if (assignment) {
                            // Use pre-extracted OCR text if available
                            if (assignment.teacherOcrText && assignment.teacherOcrText.trim()) {
                                teacherContext = assignment.teacherOcrText;
                                console.log(`[AI Pipeline] ✅ Teacher context loaded from DB (${teacherContext.length} chars).`);
                            } else if (assignment.filePath) {
                                // OCR hasn't finished yet (race condition on fresh upload) — OCR it now
                                console.log(`[AI Pipeline] ⚠️  Teacher OCR not in DB yet. Running OCR on assignment PDF now.`);
                                const assignmentPdfPath = path.join(__dirname, "../", assignment.filePath);
                                if (fs.existsSync(assignmentPdfPath)) {
                                    teacherContext = await extractTextFromPDF(assignmentPdfPath, "teacher");
                                    // Save it to DB for next time
                                    await Assignment.findByIdAndUpdate(assignmentId, { teacherOcrText: teacherContext });
                                }
                            }

                            // Always append the text description from DB as a fallback supplement
                            if (assignment.description && !teacherContext.includes(assignment.description)) {
                                teacherContext = `Assignment: ${assignment.title}\nDescription: ${assignment.description}\n\n${teacherContext}`;
                            }
                        }
                    } catch (ctxErr) {
                        console.warn(`[AI Pipeline] ⚠️  Could not fetch teacher context: ${ctxErr.message}`);
                        // Don't throw — teacher context is optional, proceed without it
                    }
                }

                // ── Step 3: Run the multi-agent AI pipeline ───────────────────────
                console.log(`[AI Pipeline] 🚀 Triggering feedback pipeline for: ${req.file.originalname}`);
                const aiResult = await generateAcademicFeedback(extractedText, teacherContext);

                if (!aiResult || aiResult.status !== "success") {
                    throw new Error(`Pipeline returned non-success status: ${JSON.stringify(aiResult?.status)}`);
                }

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
                    aiComment: [
                        feedbackData.feedbackSummary || "",
                        feedbackData.actionableSteps ? feedbackData.actionableSteps.join("\n") : "",
                        feedbackData.encouragingClosing || "",
                        metrics.gradedAgainstAssignment ? "\n\n✅ This feedback was generated by comparing your answers to the actual assignment questions." : ""
                    ].filter(Boolean).join("\n\n"),
                    rubric: []
                });
                
                await newFeedback.save();

                // Update submission status to reviewed
                await Submitted.findByIdAndUpdate(newSubmission._id, { status: "reviewed" });
                console.log(`[AI Pipeline] ✅ Feedback saved to DB for ${req.file.originalname}. Graded against assignment: ${metrics.gradedAgainstAssignment}`);
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
