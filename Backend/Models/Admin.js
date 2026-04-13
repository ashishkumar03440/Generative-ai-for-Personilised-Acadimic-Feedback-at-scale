const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    }
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);