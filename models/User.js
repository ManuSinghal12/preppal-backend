const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6
    },
    branch: { type: String, default: "" },
    targetCompanies: { type: [String], default: [] },
    goals: { type: String, default: "" },
    role: {
        type: String,
        enum: ["SDE", "ML", "Core"],
        default: "SDE"
    }

}, { timestamps: true })

const User = mongoose.model("User", userSchema)
module.exports = User