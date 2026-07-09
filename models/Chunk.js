const mongoose = require("mongoose")

const chunkSchema = new mongoose.Schema({
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
    embedding: { type: [Number], required: true }
})

module.exports = mongoose.model("Chunk", chunkSchema)