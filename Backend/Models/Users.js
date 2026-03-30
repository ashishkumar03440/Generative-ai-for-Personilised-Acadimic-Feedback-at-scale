const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic fields (aligned with old schema)
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
    },

    password: {
      type: String,
      required: true,
      minlength: 5,
    },

    // New fields from advanced schema
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
    },

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    // Student-specific fields
    studentProfile: {
      gradeLevel: Number,
      board: {
        type: String,
        enum: ["CBSE", "ICSE", "State", "Engineering", "Coaching"],
      },
      rollNumber: String,
      section: String,
      parentEmail: String,
    },

    // Teacher-specific fields
    teacherProfile: {
      subjects: [String],
      designation: String,
      employeeId: String,
    },

    avatar: String,
    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: Date,

    // Auth tokens
    refreshToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);