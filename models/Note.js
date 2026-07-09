const mongoose = require("mongoose")

const noteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: [true, "Title is required"], trim: true },
    subject: { type: String, required: [true, "Subject is required"], trim: true },
    tags: { type: [String], default: [] },
    originalFileName: { type: String },
    filePath: { type: String }
}, { timestamps: true })

const Note = mongoose.model("Note", noteSchema)
module.exports = Note