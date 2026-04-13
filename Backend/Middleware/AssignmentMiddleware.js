const Assignment = require("../Models/Assignment");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Store in the 'uploads/' folder
    },
    filename: function (req, file, cb) {
        // Append a timestamp to make the filename unique and prevent overwrites
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// PDF-only file filter
const pdfFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are accepted. Please convert your file to PDF before uploading.'), false);
    }
};

// Initialize upload using multer — PDF only, max 20MB limit
exports.upload = multer({ 
    storage: storage,
    fileFilter: pdfFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB limit
});

// Create a new Assignment
exports.createAssignment = async (req, res) => {
    try {
        const { title, course, description } = req.body;
        // Parse rubric if it was sent as a stringified JSON array
        let rubric = [];
        if (req.body.rubric) {
            rubric = JSON.parse(req.body.rubric);
        }

        const newAssignmentData = {
            title,
            course,
            description,
            rubric
        };

        // If a file was uploaded, attach its metadata
        if (req.file) {
            newAssignmentData.fileName = req.file.originalname;
            newAssignmentData.filePath = req.file.path.replace(/\\/g, "/"); // normalize path separators
        }

        const newAssignment = await Assignment.create(newAssignmentData);

        return res.status(201).json({
            message: "Assignment created successfully",
            assignment: newAssignment
        });
        
    } catch (error) {
        console.error("Error creating assignment:", error);
        return res.status(500).json({ message: "Failed to create assignment", error: error.message });
    }
};

// Get all Assignments
exports.getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find().sort({ createdAt: -1 });
        return res.status(200).json({ assignments });
    } catch (error) {
        console.error("Error fetching assignments:", error);
        return res.status(500).json({ message: "Failed to fetch assignments", error: error.message });
    }
};

// Download Assignment File
exports.downloadFile = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment || !assignment.filePath) {
            return res.status(404).json({ message: "File not found" });
        }

        const fileLocation = path.join(__dirname, "../", assignment.filePath);
        
        if (fs.existsSync(fileLocation)) {
            return res.download(fileLocation, assignment.fileName); 
        } else {
            return res.status(404).json({ message: "File missing on server" });
        }
    } catch (error) {
        console.error("Error downloading file:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
