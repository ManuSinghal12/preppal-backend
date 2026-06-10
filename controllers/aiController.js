const { ChatGroq } = require("@langchain/groq")
const { ChatPromptTemplate } = require("@langchain/core/prompts")
const Note = require("../models/Note")
const { retrieveChunks } = require("../utils/retrieveChunks")
const Problem = require("../models/Problem")
const User = require("../models/User")

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

const explainConcept = async (req, res, next) => {
    try {
        const { concept, beginnerMode } = req.body
        if (!concept) { res.status(400); throw new Error("concept is required") }
        const sys = beginnerMode
            ? "You are a friendly CS teacher. Use simple words, real-world analogies, short paragraphs. Zero jargon."
            : "You are a senior engineer. Be precise and technical. Include relevant implementation details."
        const result = await ChatPromptTemplate.fromMessages([
            ["system", sys],
            ["human", "Explain this clearly: {concept}"]
        ]).pipe(getModel()).invoke({ concept })
        res.json({ explanation: result.content })
    } catch (error) { next(error) }
}

const getPrepSummary = async (req, res, next) => {
    try {
        const problems = await Problem.find({ userId: req.user._id })
        const user = await User.findById(req.user._id)
        const weakMap = problems.reduce((acc, p) => {
            if (p.status === "Stuck")
                acc[p.topic] = (acc[p.topic] || 0) + 1
            return acc
        }, {})
        const today = new Date(); today.setHours(23, 59, 59, 999)
        const stats = {
            total: problems.length,
            solved: problems.filter(p => p.status === "Solved").length,
            weakTopics: Object.entries(weakMap).filter(([, n]) => n >= 2).map(([t]) => t),
            backlog: problems.filter(p => p.status === "Stuck" && p.nextRevisionDate && new Date(p.nextRevisionDate) <= today).length, // Only "Stuck" problems with a past/due revision date are in backlog
            targetCompanies: user?.targetCompanies || [],
            topics: problems.reduce((acc, p) => { acc[p.topic] = (acc[p.topic] || 0) + 1; return acc }, {})
        }
        const result = await ChatPromptTemplate.fromMessages([
            ["system", "You are a placement prep coach. Be honest, specific, motivating. Max 3 sentences."],
            ["human", "My DSA stats (I am targeting: {companies}): {stats}\n\nTell me: what I am doing well, what needs urgent work, one action for today."]
        ]).pipe(getModel()).invoke({
            stats: JSON.stringify(stats),
            companies: (user?.targetCompanies || []).join(", ")
        })
        res.json({ summary: result.content, stats })
    } catch (error) { next(error) }
}

const mockInterview = async (req, res, next) => {
    try {
        const { topic, userAnswer, questionIndex } = req.body
        if (!topic) { res.status(400); throw new Error("topic is required") }
        if (!userAnswer) {
            const r = await ChatPromptTemplate.fromMessages([
                ["system", "You are a technical interviewer for placements. Ask one question at a time."],
                ["human", "Start a mock interview on {topic}. Ask question 1 of 5. Just the question, no preamble."]
            ]).pipe(getModel()).invoke({ topic })
            return res.json({ question: r.content, questionIndex: 0, done: false })
        }
        if (questionIndex >= 4) {
            const r = await ChatPromptTemplate.fromMessages([
                ["system", "Give final constructive feedback after a placement mock interview."],
                ["human", "Topic: {topic}. Final answer: {answer}\nTwo-sentence performance summary + one key improvement area."]
            ]).pipe(getModel()).invoke({ topic, answer: userAnswer })
            return res.json({ feedback: r.content, done: true })
        }
        const r = await ChatPromptTemplate.fromMessages([
            ["system", "You are a technical interviewer. Give one-line feedback on their answer then ask the next question."],
            ["human", "Topic: {topic}. Q{q} answer: {answer}\nOne-line feedback. Then ask question {next} of 5 on the same topic."]
        ]).pipe(getModel()).invoke({ topic, answer: userAnswer, q: questionIndex + 1, next: questionIndex + 2 })
        return res.json({ feedbackAndQuestion: r.content, questionIndex: questionIndex + 1, done: false })
    } catch (error) { next(error) }
}

module.exports = { askNote, generateQuestions, explainConcept, getPrepSummary, mockInterview }
