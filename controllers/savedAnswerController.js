const SavedAnswer = require("../models/SavedAnswer")

const getAll = async (req, res, next) => {
    try {
        const answers = await SavedAnswer.find({ userId: req.user._id }).sort({ createdAt: -1 })
        res.json(answers)
    } catch (error) { next(error) }
}

const save = async (req, res, next) => {
    try {
        const { question, answer, noteId, noteTitle } = req.body
        if (!question || !answer) { res.status(400); throw new Error("question and answer required") }
        const saved = await SavedAnswer.create({ userId: req.user._id, question, answer, noteId, noteTitle })
        res.status(201).json(saved)
    } catch (error) { next(error) }
}

const remove = async (req, res, next) => {
    try {
        await SavedAnswer.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
        res.json({ message: "Deleted" })
    } catch (error) { next(error) }
}

module.exports = { getAll, save, remove }