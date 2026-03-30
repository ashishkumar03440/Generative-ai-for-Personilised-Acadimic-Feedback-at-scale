const UsersModel = require('../Models/Users.js');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// SIGNUP
exports.signup = async (req, res) => {
    let {
        userName,
        phoneNumber,
        email,
        Email,
        password,
        role,
        institution,
        studentProfile,
        teacherProfile
    } = req.body;

    email = email || Email;

    // ✅ Required validation
    if (!userName || !phoneNumber || !email || !password || !role || !institution) {
        return res.status(400).json({ message: "All required fields must be provided" });
    }

    email = email.toLowerCase();

    try {
        // ✅ Check existing user
        const existingUser = await UsersModel.findOne({ email });
        if (existingUser) {
            return res.status(403).json({ message: "User already exists" });
        }

        // ✅ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create user object
        const userData = {
            userName,
            phoneNumber,
            email,
            password: hashedPassword,
            role,
            institution
        };

        // ✅ Role-based profile handling
        if (role === "student") {
            userData.studentProfile = studentProfile;
        }

        if (role === "teacher") {
            userData.teacherProfile = teacherProfile;
        }

        // ✅ Create user
        const newUser = await UsersModel.create(userData);

        return res.status(201).json({
            message: "User created successfully",
            user: newUser
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error during signup",
            error: error.message
        });
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
        const user = await UsersModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // ✅ Add role in token
        const token = jwt.sign(
            { id: user._id, role: user.role },
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
                role: user.role
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error during login",
            error: error.message
        });
    }
};