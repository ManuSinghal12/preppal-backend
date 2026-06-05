const mongoose = require("mongoose")

const savedAnswerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
    noteTitle: { type: String, default: "" }
}, { timestamps: true })

module.exports = mongoose.model("SavedAnswer", savedAnswerSchema)