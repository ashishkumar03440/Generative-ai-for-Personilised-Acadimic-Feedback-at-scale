const UsersModel = require('../Models/Admin.js');
const TeacherModel = require('../Models/Teachers.js');
const StudentModel = require('../Models/Users.js');
const Assignment = require('../Models/Assignment.js');
const Submitted = require('../Models/Submitted.js');
const Feedback = require('../Models/Feedback.js');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// SIGNUP
exports.signup = async (req, res) => {
    let { userName, phoneNumber, email, Email, password } = req.body;
    email = email || Email;

    if (!email || !password || !userName || !phoneNumber) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    email = email.toLowerCase();

    try {
        const existingUser = await UsersModel.findOne({ email: email });
        if (existingUser) {
            return res.status(403).json({ message: "User already exists" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await UsersModel.create({
            userName,
            phoneNumber,
            email,
            password: hashedPassword
        });

        return res.status(201).json({ message: "User created successfully", user: newUser });

    } catch (error) {
        return res.status(500).json({ message: "Server error during signup", error: error.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: "email and password are required" });
    }
    const email = req.body.email.toLowerCase();
    const { password } = req.body;

    try {
        const user = await UsersModel.findOne({
            $or: [
                { email: new RegExp(`^${email}$`, 'i') },
                { Email: new RegExp(`^${email}$`, 'i') }
            ]
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let isPasswordValid = false;
        if (user.password && user.password.startsWith('$2')) {
            isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
            // Fallback for older plaintext testing passwords
            isPasswordValid = (password === user.password);
            
            // Optional DB update: If valid plaintext, convert to hash for future logins
            if (isPasswordValid) {
                user.password = await bcrypt.hash(password, 10);
                if (!user.email) {
                    user.email = email; // Populate email field so schema validation passes
                }
                await user.save();
            }
        }

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id, role: "admin" },
            'AshishPrivateKey',
            { expiresIn: '10h' }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.userName,
                email: user.email,
                role: "admin"
            }
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error during login", error: error.message });
    }
};

// GET /admin/stats — aggregate stats from all collections
exports.getStats = async (req, res) => {
    try {
        const [
            studentCount,
            teacherCount,
            adminCount,
            assignmentCount,
            submissionCount,
            reviewedCount,
            pendingCount,
            feedbackCount,
        ] = await Promise.all([
            StudentModel.countDocuments(),
            TeacherModel.countDocuments(),
            UsersModel.countDocuments(),
            Assignment.countDocuments(),
            Submitted.countDocuments(),
            Submitted.countDocuments({ status: "reviewed" }),
            Submitted.countDocuments({ status: "pending" }),
            Feedback.countDocuments(),
        ]);

        // Submissions grouped by day for the chart (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const submissionsByDay = await Submitted.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const trendMap = {};
        submissionsByDay.forEach(d => { trendMap[d._id] = d.count; });

        const trendData = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const dow = d.getDay() + 1; // MongoDB $dayOfWeek: 1=Sun
            return {
                day: dayNames[d.getDay()],
                submissions: trendMap[dow] || 0
            };
        });

        const approvalRate = submissionCount > 0
            ? ((reviewedCount / submissionCount) * 100).toFixed(1)
            : "0.0";

        return res.status(200).json({
            totalUsers: studentCount + teacherCount + adminCount,
            studentCount,
            teacherCount,
            adminCount,
            assignmentCount,
            submissionCount,
            reviewedCount,
            pendingCount,
            feedbackCount,
            approvalRate: `${approvalRate}%`,
            trendData,
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET /admin/users — list all users merged from all three collections
exports.getUsers = async (req, res) => {
    try {
        const [students, teachers, admins] = await Promise.all([
            StudentModel.find({}, "userName email isActive createdAt").lean(),
            TeacherModel.find({}, "userName email createdAt").lean(),
            UsersModel.find({}, "userName email createdAt").lean(),
        ]);

        const toEntry = (u, role) => ({
            id: u._id.toString(),
            name: u.userName || "—",
            email: u.email || "—",
            role,
            status: u.isActive === false ? "inactive" : "active",
            joinedAt: u.createdAt,
        });

        const users = [
            ...students.map(u => toEntry(u, "student")),
            ...teachers.map(u => toEntry(u, "teacher")),
            ...admins.map(u => toEntry(u, "admin")),
        ].sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));

        return res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// DELETE /admin/users/:model/:id — remove a user
exports.deleteUser = async (req, res) => {
    const { model, id } = req.params;
    try {
        let deleted;
        if (model === "student") deleted = await StudentModel.findByIdAndDelete(id);
        else if (model === "teacher") deleted = await TeacherModel.findByIdAndDelete(id);
        else if (model === "admin") deleted = await UsersModel.findByIdAndDelete(id);
        else return res.status(400).json({ message: "Invalid model type" });

        if (!deleted) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ message: "User deleted" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};