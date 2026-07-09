const fs = require("fs")
const path = require("path")
const pdf = require("pdf-parse")
const Note = require("../models/Note")
const Chunk = require("../models/Chunk")
const { getEmbedding } = require("../utils/getEmbedding")
const { chunkText } = require("../utils/chunkText")

const uploadNote = async (req, res, next) => {
    try {
        if (!req.file) { res.status(400); throw new Error("No file uploaded") }
        const { title, subject, tags } = req.body
        if (!title || !subject) {
            res.status(400); throw new Error("Title and subject are required")
        }
        const ext = path.extname(req.file.originalname).toLowerCase()
        let rawText = ""
        if (ext === ".pdf") {
            const buffer = fs.readFileSync(req.file.path)
            const data = await pdf(buffer)
            rawText = data.text
        } else {
            rawText = fs.readFileSync(req.file.path, "utf-8")
        }
        if (!rawText.trim()) {
            res.status(400); throw new Error("Could not extract text from this file")
        }

        const rawChunks = await chunkText(rawText)
        const tagsArr = tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : []


        const note = await Note.create({
            userId: req.user._id, title, subject,
            tags: tagsArr, originalFileName: req.file.originalname,
            filePath: `uploads/${req.file.filename}`
        })


        const chunkDocs = []
        for (const c of rawChunks) {
            const embedding = await getEmbedding(c.text)
            chunkDocs.push({
                noteId: note._id,
                userId: req.user._id,
                text: c.text,
                chunkIndex: c.chunkIndex,
                embedding: embedding
            })
        }

        await Chunk.insertMany(chunkDocs)

        res.status(201).json({
            _id: note._id, title: note.title, subject: note.subject,
            tags: note.tags, originalFileName: note.originalFileName,
            filePath: note.filePath, chunkCount: rawChunks.length, createdAt: note.createdAt
        })
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
        next(error)
    }
}

const getAllNotes = async (req, res, next) => {
    try {

        const notes = await Note.aggregate([
            { $match: { userId: req.user._id } },
            {
                $lookup: {
                    from: "chunks",
                    localField: "_id",
                    foreignField: "noteId",
                    as: "noteChunks"
                }
            },
            {
                $addFields: {
                    chunkCount: { $size: "$noteChunks" }
                }
            },
            { $project: { noteChunks: 0 } },
            { $sort: { createdAt: -1 } }
        ])
        res.json(notes)
    } catch (error) { next(error) }
}

const deleteNote = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id)
        if (!note) { res.status(404); throw new Error("Note not found") }
        if (note.userId.toString() !== req.user._id.toString()) {
            res.status(403); throw new Error("Not authorised")
        }
        await Note.findByIdAndDelete(req.params.id)

        await Chunk.deleteMany({ noteId: req.params.id })

        res.json({ message: "Note deleted" })
    } catch (error) { next(error) }
}

module.exports = { uploadNote, getAllNotes, deleteNote }