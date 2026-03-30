const UsersModel = require('../Models/Admin.js');
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