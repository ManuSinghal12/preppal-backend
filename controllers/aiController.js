const { ChatGroq } = require("@langchain/groq")
const { ChatPromptTemplate } = require("@langchain/core/prompts")
const Note = require("../models/Note")
const { retrieveChunks } = require("../utils/retrieveChunks")

const getModel = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is missing in .env")
    }

    return new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "llama-3.3-70b-versatile",
        temperature: 0.3
    })
}

const askNote = async (req, res, next) => {
    try {
        const { question, noteId } = req.body
        if (!question || !noteId) { res.status(400); throw new Error("question and noteId required") }

        const note = await Note.findById(noteId)
        if (!note) { res.status(404); throw new Error("Note not found") }
        if (note.userId.toString() !== req.user._id.toString()) {
            res.status(403); throw new Error("Not authorised")
        }

        const topChunks = retrieveChunks(question, note.chunks)
        if (topChunks.length === 0) {
            return res.json({
                answer: "I could not find relevant content in this document to answer your question.",
                chunksUsed: []
            })
        }

        const context = topChunks.map(c => c.text).join("\n\n---\n\n")

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful study assistant. Answer using ONLY the provided context. If the answer is not there, say so clearly."],
            ["human", "Context:\n{context}\n\nQuestion: {question}"]
        ])

        const chain = prompt.pipe(getModel())
        const result = await chain.invoke({ context, question })

        res.json({
            answer: result.content,
            chunksUsed: topChunks.map(c => ({ text: (c.text || "").substring(0, 160), chunkIndex: c.chunkIndex }))
        })
    } catch (error) { next(error) }
}

const generateQuestions = async (req, res, next) => {
    try {
        const { topic, difficulty, type } = req.body
        if (!topic) { res.status(400); throw new Error("topic is required") }

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "You are an expert technical interviewer for placement preparation."],
            ["human", "Generate 5 {difficulty} {type} interview questions on: {topic}.\nFormat as a numbered list. Each question must be specific and placement-relevant."]
        ])

        const chain = prompt.pipe(getModel())
        const result = await chain.invoke({
            topic,
            difficulty: difficulty || "Intermediate",
            type: type || "conceptual"
        })

        res.json({ questions: result.content })
    } catch (error) { next(error) }
}

module.exports = { askNote, generateQuestions }
