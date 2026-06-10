const mongoose = require("mongoose")

const chunkSchema = new mongoose.Schema({
    text: { type: String, required: true },
    chunkIndex: { type: Number, required: true }
}, { _id: false })

const noteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: [true, "Title is required"], trim: true },
    subject: { type: String, required: [true, "Subject is required"], trim: true },
    tags: { type: [String], default: [] },
    originalFileName: { type: String },
    filePath: { type: String },
    chunks: [chunkSchema]
}, { timestamps: true })

const Note = mongoose.model("Note", noteSchema)
module.exports = Note